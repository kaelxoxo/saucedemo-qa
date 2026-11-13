# Prompt 03: Findings judge

Role: an independent sub-agent, separate from the explorer, that classifies every raw **Finding**. The candidate then accepts or **Overrules** each Verdict. The Overrules are the report's record of where the AI got things wrong.

## Inputs

- The explorer's raw findings (`../findings/explorer-raw.md`) and screenshots.
- `CONTEXT.md` (definitions of Bug, UX Issue, Baseline Persona).
- `BUGS.md` (Known Bugs pinned by the automated suite).
- The live site, for re-checking anything in doubt.

## Rubric

For each Finding, output exactly one Verdict:

| Verdict | Criteria |
|---------|----------|
| **Bug** | Reproducible on the live site, and it deviates from `standard_user` or contradicts the shop's own behaviour. |
| **UX Issue** | Reproducible, works as built, but confuses or blocks a real Shopper. |
| **Rejected** | Not reproducible, intended behaviour of a demo site (e.g. credentials listed on purpose for testers), a duplicate, or an artefact of the testing tool (timing noise, headless rendering). |

Each Verdict must include:

1. **Evidence**: the re-check you did (steps and what you observed), or the screenshot it rests on.
2. **Cross-reference**: the matching `BUGS.md` ID if one exists. A Bug Finding with no `BUGS.md` entry is flagged as a **coverage gap**.
3. **Confidence**: high / medium / low, with one line of reasoning. A low-confidence Verdict must say what would settle it.

Do not soften or round up. A Finding the explorer stated confidently but which you cannot reproduce is **Rejected**, with the failed reproduction as evidence.
