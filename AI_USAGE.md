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

The work moved through four stages. Each stage's output was reviewed before it became the next stage's input.

1. **Questioning the idea before any design.** The AI was asked to probe the brief and challenge the assumptions behind it, not to start building. This brought out the gaps in the acceptance criteria early, such as what "top rated" means and what "the sales inbox" should be for a PoC. The answers became the assumptions in [`DECISIONS.md`](DECISIONS.md) and the terms in [`GLOSSARY.md`](GLOSSARY.md).
2. **Turning the decisions into specs.** The agreed answers were written up as the backend and frontend design docs, so later work had one source to check against.
3. **Breaking the specs into tickets.** The specs were split into small issues, one vertical slice per user story, each with its own branch and PR.
4. **Building each ticket test-first.** For each ticket the tests came first, from the spec's expected behaviour, and the code followed. This is why the backend routes and the enquiry form states have tests that line up with the design docs.

## Where the AI got it wrong

- **It added a full build to CI.** The AI made CI build both apps, and to get the frontend build through, it started the backend inside the frontend job. That pulled in a repository secret for the catalogue provider and made CI depend on a live third-party API. I caught it while reviewing the PR by hand and running its CI. CI here is only meant to check lint, types and tests. The build steps were removed from both workflows, and each app's CI went back to `lint`, `typecheck` and `test`.
