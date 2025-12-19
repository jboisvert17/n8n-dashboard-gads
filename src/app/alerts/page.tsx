'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Check,
  Trash2,
  Filter
} from 'lucide-react';
import clsx from 'clsx';

// Données de démonstration
const demoAlerts = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Campagne performante détectée',
    message: 'La campagne "Search - Unscented Shampoo" a atteint un ROAS de 5.2x ce mois-ci. Considérez augmenter le budget de 20-30%.',
    campaignName: 'Search - Unscented Shampoo',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: '2',
    type: 'warning' as const,
    title: 'Analyse Search Terms terminée',
    message: '15 termes de recherche ont été identifiés comme non pertinents et sont prêts à être exclus. Économies estimées: $127/mois.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: '3',
    type: 'error' as const,
    title: 'Performance critique',
    message: 'La campagne "Search - Hand Soap" a un ROAS de seulement 0.8x. Action immédiate recommandée.',
    campaignName: 'Search - Hand Soap',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: '4',
    type: 'info' as const,
    title: 'Rapport hebdomadaire disponible',
    message: 'Le rapport de performance de la semaine 50 est prêt. Cliquez pour voir les détails.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '5',
    type: 'success' as const,
    title: 'Synchronisation réussie',
    message: 'Les 43 mots-clés négatifs ont été ajoutés avec succès à vos campagnes.',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '6',
    type: 'warning' as const,
    title: 'Budget bientôt épuisé',
    message: 'La campagne "Display - Retargeting" a utilisé 85% de son budget mensuel.',
    campaignName: 'Display - Retargeting',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
    isRead: true,
  },
];

const alertStyles = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    label: 'Succès',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    label: 'Attention',
  },
  error: {
    icon: XCircle,
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    label: 'Critique',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    label: 'Info',
  },
};

type AlertType = keyof typeof alertStyles;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(demoAlerts);
  const [filter, setFilter] = useState<AlertType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (showUnreadOnly && alert.isRead) return false;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, isRead: true } : a
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, isRead: true })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Il y a moins d\'une heure';
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-CA');
  };

  return (
    <div className="min-h-screen bg-pattern">
      <Header 
        title="Alertes" 
        subtitle={`${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`} 
      />

      <div className="p-6">
        {/* Filtres et actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-4 py-2 rounded-lg transition-all',
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              )}
            >
              Toutes ({alerts.length})
            </button>
            {(Object.keys(alertStyles) as AlertType[]).map(type => {
              const style = alertStyles[type];
              const count = alerts.filter(a => a.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={clsx(
                    'px-4 py-2 rounded-lg transition-all flex items-center gap-2',
                    filter === type 
                      ? `${style.bg} ${style.iconColor}` 
                      : 'bg-dark-700 text-gray-400 hover:text-white'
                  )}
                >
                  <style.icon className="w-4 h-4" />
                  {style.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 md:ml-auto">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={clsx(
                'px-4 py-2 rounded-lg transition-all',
                showUnreadOnly
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              )}
            >
              Non lues uniquement
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-lg bg-dark-700 text-gray-400 hover:text-white transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Tout marquer lu
              </button>
            )}
          </div>
        </div>

        {/* Liste des alertes */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="card text-center py-12">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune alerte à afficher</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const style = alertStyles[alert.type];
              const Icon = style.icon;

              return (
                <div
                  key={alert.id}
                  className={clsx(
                    'card border transition-all',
                    style.border,
                    !alert.isRead && 'border-l-4',
                    alert.isRead && 'opacity-60'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={clsx('p-3 rounded-xl', style.bg)}>
                      <Icon className={clsx('w-6 h-6', style.iconColor)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{alert.title}</h3>
                            {!alert.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                          <p className="text-gray-400">{alert.message}</p>
                          {alert.campaignName && (
                            <p className="text-sm text-gray-500 mt-2">
                              Campagne: <span className="text-gray-300">{alert.campaignName}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!alert.isRead && (
                            <button
                              onClick={() => markAsRead(alert.id)}
                              className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
                              title="Marquer comme lu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-2 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


