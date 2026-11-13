# SauceDemo QA Report

**Patrick Melendres** · November 2026 · [github.com/kaelxoxo/saucedemo-qa](https://github.com/kaelxoxo/saucedemo-qa) · Run: `npm ci && npx playwright install --with-deps chromium && npm test` (about 7 min, green)

## 1. Bugs found: 28, all reproduced and pinned by tests ([BUGS.md](BUGS.md))

| Persona | Bugs | Most serious |
|---|---|---|
| all Personas | 6 | An empty-cart order shows "Thank you for your order!" (BUG-02); spaces pass the required checkout fields (BUG-04); an "ITEM NOT FOUND" product can be added to the cart (BUG-26) |
| `problem_user` | 9 | Typing a last name overwrites the first name, so checkout is impossible (BUG-11, Critical); 3 products can't be added (BUG-09); overview **doubles the item total** (BUG-27) |
| `error_user` | 7 | Finish does nothing (BUG-19, Critical); 3 products can't be added (BUG-14); checkout continues without a last name (BUG-18) |
| `visual_user` | 5 | Inventory shows **random prices** that differ from the cart (BUG-20); Checkout button floats in the header (BUG-24) |
| `performance_glitch_user` | 1 | The page freezes about 5 s whenever the product list renders (BUG-25) |
| `locked_out_user` | 0 | Correctly refused with a clear message |

Severity (harm) and Priority (fix order) are rated separately. BUG-27 is Critical but P2, because BUG-11 already stops Shoppers before they reach that page. *Out of scope:* the session lives in a client-side cookie, so a forged cookie logs you in. It's harmless here because the passwords are public, but on a real shop it would need a server-side session check.

## 2. UX recommendations, top 5 ([docs/ux/UX-ISSUES.md](docs/ux/UX-ISSUES.md), annotated screenshots)

1. **Keyboard users can't reach the cart and can't see focus.** Make the cart a real link and add a `:focus-visible` ring. (WCAG 2.1.1, 2.4.7)
2. **Checkout form:** one empty field turns all three fields red, errors appear one at a time, and blank input is accepted. Validate everything at once, inline, with `aria-invalid`.
3. **Cart:** no quantity control and no thumbnails. Add a −/+ stepper and 64 px images.
4. **Sort resets** after "Back to products". Keep the sort in the URL; on mobile, show the active sort.
5. **Mobile:** a 256 px empty gap pushes the first Add to cart below the fold, and the menu button is 20×20. Remove the gap and use 44 px targets.

## 3. Why this approach

- **Explore first, then automate.** I mapped each Persona's real behaviour before writing any assertions.
- **Playwright + TypeScript with Page Objects.** It's the standard tool for this, and it comes with traces and an HTML report.
- **A Persona matrix.** The same tests run for all six users and assert *correct* behaviour, so every deviation shows up as a Bug.
- **Known Bugs pinned with `test.fail`.** The suite stays green, and a fixed Bug turns its test red.
- **`visual_user` compared to `standard_user` in the same run.** No stored image baselines that break across operating systems.
- **CI on every push.**

## 4. Where AI helped and where it got things wrong ([full log](docs/ai-workflow/ai-mistakes.md))

I ran an orchestrated team of AI agents with Claude Opus 5.5 in [omp](https://github.com/can1357/oh-my-pi): an explorer, a test builder, a UX agent, and two independent judges ([workflow](docs/ai-workflow.md)). It interviewed me on every design decision first, and I made the calls ([decisions](docs/ai-workflow/decisions.md)).

**Helped:** walking 6 Personas × every flow in minutes; turning observations into 181 tests and 28 structured bug reports; re-checking all 80 raw Findings live.

**Got wrong:**

- The explorer called `problem_user`'s checkout overview unreachable. It wasn't, and two Bugs it missed were there (BUG-27/28).
- It filed a site-wide bug as `problem_user`-only (BUG-26).
- It recorded a wrong reproduction result (P9) and reported a console message that came from its own tooling (E10).
- The builder's first locator made some expected failures fail for the wrong reason. It caught this only by reading the failure messages, not the pass counts.
- I **overruled** the judge twice (BUG-02, BUG-04) and accepted its rejection of 38 Findings.

**Lesson:** AI is fast at coverage and unreliable on specifics, so every claim gets an independent re-check.
