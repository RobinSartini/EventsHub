# Contrat d'API

Le contrat est [`contrat/openapi.yaml`](../contrat/openapi.yaml) (OpenAPI 3.0). Il fait foi : le back l'implémente, le web et le mobile s'appuient dessus. En cas de désaccord entre une issue et le contrat, c'est le contrat qui gagne.

## Le consulter

- **Lisible** : ouvrir le fichier dans [Swagger Editor](https://editor.swagger.io) (Fichier → Importer) ou l'extension OpenAPI de votre éditeur.
- **Résumé des routes** : la page API de la documentation (`bun dev`, puis http://localhost:4000).
- **API simulée**, sans lancer le serveur :

  ```bash
  npx @stoplight/prism-cli mock contrat/openapi.yaml -p 4010
  ```

  L'app iOS l'utilise en Debug.

## Conventions

- Réponses en JSON brut : `GET /events` renvoie un tableau d'`Event`, sans enveloppe `{ success, data }`.
- Pagination par `page` et `pageSize`, optionnels ; le total est dans l'en-tête `X-Total-Count`.
- Erreurs au format `Error` : `{ success: false, status, error, details? }`. Pour une erreur de validation, `details` liste les messages par champ (`{ "city": ["…"] }`), et les erreurs qui ne visent pas un champ sont sous `_form`.
- Authentification par le cookie de session Better Auth. Une route protégée répond 401 sans session et 403 sans le bon rôle.

## Le modifier

1. Ouvrir une PR qui ne touche que `contrat/openapi.yaml`, avec le label `api-contract`, et la faire valider par la cheffe du contrat.
2. Augmenter `info.version` :
   - **mineure** (1.3.0 → 1.4.0) pour un ajout : route, paramètre ou champ optionnel ;
   - **majeure** (1.x → 2.0.0) pour un changement cassant : champ retiré ou renommé, type modifié, nouveau paramètre obligatoire. Prévenir le web et le mobile avant le merge ;
   - **correctif** (1.4.0 → 1.4.1) pour une précision de description sans effet sur l'API.
3. Implémenter ensuite dans une PR séparée, mergée après celle du contrat.

## Historique

| Version | Changement                                                                                                                                                                                     | PR                                                                                                                 |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | Première version du contrat                                                                                                                                                                    | [#27](https://github.com/RobinSartini/EventsHub/pull/27)                                                           |
| 1.1.0   | Routes décrites telles qu'implémentées : `GET /events` (filtres, pagination), `GET /users`, `PATCH /users/{id}` et l'auth (`sign-up`, `sign-in`, `sign-out`, `get-session`, `refresh`, `jwks`) | [#53](https://github.com/RobinSartini/EventsHub/pull/53)                                                           |
| 1.2.0   | Recherche par mot-clé `q` sur `GET /events` ; routes `/admin/events`                                                                                                                           | [#56](https://github.com/RobinSartini/EventsHub/pull/56), [#57](https://github.com/RobinSartini/EventsHub/pull/57) |
| 1.3.0   | `GET /categories` ; tri `sort=distance` avec `lat`/`lng` et `distanceKm` ; filtres limités à 100 caractères                                                                                    | [#87](https://github.com/RobinSartini/EventsHub/pull/87)                                                           |
| 1.4.0   | `GET /events/{id}`                                                                                                                                                                             | [#100](https://github.com/RobinSartini/EventsHub/pull/100)                                                         |
