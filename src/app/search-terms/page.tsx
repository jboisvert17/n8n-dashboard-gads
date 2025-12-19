'use client';

import { Header } from '@/components/Header';
import { SearchTermsTable } from '@/components/SearchTermsTable';
import { Database } from 'lucide-react';

export default function SearchTermsPage() {
  return (
    <div className="min-h-screen bg-pattern">
      <Header 
        title="Search Terms Analysis" 
        subtitle="Données en direct depuis NocoDB" 
      />

      <div className="p-6">
        {/* Info banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-white font-medium">Connecté à NocoDB</p>
            <p className="text-sm text-gray-400">
              Les données affichées proviennent de ta table "Ai Search Terms Analysis"
            </p>
          </div>
        </div>

        {/* Tableau des Search Terms */}
        <SearchTermsTable />
      </div>
    </div>
  );
}


