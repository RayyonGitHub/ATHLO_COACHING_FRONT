![Logo Athlo](src/assets/images/logo.png)

# Athlo - Front-End

Athlo est une plateforme web complète dédiée aux **coachs sportifs** et à leur écosystème : gestion des clients, planification des séances, programmes d'entraînement, boutique en ligne, nutrition, messagerie, facturation et tableaux de bord analytiques.

Ce dépôt contient uniquement le **Front-End** de l'application, développé avec **React 19** et **Tailwind CSS 4**.

---

## Contexte du projet

Le projet fait partie du programme **ArchiWeb 2026** et vise à créer une application web complète pour les coachs sportifs.

**Objectifs Front-End :**

- Offrir une interface utilisateur responsive, moderne et accessible (desktop et mobile)
- Communiquer avec le back-end via des API REST (authentification JWT, refresh automatique)
- Visualiser les données clients, séances, programmes, nutrition et facturation
- Intégrer des services tiers : Stripe, Strava, Google Calendar

---

## Rôles utilisateurs

L'application gère **5 types de profils** distincts, chacun disposant d'un espace dédié :

| Rôle | Description | Espace |
| ---- | ----------- | ------ |
| **Coach** | Gère ses clients, séances, programmes, boutique et finances | `/dashboard`, `/calendar`, `/clients`… |
| **Athlète** | Consulte ses séances, programmes, commandes et statistiques | `/athlete/*` |
| **Prospect** | Découvre les coachs, demande des devis et s'inscrit | `/prospect/*` |
| **Responsable** | Supervise les coachs et le planning d'une salle de sport | `/responsable/*` |
| **Admin** | Administre l'ensemble de la plateforme | `/admin/*` |

---

## Fonctionnalités principales

### Coach
- **Dashboard analytique** : KPIs, revenus, MRR, nombre de clients actifs (Recharts)
- **Calendrier des séances** : création, modification, gestion des indisponibilités (FullCalendar)
- **Gestion des clients** : liste, création, mise à jour, suppression
- **Programmes d'entraînement** : création et attribution de programmes personnalisés
- **Bibliothèque d'exercices** : catalogue avec catégories, création et édition
- **Boutique en ligne** : gestion des produits (numériques et physiques), suivi des stocks
- **Nutrition** : bibliothèque de recettes et création de plans alimentaires
- **Messagerie** : conversations individuelles et de groupe, pièces jointes
- **Devis** : création et envoi de devis aux prospects
- **Paramètres** : profil coach, configuration Stripe Connect
- **Export Google Calendar** : synchronisation du planning

### Athlète
- **Dashboard personnel** : objectifs du jour, statistiques de santé, séance en vedette
- **Calendrier** : consultation et inscription aux séances disponibles
- **Programmes** : visualisation des programmes assignés par le coach
- **Boutique** : navigation et achat (panier, paiement Stripe)
- **Nutrition** : consultation des plans alimentaires assignés
- **Statistiques** : suivi des performances et progression
- **Facturation** : historique des commandes et factures
- **Intégrations** : connexion Strava (synchronisation des activités), Google Calendar

### Prospect
- **Découverte des coachs** : listing public avec filtres
- **Salles de sport** : carte des salles à proximité
- **Devis** : demande de devis auprès des coachs
- **Achat et inscription** : paiement Stripe, activation du profil athlète

### Responsable de salle
- **Dashboard** : statistiques de la salle
- **Planning** : visualisation des séances planifiées
- **Supervision des coachs** : suivi de l'activité des coachs rattachés

### Admin
- **Vue d'ensemble** : KPIs globaux (coaches, athlètes, revenus, MRR)
- **Gestion des utilisateurs** : CRUD coaches, athlètes, prospects, responsables
- **Catalogue** : gestion des exercices et catégories de produits
- **Finance** : rapports financiers
- **Paramètres système** : administration globale

---

## Stack technique

| Catégorie | Technologie | Version |
| --------- | ----------- | ------- |
| Framework UI | React | 19.2.0 |
| Build tool | Vite (rolldown-vite) | 7.2.5 |
| Styling | Tailwind CSS | 4.1.18 |
| Routing | React Router DOM | 7.12.0 |
| Client HTTP | Axios | 1.13.2 |
| Icônes | Lucide React | 0.563.0 |
| Calendrier | FullCalendar | 6.1.20 |
| Graphiques | Recharts | 3.8.0 |
| Paiements | Stripe (React + JS) | — |
| Drag & Drop | Hello Pangea DND | 18.0.1 |
| Sélecteur de date | React Calendar | 6.0.0 |
| Linter | ESLint | 9.39.1 |

---

## Architecture

```
src/
├── assets/         # Images et ressources statiques
├── components/     # Composants réutilisables (layouts, widgets, guards)
├── context/        # État global React (CartContext)
├── pages/          # Pages par rôle (coach, athlete, prospect, admin, responsable)
└── services/       # Couche d'accès à l'API REST (Axios + authService)
```

**Flux de données :**
```
Page / Composant
    └── Service (ex: coachService.js)
            └── api.js (Axios avec intercepteurs JWT)
                    └── API REST back-end (http://localhost:8000/api)
```

**Gestion de l'état :**
- **Authentification** : tokens JWT stockés en `localStorage`, refresh automatique via intercepteur Axios
- **Panier** : `CartContext` (React Context + `localStorage`)
- **État local** : hooks React (`useState`, `useEffect`) dans chaque composant

---

## Intégrations tierces

| Service | Usage | Variables d'environnement requises |
| ------- | ----- | ---------------------------------- |
| **Stripe** | Paiements athlètes & Stripe Connect coaches | `VITE_STRIPE_PUBLIC_KEY` |
| **Strava** | Synchronisation des activités sportives | `VITE_STRAVA_CLIENT_ID`, `VITE_STRAVA_REDIRECT_URI` |
| **Google Calendar** | Export et synchronisation du planning | `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_REDIRECT_URI` |

---

## Documentation

- [Guide d'installation et de configuration](docs/installation.md)
- [Maquette UI (Google Stitch)](https://stitch.withgoogle.com/projects/15655097857567584238)

---

## CI/CD

Le déploiement est automatisé via **GitHub Actions** (`.github/workflows/deploy.yml`) :
1. Déclenchement sur push vers la branche `main`
2. Installation des dépendances (`npm ci`)
3. Build de production avec injection des variables d'environnement
4. Déploiement vers le VPS de production (`/app/front`) via SCP

---

## Auteur

- **Groupe 6 ArchiWeb 2026**
