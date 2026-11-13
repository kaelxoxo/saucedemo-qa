# Prompt 02: Test-suite builder (SuiteBuilder)

Role: executor sub-agent that writes and runs the Playwright suite. Every design choice in the Contract below was made by the candidate during the planning interview (see `../decisions.md`); the agent only had freedom over test design, bug discovery, the timing budget, and the visual-compare method.

## Context

> **Goal:** Public GitHub repo for a QA-intern take-home: automated tests for https://www.saucedemo.com (public demo shop, demo users listed on the login page, password `secret_sauce`; some users are deliberately buggy). The recruiter must be able to run the tests in a few commands. Quality bar: senior-grade but readable; every file must be explainable by the candidate.
>
> **Repo:** git already initialized; DO NOT commit, DO NOT push, DO NOT create README.md, REPORT.md, docs/ux/, docs/judging/, docs/ai-workflow/. CONTEXT.md exists there: read it and use its terms exactly (Persona, Baseline Persona, Bug, Known Bug, UX Issue, Severity, Priority, Test Case).
>
> **Contract (fixed decisions)**
> - Playwright + TypeScript, npm with committed package-lock.json. Quickstart MUST work exactly as: `npm ci`, `npx playwright install --with-deps chromium`, `npm test`.
> - Playwright projects: `desktop-chromium` and `mobile-chromium` (a Chromium-based phone device descriptor such as Pixel 7) so only Chromium is installed.
> - Page Object Model: one small class per page under `pages/` built on the site's `data-test` attributes; wired via Playwright fixtures in one fixtures file. Persona list in one data file.
> - Persona matrix: core flows run for every Persona listed on the login page (login, inventory listing + all 4 sort options, item detail, add/remove from inventory and detail, cart badge, cart, checkout step one validation incl. each empty field, overview price math item total + tax = total, finish, burger menu logout + reset app state, logged-out direct access to /inventory.html blocked). locked_out_user: assert the lockout error and that nothing else is reachable.
> - Tests assert CORRECT behavior (Baseline Persona = standard_user). Each Known Bug is pinned with a conditional `test.fail(persona === '<x>', 'BUG-NN: <title>')` plus a `bug` annotation, so `npm test` is green and a fixed bug flips that test to failing. Keep each test focused on ONE behavior so one bug never masks another. Only mark test.fail after you have reproduced the failure against the live site and confirmed the cause is a site bug, not your test.
> - visual_user: compare against standard_user within the SAME run. NO committed screenshot baselines (they break across Windows/Linux CI).
> - performance_glitch_user: assert login→inventory visible within a budget you justify from measurements (measure standard_user too); pin as Known Bug if it exceeds. Must not be flaky in CI.
> - Be polite to the public site: cap workers, retries 0 locally / 1 on CI. Fresh browser context per test.
> - Test titles start with their Test Case ID, e.g. `TC-07 sort by price low→high`.
> - `BUGS.md`: one entry per Known Bug with ID, title, Persona, environment, steps to reproduce, expected, actual, Severity, Priority (justified; severity ≠ priority), evidence screenshot, linked test.
> - `TEST-CASES.md`: 15–25 Test Cases with preconditions, steps, expected, design technique, Personas covered, and the automated test that covers it (traceability).
> - GitHub Actions workflow: `npm ci`, install chromium, `npm test`, upload `playwright-report/` always.
> - npm scripts: `test`, `test:desktop`, `test:mobile`, `report`, `typecheck`.

## Task

> 1. Scaffold the project, page objects, fixtures, persona data, specs, CI workflow.
> 2. Run the suite against the live site; for every failure, reproduce manually, decide site bug vs test bug, fix test bugs, pin site bugs as Known Bugs with IDs BUG-01.. and save evidence screenshots.
> 3. Write BUGS.md and TEST-CASES.md.
> 4. Run typecheck and the suite until green; run the suite a second time to check flakiness.
>
> **Acceptance:** quickstart passes twice in a row; every `test.fail` references a BUGS.md entry and vice versa; report counts, the bug list, and an honest `AI mistakes caught` section.
