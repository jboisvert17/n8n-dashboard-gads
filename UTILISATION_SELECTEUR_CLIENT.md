# 🎯 Comment utiliser le Sélecteur de Client

## C'est quoi ?

Le **sélecteur de client** est un menu déroulant qui te permet de choisir quel compte Google Ads tu veux consulter dans ton dashboard.

Imagine que tu gères plusieurs clients (The Unscented Company, SoftdB, Luxury Metals, etc.). Au lieu de voir toutes les données mélangées, tu peux maintenant **sélectionner un client spécifique** et voir uniquement ses informations.

---

## 📍 Où le trouver ?

Le sélecteur se trouve **en haut de chaque page**, dans la barre de navigation (header), juste à droite du titre de la page.

```
┌──────────────────────────────────────────────────────┐
│  📊 Dashboard    [🏢 The Unscented Company ▼]   🔔 👤 │
└──────────────────────────────────────────────────────┘
                        ↑
                 C'EST ICI !
```

---

## 🎨 À quoi ça ressemble ?

### Version fermée (par défaut)

```
┌────────────────────────────┐
│ 🏢  CLIENT                  │
│    The Unscented Company  ▼│
└────────────────────────────┘
```

### Version ouverte (quand tu cliques dessus)

```
┌────────────────────────────┐
│ 🏢  CLIENT                  │
│    The Unscented Company  ▲│
├────────────────────────────┤
│ 🏢 The Unscented Company  ●│ ← Client actuel
│ 🏢 SoftdB                   │
│ 🏢 Luxury Metals            │
│ 🏢 ACET                     │
│ 🏢 EEQ - MASTERCARD         │
│ 🏢 EEQ - SUBVENTION GOO...  │
└────────────────────────────┘
```

---

## 🚀 Comment l'utiliser ?

### Étape 1 : Ouvrir le menu

Clique sur le bouton avec le nom du client actuel (ou "Sélectionner un client" si aucun n'est choisi).

### Étape 2 : Choisir un client

La liste de tous tes clients s'affiche. Clique sur celui que tu veux consulter.

### Étape 3 : Consulter les données

Une fois le client sélectionné :
- ✅ Les pages du dashboard affichent **uniquement** les données de ce client
- ✅ Le nom du client s'affiche en haut
- ✅ Tu peux voir son ID Google Ads et autres informations

---

## 📊 Que se passe-t-il quand tu changes de client ?

Quand tu sélectionnes un nouveau client :

1. **Le dashboard se met à jour automatiquement**
   - Les graphiques changent
   - Les tableaux affichent les nouvelles données
   - Les statistiques sont recalculées

2. **Le client reste sélectionné**
   - Même si tu changes de page (Dashboard → Search Terms → Campagnes)
   - Tu n'as pas besoin de le resélectionner à chaque fois

3. **Les données affichées correspondent au client choisi**
   - Search Terms du client
   - Campagnes du client
   - Métriques du client

---

## 💡 Exemples concrets

### Exemple 1 : Consulter les Search Terms d'un client

1. Va sur la page **Search Terms**
2. En haut, clique sur le sélecteur de client
3. Choisis "The Unscented Company"
4. Le tableau affiche maintenant **uniquement** les search terms de ce client
5. Tu vois aussi :
   - Le nom du client
   - Son Customer ID
   - Sa liste d'exclusion partagée

### Exemple 2 : Comparer deux clients

1. Sélectionne "SoftdB"
2. Note les métriques (dépenses, conversions, ROAS)
3. Change pour "Luxury Metals"
4. Compare les différences !

---

## 🎯 Informations affichées pour chaque client

Quand tu sélectionnes un client, voici ce que tu peux voir :

| Information | Description | Exemple |
|-------------|-------------|---------|
| **Nom du client** | Le nom de l'entreprise | The Unscented Company |
| **Customer ID** | L'identifiant Google Ads | 1184059199 |
| **MCC ID** | Le compte manager | 4660067452 |
| **Shared List** | Liste d'exclusion | Acc_Ai Analysis Search Terms |
| **Email** | Contact du client | lesaccoladesmedia@gmail.com |

---

## ❓ Questions fréquentes

### Pourquoi je ne vois pas de clients ?

**Raisons possibles :**
- ❌ La connexion à NocoDB n'est pas configurée
- ❌ La table "Configuration" est vide
- ❌ Il y a un problème avec les variables d'environnement

**Solution :** Vérifie que tes variables d'environnement (`NOCODB_URL`, `NOCODB_API_TOKEN`) sont correctes.

### Le sélecteur affiche "Chargement des clients..."

C'est normal ! Cela signifie que l'application est en train de récupérer la liste des clients depuis NocoDB. Ça prend généralement 1-2 secondes.

### Je veux masquer le sélecteur sur certaines pages

Pas de problème ! Le sélecteur peut être masqué si nécessaire. Contacte ton développeur pour cette configuration.

### Est-ce que mon choix est sauvegardé ?

**Actuellement :** Non, si tu rafraîchis la page, le premier client de la liste est automatiquement sélectionné.

**Amélioration future :** Il est possible d'ajouter une sauvegarde dans le navigateur pour mémoriser ton dernier choix.

---

## 🎨 Personnalisation visuelle

Le sélecteur utilise le même design que le reste du dashboard :
- **Couleurs sombres** pour réduire la fatigue oculaire
- **Icônes** pour identifier rapidement les éléments
- **Animations douces** quand tu ouvres/fermes le menu
- **Indicateur visuel** (point bleu) pour le client actuel

---

## 🔍 D'où viennent les données ?

Les clients proviennent de ta base de données **NocoDB**, dans la base **Acolya**, table **Configuration**.

C'est la même base où tu configures :
- Les IDs des clients Google Ads
- Les tables NocoDB pour chaque client
- Les listes d'exclusion
- Les emails de contact

Donc si tu veux **ajouter un nouveau client**, tu dois simplement l'ajouter dans cette table NocoDB, et il apparaîtra automatiquement dans le sélecteur !

---

## ✨ Fonctionnalités cool

### 1. Sélection automatique
Dès que tu arrives sur le dashboard, **le premier client est automatiquement sélectionné**. Tu n'as pas besoin de faire quoi que ce soit !

### 2. Recherche visuelle facile
Chaque client a une icône 🏢 et son ID est affiché en petit sous le nom, pour t'aider à identifier rapidement.

### 3. Indicateur visuel
Le client actuellement sélectionné a un **fond bleu** et un **point bleu** à droite dans la liste.

### 4. Fermeture automatique
Quand tu cliques en dehors du menu, il se ferme automatiquement.

---

## 🚀 Ce que tu peux faire maintenant

Avec ce sélecteur, tu peux :

✅ **Gérer plusieurs clients facilement** sans confusion  
✅ **Voir des données spécifiques** à chaque client  
✅ **Comparer les performances** entre différents comptes  
✅ **Déclencher des workflows n8n** pour un client précis  
✅ **Générer des rapports** client par client  

---

## 🎯 En résumé

Le sélecteur de client, c'est comme un **filtre intelligent** qui te permet de :

1. **Choisir** quel client tu veux voir
2. **Afficher** uniquement ses données
3. **Naviguer** entre les pages en gardant le client sélectionné
4. **Travailler efficacement** sans confusion

Simple, rapide, et toujours accessible en haut de ton écran ! 🎉

---

**Besoin d'aide ?** Si quelque chose ne fonctionne pas comme prévu, vérifie d'abord que :
- ✅ Tu es bien connecté à NocoDB
- ✅ La table Configuration contient des clients
- ✅ Ton navigateur n'a pas d'erreurs (appuie sur F12 pour voir la console)

