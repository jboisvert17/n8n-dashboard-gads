'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  DollarSign,
  MousePointerClick,
  Target,
  RefreshCw,
  Search,
  ArrowUpRight,
  Settings2,
  X,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { DateRangePicker, getDateRange } from '@/components/DateRangePicker';

interface AccountData {
  id: string;
  descriptiveName: string;
  currencyCode: string;
  metrics: {
    clicks: number;
    impressions: number;
    cost: number;
    conversions: number;
    ctr: number;
  };
  alertsCount: number;
}

interface AccountsResponse {
  accounts: AccountData[];
  totalAccounts: number;
  totalAlerts: number;
}

const VISIBLE_ACCOUNTS_KEY = 'google-ads-visible-accounts';
const DATE_RANGE_KEY = 'google-ads-date-range';

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AccountsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [visibleAccountIds, setVisibleAccountIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const [dateRangeId, setDateRangeId] = useState('last30');
  const [currentDates, setCurrentDates] = useState(() => getDateRange('last30'));

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
    if (session) {
      fetchAccounts(currentDates);
    }
  }, [session, currentDates]);

  // Charger les préférences de visibilité depuis localStorage
  useEffect(() => {
    if (data?.accounts && !initialized) {
      const saved = localStorage.getItem(VISIBLE_ACCOUNTS_KEY);
      if (saved) {
        try {
          const savedIds = JSON.parse(saved);
          setVisibleAccountIds(new Set(savedIds));
        } catch {
          // Si erreur, afficher tous les comptes
          setVisibleAccountIds(new Set(data.accounts.map(a => a.id)));
        }
      } else {
        // Par défaut, tous les comptes sont visibles
        setVisibleAccountIds(new Set(data.accounts.map(a => a.id)));
      }
      setInitialized(true);
    }
  }, [data, initialized]);

  // Sauvegarder les préférences quand elles changent
  useEffect(() => {
    if (initialized && visibleAccountIds.size > 0) {
      localStorage.setItem(VISIBLE_ACCOUNTS_KEY, JSON.stringify(Array.from(visibleAccountIds)));
    }
  }, [visibleAccountIds, initialized]);

  const fetchAccounts = async (dates?: { startDate: string; endDate: string }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dates) {
        params.set('startDate', dates.startDate);
        params.set('endDate', dates.endDate);
      }
      const url = `/api/google-ads/accounts${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des comptes');
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

  const toggleAccountVisibility = (accountId: string) => {
    setVisibleAccountIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        // Ne pas permettre de masquer tous les comptes
        if (newSet.size > 1) {
          newSet.delete(accountId);
        }
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const selectAllAccounts = () => {
    if (data?.accounts) {
      setVisibleAccountIds(new Set(data.accounts.map(a => a.id)));
    }
  };

  const deselectAllAccounts = () => {
    // Garder au moins le premier compte visible
    if (data?.accounts && data.accounts.length > 0) {
      setVisibleAccountIds(new Set([data.accounts[0].id]));
    }
  };

  // Filtrer par recherche ET par visibilité
  const filteredAccounts = data?.accounts.filter(account =>
    visibleAccountIds.has(account.id) &&
    (account.descriptiveName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.id.includes(searchTerm))
  ) || [];

  // Calculs totaux basés uniquement sur les comptes VISIBLES
  const visibleAccounts = data?.accounts.filter(a => visibleAccountIds.has(a.id)) || [];
  const totalCost = visibleAccounts.reduce((sum, a) => sum + a.metrics.cost, 0);
  const totalClicks = visibleAccounts.reduce((sum, a) => sum + a.metrics.clicks, 0);
  const totalConversions = visibleAccounts.reduce((sum, a) => sum + a.metrics.conversions, 0);
  const totalAlerts = visibleAccounts.reduce((sum, a) => sum + a.alertsCount, 0);

  const formatCurrency = (value: number, currency = 'CAD') => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-CA').format(Math.round(value));
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des comptes Google Ads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => fetchAccounts(currentDates)}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Comptes Google Ads</h1>
          <p className="text-gray-400">
            {visibleAccountIds.size} sur {data?.totalAccounts || 0} comptes affichés • {currentDates.startDate} → {currentDates.endDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker 
            value={dateRangeId} 
            onChange={handleDateRangeChange}
          />
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
          >
            <Settings2 className="w-4 h-4" />
            Gérer
          </button>
          <button
            onClick={() => fetchAccounts(currentDates)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Comptes affichés</span>
          </div>
          <p className="text-2xl font-bold text-white">{visibleAccountIds.size}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Dépenses totales</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Clics totaux</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalClicks)}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-gray-400 text-sm">Conversions</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalConversions)}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-gray-400 text-sm">Alertes</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalAlerts}</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un compte..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Liste des comptes */}
      <div className="flex flex-col gap-3">
        {filteredAccounts.map((account) => (
          <Link
            key={account.id}
            href={`/accounts/${account.id}`}
            className="group bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-blue-500/50 hover:bg-dark-750 transition-all duration-200"
          >
            <div className="flex items-center gap-6">
              {/* Nom du compte */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition flex items-center gap-2">
                  {account.descriptiveName}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </h3>
                <p className="text-xs text-gray-500">ID: {account.id}</p>
              </div>

              {/* Métriques en ligne */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Dépenses</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(account.metrics.cost, account.currencyCode)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Clics</p>
                  <p className="text-sm font-semibold text-white">
                    {formatNumber(account.metrics.clicks)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">CTR</p>
                  <p className={`text-sm font-semibold ${account.metrics.ctr >= 2 ? 'text-green-400' : account.metrics.ctr >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {account.metrics.ctr.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Conv.</p>
                  <p className="text-sm font-semibold text-white">
                    {formatNumber(account.metrics.conversions)}
                  </p>
                </div>
              </div>

              {/* Badge alertes */}
              {account.alertsCount > 0 ? (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full flex items-center gap-1 flex-shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  {account.alertsCount}
                </span>
              ) : (
                <span className="w-16"></span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredAccounts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucun compte trouvé</p>
        </div>
      )}

      {/* Modal de gestion des comptes */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-lg max-h-[80vh] overflow-hidden">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <div>
                <h2 className="text-xl font-bold text-white">Gérer les comptes</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Sélectionnez les comptes à afficher dans le dashboard
                </p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-2 p-4 border-b border-dark-700">
              <button
                onClick={selectAllAccounts}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm"
              >
                <Eye className="w-4 h-4" />
                Tout afficher
              </button>
              <button
                onClick={deselectAllAccounts}
                className="flex items-center gap-2 px-3 py-2 bg-dark-700 text-gray-400 rounded-lg hover:bg-dark-600 transition text-sm"
              >
                <EyeOff className="w-4 h-4" />
                Masquer tout
              </button>
            </div>

            {/* Liste des comptes */}
            <div className="overflow-y-auto max-h-[400px] p-4">
              <div className="space-y-2">
                {data?.accounts.map((account) => {
                  const isVisible = visibleAccountIds.has(account.id);
                  return (
                    <button
                      key={account.id}
                      onClick={() => toggleAccountVisibility(account.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isVisible
                          ? 'bg-blue-500/10 border-blue-500/30 text-white'
                          : 'bg-dark-700/50 border-dark-600 text-gray-500'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        isVisible ? 'bg-blue-500' : 'bg-dark-600'
                      }`}>
                        {isVisible && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${isVisible ? 'text-white' : 'text-gray-500'}`}>
                          {account.descriptiveName}
                        </p>
                        <p className="text-xs text-gray-500">ID: {account.id}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isVisible ? 'text-white' : 'text-gray-600'}`}>
                          {formatCurrency(account.metrics.cost, account.currencyCode)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer du modal */}
            <div className="flex items-center justify-between p-4 border-t border-dark-700 bg-dark-800/50">
              <p className="text-sm text-gray-400">
                {visibleAccountIds.size} compte{visibleAccountIds.size > 1 ? 's' : ''} sélectionné{visibleAccountIds.size > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Terminé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
