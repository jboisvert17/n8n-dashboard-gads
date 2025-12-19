#!/bin/bash

# ============================================
# 🚀 Script de déploiement - Google Ads Dashboard
# ============================================

echo "🚀 Déploiement du Google Ads Dashboard..."

# Arrête le conteneur existant si présent
echo "⏹️  Arrêt du conteneur existant..."
docker compose down 2>/dev/null

# Reconstruit l'image
echo "🔨 Construction de l'image Docker..."
docker compose build --no-cache

# Démarre le conteneur
echo "▶️  Démarrage du conteneur..."
docker compose up -d

# Vérifie le statut
echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📊 Statut du conteneur:"
docker compose ps

echo ""
echo "🌐 Le dashboard est accessible sur le port 3001"
echo "   Configure Nginx pour le rendre accessible via un domaine"
echo ""
echo "📋 Pour voir les logs: docker compose logs -f"


