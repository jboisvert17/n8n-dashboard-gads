'use client';

import { Bell, RefreshCw, User } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simule un refresh
    setTimeout(() => setIsRefreshing(false), 1500);
    // En production, tu appelleras ton API ici
    window.location.reload();
  };

  return (
    <header className="h-16 bg-dark-800/50 backdrop-blur-sm border-b border-dark-600 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Titre */}
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-all"
          title="Rafraîchir les données"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* Séparateur */}
        <div className="w-px h-8 bg-dark-600 mx-2"></div>

        {/* Profil */}
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700 transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-white">Jonathan</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </button>
      </div>
    </header>
  );
}


