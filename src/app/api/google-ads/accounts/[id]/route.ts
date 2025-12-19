import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAccountMetrics, getCampaigns, getAccountAlerts, getCustomerInfo } from '@/lib/google-ads';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.refreshToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const customerId = params.id;

    // Récupérer les paramètres de date depuis l'URL
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const dateRange = startDate && endDate 
      ? { startDate, endDate }
      : undefined;

    // Récupérer toutes les données en parallèle
    const [customerInfo, metrics, campaigns, alerts] = await Promise.all([
      getCustomerInfo(session.refreshToken, customerId),
      getAccountMetrics(session.refreshToken, customerId, dateRange),
      getCampaigns(session.refreshToken, customerId, dateRange),
      getAccountAlerts(session.refreshToken, customerId),
    ]);

    return NextResponse.json({
      customerId,
      customerName: customerInfo.descriptiveName,
      currencyCode: customerInfo.currencyCode,
      metrics,
      campaigns,
      alerts,
      dateRange: dateRange || { startDate: 'LAST_30_DAYS', endDate: 'LAST_30_DAYS' },
    });
  } catch (error) {
    console.error('Erreur API account detail:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du compte', details: String(error) },
      { status: 500 }
    );
  }
}
