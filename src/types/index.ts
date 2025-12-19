// Types pour les données Google Ads
export interface Campaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  type: string;
  performanceScore: number;
  performanceTier: 'Excellent' | 'Good' | 'Fair' | 'Underperforming';
  alertLevel: 'normal' | 'warning' | 'critical';
  metrics: CampaignMetrics;
  recommendations: string[];
  insights: string[];
  analyzedAt: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  costPerConversion: number;
  avgCpc: number;
  roas?: number;
}

// Types pour les Search Terms (ton workflow Unscented)
export interface SearchTerm {
  id: string;
  search_term: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  cpa: number;
  roas: number;
  reason: string;
  is_relevant: boolean;
  analyzed_at: string;
}

// Types pour les workflows n8n
export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';
  webhookUrl: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  category: 'analysis' | 'optimization' | 'reporting' | 'sync';
}

// Types pour les alertes
export interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  campaignId?: string;
  campaignName?: string;
  timestamp: string;
  isRead: boolean;
}

// Types pour les métriques du dashboard
export interface DashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalConversions: number;
  averageRoas: number;
  excellentCampaigns: number;
  warningCampaigns: number;
  criticalCampaigns: number;
}

// Types pour l'historique
export interface HistoryDataPoint {
  date: string;
  spend: number;
  conversions: number;
  roas: number;
  impressions: number;
  clicks: number;
}

// Configuration des workflows
export interface WorkflowConfig {
  n8nBaseUrl: string;
  nocodbBaseUrl: string;
  nocodbApiToken: string;
}


