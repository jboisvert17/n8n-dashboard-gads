import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCustomerAccounts, getAccountMetrics, getAccountAlerts } from '@/lib/google-ads';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.refreshToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de date depuis l'URL
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const dateRange = startDate && endDate 
      ? { startDate, endDate }
      : undefined;

    // Récupérer tous les comptes clients
    const accounts = await getCustomerAccounts(session.refreshToken);

    // Récupérer les métriques et alertes pour chaque compte en parallèle
    const accountsWithData = await Promise.all(
      accounts.map(async (account) => {
        const [metrics, alerts] = await Promise.all([
          getAccountMetrics(session.refreshToken!, account.id, dateRange),
          getAccountAlerts(session.refreshToken!, account.id),
        ]);

        return {
          ...account,
          metrics,
          alertsCount: alerts.length,
          alerts,
        };
      })
    );

    return NextResponse.json({
      accounts: accountsWithData,
      totalAccounts: accountsWithData.length,
      totalAlerts: accountsWithData.reduce((sum, a) => sum + a.alertsCount, 0),
      dateRange: dateRange || { startDate: 'LAST_30_DAYS', endDate: 'LAST_30_DAYS' },
    });
  } catch (error) {
    console.error('Erreur API accounts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des comptes', details: String(error) },
      { status: 500 }
    );
  }
}
