# Where AI got things wrong

Every entry below happened during this build and was caught by a re-check, an independent judge, the test suite itself, or me. None are hypothetical. Entries that cite a judge Verdict, a BUGS.md ID or a UX Issue link to it. The rest (rows 9–11 and 12–16) come from the sub-agents' build reports in the session, whose transcripts are not committed (see [decisions Q17](decisions.md)).

## Explorer mistakes caught downstream

| # | What the explorer AI claimed | What was actually true | Caught by |
|---|---|---|---|
| 1 | `problem_user`'s checkout overview and Finish "can't be reached" | Both open by URL. They contain two Bugs the explorer never saw: a doubled item total (BUG-27) and a cart that isn't emptied after an order (BUG-28). | Suite builder; see [verdicts, Human review](../judging/findings-verdicts.md#human-review-candidate) |
| 2 | "ITEM NOT FOUND" (`?id=6`) is a `problem_user` bug | Any Persona can reach it by typing the URL. Adding it to the cart shows a badge of 1 next to an empty cart (BUG-26). | Findings judge (P6) |
| 3 | `problem_user`: `fill('Smith')` in Last Name leaves First Name = `h` | `fill()` moves the whole value into First Name (`Smith`). Typing key by key leaves only the last letter. The Bug is real; the recorded result was wrong. | Findings judge (P9) and suite builder |
| 4 | `error_user` console shows `[object Object]` | The page actually logs `Error: This component failed to render!`. `[object Object]` was the explorer's own tool printing an error object. | Findings judge (E10) |
| 5 | The product description is missing on `error_user`'s Backpack page | It is missing on every product page (ids 0–5). | Findings judge (E4) |
| 6 | Sort resets after visiting a product page | Only the in-app "Back to products" button resets it. The browser's Back button keeps the chosen sort. | Findings judge (S8) and UX agent |
| 7 | Footer "Terms / Privacy" look like links; Dynamic Catalog pages have "0 buttons" | The footer text is styled exactly like the surrounding copyright line. The Slider page has 6 buttons. | Findings judge (U16, U17) |
| 8 | Demo credentials on the login page, no address/payment step, the "Epic sadface" wording, a forged session cookie | All are intended demo design with no impact on a Shopper, so all were Rejected. | Findings judge (U1, U7, U8, S7) |

## Mistakes in correcting the explorer

| # | Mistake | Correction |
|---|---|---|
| 9 | The judge, and I as orchestrator, told the suite builder "only key-by-key typing shows the last-name bug". | That overcorrected. `fill()` reproduces the Bug as well (Last Name stays empty and the value lands in First Name); only the pattern differs. The builder checked both methods and reported it. |
| 10 | The UX agent's first draft repeated the explorer's claim that tap targets under 44 px fail WCAG. | WCAG 2.2's AA minimum (2.5.8) is 24 px with a spacing exception, and the 20×20 menu button passes through that exception. The accurate claim is a failure of 2.5.5 (AAA, 44 px). |
| 11 | The explorer put Finish 16 px below the fold on a phone and filed it as a UX Issue. The UX agent first annotated it as part of UX-03. | The judge rejected "Finish below the fold" as a UX Issue (verdicts M4: y=860 with 1 item, y=1747 with 4), because the button coming after the totals is the normal checkout order. I accepted that, and it was removed from UX-03. |

## Suite builder mistakes caught during the build

| # | Mistake | How it was caught |
|---|---|---|
| 12 | It located the Add/Remove button with `card.getByRole('button')`. That also matched the card's image and title links (they have `role="button"`), which broke 24 tests. Worse, some expected failures "passed" for the wrong reason: a locator error, not the Bug. | Reading the failure *messages* of expected failures, not just the pass counts. |
| 13 | It assumed `data-test="inventory-container"` exists only on the product page. The inventory page uses it too. | A strict-mode "2 elements" error. |
| 14 | It wrote a performance-budget comment claiming CI timings before it had run on CI. | Self-review. The comment was replaced with measured ranges. |
| 15 | It added a global 10 s timeout for `performance_glitch_user`. Every expected failure then waited 10 s, and the suite took 9.6 min. | Run time. The long wait was moved to the two steps that need it (7.1 min). |
| 16 | A highlight overlay and an open menu hid the evidence in two Bug screenshots. | Looking at the screenshots. Both were re-taken. |

## Where I overruled the AI

| # | AI position | My decision |
|---|---|---|
| 17 | The orchestrator recommended building a separate free-tier LLM agent into the repo. | **Overruled.** "No need to pay" is about me, and the reviewer only runs the tests. The agent is the orchestrated workflow itself ([decisions](decisions.md)). |
| 18 | The judge classified checkout with an empty cart (S2) as a UX Issue. | **Overruled to Bug (BUG-02).** The shop confirms an order with zero items. |
| 19 | The judge classified spaces-only checkout fields (S4) as a UX Issue. | **Overruled to Bug (BUG-04).** Three spaces pass the shop's own "required" check. |

## Tooling that didn't match its configuration

| # | Configured | Actual |
|---|---|---|
| 20 | Executor sub-agents run a separate model (GPT-6 Sol). | Per-call model selection was disabled in the harness, so every agent ran Claude Opus 5.5. |
| 21 | A typed-check model (Jev) adds brief-vs-result checks. | It returned HTTP 402 (payment required), and judging fell back to Opus. |
