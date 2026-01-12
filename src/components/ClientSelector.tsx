'use client';

import { useClientConfiguration } from '@/lib/useNocoDB';
import { ClientConfiguration } from '@/types';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface ClientSelectorProps {
  onClientSelect?: (client: ClientConfiguration | null) => void;
  className?: string;
}

export function ClientSelector({ onClientSelect, className }: ClientSelectorProps) {
  const { data: clients, loading, error } = useClientConfiguration();
  const [selectedClient, setSelectedClient] = useState<ClientConfiguration | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sélectionner automatiquement le premier client si aucun n'est sélectionné
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      const firstClient = clients[0];
      setSelectedClient(firstClient);
      onClientSelect?.(firstClient);
    }
  }, [clients, selectedClient, onClientSelect]);

  const handleClientSelect = (client: ClientConfiguration) => {
    setSelectedClient(client);
    setIsOpen(false);
    onClientSelect?.(client);
  };

  if (loading) {
    return (
      <div className={clsx('flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-lg', className)}>
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-400">Chargement des clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg', className)}>
        <span className="text-sm text-rose-400">⚠️ {error}</span>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className={clsx('flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-lg', className)}>
        <span className="text-sm text-gray-400">Aucun client disponible</span>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      {/* Bouton de sélection */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-dark-500 rounded-lg transition-all duration-200 min-w-[250px]"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Client</p>
          <p className="text-sm font-medium text-white truncate">
            {selectedClient?.customer_name || 'Sélectionner un client'}
          </p>
        </div>
        <ChevronDown 
          className={clsx(
            'w-4 h-4 text-gray-400 transition-transform flex-shrink-0',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Liste déroulante */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {clients.map((client) => (
            <button
              key={client.Id}
              onClick={() => handleClientSelect(client)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors text-left',
                selectedClient?.Id === client.Id && 'bg-blue-500/20 hover:bg-blue-500/30'
              )}
            >
              <div className={clsx(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                selectedClient?.Id === client.Id 
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                  : 'bg-dark-600'
              )}>
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {client.customer_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  ID: {client.customer_id}
                </p>
              </div>
              {selectedClient?.Id === client.Id && (
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

