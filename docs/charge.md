# Tests de charge

Scénario : `apps/server/tests/load/ticket-rush.js`, lancé avec `bun run test:load` depuis `apps/server`.
10 événements à 1 place, 50 utilisateurs connectés se ruent sur chacun (`POST /events/:id/tickets`).
Attendu : p95 < 500 ms, erreurs < 1 %, places accordées = 10 (une par événement), refusées = 490.

## 2026-11-17

- Commit : `19d9024` + modifs non commitées (`book-ticket.ts`, `require-session.ts`)
- Machine : Intel Core i7-1355U, 16 Go RAM, Windows 11, serveur + Postgres en local

### Résultat

p95 = 375 ms, erreurs = 0 %, places accordées = 10/10

Refusées : 490/490 (409). Médiane 192 ms, max 450 ms. 0 requête en échec sur 550. Les 4 seuils passent.

### Ce qu'on corrige

- Rien : pas de survente, latence sous le seuil.
