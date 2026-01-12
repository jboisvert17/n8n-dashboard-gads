# 🚀 Déployer le Sélecteur de Client sur dashboard.accolades.marketing

## 📋 Ce qu'il faut faire

Les modifications sont actuellement sur **ton ordinateur**. Pour les voir sur **https://dashboard.accolades.marketing**, il faut les envoyer sur ton serveur OVH et redémarrer l'application.

---

## 🎯 Option 1 : Avec Git (Recommandé)

### Étape 1 : Commit et push les modifications

Sur ton Mac, dans le terminal :

```bash
cd "/Users/jonathanboisvert/Library/Mobile Documents/com~apple~CloudDocs/1. PROJECTS/n8n/google-ads-dashboard"

# Ajoute tous les nouveaux fichiers
git add .

# Commit les changements
git commit -m "✨ Ajout du sélecteur de client

- Nouveau composant ClientSelector
- Context global pour le client sélectionné
- Intégration dans le Header
- Connexion à la table Configuration NocoDB
- Documentation complète"

# Push vers le repo
git push
```

### Étape 2 : Pull et redéployer sur le serveur

Connecte-toi à ton serveur OVH :

```bash
ssh root@ton-serveur-ovh
cd /opt/google-ads-dashboard

# Récupère les dernières modifications
git pull

# Redémarre avec les nouvelles modifications
docker compose up -d --build
```

### Étape 3 : Vérifie le déploiement

```bash
# Vérifie que le conteneur est en cours d'exécution
docker compose ps

# Regarde les logs en temps réel
docker compose logs -f

# Appuie sur Ctrl+C pour sortir des logs
```

---

## 🎯 Option 2 : Avec SCP (Copie directe)

### Étape 1 : Compresse le projet (sans node_modules)

Sur ton Mac :

```bash
cd "/Users/jonathanboisvert/Library/Mobile Documents/com~apple~CloudDocs/1. PROJECTS/n8n"

# Crée une archive (exclut node_modules et .next pour gagner du temps)
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    -czvf google-ads-dashboard-update.tar.gz google-ads-dashboard
```

### Étape 2 : Envoie sur le serveur

```bash
# Remplace TON_SERVEUR_IP par l'IP de ton serveur OVH
scp google-ads-dashboard-update.tar.gz root@TON_SERVEUR_IP:/opt/
```

### Étape 3 : Décompresse et redéploie sur le serveur

```bash
# Connecte-toi au serveur
ssh root@TON_SERVEUR_IP

# Sauvegarde l'ancien dossier (au cas où)
cd /opt
mv google-ads-dashboard google-ads-dashboard-backup-$(date +%Y%m%d)

# Décompresse la nouvelle version
tar -xzvf google-ads-dashboard-update.tar.gz

# Va dans le dossier
cd google-ads-dashboard

# Vérifie que le .env existe (important !)
ls -la .env

# Si le .env n'existe pas, recrée-le
nano .env
# Ajoute : NOCODB_API_TOKEN=esUwOymVyaTqbdLNagwCgdcFfu8GmZ47R2nLb6u0
# Sauvegarde avec Ctrl+X, puis Y, puis Enter

# Redémarre avec les nouvelles modifications
docker compose up -d --build
```

### Étape 4 : Vérifie le déploiement

```bash
# Vérifie que le conteneur est en cours d'exécution
docker compose ps

# Regarde les logs
docker compose logs -f
```

---

## ✅ Vérification finale

### 1. Vérifie que l'application est accessible

Ouvre ton navigateur et va sur :
🌐 **https://dashboard.accolades.marketing**

### 2. Vérifie que le sélecteur est visible

Tu devrais voir :
```
┌────────────────────────────────────────────────────┐
│  📊 Dashboard  [🏢 The Unscented Company ▼]  🔔 👤 │
└────────────────────────────────────────────────────┘
                      ↑↑↑
            C'EST LÀ LE NOUVEAU SÉLECTEUR !
```

### 3. Teste le sélecteur

1. Clique sur le sélecteur
2. Tu devrais voir la liste de tes 6 clients
3. Sélectionne un autre client
4. Va sur la page "Search Terms"
5. Tu devrais voir les infos du client sélectionné

---

## 🐛 En cas de problème

### Le sélecteur n'apparaît pas

**1. Vérifie les logs du conteneur**
```bash
ssh root@ton-serveur-ovh
cd /opt/google-ads-dashboard
docker compose logs -f
```

Cherche des erreurs comme :
- Erreurs de connexion à NocoDB
- Erreurs de compilation
- Erreurs 500

**2. Vérifie que la table Configuration existe**

Va sur https://database.accolades.marketing et vérifie que :
- La base "Acolya" existe
- La table "Configuration" existe
- Elle contient des données (tes 6 clients)

**3. Vérifie les variables d'environnement**
```bash
ssh root@ton-serveur-ovh
cd /opt/google-ads-dashboard
cat .env
```

Tu devrais voir :
```
NOCODB_API_TOKEN=esUwOymVyaTqbdLNagwCgdcFfu8GmZ47R2nLb6u0
```

Si ce n'est pas là, ajoute-le :
```bash
nano .env
# Ajoute la ligne ci-dessus
# Sauvegarde avec Ctrl+X, puis Y, puis Enter

# Redémarre
docker compose restart
```

**4. Erreur "Impossible de charger les clients"**

Teste l'API directement :
```bash
ssh root@ton-serveur-ovh
curl http://localhost:3001/api/nocodb?table=configuration
```

Tu devrais voir un JSON avec tes clients. Si tu vois une erreur, c'est un problème de connexion à NocoDB.

**5. Le conteneur ne démarre pas**
```bash
# Arrête tout
docker compose down

# Nettoie les anciennes images
docker system prune -a

# Reconstruit complètement
docker compose build --no-cache

# Redémarre
docker compose up -d
```

---

## 📝 Commandes utiles

```bash
# Voir les logs en direct
docker compose logs -f

# Redémarrer seulement le dashboard
docker compose restart

# Arrêter complètement
docker compose down

# Voir l'utilisation des ressources
docker stats

# Entrer dans le conteneur (debug avancé)
docker compose exec google-ads-dashboard sh
```

---

## 🔄 Pour les futures mises à jour

Quand tu veux déployer de nouvelles modifications :

**Si tu utilises Git :**
```bash
ssh root@ton-serveur-ovh
cd /opt/google-ads-dashboard
git pull
docker compose up -d --build
```

**Si tu utilises SCP :**
1. Compresse le projet sur ton Mac
2. Envoie-le avec `scp`
3. Décompresse sur le serveur
4. Redémarre avec `docker compose up -d --build`

---

## ⏱️ Temps estimé

- **Avec Git** : ~5 minutes
- **Avec SCP** : ~10-15 minutes (selon ta connexion)

---

## 🎉 C'est fait !

Une fois déployé, le sélecteur de client sera visible sur :

🌐 **https://dashboard.accolades.marketing**

Et tous tes utilisateurs pourront sélectionner les clients directement depuis l'interface ! 🚀

