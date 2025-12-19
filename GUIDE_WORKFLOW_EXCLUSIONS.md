# 🚫 Guide : Workflow n8n pour Exclusions de Mots-clés

Ce guide explique comment créer le workflow n8n qui traite les exclusions de mots-clés depuis le dashboard.

---

## 📋 Vue d'ensemble

Le workflow est déclenché depuis le dashboard et effectue les étapes suivantes :

1. **Reçoit** la liste des termes à exclure via webhook
2. **Traite** chaque terme selon son niveau d'exclusion (Ad Group, Campaign, ou Liste)
3. **Applique** l'exclusion via l'API Google Ads
4. **Met à jour** le statut dans NocoDB (`excluded`)
5. **Notifie** (optionnel) par email ou Slack

---

## 🔧 Configuration du Webhook

### URL du Webhook
```
https://automation.accolades.marketing/webhook/apply-negative-keywords
```

### Données reçues
Le webhook reçoit un JSON avec cette structure :

```json
{
  "action": "apply_exclusions",
  "default_exclusion_level": "campaign",
  "terms_to_exclude": [
    {
      "id": 123,
      "search_term": "terme non pertinent",
      "exclusion_level": "campaign",
      "ad_group_id": "12345678901",
      "campaign_id": "98765432109",
      "customer_id": "1234567890"
    }
  ],
  "total_count": 1,
  "triggeredAt": "2024-12-19T10:30:00.000Z",
  "source": "dashboard"
}
```

---

## 🔄 Structure du Workflow n8n

### Nœuds à créer

```
[Webhook] → [Loop] → [Switch par niveau] → [Google Ads API] → [Update NocoDB] → [Notification]
```

### 1. Webhook Trigger
- **Type**: Webhook
- **Méthode**: POST
- **Path**: `/apply-negative-keywords`
- **Authentication**: Aucune (ou Basic Auth si souhaité)

### 2. Loop sur les termes
- **Type**: SplitInBatches
- **Batch Size**: 1 (pour traiter un par un)
- **Input**: `{{ $json.terms_to_exclude }}`

### 3. Switch par niveau d'exclusion
- **Type**: Switch
- **Routing**: Basé sur `{{ $json.exclusion_level }}`
  - `ad_group` → Branche Ad Group
  - `campaign` → Branche Campaign  
  - `list` → Branche Liste partagée

### 4. Google Ads API - Exclusion Ad Group
```javascript
// Endpoint
POST https://googleads.googleapis.com/v15/customers/{customer_id}/googleAds:mutate

// Body
{
  "mutateOperations": [{
    "adGroupCriterionOperation": {
      "create": {
        "adGroup": "customers/{customer_id}/adGroups/{ad_group_id}",
        "keyword": {
          "text": "{{ $json.search_term }}",
          "matchType": "EXACT"
        },
        "negative": true
      }
    }
  }]
}
```

### 5. Google Ads API - Exclusion Campaign
```javascript
// Endpoint
POST https://googleads.googleapis.com/v15/customers/{customer_id}/googleAds:mutate

// Body
{
  "mutateOperations": [{
    "campaignCriterionOperation": {
      "create": {
        "campaign": "customers/{customer_id}/campaigns/{campaign_id}",
        "keyword": {
          "text": "{{ $json.search_term }}",
          "matchType": "EXACT"
        },
        "negative": true
      }
    }
  }]
}
```

### 6. Google Ads API - Ajouter à Liste partagée
```javascript
// D'abord, obtenir ou créer la liste
// Puis ajouter le mot-clé

// Endpoint pour ajouter à une liste existante
POST https://googleads.googleapis.com/v15/customers/{customer_id}/googleAds:mutate

// Body
{
  "mutateOperations": [{
    "sharedCriterionOperation": {
      "create": {
        "sharedSet": "customers/{customer_id}/sharedSets/{shared_set_id}",
        "keyword": {
          "text": "{{ $json.search_term }}",
          "matchType": "EXACT"
        }
      }
    }
  }]
}
```

### 7. Mise à jour NocoDB
```javascript
// Endpoint
PATCH https://database.accolades.marketing/api/v2/tables/mjfs0gle9j3wyfi/records

// Headers
{
  "xc-token": "{{ $credentials.nocodbToken }}",
  "Content-Type": "application/json"
}

// Body
[{
  "Id": {{ $json.id }},
  "action_status": "excluded",
  "processed_at": "{{ $now.toISO() }}"
}]
```

---

## 📊 Colonnes NocoDB à ajouter

Avant d'utiliser ce workflow, ajoute ces colonnes à ta table "Ai Search Terms Analysis" :

| Colonne | Type | Description |
|---------|------|-------------|
| `action_status` | Single Select | `pending`, `keep`, `exclude`, `excluded` |
| `exclusion_level` | Single Select | `ad_group`, `campaign`, `list` |
| `processed_at` | DateTime | Date/heure du traitement |
| `ad_group_id` | Text | ID du groupe d'annonces (optionnel) |
| `campaign_id` | Text | ID de la campagne (optionnel) |
| `customer_id` | Text | ID du compte client (optionnel) |

---

## 🔐 Authentification Google Ads

Pour l'API Google Ads, tu auras besoin de :

1. **OAuth2 Credentials** dans n8n avec :
   - Client ID: `484711527719-58iujttegjghvqj4bjoudvhigf17qped.apps.googleusercontent.com`
   - Client Secret: (ton secret)
   - Scope: `https://www.googleapis.com/auth/adwords`

2. **Developer Token**: `_H1cDOR9UsoYJUcRSNgavA`

3. **Headers à inclure dans chaque requête**:
```
Authorization: Bearer {{ $credentials.googleAdsOAuth2.accessToken }}
developer-token: _H1cDOR9UsoYJUcRSNgavA
login-customer-id: 4660067452
```

---

## 💡 Workflow Simplifié (Alternative)

Si tu ne veux pas gérer directement l'API Google Ads, tu peux :

1. **Exporter** les termes vers un fichier CSV
2. **Uploader** manuellement dans Google Ads Editor
3. **Marquer** comme "excluded" dans NocoDB après

### Workflow simplifié :

```
[Webhook] → [Fetch NocoDB (action_status=exclude)] → [Generate CSV] → [Send Email with CSV]
```

---

## 🧪 Test du Workflow

1. Va sur https://dashboard.accolades.marketing/search-terms
2. Marque quelques termes comme "À exclure"
3. Clique sur "Appliquer les exclusions via n8n"
4. Vérifie les logs n8n

---

## ⚠️ Notes importantes

- **Match Type**: Par défaut, les mots-clés sont ajoutés en "EXACT". Tu peux modifier pour "PHRASE" ou "BROAD".
- **Rate Limits**: L'API Google Ads a des limites. Ne traite pas trop de termes en même temps.
- **Rollback**: Garde un log des exclusions pour pouvoir les annuler si nécessaire.
- **Test Mode**: Teste d'abord avec un seul terme avant de lancer en masse.

---

## 📁 Fichiers liés

- Dashboard : `src/components/SearchTermsTable.tsx`
- API Trigger : `src/app/api/trigger/route.ts`
- API NocoDB : `src/app/api/nocodb/route.ts`
- Config workflows : `src/lib/config.ts`


