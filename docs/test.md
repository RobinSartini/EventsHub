# Tests

## Lancer les tests

```bash
bun run test
```

Lance Vitest dans chaque paquet. Utilisez `bun run test` et non `bun test`, qui lance le runner de Bun à la place de Vitest. Aucun service n'est nécessaire : ni Docker, ni base, ni variable d'environnement réelle.

Pour un seul paquet, ou un seul fichier :

```bash
cd apps/server && bun run test
cd apps/server && bunx vitest run tests/feature/events/show.test.ts
```

## Back (`apps/server`)

Des tests de fonctionnalité qui appellent l'API comme un client, sur le modèle de Laravel :

```text
apps/server/tests/
├── setup.ts            # mocks partagés
├── helpers.ts          # get, post, patch, del, signUp, signIn, setUserFields
└── feature/
    ├── auth/           # un fichier par route : sign-up, sign-in, refresh…
    ├── events/         # list, search, sort, show
    ├── categories/
    ├── users/
    └── admin-events/
```

- **Un fichier par route**, rangé par feature : `tests/feature/<feature>/<route>.test.ts`.
- **La base est simulée** : `setup.ts` remplace `@EventsHub/db` par des fonctions `vi.fn()`. Chaque test indique ce que Prisma renvoie (`mockResolvedValue`) et vérifie la réponse HTTP, ainsi que la requête envoyée à Prisma quand elle compte (filtres, tri, pagination).
- **L'authentification est réelle** : Better Auth tourne avec un adaptateur en mémoire à la place de Prisma. `signUp` et `signIn` créent de vrais comptes et de vraies sessions, et `setUserFields` passe un compte en admin ou suspendu.
- **Les noms de test décrivent un comportement** : « an unknown event returns 404 », pas « test 404 ».
- Chaque route couvre au minimum : le cas nominal, les erreurs de validation (400), l'accès refusé (401/403) si la route est protégée, et l'absence de ressource (404).

## Front web (`apps/web`)

Vitest avec jsdom et Testing Library (`apps/web/vitest.config.ts`).

- `src/__tests__/` : un fichier par parcours ou user story (authentification, liste, recherche, filtres, administration). Les appels à l'API sont simulés.
- À côté des composants (`src/components/**/*.test.tsx`) : le comportement de chaque composant du design system.

## `packages/api`

Pas de tests : les anciens tests tRPC en échec attendu (`it.fails`) ont été supprimés dans [#112](https://github.com/RobinSartini/EventsHub/pull/112), car ce qu'ils décrivaient est implémenté et testé dans `apps/server`.

## App iOS (`apps/native`)

Tests XCTest dans `apps/native/Tests`, lancés depuis Xcode (⌘U) sur le projet généré par `xcodegen generate`. Ils ne font pas partie de `bun run test`.

## Tests de charge

Le protocole et les résultats sont dans [`charge.md`](charge.md).

## En CI

`vp run -r test` est la dernière étape de la CI (voir [`ci.md`](ci.md)) : une PR ne se merge pas si un test échoue.
