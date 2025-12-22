import { NextRequest, NextResponse } from 'next/server';

// Configuration NocoDB depuis les variables d'environnement
const NOCODB_BASE_URL = process.env.NEXT_PUBLIC_NOCODB_URL || 'https://database.accolades.marketing';

// IDs des tables NocoDB
const NOCODB_TABLES: Record<string, string> = {
  campaigns: 'm85p8wmzwk6mrls',
  searchTermsAnalysis: 'mjfs0gle9j3wyfi',
  workflowLogs: 'mrpo5lia5l7a7al',
  dailyMetrics: 'mr4qlww7ecgz0ap',
};

// Token API NocoDB (à configurer via variable d'environnement)
const NOCODB_TOKEN = process.env.NOCODB_API_TOKEN || '';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const table = searchParams.get('table');
  const limit = searchParams.get('limit') || '100';
  const offset = searchParams.get('offset') || '0';
  const sort = searchParams.get('sort') || '';
  const where = searchParams.get('where') || '';

  if (!table || !NOCODB_TABLES[table]) {
    return NextResponse.json(
      { error: 'Table invalide', validTables: Object.keys(NOCODB_TABLES) },
      { status: 400 }
    );
  }

  const tableId = NOCODB_TABLES[table];

  try {
    // Construit l'URL avec les paramètres
    const params = new URLSearchParams();
    params.set('limit', limit);
    params.set('offset', offset);
    if (sort) params.set('sort', sort);
    if (where) params.set('where', where);

    const url = `${NOCODB_BASE_URL}/api/v2/tables/${tableId}/records?${params}`;
    
    console.log(`📊 Récupération NocoDB: ${table} (${tableId})`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Ajoute le token si disponible
    if (NOCODB_TOKEN) {
      headers['xc-token'] = NOCODB_TOKEN;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur NocoDB: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Erreur NocoDB: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ NocoDB: ${data.list?.length || 0} enregistrements récupérés`);

    return NextResponse.json({
      success: true,
      table,
      data: data.list || [],
      pageInfo: data.pageInfo || {},
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération NocoDB:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: String(error) },
      { status: 500 }
    );
  }
}

// POST pour créer un enregistrement (utile pour les logs)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, data } = body;

    if (!table || !NOCODB_TABLES[table]) {
      return NextResponse.json(
        { error: 'Table invalide' },
        { status: 400 }
      );
    }

    const tableId = NOCODB_TABLES[table];
    const url = `${NOCODB_BASE_URL}/api/v2/tables/${tableId}/records`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (NOCODB_TOKEN) {
      headers['xc-token'] = NOCODB_TOKEN;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Erreur NocoDB: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création', details: String(error) },
      { status: 500 }
    );
  }
}

// PATCH pour mettre à jour un enregistrement
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, id, data } = body;

    if (!table || !NOCODB_TABLES[table]) {
      return NextResponse.json(
        { error: 'Table invalide' },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis pour la mise à jour' },
        { status: 400 }
      );
    }

    const tableId = NOCODB_TABLES[table];
    const url = `${NOCODB_BASE_URL}/api/v2/tables/${tableId}/records`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (NOCODB_TOKEN) {
      headers['xc-token'] = NOCODB_TOKEN;
    }

    // NocoDB PATCH attend un tableau d'objets avec Id
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify([{ Id: id, ...data }]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur NocoDB PATCH: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Erreur NocoDB: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`✅ NocoDB: Enregistrement ${id} mis à jour dans ${table}`);
    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour NocoDB:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour', details: String(error) },
      { status: 500 }
    );
  }
}

