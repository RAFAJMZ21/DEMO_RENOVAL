import React, { useState } from 'react';
import { loginUser, registerUser } from '../api/auth';
import type { TokenResponse, UserRegisterPayload } from '../types';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

export const LoginForm: React.FC<{ onLoginSuccess: (data: TokenResponse) => void }> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Estados del Formulario
  const [email, setEmail] = useState<string>('admin@renoval.com');
  const [password, setPassword] = useState<string>('123456');
  const [username, setUsername] = useState<string>('');
  const [nombreCompleto, setNombreCompleto] = useState<string>('');
  const [rol, setRol] = useState<UserRegisterPayload['rol']>('ADMIN');

  const [error, setError] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    if (isRegistering) {
      try {
        await registerUser({
          username,
          email,
          password,
          nombre_completo: nombreCompleto,
          rol,
        });
        setMensajeExito('¡Registro exitoso! Ya puedes iniciar sesión.');
        setIsRegistering(false);
      } catch {
        setError('Error al registrar usuario. Comprueba si el correo ya existe.');
      }
    } else {
      try {
        const res = await loginUser({ email, password });
        localStorage.setItem('access_token', res.access_token);
        onLoginSuccess(res);
      } catch {
        setError('Credenciales incorrectas o el servidor backend está apagado.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0d14] p-4">
      <form onSubmit={handleSubmit} className="bg-[#10141d] p-8 rounded-2xl border border-[#1e2430] w-full max-w-md space-y-4 text-white">
        <h2 className="text-2xl font-black text-emerald-400 text-center">
          RENOVAL<span className="text-lime-400">SYS</span>
        </h2>
        <p className="text-xs text-gray-400 text-center mb-4">
          {isRegistering ? 'Crear nueva cuenta de usuario' : 'Ingreso unificado (Admin y Clientes)'}
        </p>

        {error && <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded text-center">{error}</div>}
        {mensajeExito && <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded text-center">{mensajeExito}</div>}

        {isRegistering && (
          <>
            <div>
              <label className="text-xs text-gray-400">Nombre de Usuario (Username):</label>
              <div className="flex items-center gap-2 bg-[#181d29] border border-[#252c3d] p-2 rounded-xl mt-1">
                <User className="w-4 h-4 text-gray-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-white" required />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Nombre Completo:</label>
              <div className="flex items-center gap-2 bg-[#181d29] border border-[#252c3d] p-2 rounded-xl mt-1">
                <User className="w-4 h-4 text-gray-400" />
                <input type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-white" required />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Área / Rol en RENOVAL:</label>
              <div className="flex items-center gap-2 bg-[#181d29] border border-[#252c3d] p-2 rounded-xl mt-1">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <select 
                  value={rol} 
                  onChange={(e) => setRol(e.target.value as UserRegisterPayload['rol'])} 
                  className="bg-transparent border-none outline-none text-sm w-full text-white"
                >
                  <option value="ADMIN" className="bg-[#10141d]">Administrador</option>
                  <option value="CLIENTE" className="bg-[#10141d]">Cliente</option>
                  <option value="OPERADOR_PLANTA" className="bg-[#10141d]">Operador de Planta</option>
                  <option value="ALMACENISTA" className="bg-[#10141d]">Almacenista</option>
                  <option value="PROVEEDOR" className="bg-[#10141d]">Proveedor</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-xs text-gray-400">Correo Electrónico:</label>
          <div className="flex items-center gap-2 bg-[#181d29] border border-[#252c3d] p-2 rounded-xl mt-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-white" required />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400">Contraseña:</label>
          <div className="flex items-center gap-2 bg-[#181d29] border border-[#252c3d] p-2 rounded-xl mt-1">
            <Lock className="w-4 h-4 text-gray-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-white" required />
          </div>
        </div>

        <button type="submit" className="w-full bg-lime-400 hover:bg-lime-300 text-emerald-950 font-bold py-3 rounded-xl transition mt-4">
          {isRegistering ? 'Registrar Usuario' : 'Iniciar Sesión'}
        </button>

        <div className="text-center pt-2">
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-xs text-emerald-400 hover:underline">
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </form>
    </div>
  );
};