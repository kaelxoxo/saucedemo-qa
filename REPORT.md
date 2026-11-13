# SauceDemo QA Report

**Patrick Melendres** · November 2026 · [github.com/kaelxoxo/saucedemo-qa](https://github.com/kaelxoxo/saucedemo-qa) · Video (3 min): _link_ · Run: `npm ci && npx playwright install --with-deps chromium && npm test` (≈7 min, green)

## 1. Bugs found: 28, all reproduced and pinned by tests ([BUGS.md](BUGS.md))

| Persona | Bugs | Most serious |
|---|---|---|
| all Personas¹ | 6 | Empty-cart "order" is confirmed (BUG-02); spaces pass required checkout fields (BUG-04); "ITEM NOT FOUND" can be added to the cart (BUG-26) |
| `problem_user` | 9 | Last name overwrites first name, so checkout is impossible (BUG-11, Critical); overview **doubles the item total** (BUG-27) |
| `error_user` | 7 | Finish does nothing (BUG-19, Critical); 3 products can't be added (BUG-14) |
| `visual_user` | 5 | Inventory shows **random prices** that differ from the cart (BUG-20) |
| `performance_glitch_user` | 1 | Page freezes about 5 s on every product-list render (BUG-25) |
| `locked_out_user` | 0 | Correctly refused |

¹ BUG-04 doesn't apply to `problem_user`, whose BUG-11 fails first. Severity (harm) and Priority (fix order) are rated separately: BUG-27 is Critical but P2, because BUG-11 already blocks the way to it. *Out of scope:* the session is a client-side cookie that can be forged. That's harmless here because the passwords are public; on a real shop it would need a server-side check.

## 2. UX recommendations, top 5 by Shopper impact ([UX-ISSUES.md](docs/ux/UX-ISSUES.md), annotated screenshots)

1. **Cart:** you can't buy two of anything (no quantity control), and rows have no thumbnails. Add a −/+ stepper and 64 px images.
2. **Mobile:** a 256 px gap pushes the first Add to cart below the fold, and the menu button is 20×20. Remove the gap; use 44 px targets.
3. **Checkout form:** one empty field turns all three red, errors show one at a time, and a non-numeric ZIP is accepted. Validate all fields at once, inline, with `aria-invalid`.
4. **Sort resets** after "Back to products". Keep it in the URL; show the active sort on mobile.
5. **Keyboard-only Shoppers** can't see focus or reach the cart. Make the cart a real link and add a `:focus-visible` ring (WCAG 2.1.1, 2.4.7).

## 3. Why this approach

- **Explore first, then automate:** map each Persona's real behaviour before writing assertions.
- **Playwright + TypeScript, Page Objects:** the standard tool, with traces and an HTML report built in.
- **Persona matrix:** the same tests run for all six Personas and assert *correct* behaviour, so every deviation surfaces as a Bug.
- **Known Bugs pinned with `test.fail`:** the suite stays green, and a fixed Bug turns its test red.
- **Same-run visual comparison** against `standard_user` (no OS-specific image baselines), with CI on every push.

## 4. Where AI helped and where it got things wrong ([full log](docs/ai-workflow/ai-mistakes.md))

I ran an orchestrated team of AI agents (Claude Opus 5.5 in Claude Code): an explorer, a test builder, a UX agent, and two independent judges ([workflow](docs/ai-workflow.md)). It interviewed me on every design decision before building, and I made the calls ([decisions](docs/ai-workflow/decisions.md)).

**Helped:** walking 6 Personas through every flow in minutes, turning observations into 181 tests and 28 structured bug reports, and re-checking all 80 raw Findings live.

**Got wrong:**

- The explorer called `problem_user`'s checkout overview unreachable. It wasn't, and two Bugs it missed were there (BUG-27, BUG-28).
- It filed a site-wide Bug as `problem_user`-only (BUG-26), recorded a wrong reproduction result (P9), and reported a console message that came from its own tooling (E10).
- The builder's first locator made some expected failures fail for the wrong reason. It caught this only by reading the failure messages, not the pass counts.
- I **overruled** the AI three times: two judge Verdicts (BUG-02, BUG-04) and its UX ranking. I accepted the judge's 38 Rejections.

**Lesson:** AI is fast at coverage and unreliable on specifics, so every claim gets an independent re-check.
