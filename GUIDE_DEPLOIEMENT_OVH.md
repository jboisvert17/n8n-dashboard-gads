# 🚀 Guide de déploiement sur OVH

## Prérequis

- Serveur OVH avec Docker installé
- Nginx configuré (tu l'as déjà pour n8n et NocoDB)
- Accès SSH au serveur

---

## Étape 1 : Copier le projet sur le serveur

### Option A : Avec Git (recommandé)

Si tu as mis le projet sur GitHub/GitLab :

```bash
ssh root@ton-serveur-ovh
cd /opt
git clone https://ton-repo/google-ads-dashboard.git
cd google-ads-dashboard
```

### Option B : Avec SCP (copie directe)

Depuis ton Mac :

```bash
# Compresse le dossier (sans node_modules)
cd "/Users/jonathanboisvert/Library/Mobile Documents/com~apple~CloudDocs/1. PROJECTS/n8n"
tar --exclude='node_modules' --exclude='.next' -czvf google-ads-dashboard.tar.gz google-ads-dashboard

# Envoie sur le serveur
scp google-ads-dashboard.tar.gz root@ton-serveur-ovh:/opt/

# Sur le serveur, décompresse
ssh root@ton-serveur-ovh
cd /opt
tar -xzvf google-ads-dashboard.tar.gz
cd google-ads-dashboard
```

---

## Étape 2 : Configurer les variables d'environnement

Sur le serveur, crée le fichier `.env` :

```bash
cd /opt/google-ads-dashboard
nano .env
```

Ajoute ces lignes :

```env
NOCODB_API_TOKEN=esUwOymVyaTqbdLNagwCgdcFfu8GmZ47R2nLb6u0
```

Sauvegarde avec `Ctrl+X`, puis `Y`, puis `Enter`.

---

## Étape 3 : Lancer le déploiement

```bash
chmod +x deploy.sh
./deploy.sh
```

Ou manuellement :

```bash
docker compose up -d --build
```

Vérifie que ça tourne :

```bash
docker compose ps
docker compose logs -f
```

---

## Étape 4 : Configurer Nginx

### 4.1 Crée le certificat SSL (si pas déjà fait)

```bash
certbot certonly --nginx -d dashboard.accolades.marketing
```

### 4.2 Crée la configuration Nginx

```bash
nano /etc/nginx/sites-available/dashboard.accolades.marketing
```

Copie le contenu du fichier `nginx.conf.example` :

```nginx
server {
    listen 80;
    server_name dashboard.accolades.marketing;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashboard.accolades.marketing;

    ssl_certificate /etc/letsencrypt/live/accolades.marketing/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/accolades.marketing/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

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

### 4.3 Active la configuration

```bash
ln -s /etc/nginx/sites-available/dashboard.accolades.marketing /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Étape 5 : Configurer le DNS

Dans ton panneau OVH (ou ton gestionnaire DNS) :

1. Ajoute un enregistrement **A** :
   - Nom : `dashboard`
   - Type : `A`
   - Valeur : `IP de ton serveur OVH`
   - TTL : 3600

---

## ✅ C'est terminé !

Ton dashboard est maintenant accessible sur :

🌐 **https://dashboard.accolades.marketing**

---

## 🔧 Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Redémarrer le dashboard
docker compose restart

# Arrêter
docker compose down

# Mettre à jour (après modifications)
docker compose up -d --build

# Voir l'utilisation des ressources
docker stats google-ads-dashboard
```

---

## 🐛 Dépannage

### Le dashboard ne répond pas

```bash
# Vérifie que le conteneur tourne
docker compose ps

# Vérifie les logs
docker compose logs -f

# Vérifie que le port est accessible
curl http://localhost:3001
```

### Erreur 502 Bad Gateway

Le conteneur n'est probablement pas démarré :

```bash
docker compose up -d
```

### Erreur de connexion NocoDB

Vérifie que le token est correct dans `.env` :

```bash
cat .env
```

---

## 🔄 Mise à jour

Pour mettre à jour le dashboard :

```bash
cd /opt/google-ads-dashboard

# Si tu utilises Git
git pull

# Reconstruis et redémarre
docker compose up -d --build
```


