import axios, { type AxiosResponse } from 'axios';
import { setConnectionStatus, type ConnectionStatus } from './connection';
import { getMockResponse, hasMockFor } from './demoMocks';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback automático: si el backend no responde (red/timeout), devuelve 5xx o
// pide una ruta que no existe, se resuelve con los datos del Modo Demo.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const config = error.config;
    if (!config) return Promise.reject(error);

    const sinRespuesta = !error.response;
    const status = error.response?.status;
    const esServidor = status !== undefined && status >= 500;

    if (sinRespuesta) setConnectionStatus('offline');

    const metodo = (config.method ?? 'get').toUpperCase();
    const ruta = config.url ?? '';
    const hayFallback = sinRespuesta || esServidor || status === 404;

    if (hayFallback && hasMockFor(metodo, ruta)) {
      const demo = getMockResponse(metodo, ruta, config.data);
      if (demo) {
        const respuestaDemo: AxiosResponse = {
          data: demo.data,
          status: demo.status,
          statusText: demo.status === 204 ? 'No Content' : 'OK',
          headers: {},
          config,
          request: null,
        };
        return Promise.resolve(respuestaDemo);
      }
    }

    return Promise.reject(error);
  }
);

// Sonda de salud: nunca tiene mock asignado, por lo que refleja el estado real.
export const probeApiConnection = async (): Promise<ConnectionStatus> => {
  try {
    await api.get('v1/clientes/', { timeout: 4000 });
    setConnectionStatus('online');
    return 'online';
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const backendRespondio = status !== undefined && status < 500;
    const resultado: ConnectionStatus = backendRespondio ? 'online' : 'offline';
    setConnectionStatus(resultado);
    return resultado;
  }
};

export default api;
