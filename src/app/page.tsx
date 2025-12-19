'use client';

import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { PerformanceChart } from '@/components/PerformanceChart';
import { QuickActions } from '@/components/QuickActions';
import { RecentAlerts } from '@/components/RecentAlerts';
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Données de démonstration - En production, tu récupéreras ça depuis NocoDB
const demoMetrics = {
  totalSpend: 8450.00,
  totalConversions: 234,
  averageRoas: 4.2,
  activeCampaigns: 12,
  excellentCampaigns: 5,
  warningCampaigns: 2,
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-pattern">
      <Header 
        title="Dashboard" 
        subtitle="Vue d'ensemble de vos campagnes Google Ads" 
      />

      <div className="p-6 space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Dépenses totales"
            value={`$${demoMetrics.totalSpend.toLocaleString('fr-CA')}`}
            subtitle="Ce mois-ci"
            icon={DollarSign}
            color="blue"
            trend={{ value: 12.5, label: 'vs mois dernier' }}
          />
          <MetricCard
            title="Conversions"
            value={demoMetrics.totalConversions}
            subtitle="Ce mois-ci"
            icon={Target}
            color="emerald"
            trend={{ value: 8.3, label: 'vs mois dernier' }}
          />
          <MetricCard
            title="ROAS moyen"
            value={`${demoMetrics.averageRoas}x`}
            subtitle="Retour sur dépenses"
            icon={TrendingUp}
            color="violet"
            trend={{ value: 5.2, label: 'vs mois dernier' }}
          />
          <MetricCard
            title="Campagnes actives"
            value={demoMetrics.activeCampaigns}
            subtitle={`${demoMetrics.excellentCampaigns} excellentes`}
            icon={BarChart3}
            color="cyan"
          />
        </div>

        {/* Statut des campagnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{demoMetrics.excellentCampaigns}</p>
              <p className="text-sm text-gray-400">Campagnes excellentes</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{demoMetrics.warningCampaigns}</p>
              <p className="text-sm text-gray-400">Nécessitent attention</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {demoMetrics.activeCampaigns - demoMetrics.excellentCampaigns - demoMetrics.warningCampaigns}
              </p>
              <p className="text-sm text-gray-400">Performance normale</p>
            </div>
          </div>
        </div>

        {/* Graphique et Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart data={[]} />
          </div>
          <div className="space-y-6">
            <QuickActions />
          </div>
        </div>

        {/* Alertes récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentAlerts />
          
          {/* Résumé des analyses */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              🔍 Dernière analyse Search Terms
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">Termes analysés</p>
                  <p className="text-sm text-gray-400">Workflow Unscented</p>
                </div>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Non pertinents identifiés</p>
                  <p className="text-sm text-gray-400">À exclure</p>
                </div>
                <p className="text-2xl font-bold text-rose-400">43</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Économies estimées</p>
                  <p className="text-sm text-gray-400">Par mois</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">$127</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


