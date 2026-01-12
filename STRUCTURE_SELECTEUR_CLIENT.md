# Structure du Sélecteur de Client

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Application                       │
│  ┌───────────────────────────────────────────────┐  │
│  │          ClientProvider (Contexte)            │  │
│  │  • Gère le client sélectionné globalement     │  │
│  │  • Accessible dans toutes les pages           │  │
│  └───────────────────────────────────────────────┘  │
│                         ↓                            │
│  ┌───────────────────────────────────────────────┐  │
│  │         Header avec ClientSelector            │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │     ClientSelector Component            │  │  │
│  │  │  • Liste déroulante des clients         │  │  │
│  │  │  • Récupère les données via hook        │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                         ↓                            │
│  ┌───────────────────────────────────────────────┐  │
│  │        Pages (Dashboard, Search Terms, etc.)  │  │
│  │  • Utilisent useClient() pour accéder au     │  │
│  │    client sélectionné                         │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                    API Route                         │
│        /api/nocodb?table=configuration               │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                     NocoDB                           │
│      Base: Acolya (p1yvtejmzjpz3ld)                 │
│      Table: Configuration (msy0l7ayypvzotp)          │
└─────────────────────────────────────────────────────┘
```

## 📦 Flux de données

### 1. Chargement initial

```
1. App démarre
   ↓
2. ClientProvider initialisé (selectedClient = null)
   ↓
3. ClientSelector monte
   ↓
4. useClientConfiguration() fait un appel API
   ↓
5. GET /api/nocodb?table=configuration
   ↓
6. NocoDB retourne la liste des clients
   ↓
7. ClientSelector sélectionne automatiquement le 1er client
   ↓
8. setSelectedClient(firstClient) mis à jour dans le contexte
   ↓
9. Toutes les pages reçoivent le client via useClient()
```

### 2. Changement de client

```
1. Utilisateur clique sur ClientSelector
   ↓
2. Liste déroulante s'ouvre avec tous les clients
   ↓
3. Utilisateur sélectionne un client
   ↓
4. handleClientSelect(client) est appelé
   ↓
5. setSelectedClient(client) met à jour le contexte
   ↓
6. Toutes les pages qui utilisent useClient() 
   reçoivent le nouveau client automatiquement
   ↓
7. Les composants se rafraîchissent avec les nouvelles données
```

## 🔑 Données d'un client

Structure du type `ClientConfiguration` :

```typescript
{
  Id: number                    // ID unique dans NocoDB
  customer_name: string         // "The Unscented Company", "SoftdB", etc.
  customer_id: string           // "1184059199", "5811537859", etc.
  mcc_id: string                // "4660067452"
  shared_list_name: string      // "Acc_Ai Analysis Search Terms"
  nocodb_base_id: string        // "phaukopzpj6pgp2", etc.
  nocodb_table_id: string       // "mjfs0gle9j3wyfi", etc.
  email_to: string              // "lesaccoladesmedia@gmail.com"
}
```

## 🎯 Points d'accès dans le code

### Pour utiliser le client dans une page

```typescript
import { useClient } from '@/lib/ClientContext';

const { selectedClient, setSelectedClient } = useClient();
```

### Pour récupérer la liste des clients

```typescript
import { useClientConfiguration } from '@/lib/useNocoDB';

const { data: clients, loading, error } = useClientConfiguration();
```

### Pour accéder au type

```typescript
import { ClientConfiguration } from '@/types';
// ou
import { ClientConfiguration } from '@/lib/useNocoDB';
```

## 📁 Fichiers clés

| Fichier | Rôle | Type |
|---------|------|------|
| `src/lib/ClientContext.tsx` | Contexte global du client | Provider |
| `src/components/ClientSelector.tsx` | UI du sélecteur | Component |
| `src/lib/useNocoDB.ts` | Hook pour récupérer les clients | Hook |
| `src/app/api/nocodb/route.ts` | API pour NocoDB | API Route |
| `src/types/index.ts` | Types TypeScript | Types |
| `src/components/Header.tsx` | Header avec sélecteur intégré | Component |
| `src/components/Providers.tsx` | Providers de l'app | Provider |

## 🎨 Design

### Couleurs utilisées

- **Fond** : `bg-dark-700` / `bg-dark-800`
- **Bordures** : `border-dark-600`
- **Texte** : `text-white` / `text-gray-400`
- **Icône** : Dégradé `from-blue-500 to-cyan-500`
- **Hover** : `hover:bg-dark-600`
- **Sélectionné** : `bg-blue-500/20`

### Composants Lucide utilisés

- `Building2` : Icône du client
- `ChevronDown` : Flèche du dropdown
- `Loader2` : Animation de chargement

## 🔄 États possibles

| État | Description | UI |
|------|-------------|-----|
| **Loading** | Chargement des clients | Spinner + "Chargement des clients..." |
| **Error** | Erreur API | Badge rouge avec message d'erreur |
| **Empty** | Aucun client | "Aucun client disponible" |
| **Loaded** | Clients chargés | Liste déroulante fonctionnelle |
| **Selected** | Client sélectionné | Nom affiché, badge bleu |

## 💡 Exemples d'utilisation

### Afficher le nom du client actuel

```typescript
const { selectedClient } = useClient();

return <h1>Dashboard - {selectedClient?.customer_name}</h1>;
```

### Filtrer des données par client

```typescript
const { selectedClient } = useClient();
const { data } = useSearchTermsAnalysis();

const clientData = data.filter(
  item => item.customer_id === selectedClient?.customer_id
);
```

### Déclencher un workflow avec le client

```typescript
const { selectedClient } = useClient();

const triggerWorkflow = async () => {
  await fetch('/api/trigger', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: selectedClient?.customer_id,
      nocodb_table_id: selectedClient?.nocodb_table_id,
    }),
  });
};
```

## ✅ Checklist d'intégration

- [x] Table Configuration ajoutée dans l'API NocoDB
- [x] Type `ClientConfiguration` créé
- [x] Hook `useClientConfiguration()` créé
- [x] Contexte `ClientContext` créé et intégré
- [x] Composant `ClientSelector` créé
- [x] Intégration dans le `Header`
- [x] Exemple d'utilisation (page Search Terms)
- [x] Documentation créée

## 🚀 Pour aller plus loin

### Sauvegarder le client dans localStorage

```typescript
// Dans ClientContext.tsx
useEffect(() => {
  if (selectedClient) {
    localStorage.setItem('selectedClient', JSON.stringify(selectedClient));
  }
}, [selectedClient]);

// Au chargement
useEffect(() => {
  const saved = localStorage.getItem('selectedClient');
  if (saved) {
    setSelectedClient(JSON.parse(saved));
  }
}, []);
```

### Ajouter une recherche dans le dropdown

```typescript
const [searchTerm, setSearchTerm] = useState('');
const filteredClients = clients.filter(client =>
  client.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

