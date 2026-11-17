# Contributing to EventHub

Thank you for your interest in EventHub! This guide explains how to propose a change, from the branch to the pull request.

Version française : [CONTRIBUTING.md](./CONTRIBUTING.md). If you use an AI assistant, also read the [AI contribution policy](./CONTRIBUTING.ai.md).

## Table of contents

- [Contribution charter](#contribution-charter)
- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Git workflow](#git-workflow)
- [API contract](#api-contract)
- [Tests and quality](#tests-and-quality)
- [Pull requests and review](#pull-requests-and-review)
- [Dependencies](#dependencies)
- [AI assistants and generated files](#ai-assistants-and-generated-files)
- [Reporting a bug or a vulnerability](#reporting-a-bug-or-a-vulnerability)

## Contribution charter

By contributing, you commit to:

- opening an _issue_ to discuss any significant change before coding;
- keeping changes focused: one PR, one topic;
- following the conventions in this guide (branches, commits, API contract);
- never committing secrets (API keys, `.env`, tokens);
- accepting that your contribution is published under the project's license (see the [README](README.md#-licence));
- reviewing and fixing your code following review feedback.

## Code of conduct

- Be respectful and kind, whatever the level and background of other contributors.
- Criticize the code, never the person.
- Harassment, discrimination and offensive remarks will not be tolerated.
- Maintainers may moderate or remove any content (comment, issue, PR) that breaks these rules, and exclude its author.

## Getting started

Prerequisites: [Bun](https://bun.sh), Docker (optional, for PostgreSQL), and for mobile, macOS, Xcode and XcodeGen.

```bash
git clone https://github.com/<your-account>/eventhub.git
cd eventhub
bun install
```

Then copy each `.env.example` to `.env` (e.g. `apps/server/.env.example`) and fill in the variables. Then:

```bash
bun db:start  # starts PostgreSQL through Docker (optional if you already have a database)
bun db:push   # applies the schema to the database
bun dev       # starts the web app and the server
```

Server environment variables (`apps/server/.env.example`):

| Variable                                 | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| `DATABASE_URL`                           | PostgreSQL connection                |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | Authentication (secret of 32+ chars) |
| `CORS_ORIGIN`                            | Allowed front-end origin             |

These variables are validated with Zod in `packages/env`: declare any new variable there, and add it to `.env.example` **and** to the `env` section of `.github/workflows/ci.yml`. Never commit a `.env` file.

Alternative: `docker-compose.yml` provides a ready-to-use environment. For mobile (macOS only): `cd apps/native && xcodegen generate`, then open the project in Xcode.

Useful commands: `bun db:studio` (database UI), `bun db:generate` / `bun db:migrate` (Prisma), `bun dev:web`, `bun dev:server`, `bun dev:docs`.

## Project structure

```text
eventhub/
├── apps/
│   ├── web/        # Front end: React + React Router
│   ├── server/     # Back end: Hono
│   ├── native/     # Mobile: SwiftUI (iOS)
│   └── fumadocs/   # Documentation
├── packages/
│   ├── api/        # tRPC routers
│   ├── auth/       # Better Auth
│   ├── db/         # Prisma schema and client (PostgreSQL)
│   ├── env/        # Environment variable validation (Zod)
│   └── config/     # Shared configuration
└── scripts/
```

## Git workflow

1. Create a branch from an up-to-date `master`.
2. Commit small, coherent changes.
3. Push and open a pull request against `master`.

### Branch naming

Format `type/description`, lowercase, separated by hyphens:

```text
feat/export-pdf
fix/auth-redirect
chore/better-readme
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `ci`, `chore`.

### Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`, in the imperative or present tense. The project history is written in French, so keep descriptions in French.

```text
feat(web): ajoute la page des favoris
fix(server): corrige le type de retour de updateCollectionSchema
ci: corrige vp check
```

The scope is optional (`web`, `server`, `api`, `auth`, `db`, `native`, `docs`...). Add `!` after the type or a `BREAKING CHANGE:` footer for a breaking change.

## API contract

The API is built on **tRPC** and **Zod**: types and validation are shared between back end and front end.

- Every procedure is added in `packages/api/src/routers/` and exposed through `appRouter`.
- Every `input` is validated by a Zod schema; never trust client data.
- Use `protectedProcedure` for anything that needs a session, `publicProcedure` otherwise.
- The API contract (procedures, input and output Zod schemas, errors) must always match the code: update it **in the same PR** as the change, never afterwards.
- Changing a procedure's input or output is a contract change: in the same PR, update the front end (`apps/web`), the mobile app (`apps/native`) if it consumes the endpoint, and the documentation (`apps/fumadocs`, the "User story → Screen → Endpoint" map in the README).
- An out-of-date contract is a valid reason to reject a PR in review.
- A breaking change must be flagged in the PR description and in the commit (`!` or `BREAKING CHANGE:`).
- Database schema changes go through `packages/db`; describe them in the PR.
- Do not edit `<better-fullstack:recipe-...>` regions by hand.

## Tests and quality

Before pushing:

```bash
bun check         # lint + formatting (vp check)
bun check-types   # TypeScript type checking
bun run test      # tests (Vitest)
bun build         # production build
bun secrets:scan  # secret detection (Gitleaks)
```

Add or update tests for any new or fixed behavior. A pre-commit hook (`.vite-hooks`, installed by `bun install`) runs the checks and Gitleaks on staged files; do not bypass it (`--no-verify`).

### Continuous integration (CI)

The GitHub Actions CI (`.github/workflows/ci.yml`) runs on every push and every PR against `master`. It runs, in order: `vp check`, `vp run -r check-types`, `vp run -r build`, then `vp run -r test`.

- **A PR can only be merged if CI is green.** A red or pending CI blocks the merge, even with an approval.
- If CI fails, fix it on your branch and push; do not rerun a job that fails for a real reason.
- Reproduce CI locally with the commands above before asking for a review.
- A flaky test is never silently disabled: open an issue and reference it.
- CI environment variables are dummy values; never put a real secret in them.

## Pull requests and review

Before opening the PR:

- [ ] the branch is up to date with `master`;
- [ ] commits follow Conventional Commits;
- [ ] `check`, `check-types`, `test` and `build` pass locally, and CI is green on the PR;
- [ ] tests cover the change;
- [ ] the API contract (Zod schemas, web/mobile consumers, documentation) is up to date, or the PR does not touch it;
- [ ] new environment variables are declared (`packages/env`, `.env.example`, CI);
- [ ] no secret is committed (`bun secrets:scan`).

In the description, give the context (linked issue, e.g. `Closes #12`), what changes, and how to test it; add screenshots for any visual change.

Review:

- One (1) reviewer must approve the PR, and **all CI checks must be green**, before merging. Authors cannot approve their own PR.
- Answer comments with commits or an explanation; do not resolve a discussion in place of the reviewer.
- Reviewers aim to answer within a few days.
- We merge with _squash_, so the PR title must follow Conventional Commits.

## Dependencies

- Shared versions are centralized in the `catalog` of the root `package.json`: use `catalog:` in packages instead of a hard-coded version.
- Use Bun (`bun add`), not npm or yarn, and commit `bun.lock`.
- Justify every added dependency in the PR.

## AI assistants and generated files

The project was generated with [Better Fullstack](https://github.com/Marve10s/Better-Fullstack) (`bts.jsonc`). Instructions for AI assistants live in `CLAUDE.md` / `AGENTS.md`, generated from `.ruler/`: edit the source in `.ruler/`, not the generated copies. Update `CLAUDE.md` if you add a dependency, a service, or change the project structure.

Using an AI assistant is allowed, but you remain fully responsible for what you submit. See the [AI contribution policy](./CONTRIBUTING.ai.md).

## Reporting a bug or a vulnerability

### Bug

Open an _issue_, after checking that it does not already exist, with:

- the expected behavior and the observed behavior;
- the steps to reproduce;
- the environment (OS, browser, Bun version) and any useful logs or screenshots.

### Security vulnerability

**Do not open a public issue.** Contact the maintainers privately through GitHub's [_Report a vulnerability_](../../security/advisories/new) feature (Security tab of the repository), describing the flaw and how to reproduce it. Do not disclose anything publicly until a fix is available.
