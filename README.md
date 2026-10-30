<div align="center">

# 🎟️ EventHub

**La plateforme qui révolutionne la gestion d'événements.**

Recherchez, créez et suivez des événements près de chez vous, sur le web comme sur mobile.

![React](https://img.shields.io/badge/React-Router_v8-61DAFB?logo=react&logoColor=black)
![Hono](https://img.shields.io/badge/Hono-Node.js-E36002?logo=hono&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwindcss&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?logo=openstreetmap&logoColor=white)

</div>

---

## 📖 Histoire

On en avait marre des événements mal organisés. C'est pourquoi nous avons créé **EventHub** : une application qui centralise la découverte, la création et la gestion d'événements, avec les inscriptions, les quotas et les billets à QR code.

## ✨ Fonctionnalités principales

| Fonctionnalité | Description |
| --- | --- |
| 🔍 **Recherche d'événements** | Catalogue filtrable (titre, catégorie, date, lieu). |
| ➕ **Création d'événements** | Espace organisateur pour publier et gérer ses événements. |
| 📍 **Événements à proximité** | Suggestions géolocalisées avec vue sur carte (OpenStreetMap). |
| ⭐ **Favoris** | Sauvegarde des événements qui nous intéressent. |

### Fonctionnalités de coordination (prévues)

- Gestion des inscriptions et des quotas de places
- Prévention des doubles réservations
- Génération de billets avec QR code
- Envoi d'emails de confirmation

---

## 🧱 Stack technique

| Couche | Technologies |
| --- | --- |
| **Web (front)** | React, React Router v8, Zod, Zustand, shadcn/ui, DevIcon, TailwindCSS |
| **Back** | Node.js, Hono, Zod, Better Auth (authentification) |
| **Services tiers (back)** | Upstash Redis (+ rate limiting), Stripe (paiements), Anthropic API (IA) |
| **Mobile** | SwiftUI (`apps/native`) |
| **Base de données** | PostgreSQL (`packages/db`) |
| **Services externes** | OpenStreetMap |
| **Outillage** | Bun, Vite+, Docker Compose, Dev Container, GitHub Actions, Gitleaks, Fumadocs, Ruler |
| **Pistes à confirmer** | Usage exact de Redis (verrous de places, cache), service d'emails |

> Les dépendances `better-auth`, `stripe`, `@upstash/redis`, `@upstash/ratelimit` et `@anthropic-ai/sdk` sont déclarées dans `apps/server`, et leurs variables d'environnement sont validées dans `packages/env`. Leur rôle fonctionnel dans EventHub reste à préciser.

---

## 🗺️ Carte des dépendances

### Vue d'ensemble de l'architecture

```mermaid
flowchart LR
    subgraph Clients
        WEB["🌐 Web<br/>React + React Router v8"]
        MOB["📱 Mobile<br/>SwiftUI"]
    end

    subgraph Backend
        API["⚙️ API<br/>Node.js + Hono"]
        DB[("PostgreSQL")]
    end

    subgraph Externe["Services externes"]
        OSM["🗺️ OpenStreetMap"]
        REDIS[("Upstash Redis")]
        STRIPE["💳 Stripe"]
        AI["🤖 Anthropic API"]
    end

    subgraph Prevu["Pistes à confirmer"]
        MAIL["✉️ Service d'emails"]
    end

    WEB -- "HTTP / JSON" --> API
    MOB -- "HTTP / JSON" --> API
    WEB -- "tuiles de carte" --> OSM
    MOB -- "tuiles de carte" --> OSM
    API --> DB
    API --> REDIS
    API --> STRIPE
    API --> AI
    API -.-> MAIL
```

> Les flèches pleines sont les dépendances actuelles ; les flèches en pointillés sont des pistes encore à valider.

### Dépendances du front web

```mermaid
flowchart TD
    APP["Application web"] --> REACT["React"]
    APP --> RR["React Router v8<br/>routage"]
    APP --> ZUSTAND["Zustand<br/>état global"]
    APP --> ZODF["Zod<br/>validation des formulaires"]
    APP --> UI["Couche UI"]
    UI --> SHAD["shadcn/ui<br/>composants"]
    UI --> TW["TailwindCSS<br/>styles"]
    UI --> DEVICON["DevIcon<br/>icônes"]
    SHAD --> TW
    APP --> OSMF["OpenStreetMap<br/>carte des événements"]
```

### Dépendances du back

```mermaid
flowchart TD
    API["API Hono (Node.js)"] --> HONO["Hono<br/>routage HTTP"]
    API --> ZODB["Zod<br/>validation des entrées"]
    API --> AUTH["Better Auth<br/>email + mot de passe, sessions<br/>/api/auth/*"]
    HONO --> ROUTES["Routes"]
    ROUTES --> EV["/events, /categories<br/>recherche, création"]
    ROUTES --> FAV["/me/favorites<br/>favoris"]
    ROUTES --> NEAR["/events/nearby, /events/map<br/>proximité"]
    ROUTES --> REG["/events/:id/registrations, /tickets<br/>inscriptions, billets"]
    ROUTES --> ADM["/admin/*<br/>administration"]
    ROUTES --> GEO["/geocode"]
    GEO -.-> OSMB["OpenStreetMap<br/>géocodage"]
```

### Schéma partagé (Zod)

Zod est utilisé des deux côtés : idéalement, les schémas sont définis une seule fois et partagés entre le front et le back pour garantir que les contrats d'API restent synchronisés.

```mermaid
flowchart LR
    SCHEMAS["📦 Schémas Zod partagés<br/>(à créer)"] --> FRONT["Front web"]
    SCHEMAS --> BACK["API Hono"]
```

### Carte User story → Écran → Endpoint

> Les écrans valent pour le web (React Router) et le mobile (SwiftUI). Les endpoints sont une **proposition de conception** : seule l'authentification (`/api/auth/*`, gérée par Better Auth avec email + mot de passe) existe déjà dans `apps/server`. Le serveur expose aussi un routeur tRPC sur `/trpc/*`, à arbitrer avec cette API REST.
>
> Les rôles `admin` et `organisateur` ne sont pas encore modélisés dans le schéma Prisma : les pages `/admin/*` supposent d'ajouter un champ `role` (ou le plugin `admin` de Better Auth).

```mermaid
flowchart LR
    subgraph FRONT["🖥️ Écrans (front)"]
        S1["/register · /login"]
        S2["/ (accueil)"]
        S3["/search + filtres"]
        S4["/events/:id"]
        S5["/nearby (liste · carte · rayon)"]
        S6["/favorites"]
        S7["/events/new · /events/:id/edit"]
        S8["/events/:id/attendees"]
        S9["/me/registrations"]
        S10["/tickets/:id"]
        S11["/admin/users"]
        S12["/admin/events"]
    end

    subgraph BACK["⚙️ Endpoints (back)"]
        E1["POST /api/auth/sign-up/email<br/>POST /api/auth/sign-in/email<br/>POST /api/auth/sign-out"]
        E2["GET /events"]
        E3["GET /categories"]
        E4["GET /events/:id"]
        E5["GET /events/nearby · /events/map"]
        E6["POST · DELETE · GET /me/favorites"]
        E7["POST /events · PATCH /events/:id<br/>POST /events/:id/cancel"]
        E8["GET /geocode"]
        E9["GET /events/:id/registrations (+ export CSV)"]
        E10["POST /events/:id/registrations<br/>DELETE /registrations/:id<br/>GET /me/registrations"]
        E11["GET · POST /tickets/:id (+ pdf, scan)"]
        E12["GET · PATCH /admin/users"]
        E13["GET · PATCH · DELETE /admin/events"]
    end

    subgraph DATA["🗄️ Données & services"]
        D1[("users")]
        D2[("events")]
        D3[("categories")]
        D4[("favorites")]
        D5[("registrations")]
        D6[("tickets")]
        OSM["OpenStreetMap"]
        MAIL["✉️ Email"]
    end

    S1 --> E1 --> D1
    S2 --> E2 --> D2
    S3 --> E2
    S3 --> E3 --> D3
    S4 --> E4 --> D2
    S4 --> E6
    S4 --> E10
    S5 --> E5 --> D2
    S6 --> E6 --> D4
    S7 --> E7 --> D2
    S7 --> E3
    S7 --> E8 -.-> OSM
    S8 --> E9 --> D5
    S9 --> E10 --> D5
    S10 --> E11 --> D6
    S11 --> E12 --> D1
    S12 --> E13 --> D2
    E10 -.-> MAIL
```

> Les flèches en pointillés sont des services externes ou à confirmer (`/geocode` → OpenStreetMap, email → service d'emails).

| ID | User story | Écran (front) | Endpoint(s) (back) |
| --- | --- | --- | --- |
| US-01 | Créer un compte, se connecter, se déconnecter | Pages « Register » et « Login » | `POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`, `POST /api/auth/sign-out`, `GET /api/auth/get-session` |
| US-02 | Parcourir les événements à l'accueil | Page `/` | `GET /events` |
| US-03 | *(Admin)* Gérer les utilisateurs | Page `/admin/users` | `GET /admin/users`, `PATCH /admin/users/:id` |
| US-04 | *(Admin)* Modérer les événements | Page `/admin/events` | `GET /admin/events`, `PATCH /admin/events/:id`, `DELETE /admin/events/:id` |
| US-05 | Rechercher un événement par mot-clé | Barre de recherche (header), page `/search` | `GET /events?q=` |
| US-06 | Filtrer par catégorie, dates et ville | Page `/search` (panneau filtres) | `GET /events?category=&from=&to=&city=`, `GET /categories` |
| US-07 | Consulter la fiche d'un événement | Page `/events/:id` | `GET /events/:id` |
| US-08 | Voir les événements proches de moi (liste) | Page `/nearby` (vue liste) | `GET /events/nearby?lat=&lng=&radius=` |
| US-09 | Voir les événements sur une carte | Page `/nearby` (vue carte) | `GET /events/map?bbox=` |
| US-10 | Ajuster le rayon de recherche | Page `/nearby` (curseur rayon) | `GET /events/nearby?radius=` (même endpoint) |
| US-11 | Ajouter un événement aux favoris | Bouton favori (carte + fiche) | `POST /me/favorites/:eventId` |
| US-12 | Retirer un événement des favoris | Bouton favori, page `/favorites` | `DELETE /me/favorites/:eventId` |
| US-13 | Consulter mes favoris | Page `/favorites` | `GET /me/favorites` |
| US-14 | Créer un événement | Page `/events/new` | `POST /events`, `GET /categories` |
| US-15 | Choisir le lieu de l'événement | Page `/events/new` (sélecteur de lieu) | `GET /geocode?q=` |
| US-16 | Modifier ou annuler mon événement | Page `/events/:id/edit` | `PATCH /events/:id`, `POST /events/:id/cancel` |
| US-17 | Voir et exporter la liste des inscrits | Page `/events/:id/attendees` | `GET /events/:id/registrations`, `GET /events/:id/registrations/export` (CSV) |
| US-18 | S'inscrire, se désinscrire, voir mes inscriptions | Bouton « S'inscrire » (fiche), page `/me/registrations` | `POST /events/:id/registrations`, `DELETE /registrations/:id`, `GET /me/registrations` |
| US-19 | Obtenir et faire scanner mon billet QR code | Page `/tickets/:id` | `GET /tickets/:id`, `GET /tickets/:id/pdf`, `POST /tickets/:id/scan` |
| US-20 | *(Système)* Envoyer un email de confirmation | Aucun (email) | Déclenché par `POST /events/:id/registrations` |
| US-21 | *(Système)* Empêcher doublons et dépassement de quota | Aucun (règle back) | `POST /events/:id/registrations` (contrainte unique + verrou de capacité) |

---

## 👥 User stories

### 🔍 Recherche d'événements

- En tant que **visiteur**, je veux rechercher un événement par mot-clé afin de trouver rapidement ce qui m'intéresse.
- En tant que **visiteur**, je veux filtrer les événements par catégorie, date et lieu afin d'affiner mes résultats.
- En tant que **visiteur**, je veux consulter la fiche détaillée d'un événement afin de décider si j'y participe.

### 📍 Événements à proximité

- En tant qu'**utilisateur**, je veux voir les événements proches de moi afin de découvrir ce qui se passe autour de moi.
- En tant qu'**utilisateur**, je veux afficher les événements sur une carte afin de visualiser leur emplacement.
- En tant qu'**utilisateur**, je veux ajuster le rayon de recherche afin de contrôler la distance maximale.

### ⭐ Favoris

- En tant qu'**utilisateur connecté**, je veux ajouter un événement à mes favoris afin de le retrouver plus tard.
- En tant qu'**utilisateur connecté**, je veux retirer un événement de mes favoris afin de garder une liste pertinente.
- En tant qu'**utilisateur connecté**, je veux consulter la liste de mes favoris afin d'y accéder en un clic.

### ➕ Création et gestion d'événements

- En tant qu'**organisateur**, je veux créer un événement (titre, description, date, lieu, capacité) afin de le rendre visible.
- En tant qu'**organisateur**, je veux placer le lieu de l'événement sur une carte afin que les participants le localisent facilement.
- En tant qu'**organisateur**, je veux modifier ou annuler mon événement afin de garder les informations à jour.
- En tant qu'**organisateur**, je veux voir la liste des inscrits afin de suivre la fréquentation.

### 🎫 Inscriptions et billets (prévu)

- En tant que **participant**, je veux m'inscrire à un événement afin de réserver ma place.
- En tant que **participant**, je veux recevoir un billet avec QR code afin de l'utiliser à l'entrée.
- En tant que **participant**, je veux recevoir un email de confirmation afin d'avoir une trace de mon inscription.
- En tant que **système**, je veux empêcher les doubles réservations et le dépassement de quota afin de garantir l'intégrité des places.

### 🛠️ Administration

- En tant qu'**administrateur**, je veux gérer les utilisateurs afin de contrôler les accès à la plateforme.
- En tant qu'**administrateur**, je veux modérer les événements (modifier, supprimer) afin de garder un catalogue de qualité.

### 👤 Compte

- En tant que **visiteur**, je veux créer un compte et me connecter afin d'accéder aux fonctions personnalisées.

---

## 🚀 Démarrage

### Prérequis

- [Bun](https://bun.sh) pour les dépendances JavaScript (installées à la racine du workspace)
- Pour l'app mobile : macOS, Xcode et [XcodeGen](https://github.com/yonaskolb/XcodeGen)
- Docker (optionnel) pour lancer PostgreSQL via Docker Compose ou le Dev Container

### Installation

```bash
git clone https://github.com/<votre-compte>/eventhub.git
cd eventhub

bun install
(cd apps/native && xcodegen generate)
```

Copiez ensuite le `.env.example` de chaque application en `.env` (quand il existe) et renseignez les identifiants de la base de données avant de démarrer les services qui en dépendent.

### Développement

Lance ensemble le front web et le back (si l'un s'arrête, les autres sont arrêtés) :

```bash
bun run dev
```

L'application mobile se lance séparément, pour choisir un simulateur ou un appareil :

```bash
cd apps/native && open BetterFullstackApp.xcodeproj
```

Le web et le mobile communiquent avec l'API en HTTP. Voir le README et le fichier d'environnement de chaque application pour son endpoint local.

## 🗂️ Structure du projet

```text
eventhub/
├── apps/
│   ├── web/        # React + React Router
│   ├── server/     # Node.js + Hono
│   └── native/     # SwiftUI (iOS)
├── packages/
│   └── db/         # PostgreSQL
└── README.md
```

> Le projet a été généré avec [Better Fullstack](https://github.com/Marve10s/Better-Fullstack). Les schémas Zod partagés (`packages/schemas`) restent une piste à créer.

## 🛣️ Feuille de route

- [ ] Recherche et catalogue d'événements
- [ ] Création d'événements
- [ ] Vue carte et événements à proximité
- [ ] Favoris
- [ ] Inscriptions, quotas et billets QR code
- [ ] Emails de confirmation
- [ ] Application mobile

## 🤝 Contribuer

Les contributions sont les bienvenues. Ouvrez une *issue* pour discuter d'un changement, puis soumettez une *pull request*.

## 🙏 Crédits

- Cartographie : © les contributeurs [OpenStreetMap](https://www.openstreetmap.org/copyright)

## 📄 Licence

À définir.
