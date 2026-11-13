# Prompt 05: UX screenshot agent (UxShots)

Role: an executor sub-agent that turns the selected UX Issues into reproducible, annotated screenshots and writes up the improvements. The orchestrator chose the five issues from the explorer's 25 UX Findings, prioritising impact on a real Shopper. The candidate had told it to apply its recommendations and reviewed the selection afterwards. The agent was told to verify every claim against the live site before annotating it.

## Task (abridged)

> Write `scripts/ux-screenshots.ts`, a standalone script (not a test). It logs in as `standard_user`, reproduces each UX Issue, outlines the problem element(s) in red with a labelled caption, and saves `docs/ux/UX-0N-<slug>.png`.
>
> UX Issues:
> - **UX-01** The cart has no quantity control and shows no product thumbnails.
> - **UX-02** Checkout form feedback is poor: all three inputs turn red even when one field is missing, errors appear one at a time, and garbage input is accepted.
> - **UX-03** On mobile, the primary actions sit below the fold and the tap targets are tiny.
> - **UX-04** Browsing state is lost: the sort order resets after viewing a product, and on mobile the active sort is hidden.
> - **UX-05** Keyboard users get no visible focus indicator, and Tab never reaches the cart link.
>
> Verify EVERY claim against the live site before annotating; if a claim from the explorer's findings is false, do not annotate it and report it.
>
> Write `docs/ux/UX-ISSUES.md`. For each issue: what the Shopper experiences, measured evidence, why it matters (citing WCAG 2.2 criteria where relevant), a concrete improvement, and a rough effort.
