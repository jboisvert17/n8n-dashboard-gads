'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Pause,
  Play,
  Zap,
  BarChart3
} from 'lucide-react';
import { workflows } from '@/lib/config';
import { DateRangePicker, getDateRange } from '@/components/DateRangePicker';

interface CampaignData {
  id: string;
  name: string;
  status: string;
  budget: number;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
}

interface AccountDetailData {
  customerId: string;
  customerName: string;
  currencyCode: string;
  metrics: {
    clicks: number;
    impressions: number;
    cost: number;
    conversions: number;
    ctr: number;
    averageCpc: number;
  };
  campaigns: CampaignData[];
  alerts: { type: string; message: string; severity: 'low' | 'medium' | 'high' }[];
}

const DATE_RANGE_KEY = 'google-ads-date-range';

export default function AccountDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;
  
  const [data, setData] = useState<AccountDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState<string | null>(null);
  const [dateRangeId, setDateRangeId] = useState('last30');
  const [currentDates, setCurrentDates] = useState(() => getDateRange('last30'));
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'ENABLED' | 'PAUSED'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Charger la période sauvegardée
  useEffect(() => {
    const saved = localStorage.getItem(DATE_RANGE_KEY);
    if (saved) {
      setDateRangeId(saved);
      setCurrentDates(getDateRange(saved));
    }
  }, []);

  useEffect(() => {
    if (session && accountId) {
      fetchAccountData(currentDates);
    }
  }, [session, accountId, currentDates]);

  const fetchAccountData = async (dates?: { startDate: string; endDate: string }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dates) {
        params.set('startDate', dates.startDate);
        params.set('endDate', dates.endDate);
      }
      const url = `/api/google-ads/accounts/${accountId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du compte');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (rangeId: string, dates: { startDate: string; endDate: string }) => {
    setDateRangeId(rangeId);
    setCurrentDates(dates);
    localStorage.setItem(DATE_RANGE_KEY, rangeId);
  };

  const triggerWorkflow = async (workflowId: string, webhookPath: string) => {
    setTriggeringWorkflow(workflowId);
    try {
      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookPath,
          data: { customerId: accountId }
        }),
      });
      
      if (response.ok) {
        alert('Workflow déclenché avec succès !');
      } else {
        alert('Erreur lors du déclenchement');
      }
    } catch (err) {
      alert('Erreur: ' + String(err));
    } finally {
      setTriggeringWorkflow(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: data?.currencyCode || 'CAD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-CA').format(Math.round(value));
  };

  const getStatusBadge = (campaignStatus: string) => {
    switch (campaignStatus) {
      case 'ENABLED':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1"><Play className="w-3 h-3" /> Actif</span>;
      case 'PAUSED':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1"><Pause className="w-3 h-3" /> Pause</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">{campaignStatus}</span>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des données du compte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchAccountData(currentDates)}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/accounts"
          className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">{data?.customerName || `Compte ${accountId}`}</h1>
          <p className="text-gray-400">ID: {accountId} • {currentDates.startDate} → {currentDates.endDate}</p>
        </div>
        <DateRangePicker 
          value={dateRangeId} 
          onChange={handleDateRangeChange}
        />
        <button
          onClick={() => fetchAccountData(currentDates)}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm">Dépenses</span>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(data?.metrics.cost || 0)}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Clics</span>
          </div>
          <p className="text-xl font-bold text-white">{formatNumber(data?.metrics.clicks || 0)}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Impressions</span>
          </div>
          <p className="text-xl font-bold text-white">{formatNumber(data?.metrics.impressions || 0)}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-400" />
            <span className="text-gray-400 text-sm">Conversions</span>
          </div>
          <p className="text-xl font-bold text-white">{formatNumber(data?.metrics.conversions || 0)}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">CTR</span>
          </div>
          <p className={`text-xl font-bold ${(data?.metrics.ctr || 0) >= 2 ? 'text-green-400' : 'text-white'}`}>
            {(data?.metrics.ctr || 0).toFixed(2)}%
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-pink-400" />
            <span className="text-gray-400 text-sm">CPC moyen</span>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(data?.metrics.averageCpc || 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campagnes */}
        <div className="lg:col-span-2 bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Campagnes ({(campaignFilter === 'all' 
                ? data?.campaigns.length 
                : data?.campaigns.filter(c => c.status === campaignFilter).length) || 0})
            </h2>
            
            {/* Filtres */}
            <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => setCampaignFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  campaignFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setCampaignFilter('ENABLED')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  campaignFilter === 'ENABLED'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3" />
                Actives
              </button>
              <button
                onClick={() => setCampaignFilter('PAUSED')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  campaignFilter === 'PAUSED'
                    ? 'bg-yellow-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Pause className="w-3 h-3" />
                Pause
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-dark-700">
                  <th className="pb-3 font-medium">Campagne</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium text-right">Dépenses</th>
                  <th className="pb-3 font-medium text-right">Clics</th>
                  <th className="pb-3 font-medium text-right">Conv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {data?.campaigns
                  .filter(c => campaignFilter === 'all' || c.status === campaignFilter)
                  .slice(0, 15)
                  .map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-dark-750">
                    <td className="py-3">
                      <p className="text-white font-medium truncate max-w-[200px]" title={campaign.name}>
                        {campaign.name}
                      </p>
                    </td>
                    <td className="py-3">{getStatusBadge(campaign.status)}</td>
                    <td className="py-3 text-right text-white">{formatCurrency(campaign.cost)}</td>
                    <td className="py-3 text-right text-gray-300">{formatNumber(campaign.clicks)}</td>
                    <td className="py-3 text-right text-gray-300">{formatNumber(campaign.conversions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!data?.campaigns || data.campaigns.filter(c => campaignFilter === 'all' || c.status === campaignFilter).length === 0) && (
            <p className="text-center text-gray-500 py-8">Aucune campagne trouvée</p>
          )}
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Alertes */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Alertes ({data?.alerts.length || 0})
            </h2>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {data?.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <p className="font-medium text-sm">{alert.type}</p>
                  <p className="text-xs opacity-80 mt-1">{alert.message}</p>
                </div>
              ))}
              
              {(!data?.alerts || data.alerts.length === 0) && (
                <p className="text-center text-gray-500 py-4">Aucune alerte</p>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Actions rapides
            </h2>
            
            <div className="space-y-2">
              {workflows.slice(0, 4).map((workflow) => (
                <button
                  key={workflow.id}
                  onClick={() => triggerWorkflow(workflow.id, workflow.webhookUrl)}
                  disabled={triggeringWorkflow === workflow.id}
                  className="w-full text-left p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition flex items-center gap-3 disabled:opacity-50"
                >
                  <span className="text-xl">{workflow.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{workflow.name}</p>
                  </div>
                  {triggeringWorkflow === workflow.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
