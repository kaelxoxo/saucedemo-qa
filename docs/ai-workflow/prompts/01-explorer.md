# Prompt 01: Exploratory agent (SauceDemoExplorer)

Role: sub-agent with a real Chromium browser. Read-only towards the repo; output is raw **Findings** (unconfirmed), later classified by the Findings judge and reviewed by the candidate.

## Context

> Fact-finding for a QA take-home on https://www.saucedemo.com (public demo shop). We need a ground-truth catalogue of how each demo user behaves, to later design a Playwright suite and pick top UX issues. Do NOT write any files in the project folder. Write output only to the findings file and screenshots to a temp folder.

## Task

> **Target:** https://www.saucedemo.com, using a scripted browser.
>
> **Change**
> 1. On the login page, record the exact listed usernames and password text verbatim.
> 2. For EACH listed user, walk: login -> inventory (check images, names, prices, sort dropdown all 4 options) -> product detail page for 2 items -> add/remove from inventory and detail page -> cart badge count -> cart -> checkout step one (first/last/postal; try empty submit and each field) -> overview (check item total, tax, total math) -> finish -> back home. Also: burger menu (All Items, About, Logout, Reset App State), footer links, browser back button after logout, direct URL access to /inventory.html when logged out.
> 3. For each user, list every deviation from standard_user with exact repro steps and observed vs expected; note timings for performance_glitch_user (measure login->inventory ms). Note visual_user differences precisely (which element, how).
> 4. Separately list UX friction a real shopper would hit even for standard_user (e.g., no quantity control, error messages, credentials displayed, missing search/filter, mobile viewport 390x844 issues, accessibility like missing labels/alt text, focus states). Check the mobile viewport.
> 5. Record stable selectors (data-test attributes) for key elements.
> 6. Screenshot each finding.
>
> **Acceptance:** findings file contains: verbatim user list + password; per-user deviation table (user, area, steps, expected, observed, screenshot path); UX friction list with screenshot paths; selector list; any blockers. Facts only; mark anything unverified as UNVERIFIED.
