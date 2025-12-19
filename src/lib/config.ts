import { Workflow } from '@/types';

// ============================================
// 🔧 CONFIGURATION PRINCIPALE
// ============================================
// Modifie ces URLs avec tes vraies adresses

export const config = {
  // URL de ton instance n8n (sur OVH)
  n8nBaseUrl: process.env.NEXT_PUBLIC_N8N_URL || 'https://automation.accolades.marketing',
  
  // URL de ton instance NocoDB (sur OVH)
  nocodbBaseUrl: process.env.NEXT_PUBLIC_NOCODB_URL || 'https://nocodb.ton-domaine.com',
  
  // Token API NocoDB (à récupérer dans les paramètres NocoDB)
  nocodbApiToken: process.env.NOCODB_API_TOKEN || '',
};

// ============================================
// 📋 CONFIGURATION DES WORKFLOWS
// ============================================
// Ajoute ici tes workflows n8n avec leurs webhooks

export const workflows: Workflow[] = [
  {
    id: 'search-terms-analysis',
    name: 'Analyse des Search Terms (Unscented)',
    description: 'Analyse les termes de recherche avec l\'IA pour identifier les mots-clés non pertinents',
    icon: '🔍',
    color: 'blue',
    webhookUrl: '/webhook/2b31c2a4-22a0-4fc8-a40f-a4720c77aa50',
    category: 'analysis',
    status: 'idle',
  },
  {
    id: 'campaign-performance',
    name: 'Analyse Performance Campagnes',
    description: 'Évalue les performances de toutes les campagnes et génère des recommandations',
    icon: '📊',
    color: 'emerald',
    webhookUrl: '/webhook/campaign-performance',
    category: 'analysis',
    status: 'idle',
  },
  {
    id: 'weekly-report',
    name: 'Rapport Hebdomadaire',
    description: 'Génère un rapport complet des performances de la semaine',
    icon: '📈',
    color: 'violet',
    webhookUrl: '/webhook/weekly-report',
    category: 'reporting',
    status: 'idle',
  },
  {
    id: 'negative-keywords-sync',
    name: 'Sync Mots-clés Négatifs',
    description: 'Synchronise les mots-clés à exclure identifiés par l\'IA vers Google Ads',
    icon: '🚫',
    color: 'rose',
    webhookUrl: '/webhook/sync-negative-keywords',
    category: 'sync',
    status: 'idle',
  },
  {
    id: 'apply-negative-keywords',
    name: 'Appliquer Exclusions (Dashboard)',
    description: 'Applique les exclusions de mots-clés marqués dans le dashboard vers Google Ads',
    icon: '⚡',
    color: 'amber',
    webhookUrl: '/webhook/apply-negative-keywords',
    category: 'sync',
    status: 'idle',
  },
  {
    id: 'budget-optimizer',
    name: 'Optimisation Budget',
    description: 'Suggère des réallocations de budget basées sur les performances',
    icon: '💰',
    color: 'amber',
    webhookUrl: '/webhook/optimize-budget',
    category: 'optimization',
    status: 'idle',
  },
  {
    id: 'competitor-monitor',
    name: 'Surveillance Concurrents',
    description: 'Analyse les changements sur les sites concurrents',
    icon: '👀',
    color: 'cyan',
    webhookUrl: '/webhook/competitor-monitor',
    category: 'analysis',
    status: 'idle',
  },
];

// ============================================
// 🎨 CONFIGURATION DES COULEURS PAR CATÉGORIE
// ============================================

export const categoryColors = {
  analysis: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  optimization: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  reporting: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  sync: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

export const categoryLabels = {
  analysis: 'Analyse',
  optimization: 'Optimisation',
  reporting: 'Rapports',
  sync: 'Synchronisation',
};

