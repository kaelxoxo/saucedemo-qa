# Decisions made by the candidate

Before any code was written, the orchestrating AI interviewed me in rounds. Each round it laid out the open choices with a recommendation, and I decided. Where I went against the recommendation, the row says so.

| # | Decision | Options considered | Chosen |
|---|----------|--------------------|--------|
| Q1 | Division of labour | AI builds alone / AI builds, I direct and review, disclosed openly / I code, AI advises | AI builds under my direction and review; AI use disclosed in README and report |
| Q2 | Test stack | Playwright + TypeScript / Playwright + Python / Cypress | Playwright + TypeScript |
| Q3, Q11 | "AI agent you build" | Framework only / framework + free-model agent / agent only | **Overrode the recommendation.** The recommendation was a separate free-tier LLM agent inside the repo. I decided the agent is the orchestrated multi-agent workflow I actually used. The brief's "no need to pay" is about me as the candidate, and the reviewer only needs to run the tests, which need no API key. |
| Q4 | Repo identity | Personal email / GitHub noreply | Public repo `saucedemo-qa`, commits under a GitHub noreply address |
| Q5 | Bug vs UX Issue | — | Bug = deviates from `standard_user` or from the shop's own behaviour; UX Issue = works as built but hurts a real shopper (see `CONTEXT.md`) |
| Q6 | Suite red or green on known bugs | Red / green with pinned Known Bugs / skip buggy users | Green. Each Known Bug is an expected failure carrying a BUG ID, so a fixed bug turns its test red |
| Q7 | CI | — | GitHub Actions on every push, HTML report uploaded |
| Q8 | Report and video | — | `REPORT.md` plus PDF; I record the video myself from a script |
| Q9 | Coverage | Chromium / Chromium + mobile / 3 browsers + mobile | Persona matrix on desktop and mobile Chromium, plus a visual comparison for `visual_user` and a timing budget for `performance_glitch_user` |
| Q10 | Code structure | Page Object Model / inline selectors | Small Page Object Model built on `data-test` attributes |
| Q13 | Bug catalogue | — | `BUGS.md` with IDs, linked from tests through annotations |
| Q14 | UX screenshots | Plain / annotated, script-generated | Annotated by a script, so they can be regenerated |
| Q15 | README | — | Quickstart first |
| Q16 | AI judge | Findings judge / deliverable judge / both | Both. The Findings judge classifies the explorer's raw Findings and I accept or overrule each Verdict; an independent judge then checks the finished repo against the brief |
| Q17 | Publishing the workflow | Description only / + prompts / + raw transcripts | Description plus the real prompts and the judge rubric. Raw transcripts left out: they are noisy and contain local paths |
| Q18 | Bug report format | — | Standard fields: steps, expected, actual, Severity, Priority, environment, evidence, linked test |
| Q19 | Written test cases | — | `TEST-CASES.md` lists each Test Case with its design technique and traces it to the automated test |
| Q20 | Scope | Keep to intern scale / best effort | **Overrode the recommendation.** Best effort, not deliberately simplified |
| Q21 | Order of the top 5 UX Issues | Orchestrator's order (keyboard access first) / rank by how many Shoppers hit it | **Overrode the recommendation.** Keyboard-only shopping is rare, so the issues every Shopper hits come first: cart quantity, then mobile layout. Keyboard access stays in the top 5 at #5 because it fully blocks checkout for those Shoppers. |
