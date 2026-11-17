# Contribuer à EventHub

Merci de l'intérêt que vous portez à EventHub ! Ce guide décrit comment proposer un changement : de la branche à la pull request.

English version: [CONTRIBUTING.en.md](./CONTRIBUTING.en.md). Si vous utilisez un assistant IA, lisez aussi la [politique de contribution IA](./CONTRIBUTING.ai.md) (en anglais).

## Sommaire

- [Charte de contribution](#charte-de-contribution)
- [Code de conduite](#code-de-conduite)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [Workflow Git](#workflow-git)
- [Contrat d'API](#contrat-dapi)
- [Tests et qualité](#tests-et-qualité)
- [Pull requests et review](#pull-requests-et-review)
- [Signaler un bug ou une faille](#signaler-un-bug-ou-une-faille)

## Charte de contribution

En contribuant, vous vous engagez à :

- ouvrir une _issue_ pour discuter d'un changement important avant de coder ;
- garder des changements ciblés : une PR, un sujet ;
- respecter les conventions de ce guide (branches, commits, contrat d'API) ;
- ne jamais committer de secret (clé API, `.env`, token) ;
- accepter que votre contribution soit publiée sous la licence du projet (voir le [README](README.md#-licence)) ;
- relire et corriger votre code suite aux retours de review.

## Code de conduite

- Soyez respectueux et bienveillant, quels que soient le niveau et le profil des autres contributeurs.
- Critiquez le code, jamais la personne.
- Aucun harcèlement, discrimination ou propos offensant ne sera toléré.
- Les mainteneurs peuvent modérer ou supprimer tout contenu (commentaire, issue, PR) qui enfreint ces règles, et exclure son auteur.

## Démarrage

Prérequis : [Bun](https://bun.sh), Docker (optionnel, pour PostgreSQL), et pour le mobile macOS, Xcode et XcodeGen.

```bash
git clone https://github.com/<votre-compte>/eventhub.git
cd eventhub
bun install
```

Copiez ensuite chaque `.env.example` en `.env` (ex. `apps/server/.env.example`) et renseignez les variables. Puis :

```bash
bun db:start  # démarre PostgreSQL via Docker (optionnel si vous avez déjà une base)
bun db:push   # applique le schéma à la base
bun dev       # lance le web et le serveur
```

Variables d'environnement du serveur (`apps/server/.env.example`) :

| Variable                                 | Rôle                                      |
| ---------------------------------------- | ----------------------------------------- |
| `DATABASE_URL`                           | Connexion PostgreSQL                      |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | Authentification (secret de 32 car. min.) |
| `CORS_ORIGIN`                            | Origine autorisée du front                |

Ces variables sont validées par Zod dans `packages/env` : toute nouvelle variable s'y déclare et s'ajoute au `.env.example` **et** à la section `env` de `.github/workflows/ci.yml`. Ne committez jamais un `.env`.

Alternative : `docker-compose.yml` fournit un environnement prêt à l'emploi. Ses valeurs sensibles (identifiants PostgreSQL `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) viennent du `.env` à la racine, créé par `bun dev` à partir de `.env.example` : n'écrivez jamais de secret en dur dans un `docker-compose.yml` ou un `Dockerfile`. Si vous changez `POSTGRES_PASSWORD`, reportez-le dans `DATABASE_URL` de `apps/server/.env`. Pour forcer l'architecture des images Docker, renseignez `DOCKER_PLATFORM` dans ce même `.env` (`linux/arm64` sur Mac Apple Silicon, `linux/amd64` sur Windows, Linux ou serveur) ; vide, Docker utilise l'architecture de la machine. Pour le mobile (macOS uniquement) : `cd apps/native && xcodegen generate`, puis ouvrez le projet dans Xcode.

Commandes utiles : `bun db:studio` (interface base de données), `bun db:generate` / `bun db:migrate` (Prisma), `bun dev:web`, `bun dev:server`, `bun dev:docs`.

## Structure du projet

```text
eventhub/
├── apps/
│   ├── web/        # Front : React + React Router
│   ├── server/     # Back : Hono
│   ├── native/     # Mobile : SwiftUI (iOS)
│   └── fumadocs/   # Documentation
├── packages/
│   ├── api/        # Routers tRPC
│   ├── auth/       # Better Auth
│   ├── db/         # Schéma et client Prisma (PostgreSQL)
│   ├── env/        # Validation des variables d'environnement (Zod)
│   └── config/     # Configuration partagée
└── scripts/
```

## Workflow Git

1. Créez une branche depuis `dev` à jour.
2. Committez par petits changements cohérents.
3. Poussez et ouvrez une pull request vers `dev`.
4. `dev` est ensuite promue vers `staging`, puis vers `main`.

### Nommage des branches

Format `type/description` en minuscules, séparée par des tirets :

```text
feat/export-pdf
fix/auth-redirect
chore/better-readme
```

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `ci`, `chore`.

### Messages de commit

Nous suivons [Conventional Commits](https://www.conventionalcommits.org/fr/) : `type(scope): description`, à l'impératif ou au présent, en français.

```text
feat(web): ajoute la page des favoris
fix(server): corrige le type de retour de updateCollectionSchema
ci: corrige vp check
```

Le scope est facultatif (`web`, `server`, `api`, `auth`, `db`, `native`, `docs`...). Indiquez `!` après le type ou un pied `BREAKING CHANGE:` pour un changement cassant.

## Contrat d'API

L'API repose sur **tRPC** et **Zod** : les types et la validation sont partagés entre le back et le front.

- Toute procédure s'ajoute dans `packages/api/src/routers/` et est exposée via `appRouter`.
- Toute entrée (`input`) est validée par un schéma Zod ; aucune donnée client n'est de confiance.
- Utilisez `protectedProcedure` pour tout ce qui nécessite une session, `publicProcedure` sinon.
- Le contrat d'API (procédures, schémas Zod d'entrée et de sortie, erreurs) doit toujours refléter le code : il se met à jour **dans la même PR** que le changement, jamais après.
- Un changement d'entrée ou de sortie d'une procédure est un changement de contrat : mettez à jour dans la même PR le front (`apps/web`), le mobile (`apps/native`) s'il consomme l'endpoint, et la documentation (`apps/fumadocs`, carte « User story → Écran → Endpoint » du README).
- Un contrat qui n'est pas à jour est un motif de refus en review.
- Un changement cassant doit être signalé dans la description de la PR et dans le commit (`!` ou `BREAKING CHANGE:`).
- Un changement de schéma de base de données passe par `packages/db` ; décrivez-le dans la PR.
- N'éditez pas les zones `<better-fullstack:recipe-...>` à la main.

## Tests et qualité

Avant de pousser :

```bash
bun check         # lint + formatage (vp check)
bun check-types   # typage TypeScript
bun run test      # tests (Vitest)
bun build         # build de production
bun secrets:scan  # détection de secrets (Gitleaks)
```

Ajoutez ou mettez à jour des tests pour tout comportement nouveau ou corrigé. Un hook de pré-commit (`.vite-hooks`, installé par `bun install`) lance les vérifications et Gitleaks sur les fichiers indexés ; ne le contournez pas (`--no-verify`).

### Intégration continue (CI)

La CI GitHub Actions (`.github/workflows/ci.yml`) se déclenche sur chaque push et chaque PR vers `main`, `staging` et `dev`. Elle exécute dans l'ordre : l'audit des dépendances, le scan Trivy du dépôt, `vp check`, `vp run -r check-types`, `vp run -r build`, puis `vp run -r test`.

- **Une PR ne peut être fusionnée que si la CI est verte.** Une CI rouge ou en cours bloque le merge, même avec une approbation.
- Si la CI échoue, corrigez sur votre branche et poussez ; ne relancez pas en boucle une exécution qui échoue pour une vraie raison.
- Reproduisez la CI en local avec les commandes ci-dessus avant de demander une review.
- Un test instable (_flaky_) ne se désactive pas en silence : ouvrez une issue et référencez-la.
- Les variables d'environnement de la CI sont factices ; n'y mettez jamais de vrai secret.

### Images Docker et rollback

Après une CI verte sur un push vers `dev`, `staging` ou `main`, la CI publie les images `server` et `web` sur GHCR (`ghcr.io/sugow0/eventshub-server` et `-web`) avec deux tags : `<branche>-<sha court>` (fixe, ex. `dev-3d566f6`) et `<branche>` (la dernière version de la branche).

Pour déployer une version, ou revenir à une version précédente, sur une machine connectée à GHCR (`docker login ghcr.io`) :

```bash
EVENTSHUB_TAG=dev-3d566f6 docker compose pull server web
EVENTSHUB_TAG=dev-3d566f6 docker compose up -d --no-build server web
```

Sans `EVENTSHUB_TAG`, `docker compose up --build` construit en local comme avant (tag `local`). Réglage du dépôt : la variable `VITE_SERVER_URL` (URL de l'API compilée dans l'image web, `http://localhost:3001` par défaut).

### Sécurité (audit et Trivy)

La CI bloque sur toute faille de sévérité haute ou critique :

- `vp pm audit --level high` : failles connues des dépendances npm (`bun audit`) ;
- Trivy sur le dépôt : secrets et erreurs de configuration (Dockerfiles, compose, workflows) ;
- Trivy sur chaque image avant publication : paquets système et dépendances embarquées (failles corrigées en amont uniquement).

Une faille non exploitable chez nous peut être acceptée dans `.trivyignore` (lu aussi par l'audit), avec la justification et une date d'expiration (`exp:AAAA-MM-JJ`). Sinon, mettez à jour la dépendance.

## Pull requests et review

Avant d'ouvrir la PR :

- [ ] la branche est à jour avec `dev` ;
- [ ] les commits respectent Conventional Commits ;
- [ ] `check`, `check-types`, `test` et `build` passent en local, et la CI est verte sur la PR ;
- [ ] les tests couvrent le changement ;
- [ ] le contrat d'API (schémas Zod, consommateurs web/mobile, documentation) est à jour, ou la PR ne le touche pas ;
- [ ] les nouvelles variables d'environnement sont déclarées (`packages/env`, `.env.example`, CI) ;
- [ ] aucun secret n'est committé (`bun secrets:scan`).

Dans la description, indiquez le contexte (issue liée, ex. `Closes #12`), ce qui change, et comment le tester ; ajoutez des captures pour tout changement visuel.

Review :

- Un (1) reviewer doit approuver la PR, et **tous les checks de la CI doivent être verts**, avant de fusionner. L'auteur ne peut pas approuver sa propre PR.
- Répondez aux commentaires par des commits ou une explication ; ne fermez pas une discussion à la place du relecteur.
- Les relecteurs s'efforcent de répondre sous quelques jours.
- Nous fusionnons en _squash_ ; le titre de la PR doit donc respecter Conventional Commits.

## Dépendances

- Les versions partagées sont centralisées dans le `catalog` du `package.json` racine : utilisez `catalog:` dans les paquets plutôt qu'une version en dur.
- Utilisez Bun (`bun add`), pas npm ni yarn, et committez `bun.lock`.
- Justifiez tout ajout de dépendance dans la PR.

## Assistants IA et fichiers générés

Le projet a été généré avec [Better Fullstack](https://github.com/Marve10s/Better-Fullstack) (`bts.jsonc`). Les instructions pour assistants IA vivent dans `CLAUDE.md` / `AGENTS.md`, issus de `.ruler/` : modifiez la source dans `.ruler/`, pas les copies générées. Mettez `CLAUDE.md` à jour si vous ajoutez une dépendance, un service ou changez la structure du projet. Relisez attentivement tout code produit par un assistant avant de le soumettre : vous en restez responsable. Voir la [politique de contribution IA](./CONTRIBUTING.ai.md).

## Signaler un bug ou une faille

### Bug

Ouvrez une _issue_ en vérifiant d'abord qu'elle n'existe pas déjà, avec :

- le comportement attendu et le comportement observé ;
- les étapes pour reproduire ;
- l'environnement (OS, navigateur, version de Bun) et les logs ou captures utiles.

### Faille de sécurité

**Ne créez pas d'issue publique.** Contactez les mainteneurs en privé via la fonction [_Report a vulnerability_](../../security/advisories/new) de GitHub (onglet Security du dépôt), en décrivant la faille et comment la reproduire. Ne divulguez rien publiquement avant qu'un correctif soit disponible.
