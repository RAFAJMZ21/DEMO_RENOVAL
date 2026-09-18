import React from 'react';
import { UserCheck, Plus } from 'lucide-react';

export const GestionUsuariosView: React.FC = () => {
  return (
    <div className="space-y-6 text-white">
      <div className="bg-[#10141d] p-6 rounded-2xl border border-[#1e2430] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" /> Gestión de Personal & Permisos
          </h2>
          <p className="text-xs text-gray-400">Control de roles (Administrador, Operador, Almacenista, Cliente).</p>
        </div>
        <button className="flex items-center gap-2 bg-lime-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>
    </div>
  );
};