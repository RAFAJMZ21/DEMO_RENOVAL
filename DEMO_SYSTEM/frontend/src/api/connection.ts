import { useSyncExternalStore } from 'react';

export type ConnectionStatus = 'checking' | 'online' | 'offline';

let currentStatus: ConnectionStatus = 'checking';
const observers = new Set<() => void>();

export const getConnectionStatus = (): ConnectionStatus => currentStatus;

export const setConnectionStatus = (next: ConnectionStatus): void => {
  if (currentStatus === next) return;
  currentStatus = next;
  observers.forEach((observer) => observer());
};

const subscribe = (observer: () => void): (() => void) => {
  observers.add(observer);
  return () => {
    observers.delete(observer);
  };
};

export const useConnectionStatus = (): ConnectionStatus =>
  useSyncExternalStore(subscribe, getConnectionStatus, getConnectionStatus);
