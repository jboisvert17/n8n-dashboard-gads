'use client';

import { Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { workflows } from '@/lib/config';
import clsx from 'clsx';

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

export function QuickActions() {
  // Affiche les 3 premiers workflows
  const quickWorkflows = workflows.slice(0, 3);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Actions rapides</h3>
        </div>
        <Link 
          href="/actions" 
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {quickWorkflows.map((workflow) => (
          <button
            key={workflow.id}
            className={clsx(
              'w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
              'hover:scale-[1.02] hover:shadow-lg',
              colorClasses[workflow.color]
            )}
          >
            <span className="text-2xl">{workflow.icon}</span>
            <div className="flex-1 text-left">
              <p className="font-medium text-white">{workflow.name}</p>
              <p className="text-sm text-gray-400 line-clamp-1">{workflow.description}</p>
            </div>
            <ArrowRight className="w-5 h-5 opacity-50" />
          </button>
        ))}
      </div>
    </div>
  );
}


