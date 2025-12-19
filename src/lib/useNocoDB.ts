'use client';

import { useState, useEffect, useCallback } from 'react';

type TableName = 'campaigns' | 'searchTermsAnalysis' | 'workflowLogs' | 'dailyMetrics';

interface UseNocoDBOptions {
  table: TableName;
  limit?: number;
  sort?: string;
  where?: string;
  autoFetch?: boolean;
}

interface UseNocoDBResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNocoDB<T = Record<string, unknown>>({
  table,
  limit = 100,
  sort = '',
  where = '',
  autoFetch = true,
}: UseNocoDBOptions): UseNocoDBResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('table', table);
      params.set('limit', limit.toString());
      if (sort) params.set('sort', sort);
      if (where) params.set('where', where);

      const response = await fetch(`/api/nocodb?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la récupération');
      }

      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table, limit, sort, where]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook spécialisé pour les Search Terms Analysis
export type ActionStatus = 'pending' | 'keep' | 'exclude' | 'excluded';
export type ExclusionLevel = 'ad_group' | 'campaign' | 'list';

export interface SearchTermAnalysis {
  Id: number;
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
  // Nouveaux champs pour la gestion des exclusions
  action_status?: ActionStatus;
  exclusion_level?: ExclusionLevel;
  processed_at?: string;
  // Contexte Google Ads (optionnel, pour le workflow n8n)
  ad_group_id?: string;
  campaign_id?: string;
  customer_id?: string;
  CreatedAt?: string;
}

export function useSearchTermsAnalysis(limit = 100) {
  return useNocoDB<SearchTermAnalysis>({
    table: 'searchTermsAnalysis',
    limit,
    sort: '-CreatedAt', // Les plus récents d'abord
  });
}

// Fonction pour mettre à jour un search term
export async function updateSearchTerm(
  id: number,
  data: Partial<Pick<SearchTermAnalysis, 'action_status' | 'exclusion_level'>>
): Promise<boolean> {
  try {
    const response = await fetch('/api/nocodb', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'searchTermsAnalysis',
        id,
        data,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur mise à jour search term:', error);
    return false;
  }
}

// Fonction pour mettre à jour plusieurs search terms en une fois
export async function bulkUpdateSearchTerms(
  updates: Array<{ id: number; action_status: ActionStatus; exclusion_level?: ExclusionLevel }>
): Promise<boolean> {
  try {
    // NocoDB supporte les mises à jour en lot, mais on fait en séquentiel pour simplifier
    const results = await Promise.all(
      updates.map((update) =>
        updateSearchTerm(update.id, {
          action_status: update.action_status,
          exclusion_level: update.exclusion_level,
        })
      )
    );
    return results.every((r) => r);
  } catch (error) {
    console.error('Erreur mise à jour en lot:', error);
    return false;
  }
}

// Hook pour les campagnes
export interface Campaign {
  Id: number;
  name: string;
  status: string;
  type: string;
  performanceScore: number;
  performanceTier: string;
  alertLevel: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  costPerConversion: number;
  roas: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export function useCampaigns(limit = 50) {
  return useNocoDB<Campaign>({
    table: 'campaigns',
    limit,
    sort: '-performanceScore',
  });
}

// Hook pour les métriques quotidiennes
export interface DailyMetric {
  Id: number;
  date: string;
  spend: number;
  conversions: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export function useDailyMetrics(limit = 30) {
  return useNocoDB<DailyMetric>({
    table: 'dailyMetrics',
    limit,
    sort: '-date',
  });
}

// Hook pour les logs de workflow
export interface WorkflowLog {
  Id: number;
  workflow_id: string;
  workflow_name: string;
  status: 'success' | 'error' | 'running';
  message: string;
  triggered_at: string;
  completed_at?: string;
}

export function useWorkflowLogs(limit = 20) {
  return useNocoDB<WorkflowLog>({
    table: 'workflowLogs',
    limit,
    sort: '-triggered_at',
  });
}

