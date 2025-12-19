import { GoogleAdsApi } from 'google-ads-api';

// Configuration Google Ads
const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
});

export interface CustomerAccount {
  id: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  manager: boolean;
}

export interface AccountMetrics {
  customerId: string;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
}

export interface CampaignData {
  id: string;
  name: string;
  status: string;
  budget: number;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Récupérer les infos d'un compte spécifique
export async function getCustomerInfo(
  refreshToken: string,
  customerId: string
): Promise<{ id: string; descriptiveName: string; currencyCode: string }> {
  const customer = client.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!,
  });

  try {
    const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code
      FROM customer
      LIMIT 1
    `;

    const results = await customer.query(query);
    
    if (results.length > 0) {
      const row = results[0] as any;
      return {
        id: customerId,
        descriptiveName: row.customer.descriptive_name || `Compte ${customerId}`,
        currencyCode: row.customer.currency_code || 'CAD',
      };
    }
    
    return {
      id: customerId,
      descriptiveName: `Compte ${customerId}`,
      currencyCode: 'CAD',
    };
  } catch (error) {
    console.error(`Erreur info compte ${customerId}:`, error);
    return {
      id: customerId,
      descriptiveName: `Compte ${customerId}`,
      currencyCode: 'CAD',
    };
  }
}

// Récupérer tous les comptes clients du MCC
export async function getCustomerAccounts(refreshToken: string): Promise<CustomerAccount[]> {
  const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!,
    refresh_token: refreshToken,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!,
  });

  try {
    // Requête pour obtenir les comptes clients accessibles
    const query = `
      SELECT
        customer_client.client_customer,
        customer_client.descriptive_name,
        customer_client.currency_code,
        customer_client.time_zone,
        customer_client.manager,
        customer_client.status
      FROM customer_client
      WHERE customer_client.status = 'ENABLED'
        AND customer_client.manager = false
    `;

    const results = await customer.query(query);
    
    return results.map((row: any) => ({
      id: row.customer_client.client_customer.replace('customers/', ''),
      descriptiveName: row.customer_client.descriptive_name || 'Sans nom',
      currencyCode: row.customer_client.currency_code || 'CAD',
      timeZone: row.customer_client.time_zone || 'America/Toronto',
      manager: row.customer_client.manager || false,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des comptes:', error);
    throw error;
  }
}

// Récupérer les métriques d'un compte pour une période donnée
export async function getAccountMetrics(
  refreshToken: string,
  customerId: string,
  dateRange?: DateRange
): Promise<AccountMetrics> {
  const customer = client.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!,
  });

  try {
    // Construire la clause WHERE pour les dates
    let dateClause = 'segments.date DURING LAST_30_DAYS';
    if (dateRange?.startDate && dateRange?.endDate) {
      dateClause = `segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'`;
    }

    const query = `
      SELECT
        metrics.clicks,
        metrics.impressions,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM customer
      WHERE ${dateClause}
    `;

    const results = await customer.query(query);
    
    // Agréger les résultats
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalCostMicros = 0;
    let totalConversions = 0;

    results.forEach((row: any) => {
      totalClicks += Number(row.metrics.clicks) || 0;
      totalImpressions += Number(row.metrics.impressions) || 0;
      totalCostMicros += Number(row.metrics.cost_micros) || 0;
      totalConversions += Number(row.metrics.conversions) || 0;
    });

    const cost = totalCostMicros / 1000000; // Convertir micros en dollars
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averageCpc = totalClicks > 0 ? cost / totalClicks : 0;

    return {
      customerId,
      clicks: totalClicks,
      impressions: totalImpressions,
      cost,
      conversions: totalConversions,
      ctr,
      averageCpc,
    };
  } catch (error) {
    console.error(`Erreur métriques pour ${customerId}:`, error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      customerId,
      clicks: 0,
      impressions: 0,
      cost: 0,
      conversions: 0,
      ctr: 0,
      averageCpc: 0,
    };
  }
}

// Convertir le statut enum en chaîne lisible
function convertCampaignStatus(status: number | string): string {
  // L'API Google Ads retourne des nombres (enum)
  // 0 = UNSPECIFIED, 1 = UNKNOWN, 2 = ENABLED, 3 = PAUSED, 4 = REMOVED
  const statusMap: Record<number, string> = {
    0: 'UNSPECIFIED',
    1: 'UNKNOWN',
    2: 'ENABLED',
    3: 'PAUSED',
    4: 'REMOVED',
  };
  
  if (typeof status === 'number') {
    return statusMap[status] || 'UNKNOWN';
  }
  // Si c'est déjà une chaîne, la retourner telle quelle
  return String(status);
}

// Récupérer les campagnes d'un compte
export async function getCampaigns(
  refreshToken: string,
  customerId: string,
  dateRange?: DateRange
): Promise<CampaignData[]> {
  const customer = client.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!,
  });

  try {
    // Construire la clause WHERE pour les dates
    let dateClause = 'segments.date DURING LAST_30_DAYS';
    if (dateRange?.startDate && dateRange?.endDate) {
      dateClause = `segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'`;
    }

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign_budget.amount_micros,
        metrics.clicks,
        metrics.impressions,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE ${dateClause}
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
      LIMIT 50
    `;

    const results = await customer.query(query);
    
    // Grouper par campagne
    const campaignMap = new Map<string, CampaignData>();
    
    results.forEach((row: any) => {
      const campaignId = row.campaign.id.toString();
      const existing = campaignMap.get(campaignId);
      const statusString = convertCampaignStatus(row.campaign.status);
      
      if (existing) {
        existing.clicks += Number(row.metrics.clicks) || 0;
        existing.impressions += Number(row.metrics.impressions) || 0;
        existing.cost += (Number(row.metrics.cost_micros) || 0) / 1000000;
        existing.conversions += Number(row.metrics.conversions) || 0;
      } else {
        campaignMap.set(campaignId, {
          id: campaignId,
          name: row.campaign.name,
          status: statusString,
          budget: (Number(row.campaign_budget?.amount_micros) || 0) / 1000000,
          clicks: Number(row.metrics.clicks) || 0,
          impressions: Number(row.metrics.impressions) || 0,
          cost: (Number(row.metrics.cost_micros) || 0) / 1000000,
          conversions: Number(row.metrics.conversions) || 0,
        });
      }
    });

    return Array.from(campaignMap.values());
  } catch (error) {
    console.error(`Erreur campagnes pour ${customerId}:`, error);
    return [];
  }
}

// Récupérer les alertes (campagnes avec problèmes)
export async function getAccountAlerts(
  refreshToken: string,
  customerId: string
): Promise<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }[]> {
  const customer = client.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID!,
  });

  const alerts: { type: string; message: string; severity: 'low' | 'medium' | 'high' }[] = [];

  try {
    // Vérifier les campagnes avec CTR faible
    const lowCtrQuery = `
      SELECT
        campaign.name,
        metrics.ctr,
        metrics.impressions
      FROM campaign
      WHERE segments.date DURING LAST_7_DAYS
        AND campaign.status = 'ENABLED'
        AND metrics.impressions > 1000
      HAVING metrics.ctr < 0.01
    `;

    const lowCtrResults = await customer.query(lowCtrQuery);
    lowCtrResults.forEach((row: any) => {
      alerts.push({
        type: 'CTR Faible',
        message: `${row.campaign.name}: CTR de ${(row.metrics.ctr * 100).toFixed(2)}%`,
        severity: 'medium',
      });
    });

    // Vérifier les campagnes sans conversions
    const noConversionsQuery = `
      SELECT
        campaign.name,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE segments.date DURING LAST_7_DAYS
        AND campaign.status = 'ENABLED'
        AND metrics.cost_micros > 50000000
        AND metrics.conversions = 0
    `;

    const noConvResults = await customer.query(noConversionsQuery);
    noConvResults.forEach((row: any) => {
      const cost = Number(row.metrics.cost_micros) / 1000000;
      alerts.push({
        type: 'Sans conversions',
        message: `${row.campaign.name}: ${cost.toFixed(2)}$ dépensés sans conversion`,
        severity: 'high',
      });
    });

  } catch (error) {
    console.error(`Erreur alertes pour ${customerId}:`, error);
  }

  return alerts;
}
