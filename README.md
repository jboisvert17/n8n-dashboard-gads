# 📊 Google Ads Dashboard

Un dashboard moderne pour gérer tes workflows n8n liés à Google Ads.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Google+Ads+Dashboard)

## ✨ Fonctionnalités

- **🏠 Dashboard principal** - Vue d'ensemble de toutes tes campagnes avec métriques clés
- **⚡ Actions rapides** - Déclenche tes workflows n8n en un clic
- **📋 Liste des campagnes** - Tableau détaillé avec scores de performance
- **🔔 Alertes** - Notifications pour les opportunités et problèmes
- **📈 Historique** - Graphiques d'évolution des performances
- **⚙️ Paramètres** - Configuration simple de la connexion

## 🚀 Installation sur OVH

### Prérequis

- Serveur OVH avec Docker installé
- n8n et NocoDB déjà en fonctionnement

### Étapes d'installation

#### 1. Clone le projet sur ton serveur

```bash
cd /opt
git clone [ton-repo] google-ads-dashboard
cd google-ads-dashboard
```

#### 2. Configure les variables d'environnement

```bash
cp .env.example .env
nano .env
```

Modifie les valeurs :
```env
NEXT_PUBLIC_N8N_URL=https://n8n.ton-domaine.com
NEXT_PUBLIC_NOCODB_URL=https://nocodb.ton-domaine.com
NOCODB_API_TOKEN=ton-token-api
```

#### 3. Lance le dashboard avec Docker

```bash
docker compose up -d --build
```

Le dashboard sera accessible sur le port 3001.

#### 4. Configure le reverse proxy (Nginx)

Ajoute cette configuration dans ton fichier Nginx :

```nginx
server {
    listen 80;
    server_name dashboard.ton-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashboard.ton-domaine.com;

    ssl_certificate /etc/letsencrypt/live/ton-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ton-domaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Recharge Nginx :
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 Configuration des workflows n8n

Pour que les boutons "Actions" fonctionnent, tu dois ajouter un **Webhook Trigger** au début de chaque workflow que tu veux déclencher.

### Étapes dans n8n :

1. Ouvre ton workflow
2. Ajoute un nœud "Webhook" au début
3. Configure le path (ex: `/analyze-search-terms`)
4. Active le workflow
5. Note l'URL du webhook

### Exemple pour ton workflow "Unscented - Negative Keywords"

1. Ajoute un Webhook Trigger avec le path `/analyze-search-terms`
2. Connecte-le à ton premier nœud "Tous les mois"
3. Active le workflow

Maintenant tu pourras le déclencher depuis le dashboard !

## 📦 Connexion à NocoDB

Pour stocker les données de façon permanente :

### 1. Crée les tables dans NocoDB

- **campaigns** - Données des campagnes
- **search_terms** - Résultats d'analyse des search terms
- **alerts** - Historique des alertes
- **metrics_history** - Historique des métriques quotidiennes

### 2. Modifie tes workflows n8n

Remplace les nœuds Google Sheets par des nœuds NocoDB dans tes workflows.

## 🎨 Personnalisation

### Modifier les workflows disponibles

Édite le fichier `src/lib/config.ts` :

```typescript
export const workflows: Workflow[] = [
  {
    id: 'mon-workflow',
    name: 'Mon Workflow',
    description: 'Description de ce que fait le workflow',
    icon: '🔍',
    color: 'blue',
    webhookUrl: '/webhook/mon-webhook-path',
    category: 'analysis',
    status: 'idle',
  },
  // Ajoute d'autres workflows ici...
];
```

### Couleurs disponibles

- `blue` - Bleu
- `emerald` - Vert
- `amber` - Orange
- `rose` - Rouge
- `violet` - Violet
- `cyan` - Cyan

### Catégories

- `analysis` - Analyse
- `optimization` - Optimisation
- `reporting` - Rapports
- `sync` - Synchronisation

## 🔄 Mise à jour

Pour mettre à jour le dashboard :

```bash
cd /opt/google-ads-dashboard
git pull
docker compose up -d --build
```

## 🐛 Dépannage

### Le dashboard ne se lance pas

```bash
# Vérifie les logs
docker compose logs -f

# Reconstruis l'image
docker compose down
docker compose up -d --build
```

### Les workflows ne se déclenchent pas

1. Vérifie que l'URL de n8n est correcte dans `.env`
2. Vérifie que le workflow a un Webhook Trigger
3. Vérifie que le workflow est activé
4. Vérifie les logs de n8n

### Les données ne s'affichent pas

1. Vérifie la connexion à NocoDB
2. Vérifie le token API
3. Vérifie que les tables existent

## 📄 Licence

MIT

---

Créé avec ❤️ pour simplifier la gestion de Google Ads avec n8n


