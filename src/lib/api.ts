import { config } from './config';

// ============================================
// 🔌 FONCTIONS API
// ============================================

/**
 * Déclenche un workflow n8n via webhook
 */
export async function triggerWorkflow(webhookPath: string, data?: Record<string, unknown>) {
  const url = `${config.n8nBaseUrl}${webhookPath}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors du déclenchement du workflow:', error);
    throw error;
  }
}

/**
 * Récupère les données depuis NocoDB
 */
export async function fetchFromNocoDB(tableName: string, params?: {
  limit?: number;
  offset?: number;
  where?: string;
  sort?: string;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  if (params?.where) queryParams.set('where', params.where);
  if (params?.sort) queryParams.set('sort', params.sort);

  const url = `${config.nocodbBaseUrl}/api/v2/tables/${tableName}/records?${queryParams}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'xc-token': config.nocodbApiToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur NocoDB: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données NocoDB:', error);
    throw error;
  }
}

/**
 * Formate un nombre en devise
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Formate un nombre avec séparateurs
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-CA').format(value);
}

/**
 * Formate un pourcentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Retourne la couleur selon le score de performance
 */
export function getPerformanceColor(tier: string): string {
  switch (tier) {
    case 'Excellent':
      return 'text-emerald-400';
    case 'Good':
      return 'text-blue-400';
    case 'Fair':
      return 'text-amber-400';
    case 'Underperforming':
      return 'text-rose-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Retourne l'icône selon le niveau d'alerte
 */
export function getAlertIcon(level: string): string {
  switch (level) {
    case 'critical':
      return '🔴';
    case 'warning':
      return '🟡';
    case 'normal':
      return '🟢';
    default:
      return '⚪';
  }
}


