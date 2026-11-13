# Prompt 04: Deliverable judge

Role: an independent QA sub-agent that has not seen the build conversation. It clones the public repository fresh and checks it against the recruiter's brief, item by item, returning PASS or FAIL with the gaps. A FAIL blocks sending. Its verdict is in [`../../judging/deliverable-verdict.md`](../../judging/deliverable-verdict.md).

## Brief (verbatim requirements)

1. Test SauceDemo automatically, using whatever tools and approach; show how AI is used in the workflow.
2. Review the UX: top 3–5 issues, each with a screenshot and how to improve it.
3. One-page report covering: the bugs found, UX recommendations, why this approach, where AI helped and where it got things wrong.
4. Public GitHub repo with a README; the reviewer can run the tests in a few commands.
5. Bonus: a ~3-minute screen recording. It lives outside the repo, so only check that a slot is ready for the link.

## Checks

| ID | Check | Pass condition |
|----|-------|----------------|
| D1 | Clean-clone run | In a fresh clone, the README quickstart commands run as written and `npm test` exits 0. |
| D2 | Known Bug integrity | Every `knownBug(...)` ID exists in `BUGS.md`, and every `BUGS.md` entry is pinned by a test. |
| D3 | Bug report quality | Every `BUGS.md` entry has steps, expected, actual, Severity, Priority, environment, evidence, and a linked test; the evidence files exist. |
| D4 | UX Issues | There are 3–5 issues; each has an annotated screenshot that exists, the impact on the Shopper, and a concrete improvement. |
| D5 | Report covers the brief | `REPORT.md` covers all four required topics. |
| D6 | One page | `REPORT.md` fits on one printed A4 page. |
| D7 | AI honesty | Every "AI got it wrong" claim traces to `docs/judging/` or the build log. There are no invented mistakes and no undisclosed AI authorship. |
| D8 | Traceability | Each `TEST-CASES.md` row names a test that exists. |
| D9 | Hygiene | No secrets, local absolute paths, personal emails, `.only`, or leftover debug code; `.gitignore` covers build output. |
| D10 | Terminology | Terms are used as `CONTEXT.md` defines them (Bug vs UX Issue, Severity vs Priority). |

Output: a table of D1–D10 with PASS/FAIL and evidence, then an overall verdict and a prioritised list of fixes.
