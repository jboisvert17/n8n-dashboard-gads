# Guide : Sélecteur de Client

## 📋 Vue d'ensemble

Le **sélecteur de client** permet de choisir quel compte Google Ads vous voulez consulter dans le dashboard. Les informations des clients proviennent directement de votre base de données NocoDB.

## 🎯 Comment ça fonctionne ?

### 1. Configuration dans NocoDB

Les informations des clients sont stockées dans :
- **Base** : Acolya (ID: `p1yvtejmzjpz3ld`)
- **Table** : Configuration (ID: `msy0l7ayypvzotp`)

Chaque client contient les informations suivantes :
- `customer_name` : Nom du client
- `customer_id` : ID Google Ads du client
- `mcc_id` : ID du compte MCC
- `shared_list_name` : Nom de la liste d'exclusion partagée
- `nocodb_base_id` : ID de la base NocoDB du client
- `nocodb_table_id` : ID de la table des search terms du client
- `email_to` : Email de contact

### 2. Utilisation dans le Dashboard

Le sélecteur de client apparaît dans le **header** (en haut de la page), à droite du titre.

**Fonctionnalités :**
- ✅ Liste déroulante avec tous les clients disponibles
- ✅ Sélection automatique du premier client au chargement
- ✅ Icône et design cohérent avec le reste de l'interface
- ✅ Affichage du nom du client et de son ID

## 💻 Utilisation dans votre code

### Dans n'importe quelle page

Pour accéder au client sélectionné dans vos pages :

```typescript
'use client';

import { useClient } from '@/lib/ClientContext';

export default function MaPage() {
  // Récupérer le client actuellement sélectionné
  const { selectedClient } = useClient();

  // Utiliser les informations du client
  if (selectedClient) {
    console.log('Client actuel :', selectedClient.customer_name);
    console.log('Customer ID :', selectedClient.customer_id);
    console.log('Table NocoDB :', selectedClient.nocodb_table_id);
  }

  return (
    <div>
      {selectedClient ? (
        <p>Client : {selectedClient.customer_name}</p>
      ) : (
        <p>Aucun client sélectionné</p>
      )}
    </div>
  );
}
```

### Exemple complet : Filtrer des données selon le client

```typescript
'use client';

import { useClient } from '@/lib/ClientContext';
import { useSearchTermsAnalysis } from '@/lib/useNocoDB';

export default function SearchTermsPage() {
  const { selectedClient } = useClient();
  const { data, loading, error } = useSearchTermsAnalysis();

  // Filtrer les search terms pour le client sélectionné
  const filteredData = data.filter(
    term => term.customer_id === selectedClient?.customer_id
  );

  return (
    <div>
      <h1>Search Terms pour {selectedClient?.customer_name}</h1>
      {/* Afficher les données filtrées */}
    </div>
  );
}
```

## 🔧 Architecture technique

### Fichiers créés/modifiés

1. **`src/lib/ClientContext.tsx`** (nouveau)
   - Contexte React pour gérer le client sélectionné globalement
   - Accessible partout dans l'application

2. **`src/components/ClientSelector.tsx`** (nouveau)
   - Composant de la liste déroulante
   - Design moderne avec animations

3. **`src/lib/useNocoDB.ts`** (modifié)
   - Ajout du hook `useClientConfiguration()`
   - Récupère automatiquement la liste des clients depuis NocoDB

4. **`src/app/api/nocodb/route.ts`** (modifié)
   - Ajout de la table `configuration` dans les routes API

5. **`src/components/Header.tsx`** (modifié)
   - Intégration du sélecteur de client
   - Prop `showClientSelector` pour l'activer/désactiver

6. **`src/components/Providers.tsx`** (modifié)
   - Ajout du `ClientProvider` pour rendre le contexte disponible

7. **`src/types/index.ts`** (modifié)
   - Ajout du type `ClientConfiguration`

## 📊 Exemple d'utilisation avancée

### Synchroniser avec un workflow n8n

```typescript
const { selectedClient } = useClient();

async function triggerWorkflow() {
  if (!selectedClient) {
    alert('Veuillez sélectionner un client');
    return;
  }

  const response = await fetch('/api/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: selectedClient.customer_id,
      customer_name: selectedClient.customer_name,
      nocodb_table_id: selectedClient.nocodb_table_id,
    }),
  });

  const result = await response.json();
  console.log('Workflow déclenché:', result);
}
```

## 🎨 Personnalisation

### Masquer le sélecteur sur certaines pages

```typescript
<Header 
  title="Ma Page" 
  subtitle="Description"
  showClientSelector={false}  // ← Masque le sélecteur
/>
```

### Ajouter une action au changement de client

```typescript
<ClientSelector 
  onClientSelect={(client) => {
    console.log('Nouveau client sélectionné:', client);
    // Faire quelque chose (recharger des données, etc.)
  }}
/>
```

## 🔍 Débogage

Si le sélecteur ne s'affiche pas ou ne fonctionne pas :

1. **Vérifier la connexion NocoDB**
   - Les variables d'environnement sont-elles correctes ?
   - La table Configuration existe-t-elle avec le bon ID ?

2. **Vérifier la console du navigateur**
   ```javascript
   // Dans la console
   localStorage.clear(); // Vider le cache si nécessaire
   ```

3. **Vérifier les données**
   ```bash
   # Tester l'API directement
   curl http://localhost:3000/api/nocodb?table=configuration
   ```

## 🚀 Prochaines améliorations possibles

- [ ] Sauvegarder le client sélectionné dans le localStorage
- [ ] Ajouter une recherche dans la liste des clients
- [ ] Afficher des statistiques rapides du client dans le dropdown
- [ ] Ajouter des favoris pour accès rapide

---

**Note** : Ce système est conçu pour être flexible et facile à étendre. N'hésite pas à l'adapter selon tes besoins !

