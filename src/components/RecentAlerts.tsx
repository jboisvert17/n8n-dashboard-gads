'use client';

import { Bell, ArrowRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

// Données de démonstration
const demoAlerts = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Campagne performante',
    message: 'La campagne "Search - Unscented Shampoo" a un ROAS de 5.2x',
    timestamp: 'Il y a 2 heures',
  },
  {
    id: '2',
    type: 'warning' as const,
    title: 'Analyse terminée',
    message: '15 termes de recherche identifiés comme non pertinents',
    timestamp: 'Il y a 4 heures',
  },
  {
    id: '3',
    type: 'error' as const,
    title: 'Budget dépassé',
    message: 'La campagne "Display - Retargeting" a dépassé son budget quotidien',
    timestamp: 'Il y a 6 heures',
  },
  {
    id: '4',
    type: 'info' as const,
    title: 'Nouveau rapport',
    message: 'Le rapport hebdomadaire est prêt à être consulté',
    timestamp: 'Hier',
  },
];

const alertStyles = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  error: {
    icon: AlertTriangle,
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
};

export function RecentAlerts() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-rose-400" />
          <h3 className="text-lg font-semibold text-white">Alertes récentes</h3>
        </div>
        <Link 
          href="/alerts" 
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {demoAlerts.map((alert) => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;

          return (
            <div
              key={alert.id}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-lg border',
                style.bg,
                style.border
              )}
            >
              <Icon className={clsx('w-5 h-5 mt-0.5', style.iconColor)} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{alert.title}</p>
                <p className="text-sm text-gray-400 line-clamp-2">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


