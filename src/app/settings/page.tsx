'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { config, workflows } from '@/lib/config';
import { 
  Settings, 
  Server, 
  Database, 
  Link2, 
  Save, 
  ExternalLink,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import clsx from 'clsx';

export default function SettingsPage() {
  const [n8nUrl, setN8nUrl] = useState(config.n8nBaseUrl);
  const [nocodbUrl, setNocodbUrl] = useState(config.nocodbBaseUrl);
  const [nocodbToken, setNocodbToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // En production, tu sauvegarderais ces valeurs dans un fichier .env ou une base de données
    // Pour l'instant, on simule juste une sauvegarde
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const testConnection = async (type: 'n8n' | 'nocodb') => {
    const url = type === 'n8n' ? n8nUrl : nocodbUrl;
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      alert(`✅ Connexion à ${type} réussie !`);
    } catch (error) {
      alert(`❌ Erreur de connexion à ${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-pattern">
      <Header 
        title="Paramètres" 
        subtitle="Configuration du dashboard" 
      />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Section n8n */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <Server className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Configuration n8n</h2>
              <p className="text-sm text-gray-400">Connexion à ton instance n8n</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de n8n
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={n8nUrl}
                  onChange={(e) => setN8nUrl(e.target.value)}
                  placeholder="https://n8n.ton-domaine.com"
                  className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => window.open(n8nUrl, '_blank')}
                  className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                  title="Ouvrir n8n"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-dark-700/50 rounded-lg border border-dark-600">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-gray-400">
                  <p className="mb-2">Pour connecter tes workflows, ajoute un nœud <strong className="text-white">Webhook Trigger</strong> au début de chaque workflow.</p>
                  <p>L'URL complète sera : <code className="px-2 py-1 bg-dark-600 rounded text-blue-400">{n8nUrl}/webhook/[ton-path]</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section NocoDB */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Configuration NocoDB</h2>
              <p className="text-sm text-gray-400">Connexion à ta base de données NocoDB</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de NocoDB
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={nocodbUrl}
                  onChange={(e) => setNocodbUrl(e.target.value)}
                  placeholder="https://nocodb.ton-domaine.com"
                  className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => window.open(nocodbUrl, '_blank')}
                  className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                  title="Ouvrir NocoDB"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token API NocoDB
              </label>
              <input
                type="password"
                value={nocodbToken}
                onChange={(e) => setNocodbToken(e.target.value)}
                placeholder="xc-token-xxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                Trouve le token dans NocoDB → Paramètres → API Tokens
              </p>
            </div>
          </div>
        </div>

        {/* Section Workflows configurés */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-violet-500/10">
              <Link2 className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Workflows configurés</h2>
              <p className="text-sm text-gray-400">Liste des workflows disponibles dans le dashboard</p>
            </div>
          </div>

          <div className="space-y-3">
            {workflows.map(workflow => (
              <div 
                key={workflow.id}
                className="flex items-center justify-between p-4 bg-dark-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{workflow.icon}</span>
                  <div>
                    <p className="font-medium text-white">{workflow.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{workflow.webhookUrl}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {workflow.category}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="mb-1"><strong>Pour modifier les workflows :</strong></p>
                <p className="text-gray-400">
                  Édite le fichier <code className="px-2 py-0.5 bg-dark-600 rounded">src/lib/config.ts</code> pour ajouter, modifier ou supprimer des workflows.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={clsx(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
              isSaved 
                ? 'bg-emerald-500 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
          >
            {isSaved ? (
              <>
                <Check className="w-5 h-5" />
                Sauvegardé !
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Sauvegarder les paramètres
              </>
            )}
          </button>
        </div>

        {/* Guide rapide */}
        <div className="card border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">📖 Guide de configuration rapide</h3>
          
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">1</span>
              <div>
                <p className="font-medium text-white">Configure les URLs</p>
                <p className="text-gray-400">Entre les URLs de ton instance n8n et NocoDB hébergées sur ton serveur OVH.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">2</span>
              <div>
                <p className="font-medium text-white">Ajoute des Webhook Triggers dans n8n</p>
                <p className="text-gray-400">Pour chaque workflow que tu veux déclencher depuis le dashboard, ajoute un nœud Webhook Trigger au début.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">3</span>
              <div>
                <p className="font-medium text-white">Configure NocoDB comme destination</p>
                <p className="text-gray-400">Dans tes workflows n8n, remplace Google Sheets par des nœuds NocoDB pour stocker les données.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">4</span>
              <div>
                <p className="font-medium text-white">Personnalise les workflows</p>
                <p className="text-gray-400">Modifie le fichier <code className="px-1.5 py-0.5 bg-dark-600 rounded">src/lib/config.ts</code> pour correspondre à tes workflows.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


