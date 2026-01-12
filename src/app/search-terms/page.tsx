'use client';

import { Header } from '@/components/Header';
import { SearchTermsTable } from '@/components/SearchTermsTable';
import { Database, Building2, AlertCircle } from 'lucide-react';
import { useClient } from '@/lib/ClientContext';

export default function SearchTermsPage() {
  const { selectedClient } = useClient();

  return (
    <div className="min-h-screen bg-pattern">
      <Header 
        title="Search Terms Analysis" 
        subtitle="Données en direct depuis NocoDB" 
      />

      <div className="p-6 space-y-6">
        {/* Info banner - Client sélectionné */}
        {selectedClient ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{selectedClient.customer_name}</p>
                <p className="text-sm text-gray-400">Client actuel</p>
              </div>
            </div>
            
            <div className="p-4 bg-dark-800 border border-dark-600 rounded-lg">
              <p className="text-xs text-gray-500 uppercase mb-1">Customer ID</p>
              <p className="text-white font-mono">{selectedClient.customer_id}</p>
            </div>
            
            <div className="p-4 bg-dark-800 border border-dark-600 rounded-lg">
              <p className="text-xs text-gray-500 uppercase mb-1">Shared List</p>
              <p className="text-white truncate">{selectedClient.shared_list_name || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-white font-medium">Aucun client sélectionné</p>
              <p className="text-sm text-gray-400">
                Veuillez sélectionner un client dans le menu en haut pour voir ses données
              </p>
            </div>
          </div>
        )}

        {/* Info banner - NocoDB */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-white font-medium">Connecté à NocoDB</p>
            <p className="text-sm text-gray-400">
              {selectedClient 
                ? `Table: ${selectedClient.nocodb_table_id} | Base: ${selectedClient.nocodb_base_id}`
                : 'Les données affichées proviennent de ta table "Ai Search Terms Analysis"'
              }
            </p>
          </div>
        </div>

        {/* Tableau des Search Terms */}
        <SearchTermsTable />
      </div>
    </div>
  );
}


