'use client';

import { 
  useNocoDB,
  SearchTermAnalysis, 
  ActionStatus,
  ExclusionLevel
} from '@/lib/useNocoDB';
import { useClient } from '@/lib/ClientContext';
import { 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  Loader2,
  X,
  Check,
  Zap,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square
} from 'lucide-react';
import { useState, useMemo } from 'react';
import clsx from 'clsx';

type SortField = 'search_term' | 'cost' | 'clicks' | 'impressions' | 'conversions' | 'roas';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'pending' | 'excluded';
type Step = 'selection' | 'exclusion';

// Actions possibles sur un terme
type TermAction = 'keep' | 'exclude' | null;

interface TermWithAction extends SearchTermAnalysis {
  action: TermAction;
  selected: boolean;
}

export function SearchTermsTable() {
  const { selectedClient } = useClient();
  
  // Utiliser le tableId du client sélectionné ou la table par défaut
  const { data, loading, error, refetch } = useNocoDB<SearchTermAnalysis>({
    table: 'searchTermsAnalysis',
    limit: 500,
    sort: '-CreatedAt',
    tableId: selectedClient?.nocodb_table_id, // Utiliser la table du client sélectionné
  });
  
  // États de l'interface
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('pending');
  const [sortField, setSortField] = useState<SortField>('cost');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // États des actions
  const [termActions, setTermActions] = useState<Map<number, TermAction>>(new Map());
  const [selectedTerms, setSelectedTerms] = useState<Set<number>>(new Set());
  
  // États du workflow
  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [exclusionLevel, setExclusionLevel] = useState<ExclusionLevel>('campaign');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État du popup de confirmation
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [resultData, setResultData] = useState<{
    success: boolean;
    count: number;
    level: string;
    savings: number;
    terms: string[];
    error?: string;
  } | null>(null);

  // Données enrichies avec les actions
  const enrichedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      action: termActions.get(item.Id) || null,
      selected: selectedTerms.has(item.Id)
    }));
  }, [data, termActions, selectedTerms]);

  // Filtrer les données
  const filteredData = useMemo(() => {
    return enrichedData
      .filter(item => {
        // Filtre de recherche
        const matchesSearch = 
          item.search_term?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.reason?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filtre de statut
        if (filterType === 'pending') {
          return matchesSearch && item.action_status !== 'excluded';
        }
        if (filterType === 'excluded') {
          return matchesSearch && item.action_status === 'excluded';
        }
        return matchesSearch;
      })
      .sort((a, b) => {
        const aVal = a[sortField] ?? 0;
        const bVal = b[sortField] ?? 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      });
  }, [enrichedData, searchQuery, filterType, sortField, sortDirection]);

  // Termes avec une action définie
  const termsWithAction = useMemo(() => {
    return enrichedData.filter(t => t.action !== null);
  }, [enrichedData]);

  // Termes à exclure
  const termsToExclude = useMemo(() => {
    return enrichedData.filter(t => t.action === 'exclude');
  }, [enrichedData]);

  // Statistiques
  const stats = useMemo(() => {
    const pending = data.filter(d => d.action_status !== 'excluded').length;
    const excluded = data.filter(d => d.action_status === 'excluded').length;
    const toExclude = termsToExclude.length;
    const toKeep = enrichedData.filter(t => t.action === 'keep').length;
    const potentialSavings = termsToExclude.reduce((sum, d) => sum + (d.cost || 0), 0);
    
    return { pending, excluded, toExclude, toKeep, potentialSavings };
  }, [data, enrichedData, termsToExclude]);

  const formatCurrency = (value: number) => 
    typeof value === 'number' ? `$${value.toFixed(2)}` : '-';

  // Gérer le tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Gérer la sélection
  const toggleSelect = (id: number) => {
    setSelectedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Sélectionner/désélectionner tout
  const toggleSelectAll = () => {
    if (selectedTerms.size === filteredData.length) {
      setSelectedTerms(new Set());
    } else {
      setSelectedTerms(new Set(filteredData.map(t => t.Id)));
    }
  };

  // Définir l'action pour un terme
  const setAction = (id: number, action: TermAction) => {
    setTermActions(prev => {
      const newMap = new Map(prev);
      if (action === null) {
        newMap.delete(id);
      } else {
        newMap.set(id, action);
      }
      return newMap;
    });
  };

  // Appliquer une action aux termes sélectionnés
  const applyActionToSelected = (action: TermAction) => {
    selectedTerms.forEach(id => {
      setAction(id, action);
    });
    setSelectedTerms(new Set());
  };

  // Marquer tous les non-pertinents (selon l'IA) comme à exclure
  const markAllNonRelevantAsExclude = () => {
    const nonRelevant = filteredData.filter(t => !t.is_relevant && t.action_status !== 'excluded');
    nonRelevant.forEach(t => {
      setAction(t.Id, 'exclude');
    });
  };

  // Labels pour les niveaux d'exclusion
  const levelLabels: Record<ExclusionLevel, string> = {
    'ad_group': 'Ad Group',
    'campaign': 'Campaign',
    'list': 'Liste partagée'
  };

  // Soumettre les exclusions à n8n
  const submitExclusions = async () => {
    if (termsToExclude.length === 0) return;
    
    setIsSubmitting(true);
    const termsData = termsToExclude.map(t => ({
      id: t.Id,
      search_term: t.search_term,
      cost: t.cost || 0,
      clicks: t.clicks || 0,
      impressions: t.impressions || 0,
      reason: t.reason || '',
      // Données Google Ads pour l'exclusion
      customer_id: t.customer_id || '',
      customer_name: t.customer_name || '',
      campaign_id: t.campaign_id || '',
      campaign_name: t.campaign_name || '',
      ad_group_id: t.ad_group_id || '',
      ad_group_name: t.ad_group_name || '',
      match_type: t.match_type || 'EXACT'
    }));
    
    const totalSavings = termsData.reduce((sum, t) => sum + t.cost, 0);
    
    try {
      const payload = {
        workflowId: 'apply-negative-keywords',
        payload: {
          action: 'apply_exclusions',
          exclusion_level: exclusionLevel,
          terms_to_exclude: termsData,
          total_count: termsToExclude.length
        }
      };

      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Afficher le popup de succès
        setResultData({
          success: true,
          count: termsToExclude.length,
          level: levelLabels[exclusionLevel],
          savings: totalSavings,
          terms: termsData.map(t => t.search_term)
        });
        setShowResultPopup(true);
        
        // Reset
        setTermActions(new Map());
        setSelectedTerms(new Set());
        setCurrentStep('selection');
        
        // Rafraîchir les données
        await refetch();
      } else {
        const errorData = await response.json();
        setResultData({
          success: false,
          count: 0,
          level: '',
          savings: 0,
          terms: [],
          error: errorData.error || 'Erreur inconnue'
        });
        setShowResultPopup(true);
      }
    } catch (err) {
      setResultData({
        success: false,
        count: 0,
        level: '',
        savings: 0,
        terms: [],
        error: String(err)
      });
      setShowResultPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu de l'en-tête de colonne triable
  const SortableHeader = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: 'left' | 'right' }) => (
    <th 
      className={clsx(
        "py-3 px-4 text-gray-400 font-medium cursor-pointer hover:text-white transition",
        align === 'right' ? 'text-right' : 'text-left'
      )}
      onClick={() => handleSort(field)}
    >
      <div className={clsx("flex items-center gap-1", align === 'right' && "justify-end")}>
        {label}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-3 text-gray-400">Chargement des données NocoDB...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-rose-500/10 border-rose-500/30">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          <div>
            <p className="font-medium text-white">Erreur de connexion NocoDB</p>
            <p className="text-sm text-gray-400">{error}</p>
            <button onClick={refetch} className="mt-2 text-sm text-blue-400 hover:underline">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAPE 2 : Choix du niveau d'exclusion
  if (currentStep === 'exclusion') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentStep('selection')}
            className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Niveau d'exclusion</h2>
            <p className="text-gray-400">{termsToExclude.length} mots-clés à exclure</p>
          </div>
        </div>

        {/* Liste des termes à exclure */}
        <div className="card max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-white mb-3">Mots-clés à exclure :</h3>
          <div className="flex flex-wrap gap-2">
            {termsToExclude.map(term => (
              <span 
                key={term.Id}
                className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-sm flex items-center gap-2"
              >
                {term.search_term}
                <button 
                  onClick={() => setAction(term.Id, null)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Économie potentielle : <span className="text-emerald-400 font-medium">{formatCurrency(stats.potentialSavings)}</span>
          </p>
        </div>

        {/* Choix du niveau */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Où exclure ces mots-clés ?</h3>
          
          <div className="space-y-3">
            <label 
              className={clsx(
                "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition",
                exclusionLevel === 'ad_group' 
                  ? "bg-blue-500/20 border-blue-500/50" 
                  : "bg-dark-700 border-dark-600 hover:border-dark-500"
              )}
            >
              <input 
                type="radio" 
                name="level" 
                checked={exclusionLevel === 'ad_group'}
                onChange={() => setExclusionLevel('ad_group')}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-white">Ad Group</p>
                <p className="text-sm text-gray-400">
                  Exclure uniquement dans le groupe d'annonces où le terme a été trouvé.
                  Idéal pour un contrôle granulaire.
                </p>
              </div>
            </label>

            <label 
              className={clsx(
                "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition",
                exclusionLevel === 'campaign' 
                  ? "bg-blue-500/20 border-blue-500/50" 
                  : "bg-dark-700 border-dark-600 hover:border-dark-500"
              )}
            >
              <input 
                type="radio" 
                name="level" 
                checked={exclusionLevel === 'campaign'}
                onChange={() => setExclusionLevel('campaign')}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-white">Campaign</p>
                <p className="text-sm text-gray-400">
                  Exclure dans toute la campagne concernée.
                  Recommandé pour la plupart des cas.
                </p>
              </div>
            </label>

            <label 
              className={clsx(
                "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition",
                exclusionLevel === 'list' 
                  ? "bg-blue-500/20 border-blue-500/50" 
                  : "bg-dark-700 border-dark-600 hover:border-dark-500"
              )}
            >
              <input 
                type="radio" 
                name="level" 
                checked={exclusionLevel === 'list'}
                onChange={() => setExclusionLevel('list')}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-white">Liste partagée</p>
                <p className="text-sm text-gray-400">
                  Ajouter à une liste de mots-clés négatifs partagée entre plusieurs campagnes.
                  Idéal pour des exclusions globales.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('selection')}
            className="px-6 py-3 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <button
            onClick={submitExclusions}
            disabled={isSubmitting || termsToExclude.length === 0}
            className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Exclure {termsToExclude.length} mots-clés
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Composant Popup de résultat
  const ResultPopup = () => {
    if (!showResultPopup || !resultData) return null;
    
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-dark-800 border border-dark-600 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className={clsx(
            "p-6 text-center",
            resultData.success ? "bg-emerald-500/20" : "bg-rose-500/20"
          )}>
            <div className={clsx(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              resultData.success ? "bg-emerald-500" : "bg-rose-500"
            )}>
              {resultData.success ? (
                <Check className="w-8 h-8 text-white" />
              ) : (
                <X className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {resultData.success ? 'Exclusions envoyées !' : 'Erreur'}
            </h2>
          </div>
          
          {/* Contenu */}
          <div className="p-6">
            {resultData.success ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-dark-700 rounded-lg">
                    <p className="text-3xl font-bold text-white">{resultData.count}</p>
                    <p className="text-sm text-gray-400">mots-clés</p>
                  </div>
                  <div className="text-center p-3 bg-dark-700 rounded-lg">
                    <p className="text-lg font-bold text-blue-400">{resultData.level}</p>
                    <p className="text-sm text-gray-400">niveau</p>
                  </div>
                  <div className="text-center p-3 bg-dark-700 rounded-lg">
                    <p className="text-xl font-bold text-emerald-400">${resultData.savings.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">économies</p>
                  </div>
                </div>
                
                {/* Liste des termes */}
                <div className="bg-dark-700 rounded-lg p-4 max-h-48 overflow-y-auto mb-6">
                  <p className="text-sm text-gray-400 mb-2">Mots-clés exclus :</p>
                  <div className="flex flex-wrap gap-2">
                    {resultData.terms.slice(0, 15).map((term, i) => (
                      <span key={i} className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded text-sm">
                        {term}
                      </span>
                    ))}
                    {resultData.terms.length > 15 && (
                      <span className="px-2 py-1 text-gray-500 text-sm">
                        +{resultData.terms.length - 15} autres
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 text-center mb-4">
                  Le workflow n8n traite actuellement vos exclusions.<br/>
                  Les statuts seront mis à jour dans NocoDB.
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-rose-400 mb-2">Une erreur s'est produite :</p>
                <p className="text-gray-300 bg-dark-700 rounded-lg p-3 text-sm">
                  {resultData.error}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-dark-600">
            <button
              onClick={() => setShowResultPopup(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ÉTAPE 1 : Sélection des mots-clés
  return (
    <div className="space-y-4">
      {/* Popup de résultat */}
      <ResultPopup />
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-400">À traiter</p>
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="card text-center bg-emerald-500/10 border-emerald-500/30">
          <p className="text-sm text-gray-400">Marqués "Garder"</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.toKeep}</p>
        </div>
        <div className="card text-center bg-rose-500/10 border-rose-500/30">
          <p className="text-sm text-gray-400">Marqués "Exclure"</p>
          <p className="text-2xl font-bold text-rose-400">{stats.toExclude}</p>
        </div>
        <div className="card text-center bg-gray-500/10 border-gray-500/30">
          <p className="text-sm text-gray-400">Déjà exclus</p>
          <p className="text-2xl font-bold text-gray-400">{stats.excluded}</p>
        </div>
        <div className="card text-center bg-blue-500/10 border-blue-500/30">
          <p className="text-sm text-gray-400">Économies potentielles</p>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.potentialSavings)}</p>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1 w-full lg:w-auto">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un terme ou une raison..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            {(['pending', 'excluded', 'all'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm transition',
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                )}
              >
                {type === 'pending' && 'À traiter'}
                {type === 'excluded' && 'Exclus'}
                {type === 'all' && 'Tous'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Actions sur sélection */}
          {selectedTerms.size > 0 && (
            <>
              <button
                onClick={() => applyActionToSelected('keep')}
                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Garder ({selectedTerms.size})
              </button>
              <button
                onClick={() => applyActionToSelected('exclude')}
                className="px-4 py-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Exclure ({selectedTerms.size})
              </button>
            </>
          )}

          <button
            onClick={markAllNonRelevantAsExclude}
            className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition flex items-center gap-2"
            title="Marquer tous les termes non-pertinents (selon l'IA) comme à exclure"
          >
            <AlertTriangle className="w-4 h-4" />
            Auto-exclure IA
          </button>

          <button
            onClick={refetch}
            className="px-4 py-2 rounded-lg bg-dark-700 text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="py-3 px-4 text-left">
                  <button 
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-dark-600 rounded transition"
                  >
                    {selectedTerms.size === filteredData.length && filteredData.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </th>
                <SortableHeader field="search_term" label="Terme de recherche" />
                <SortableHeader field="cost" label="Coût" align="right" />
                <SortableHeader field="clicks" label="Clics" align="right" />
                <SortableHeader field="impressions" label="Impr." align="right" />
                <SortableHeader field="conversions" label="Conv." align="right" />
                <SortableHeader field="roas" label="ROAS" align="right" />
                <th className="py-3 px-4 text-left text-gray-400 font-medium">Raison IA</th>
                <th className="py-3 px-4 text-center text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 100).map((item) => (
                <tr 
                  key={item.Id}
                  className={clsx(
                    'border-b border-dark-700 hover:bg-dark-700/50 transition-colors',
                    item.action === 'exclude' && 'bg-rose-500/5',
                    item.action === 'keep' && 'bg-emerald-500/5',
                    item.action_status === 'excluded' && 'opacity-50'
                  )}
                >
                  {/* Checkbox */}
                  <td className="py-3 px-4">
                    {item.action_status !== 'excluded' && (
                      <button 
                        onClick={() => toggleSelect(item.Id)}
                        className="p-1 hover:bg-dark-600 rounded transition"
                      >
                        {item.selected ? (
                          <CheckSquare className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    )}
                  </td>
                  
                  {/* Terme */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {!item.is_relevant && (
                        <span title="Non pertinent selon l'IA">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                        </span>
                      )}
                      <span className="text-white font-medium truncate max-w-[200px]" title={item.search_term}>
                        {item.search_term}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-right text-gray-300">{formatCurrency(item.cost)}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{item.clicks?.toLocaleString() || '-'}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{item.impressions?.toLocaleString() || '-'}</td>
                  <td className="py-3 px-4 text-right text-gray-300">{item.conversions || 0}</td>
                  <td className={clsx(
                    'py-3 px-4 text-right font-medium',
                    item.roas >= 4 ? 'text-emerald-400' :
                    item.roas >= 2 ? 'text-blue-400' :
                    item.roas >= 1 ? 'text-amber-400' : 'text-rose-400'
                  )}>
                    {item.roas ? `${item.roas.toFixed(1)}x` : '-'}
                  </td>
                  
                  {/* Raison */}
                  <td className="py-3 px-4 text-gray-400 max-w-[200px]">
                    <span className="truncate block text-xs" title={item.reason}>
                      {item.reason || '-'}
                    </span>
                  </td>
                  
                  {/* Boutons d'action */}
                  <td className="py-3 px-4">
                    {item.action_status === 'excluded' ? (
                      <span className="text-xs text-gray-500">Exclu</span>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setAction(item.Id, item.action === 'keep' ? null : 'keep')}
                          className={clsx(
                            'p-2 rounded-lg transition',
                            item.action === 'keep'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-dark-600 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/20'
                          )}
                          title="Conserver"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAction(item.Id, item.action === 'exclude' ? null : 'exclude')}
                          className={clsx(
                            'p-2 rounded-lg transition',
                            item.action === 'exclude'
                              ? 'bg-rose-500 text-white'
                              : 'bg-dark-600 text-gray-400 hover:text-rose-400 hover:bg-rose-500/20'
                          )}
                          title="Exclure"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length > 100 && (
          <div className="text-center py-4 text-gray-500 border-t border-dark-700">
            Affichage de 100 sur {filteredData.length} résultats
          </div>
        )}
        
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun terme trouvé
          </div>
        )}
      </div>

      {/* Bouton Suivant (fixe en bas) */}
      {termsWithAction.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-900/95 border-t border-dark-700 p-4 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-gray-300">
              <span className="text-emerald-400 font-medium">{stats.toKeep}</span> à conserver • 
              <span className="text-rose-400 font-medium ml-1">{stats.toExclude}</span> à exclure
              {stats.toExclude > 0 && (
                <span className="ml-2 text-gray-500">
                  (économie : <span className="text-blue-400">{formatCurrency(stats.potentialSavings)}</span>)
                </span>
              )}
            </div>
            
            <button
              onClick={() => setCurrentStep('exclusion')}
              disabled={stats.toExclude === 0}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Espaceur pour le bouton fixe */}
      {termsWithAction.length > 0 && <div className="h-20" />}
    </div>
  );
}
