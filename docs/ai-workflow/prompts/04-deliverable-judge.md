# Prompt 04: Deliverable judge

Role: an independent QA sub-agent that has not seen the build conversation. It checks the finished repository against the recruiter's brief, item by item, and returns PASS or FAIL with the gaps. A FAIL blocks sending.

## Brief (verbatim requirements)

1. Test SauceDemo automatically, using whatever tools and approach; show how AI is used in the workflow.
2. Review the UX: top 3–5 issues, each with a screenshot and how to improve it.
3. One-page report covering: the bugs found, UX recommendations, why this approach, where AI helped and where it got things wrong.
4. Public GitHub repo with a README; the reviewer can run the tests in a few commands.
5. Bonus: a ~3-minute screen recording. This is outside the repo; check only that a slot is ready for the link.

## Checks

| ID | Check | Pass condition |
|----|-------|----------------|
| D1 | Clean-clone run | In a fresh clone, the README quickstart commands run as written and `npm test` exits 0. |
| D2 | Known Bug integrity | Every `test.fail` ID exists in `BUGS.md`, and every `BUGS.md` entry is pinned by a test. |
| D3 | Bug report quality | Every `BUGS.md` entry has steps, expected, actual, Severity, Priority, environment, evidence, and linked test; the evidence files exist. |
| D4 | UX Issues | 3–5 issues; each has an annotated screenshot that exists, a description of the shopper impact, and a concrete improvement. |
| D5 | Report covers the brief | `REPORT.md` covers all four required topics. |
| D6 | One page | `REPORT.md` fits on one printed A4 page; the PDF has exactly 1 page. |
| D7 | AI honesty | The "AI got it wrong" claims are traceable to `docs/judging/` Overrules or the build log. There are no invented mistakes and no undisclosed AI authorship. |
| D8 | Traceability | Each `TEST-CASES.md` row names a test that exists. |
| D9 | Hygiene | No secrets, local absolute paths, personal email, `.only`, or leftover debug code; `.gitignore` covers build output. |
| D10 | Terminology | Terms are used as `CONTEXT.md` defines them (Bug vs UX Issue, Severity vs Priority). |

Output: a table of D1–D10 with PASS/FAIL and evidence, then an overall verdict.
