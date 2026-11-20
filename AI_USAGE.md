# AI usage

<!-- TODO(author): replace every _TODO_ before submitting. -->

## Tools and models

- **Tool:** [Claude Code](https://claude.com/claude-code), Anthropic's agentic coding tool.
- **Model:** Claude Opus 5.5, at medium effort.

## Agent instruction files

- [`frontend/AGENTS.md`](frontend/AGENTS.md): written by `next dev`. It tells agents to check the installed Next.js docs instead of relying on their training data.
- _TODO: list any other instruction files you used (`CLAUDE.md`, `.cursor/rules`, …) and commit them to the repo._

## Plan and spec

The design was agreed before any feature code was written:

- [`docs/backend-design.md`](docs/backend-design.md): endpoints, domain shapes, the `CatalogueSource` and `EnquiryStore` boundaries, validation and errors.
- [`docs/frontend-design.md`](docs/frontend-design.md): routes, data fetching and caching, enquiry form states, and testing.
- [`GLOSSARY.md`](GLOSSARY.md): the domain terms both apps use.

Each user story was then built as a vertical slice on its own branch and PR (`feat/<issue>-<name>`): the backend route and its tests, then `pnpm gen:api`, then the frontend page.

## Key prompts and moments

_TODO: 3–5 prompts or moments that shaped the solution._

1. _TODO_
2. _TODO_
3. _TODO_

## Where the AI got it wrong

_TODO: what the AI got wrong and how you caught it._

- _TODO_
