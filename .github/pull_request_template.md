## Contexte

Pourquoi cette PR ? Décrivez le problème ou le besoin en une ou deux phrases.

Issue liée : Closes #

## Ce qui change

- Changement 1 :
- Changement 2 :

Contrat d'API touché : oui / non (si oui, issue `api-contract` : #)

## Comment tester

1. Lancer `bun dev`
2. Aller sur la page ou l'endpoint concerné
3. Résultat attendu :

Captures d'écran (pour tout changement visuel) : avant / après

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

- Taille supérieure à 800 lignes, justification : sans objet
- Usage d'une IA (outil et usage) : aucun
- Points à surveiller en review :
