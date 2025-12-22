import { NextRequest, NextResponse } from 'next/server';
import { workflows } from '@/lib/config';

// URL n8n depuis les variables d'environnement
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || 'https://automation.accolades.marketing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookPath, workflowId, data, payload } = body;

    let finalWebhookPath = webhookPath;

    // Si on a un workflowId, on cherche le webhookUrl dans la config
    if (workflowId && !webhookPath) {
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow) {
        finalWebhookPath = workflow.webhookUrl;
      } else {
        return NextResponse.json(
          { error: `Workflow "${workflowId}" non trouvé dans la configuration` },
          { status: 404 }
        );
      }
    }

    if (!finalWebhookPath) {
      return NextResponse.json(
        { error: 'webhookPath ou workflowId est requis' },
        { status: 400 }
      );
    }

    // Construit l'URL complète du webhook n8n
    const webhookUrl = `${N8N_BASE_URL}${finalWebhookPath}`;

    console.log(`🚀 Déclenchement du workflow: ${webhookUrl}`);

    // Utilise payload si fourni, sinon data
    const bodyToSend = payload || data || {};

    // Appelle le webhook n8n
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...bodyToSend,
        triggeredAt: new Date().toISOString(),
        source: 'dashboard',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur n8n: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Erreur n8n: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Certains webhooks n8n peuvent retourner du texte brut
    const contentType = response.headers.get('content-type');
    let result;
    if (contentType?.includes('application/json')) {
      result = await response.json();
    } else {
      result = { message: await response.text() };
    }
    
    console.log(`✅ Workflow déclenché avec succès:`, result);

    return NextResponse.json({
      success: true,
      message: 'Workflow déclenché avec succès',
      result,
    });

  } catch (error) {
    console.error('❌ Erreur lors du déclenchement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du déclenchement du workflow', details: String(error) },
      { status: 500 }
    );
  }
}

