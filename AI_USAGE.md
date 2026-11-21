# AI usage

## Tools and models

I used [Claude Code](https://claude.com/claude-code) with Claude Opus 5.5, at medium effort, for everything from planning to code.

## Agent instruction files

I didn't write any. The specs and tickets did that job: every task pointed the AI at a ticket, and every ticket pointed at the design docs.

The one instruction file in the repo is [`frontend/AGENTS.md`](frontend/AGENTS.md). I didn't write it. `next dev` generates it, and it tells agents to read the installed Next.js docs before writing code, because this Next.js version differs from what models were trained on.

## Plan and spec

I agreed the design before writing any feature code. It lives in three files:

- [`docs/backend-design.md`](docs/backend-design.md) covers endpoints, domain shapes, the `CatalogueSource` and `EnquiryStore` interfaces, validation and errors.
- [`docs/frontend-design.md`](docs/frontend-design.md) covers routes, data fetching and caching, enquiry form states, and testing.
- [`GLOSSARY.md`](GLOSSARY.md) fixes the domain terms both apps use, so "featured product" means one thing everywhere.

Each user story then became one branch and one PR, named `feat/<issue>-<name>`. Inside a story the order was always the same. Backend route and tests first, then `pnpm gen:api` to regenerate the frontend types, then the frontend page.

## Key prompts and moments

I worked in four stages and reviewed the output of each one before feeding it into the next.

1. **Questioning the idea.** Before any design, I had the AI pick the brief apart and challenge my assumptions instead of building. That's where the gaps in the acceptance criteria came out. What does "top rated" mean if I chose the products? What is "the sales inbox" when the reviewer can't sign up for an email service? The answers became the assumptions in [`DECISIONS.md`](DECISIONS.md) and the terms in [`GLOSSARY.md`](GLOSSARY.md).
2. **Writing the specs.** I had the agreed answers written up as the two design docs. After that, any question about behaviour had one place to check.
3. **Breaking the specs into tickets.** Each ticket was one user story, cut as a vertical slice through backend and frontend, small enough for one PR.
4. **Building test-first.** For every ticket the tests came first, written from the behaviour in the spec, and the code came after. That's why the route tests and the enquiry form tests read almost like the tables in the design docs.

## Where the AI got it wrong

The AI turned CI into a build pipeline. It made CI build both apps. The frontend build failed without a running backend, so it started the backend inside the frontend job. That needed a repository secret for the catalogue provider and made every PR depend on a third-party API being up.

I caught it while reviewing the PR by hand and running its CI. CI in this repo is there to check lint, types and tests, nothing more. I had the build steps removed from both workflows, and each app's CI went back to `lint`, `typecheck` and `test`.

## What I haven't checked

AI wrote the Docker Compose setup, `docker-compose.yml` and the `local` stage in `frontend/Dockerfile`, near the end, to get setup down to one command. It ran once in the AI's own sandbox, against a stand-in catalogue because that sandbox couldn't reach Fake Store. I haven't checked it myself, so I don't vouch for it. The two-terminal setup in the README is the one I tested, and it's the one I recommend.
