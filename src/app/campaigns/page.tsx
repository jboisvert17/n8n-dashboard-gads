'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreVertical,
  Eye
} from 'lucide-react';
import clsx from 'clsx';

// Données de démonstration - En production, tu récupéreras ça depuis NocoDB
const demoCampaigns = [
  {
    id: '1',
    name: 'Search - Unscented Shampoo',
    status: 'ENABLED',
    type: 'SEARCH',
    performanceScore: 87,
    performanceTier: 'Excellent',
    alertLevel: 'normal',
    metrics: {
      impressions: 45230,
      clicks: 2156,
      cost: 1250.00,
      conversions: 68,
      ctr: 4.77,
      conversionRate: 3.15,
      costPerConversion: 18.38,
      roas: 5.2,
    },
  },
  {
    id: '2',
    name: 'Search - Laundry Detergent',
    status: 'ENABLED',
    type: 'SEARCH',
    performanceScore: 72,
    performanceTier: 'Good',
    alertLevel: 'normal',
    metrics: {
      impressions: 38450,
      clicks: 1823,
      cost: 980.00,
      conversions: 45,
      ctr: 4.74,
      conversionRate: 2.47,
      costPerConversion: 21.78,
      roas: 3.8,
    },
  },
  {
    id: '3',
    name: 'Display - Retargeting',
    status: 'ENABLED',
    type: 'DISPLAY',
    performanceScore: 45,
    performanceTier: 'Fair',
    alertLevel: 'warning',
    metrics: {
      impressions: 125000,
      clicks: 890,
      cost: 450.00,
      conversions: 12,
      ctr: 0.71,
      conversionRate: 1.35,
      costPerConversion: 37.50,
      roas: 2.1,
    },
  },
  {
    id: '4',
    name: 'Shopping - All Products',
    status: 'ENABLED',
    type: 'SHOPPING',
    performanceScore: 81,
    performanceTier: 'Excellent',
    alertLevel: 'normal',
    metrics: {
      impressions: 89000,
      clicks: 4200,
      cost: 2100.00,
      conversions: 95,
      ctr: 4.72,
      conversionRate: 2.26,
      costPerConversion: 22.11,
      roas: 4.5,
    },
  },
  {
    id: '5',
    name: 'Search - Hand Soap',
    status: 'PAUSED',
    type: 'SEARCH',
    performanceScore: 28,
    performanceTier: 'Underperforming',
    alertLevel: 'critical',
    metrics: {
      impressions: 12000,
      clicks: 340,
      cost: 320.00,
      conversions: 3,
      ctr: 2.83,
      conversionRate: 0.88,
      costPerConversion: 106.67,
      roas: 0.8,
    },
  },
  {
    id: '6',
    name: 'Video - Brand Awareness',
    status: 'ENABLED',
    type: 'VIDEO',
    performanceScore: 65,
    performanceTier: 'Good',
    alertLevel: 'normal',
    metrics: {
      impressions: 250000,
      clicks: 3200,
      cost: 800.00,
      conversions: 28,
      ctr: 1.28,
      conversionRate: 0.88,
      costPerConversion: 28.57,
      roas: 3.2,
    },
  },
];

const tierColors = {
  'Excellent': 'text-emerald-400 bg-emerald-500/10',
  'Good': 'text-blue-400 bg-blue-500/10',
  'Fair': 'text-amber-400 bg-amber-500/10',
  'Underperforming': 'text-rose-400 bg-rose-500/10',
};

const statusColors = {
  'ENABLED': 'text-emerald-400',
  'PAUSED': 'text-amber-400',
  'REMOVED': 'text-gray-400',
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'spend' | 'roas'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const filteredCampaigns = demoCampaigns
    .filter(campaign => 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'score':
          comparison = a.performanceScore - b.performanceScore;
          break;
        case 'spend':
          comparison = a.metrics.cost - b.metrics.cost;
          break;
        case 'roas':
          comparison = a.metrics.roas - b.metrics.roas;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(value);

  const formatNumber = (value: number) => 
    new Intl.NumberFormat('fr-CA').format(value);

  return (
    <div className="min-h-screen bg-pattern">
      <Header 
        title="Campagnes" 
        subtitle="Liste de toutes vos campagnes Google Ads" 
      />

      <div className="p-6">
        {/* Barre de recherche */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher une campagne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Tableau des campagnes */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Campagne
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                    <button 
                      onClick={() => handleSort('score')}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Score
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Impressions</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Clics</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">CTR</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">
                    <button 
                      onClick={() => handleSort('spend')}
                      className="flex items-center gap-1 hover:text-white transition-colors ml-auto"
                    >
                      Dépenses
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Conv.</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">
                    <button 
                      onClick={() => handleSort('roas')}
                      className="flex items-center gap-1 hover:text-white transition-colors ml-auto"
                    >
                      ROAS
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr 
                    key={campaign.id}
                    className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-white">{campaign.name}</p>
                        <p className="text-xs text-gray-500">{campaign.type}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={clsx(
                        'text-sm',
                        statusColors[campaign.status as keyof typeof statusColors]
                      )}>
                        {campaign.status === 'ENABLED' ? '● Actif' : campaign.status === 'PAUSED' ? '◐ Pausé' : '○ Supprimé'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-dark-600 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              'h-full rounded-full',
                              campaign.performanceScore >= 75 ? 'bg-emerald-500' :
                              campaign.performanceScore >= 50 ? 'bg-blue-500' :
                              campaign.performanceScore >= 25 ? 'bg-amber-500' : 'bg-rose-500'
                            )}
                            style={{ width: `${campaign.performanceScore}%` }}
                          />
                        </div>
                        <span className={clsx(
                          'text-sm px-2 py-0.5 rounded-full',
                          tierColors[campaign.performanceTier as keyof typeof tierColors]
                        )}>
                          {campaign.performanceScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-300">
                      {formatNumber(campaign.metrics.impressions)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-300">
                      {formatNumber(campaign.metrics.clicks)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-300">
                      {campaign.metrics.ctr.toFixed(2)}%
                    </td>
                    <td className="py-4 px-4 text-right text-white font-medium">
                      {formatCurrency(campaign.metrics.cost)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-300">
                      {campaign.metrics.conversions}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={clsx(
                        'font-medium',
                        campaign.metrics.roas >= 4 ? 'text-emerald-400' :
                        campaign.metrics.roas >= 2 ? 'text-blue-400' :
                        campaign.metrics.roas >= 1 ? 'text-amber-400' : 'text-rose-400'
                      )}>
                        {campaign.metrics.roas.toFixed(1)}x
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-sm text-gray-400">Total dépenses</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(demoCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0))}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-400">Total conversions</p>
            <p className="text-2xl font-bold text-white">
              {demoCampaigns.reduce((sum, c) => sum + c.metrics.conversions, 0)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-400">ROAS moyen</p>
            <p className="text-2xl font-bold text-emerald-400">
              {(demoCampaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / demoCampaigns.length).toFixed(1)}x
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-400">Score moyen</p>
            <p className="text-2xl font-bold text-blue-400">
              {Math.round(demoCampaigns.reduce((sum, c) => sum + c.performanceScore, 0) / demoCampaigns.length)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


