'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { workflows, categoryColors, categoryLabels, config } from '@/lib/config';
import { Workflow } from '@/types';
import { 
  Play, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Search,
  ExternalLink,
  Settings,
  Zap
} from 'lucide-react';
import clsx from 'clsx';

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-500/60',
    button: 'bg-blue-500 hover:bg-blue-600',
    glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hover: 'hover:border-emerald-500/60',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    hover: 'hover:border-amber-500/60',
    button: 'bg-amber-500 hover:bg-amber-600',
    glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    hover: 'hover:border-rose-500/60',
    button: 'bg-rose-500 hover:bg-rose-600',
    glow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]',
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    hover: 'hover:border-violet-500/60',
    button: 'bg-violet-500 hover:bg-violet-600',
    glow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    hover: 'hover:border-cyan-500/60',
    button: 'bg-cyan-500 hover:bg-cyan-600',
    glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  },
};

type WorkflowStatus = 'idle' | 'running' | 'success' | 'error';

export default function ActionsPage() {
  const [workflowStatuses, setWorkflowStatuses] = useState<Record<string, WorkflowStatus>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [runLogs, setRunLogs] = useState<Array<{
    id: string;
    workflowName: string;
    status: 'success' | 'error';
    timestamp: Date;
    message: string;
  }>>([]);

  const categories = Array.from(new Set(workflows.map(w => w.category)));

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || workflow.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const triggerWorkflow = async (workflow: Workflow) => {
    setWorkflowStatuses(prev => ({ ...prev, [workflow.id]: 'running' }));

    try {
      // Appel via notre API proxy pour éviter les problèmes CORS
      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookPath: workflow.webhookUrl,
          data: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      setWorkflowStatuses(prev => ({ ...prev, [workflow.id]: 'success' }));
      setRunLogs(prev => [{
        id: Date.now().toString(),
        workflowName: workflow.name,
        status: 'success',
        timestamp: new Date(),
        message: 'Workflow déclenché avec succès',
      }, ...prev]);

      // Reset status après 5 secondes
      setTimeout(() => {
        setWorkflowStatuses(prev => ({ ...prev, [workflow.id]: 'idle' }));
      }, 5000);

    } catch (error) {
      console.error('Erreur:', error);
      setWorkflowStatuses(prev => ({ ...prev, [workflow.id]: 'error' }));
      setRunLogs(prev => [{
        id: Date.now().toString(),
        workflowName: workflow.name,
        status: 'error',
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      }, ...prev]);

      // Reset status après 5 secondes
      setTimeout(() => {
        setWorkflowStatuses(prev => ({ ...prev, [workflow.id]: 'idle' }));
      }, 5000);
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Play className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: WorkflowStatus) => {
    switch (status) {
      case 'running':
        return 'En cours...';
      case 'success':
        return 'Terminé !';
      case 'error':
        return 'Erreur';
      default:
        return 'Exécuter';
    }
  };

  return (
    <div className="min-h-screen bg-pattern">
      <Header 
        title="Actions & Workflows" 
        subtitle="Déclenchez vos automatisations n8n" 
      />

      <div className="p-6">
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un workflow..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={clsx(
                'px-4 py-2 rounded-lg transition-all',
                !selectedCategory 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              )}
            >
              Tous
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
                  'px-4 py-2 rounded-lg transition-all',
                  selectedCategory === category
                    ? categoryColors[category as keyof typeof categoryColors].bg + ' ' + categoryColors[category as keyof typeof categoryColors].text
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                )}
              >
                {categoryLabels[category as keyof typeof categoryLabels]}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des workflows */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {filteredWorkflows.map((workflow) => {
            const colors = colorClasses[workflow.color];
            const status = workflowStatuses[workflow.id] || 'idle';
            const isDisabled = status === 'running';

            return (
              <div
                key={workflow.id}
                className={clsx(
                  'card border transition-all duration-300',
                  colors.border,
                  colors.hover,
                  colors.glow,
                  'group'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    'p-4 rounded-xl text-3xl',
                    colors.bg
                  )}>
                    {workflow.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{workflow.name}</h3>
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded-full',
                        categoryColors[workflow.category as keyof typeof categoryColors].bg,
                        categoryColors[workflow.category as keyof typeof categoryColors].text
                      )}>
                        {categoryLabels[workflow.category as keyof typeof categoryLabels]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                      {workflow.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerWorkflow(workflow)}
                        disabled={isDisabled}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                          isDisabled ? 'bg-dark-600 text-gray-500 cursor-not-allowed' : colors.button + ' text-white',
                          !isDisabled && 'hover:scale-[1.02]'
                        )}
                      >
                        {getStatusIcon(status)}
                        {getStatusText(status)}
                      </button>
                      
                      <button
                        className="p-2 rounded-lg bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                        title="Ouvrir dans n8n"
                        onClick={() => window.open(`${config.n8nBaseUrl}/workflow`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Logs d'exécution */}
        {runLogs.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Historique des exécutions</h3>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {runLogs.map((log) => (
                <div
                  key={log.id}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-lg',
                    log.status === 'success' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                  )}
                >
                  {log.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{log.workflowName}</p>
                    <p className="text-xs text-gray-400">{log.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {log.timestamp.toLocaleTimeString('fr-CA')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info configuration */}
        <div className="mt-8 p-4 bg-dark-700/50 border border-dark-600 rounded-lg">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-300">
                <strong>Configuration requise :</strong> Pour que les boutons fonctionnent, 
                tu dois ajouter un nœud <code className="px-1.5 py-0.5 bg-dark-600 rounded text-blue-400">Webhook Trigger</code> au début de chaque workflow n8n.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Les URLs des webhooks sont configurables dans le fichier <code className="px-1.5 py-0.5 bg-dark-600 rounded">src/lib/config.ts</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

