## Contexte

<!-- Pourquoi cette PR ? Issue liée : Closes #n -->

## Ce qui change

<!-- Résumé des changements -->

## Comment tester

<!-- Étapes de vérification manuelle ; captures pour tout changement visuel -->

## Checklist

- [ ] La branche est à jour avec `master` et nommée `type/description`
- [ ] Les commits et le titre de la PR respectent Conventional Commits
- [ ] `check`, `check-types`, `test` et `build` passent en local, la CI est verte
- [ ] Les tests couvrent le changement
- [ ] La PR ne dépasse pas environ 800 lignes modifiées (sinon, justification ci-dessous)
- [ ] Le contrat d'API (schémas Zod, consommateurs web/mobile, documentation) est à jour, ou la PR ne le touche pas
- [ ] Changement cassant : issue `api-contract` liée, consommateurs mentionnés, délai de 48 h respecté
- [ ] Les nouvelles variables d'environnement sont déclarées (`packages/env`, `.env.example`, CI)
- [ ] Aucun secret ni fichier d'agent IA (plans, notes) n'est committé
- [ ] Usage substantiel d'une IA mentionné ci-dessous, et tout le code généré a été relu et compris

## Notes

<!-- Taille > 800 lignes, usage d'une IA, points à surveiller en review -->
