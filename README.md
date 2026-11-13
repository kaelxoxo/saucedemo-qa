# SauceDemo QA

[![Playwright tests](https://github.com/kaelxoxo/saucedemo-qa/actions/workflows/playwright.yml/badge.svg)](https://github.com/kaelxoxo/saucedemo-qa/actions/workflows/playwright.yml)

Automated end-to-end tests, a bug catalogue, and a UX review of [SauceDemo](https://www.saucedemo.com), a public demo shop. Built as a QA take-home exercise.

**Start here → [REPORT.md](REPORT.md)** (one page: bugs, UX recommendations, approach, where AI helped and where it got things wrong). Printable copy: [REPORT.pdf](REPORT.pdf), printed from Chromium on A4 at 9.5 pt with 15 mm margins.

**Walkthrough video (3 min):** _link_

## Quickstart

Requires Node.js 22.18 or newer.

```bash
npm ci
npx playwright install --with-deps chromium
npm test
```

`npm test` runs 362 tests against the live site, 181 each on desktop and mobile Chromium, in about 7 minutes. It should finish **green**: 236 tests pass, and the other 126 are expected failures that pin the 28 Known Bugs (see below). To browse the results:

```bash
npm run report        # open the HTML report (bug IDs show up as annotations)
```

Other scripts:

| Command | What it does |
|---------|--------------|
| `npm run test:desktop` | Desktop Chromium only |
| `npm run test:mobile` | Mobile Chromium (phone viewport) only |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run ux:screenshots` | Regenerate the annotated UX screenshots in `docs/ux/` |

## What's tested

The site lists six demo **Personas**. `standard_user` is the **Baseline Persona**; the others are deliberately buggy. Every core flow runs for every Persona, so each test answers one question: does this Persona behave like the baseline?

| Area | Covered |
|------|---------|
| Login | Valid login, the locked-out Persona, empty or wrong credentials, logged-out access to inner pages |
| Inventory | Product names, images, prices, all four sort orders |
| Product page | Opens the right product, details match the inventory |
| Cart | Add and remove from inventory and from the product page, cart badge, cart contents |
| Checkout | Required-field validation, price math (item total + tax = total), finish |
| Menu | Logout, Reset App State |
| `visual_user` | Layout compared against `standard_user` within the same run (no stored baselines, so it works on any OS) |
| `performance_glitch_user` | Time from login to inventory checked against a measured time budget |

Test design and traceability: **[TEST-CASES.md](TEST-CASES.md)**. Every Test Case ID (`TC-NN`) appears in a test title.

## Known Bugs: why the suite is green

Tests check for **correct** behaviour. When a Persona hits a confirmed site Bug, that test is declared with `knownBugs([condition, 'BUG-NN'])`. That tags it `@known-bug` and `@BUG-NN`, and a fixture marks it as an expected failure:

- the suite stays green while the Bug exists;
- once the Bug is fixed, that test **turns red**, which tells you to remove the marker;
- in the HTML report these tests show a ✓ (they failed as expected) plus `@known-bug` and `@BUG-NN` labels. Type `@known-bug` or a single ID such as `@BUG-25` in the report's search box to list them;
- each Bug is fully documented in **[BUGS.md](BUGS.md)**: steps, expected and actual result, Severity, Priority, evidence, and a link to the test.

## UX review

The top five UX Issues, each with an annotated screenshot and a proposed fix, are in **[docs/ux/UX-ISSUES.md](docs/ux/UX-ISSUES.md)**.

## How AI was used

An AI agent built this repo under my direction. I made the design decisions, reviewed the output, and overruled the AI where it was wrong. Two AI judges checked the work: one re-checked every raw Finding, and an independent one checked the finished repo against the brief.

- Orchestration, tools, and my role: [docs/ai-workflow.md](docs/ai-workflow.md)
- The actual prompts and the judge rubrics: [docs/ai-workflow/prompts/](docs/ai-workflow/prompts/)
- Judge verdicts: [docs/judging/](docs/judging/)
- Shared vocabulary (Bug vs UX Issue, Severity vs Priority): [CONTEXT.md](CONTEXT.md)

## Project layout

```
pages/                Page Objects (one per page) built on data-test attributes, plus Header
fixtures/test.ts      Playwright fixtures; knownBugs() tags a test with its Known Bug IDs and the knownBugPins fixture marks it as an expected failure
data/                 Personas, product catalogue (names, prices, sort orders), Known Bug IDs
tests/                Specs, each running once per Persona
scripts/              Script that generates the UX screenshots
docs/bugs/            Evidence screenshots for BUGS.md
docs/ux/              Annotated UX screenshots + UX-ISSUES.md
docs/judging/         AI judge verdicts
docs/ai-workflow/     Prompts, decisions, raw AI findings
.github/workflows/    CI: runs the suite on every push, uploads the HTML report
```
