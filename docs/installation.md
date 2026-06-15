# Installation et configuration - Athlo Front-End

## Contexte

Ce dépôt contient le **Front-End** de l'application **Athlo**, développé avec **React 19** et **Tailwind CSS 4**.
Le front communique avec le back-end via des API REST sécurisées (JWT) pour gérer les utilisateurs, les séances, les programmes, la nutrition, la boutique et la facturation.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/fr/) version **18 ou supérieure** (20 LTS recommandé)
- [npm](https://www.npmjs.com/) (inclus avec Node.js)
- Un navigateur moderne (Chrome, Edge, Firefox, Safari)
- Accès au back-end Athlo en cours d'exécution (par défaut `http://localhost:8000`)

---

## Étapes d'installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/uha-fr/endyearproject_2026_front.git
cd endyearproject_2026_front
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example` :

```bash
cp .env.example .env
```

Renseignez ensuite les variables suivantes :

```env
# URL de l'API back-end (par défaut : http://localhost:8000/api)
VITE_API_URL=http://localhost:8000/api

# Clé publique Stripe (mode test ou production)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Intégration Strava (optionnel)
VITE_STRAVA_CLIENT_ID=your_strava_client_id
VITE_STRAVA_REDIRECT_URI=http://localhost:5173/auth/strava/callback

# Intégration Google Calendar (optionnel)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

> **Note :** Si `VITE_API_URL` n'est pas définie, l'application utilise `http://localhost:8000/api` par défaut.
> Les variables Strava et Google Calendar sont nécessaires uniquement si vous souhaitez tester ces intégrations.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible à l'adresse : **`http://localhost:5173`**

---

## Scripts disponibles

| Commande | Description |
| -------- | ----------- |
| `npm run dev` | Lance le serveur de développement Vite |
| `npm run build` | Génère le build de production dans `dist/` |
| `npm run preview` | Prévisualise le build de production localement |
| `npm run lint` | Analyse le code avec ESLint |

---

## Variables d'environnement — référence complète

| Variable | Obligatoire | Description |
| -------- | ----------- | ----------- |
| `VITE_API_URL` | Non | URL de base de l'API REST. Défaut : `http://localhost:8000/api` |
| `VITE_STRIPE_PUBLIC_KEY` | Oui (paiements) | Clé publique Stripe pour les formulaires de paiement |
| `VITE_STRAVA_CLIENT_ID` | Non | Client ID de l'application Strava OAuth |
| `VITE_STRAVA_REDIRECT_URI` | Non | URL de callback après autorisation Strava |
| `VITE_GOOGLE_CLIENT_ID` | Non | Client ID de l'application Google OAuth |
| `VITE_GOOGLE_REDIRECT_URI` | Non | URL de callback après autorisation Google Calendar |

> **Important :** Toutes les variables d'environnement Vite doivent être préfixées par `VITE_` pour être accessibles côté client via `import.meta.env`.

---

## Build de production

Pour générer un build optimisé :

```bash
npm run build
```

Les fichiers compilés sont générés dans le dossier `dist/`. Ce dossier peut ensuite être servi par n'importe quel serveur HTTP statique (Nginx, Apache, Caddy, etc.).

> En production, les variables d'environnement doivent être injectées **avant** le build, car Vite les intègre directement dans les fichiers JavaScript à la compilation.

---

## Structure du projet

```text
src/
├── assets/         # Images, logo et ressources statiques
├── components/     # Composants réutilisables (layouts, widgets, guards de route)
├── context/        # État global React (CartContext pour le panier)
├── pages/          # Pages organisées par rôle utilisateur
│   ├── admin/      # Tableaux de bord et gestion admin
│   ├── responsable/# Espace responsable de salle
│   └── onboarding/ # Flux d'inscription multi-étapes
└── services/       # Couche d'accès à l'API (Axios, authService, etc.)
```

---

## Authentification

L'application utilise l'authentification **JWT** :

- Le token d'accès est stocké dans le `localStorage` sous la clé `authToken`.
- Un mécanisme de **refresh automatique** est intégré dans `src/services/api.js` : si une requête retourne une erreur `401`, le token est automatiquement renouvelé avant de relancer la requête.
- En cas d'échec du refresh, l'utilisateur est redirigé vers `/login`.

Comptes de test selon les rôles disponibles :

| Rôle | Accès |
| ---- | ----- |
| Coach | Via `/login` avec un compte de type `coach` |
| Athlète | Via `/login` avec un compte de type `athlete` |
| Prospect | Via `/login` avec un compte de type `prospect` |
| Responsable | Via `/login` avec un compte de type `responsable` |
| Admin | Via `/admin-login` avec un compte de type `admin` |

---

## Dépannage courant

**L'application affiche une erreur de connexion à l'API :**

- Vérifiez que le back-end est bien démarré et accessible à l'URL définie dans `VITE_API_URL`.
- Vérifiez que les CORS sont correctement configurés côté back-end pour autoriser `http://localhost:5173`.

**Les paiements Stripe ne fonctionnent pas :**

- Vérifiez que `VITE_STRIPE_PUBLIC_KEY` est définie et correspond à une clé valide (mode test : `pk_test_...`).
- En mode test, utilisez les [cartes de test Stripe](https://stripe.com/docs/testing#cards).

**Les intégrations Strava / Google Calendar ne redirigent pas correctement :**

- Vérifiez que `VITE_STRAVA_REDIRECT_URI` et `VITE_GOOGLE_REDIRECT_URI` correspondent aux URLs de callback enregistrées dans les consoles développeur Strava et Google.
