# Étape 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json* ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Variables d'environnement pour le build
ARG NEXT_PUBLIC_N8N_URL
ARG NEXT_PUBLIC_NOCODB_URL

ENV NEXT_PUBLIC_N8N_URL=$NEXT_PUBLIC_N8N_URL
ENV NEXT_PUBLIC_NOCODB_URL=$NEXT_PUBLIC_NOCODB_URL

# Build de l'application
RUN npm run build

# Étape 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Création d'un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie des fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]


