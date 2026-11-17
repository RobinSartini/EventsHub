# AI contribution policy

This document sets out EventsHub's policy on using AI assistants or agents when contributing. We expect both humans and AI agents to follow the letter and the spirit of these rules. If you notice behavior that does not follow them, report it to the maintainers through a GitHub issue or a private message.

It complements the general [contributing guide](./CONTRIBUTING.en.md) (also available in French: [CONTRIBUTING.md](./CONTRIBUTING.md)).

## Philosophy

Why have an AI policy at all? Shouldn't the code speak for itself?

Mostly, yes. That is why this policy targets **behaviors, not tools**. The behaviors below are a problem whether a human or an AI produced them, but we see them far more often when AI is involved:

- Submitting a PR with hundreds of lines the contributor does not understand.
- Telling a reviewer that a change was made when it was not, because an AI agent said so. Deliberate lying is rare; repeating a hallucination uncritically is common.
- Ignoring the project process (branch naming, Conventional Commits, PR checklist). A contributor who spent a few minutes generating a PR has little reason to learn it.

In short: **do not use AI as a substitute for human discussion**, in any forum, whether through automation or unedited copy-paste.

## Your contribution must be yours

- You are responsible for everything you submit, whatever tool produced it.
- You must have the right to submit it. Do not paste code you cannot license under the project's license (see the [README](./README.md#-licence)), and do not commit text or code reproduced from other projects without attribution.
- Never give an AI tool real secrets (API keys, `.env` contents, tokens, user data), and never commit them. Gitleaks runs in the pre-commit hook; do not bypass it with `--no-verify`.

## Issues and triage

Issues and comments must add value. Anyone can paste an issue URL into an agent, so posting the result is rarely useful.

- **Do not** run an unsupervised agent that posts issues, comments or triage notes. Any automated agent must be approved by the maintainers beforehand.
- Use AI to help with a contribution, not to replace it. It can help build a minimal reproduction or find duplicates, but you must check the output. For example, confirm that you can actually reproduce the bug before reporting it.
- Keep reports short, reproducible and accurate. AI-generated text is often verbose and imprecise: **edit it** until it contains only what matters.

## Pull requests

AI-assisted PRs follow the normal rules in [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) (branch naming, Conventional Commits, API contract, tests, green CI), plus these requirements:

1. **Review all AI-generated code yourself** before opening a non-draft PR and before asking for a re-review.
   - Unmodified AI output rarely meets our standards.
2. **Understand the code and be able to discuss it.**
   - Non-trivial PRs need discussion during review. If you do not understand the code, you cannot answer feedback.
   - Feeding review comments to an agent and reposting its answer unchecked is not a constructive review.
3. **Verify every AI-generated statement** in the PR description and in comments.
   - Incorrect information from an AI is a hallucination; pasting it into GitHub misrepresents your PR.
   - Never tell a reviewer that feedback was addressed just because an AI said so. Check it.
4. **Keep the repository clean.** Do not commit files produced by the agent for itself (plans, notes, scratch `.md` files, session logs, generated skill folders).
5. **Respect the template and checklist.** Do not replace the PR description with raw AI output; the checklist items (tests, linked issue, API contract, env variables) must be filled in by you.
6. **Mention substantial AI use** in the PR description (tool and what it was used for). This is not a penalty; it helps reviewers focus on the right things.

### AI instruction files

The AI instructions for this repository live in `CLAUDE.md` and `AGENTS.md`, generated from `.ruler/`.

- Edit the source in `.ruler/`, not the generated copies.
- If your change adds a dependency or service, or alters the project structure, update these files as well.
- Agents must follow the rules of this document and of [CONTRIBUTING.en.md](./CONTRIBUTING.en.md), including the API contract rules and the ban on editing `<better-fullstack:recipe-...>` regions by hand.

## Reviewer guidelines

Maintainer time is limited, while the capacity to generate plausible-looking code is not. Be mindful of what you choose to review. Consider closing a PR right away if it shows any of these red flags:

- The PR description replaced the template with AI output and is missing obvious checklist items (tests, issue link, API contract).
- The description does not match the changes.
- The PR contains irrelevant AI-generated files, such as agent planning files.

When closing a PR, always explain why and give next steps. If it is closed for breaking this policy, link to this document.

If at any point you feel you are getting unfiltered AI output as code or as answers, ask yourself:

- If this PR did not exist, would I spend my time fixing this issue?
- Would I fix it with an AI agent that takes hours or days to answer every prompt?

Unless both answers are yes, the review is not a good use of your time. This holds even several rounds in: if the contributor closed the PR, would you take it over? Beware the sunk cost fallacy.

## Consequences

Contributions that do not follow this policy may be closed without a detailed review. Repeated or deliberate violations may lead to restrictions on contributing, in line with the code of conduct in [CONTRIBUTING.en.md](./CONTRIBUTING.en.md#code-of-conduct).
