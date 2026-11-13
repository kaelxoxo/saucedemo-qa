# Findings verdicts

Independent judge pass over every **Finding** in [`../ai-workflow/findings/explorer-raw.md`](../ai-workflow/findings/explorer-raw.md), using the rubric in [`../ai-workflow/prompts/03-findings-judge.md`](../ai-workflow/prompts/03-findings-judge.md) and the terms in [`../../CONTEXT.md`](../../CONTEXT.md). Every **Verdict** here is provisional until a human accepts or **Overrules** it.

## Method

- Re-checked on the live site on 2026-11-13, same build as the explorer (`/assets/index-DnLqFcJI.js`).
- Tooling: Playwright 1.65.0, headless Chromium. Desktop 1280x900; mobile 390x844, DPR 3, touch. Each scenario started from a fresh browser context. The re-check scripts were throwaway and are not committed.
- The explorer's `SS/` screenshots are not committed, so evidence comes from the re-check, not from screenshots.
- Classification rules applied (from `CONTEXT.md`):
  - **Bug** (non-standard Persona): the Persona deviates from `standard_user`.
  - **Bug** (`standard_user`): there is no baseline to deviate from, so the shop must contradict itself. Either two parts of the UI disagree about the same state, or the shop breaks a format it uses everywhere else. A missing guard, validation rule or feature that the shop never promised is a **UX Issue** at most.
  - **UX Issue**: works as built, but confuses or blocks a real **Shopper**. A Finding that does neither gets **Rejected**.
  - **Rejected, duplicate**: the same defect from the same mechanism, reported again on another surface or as a downstream effect. The row still records the re-check, so the evidence stays available to the primary row's `BUGS.md` entry.
  - **Rejected, no deviation**: rows where the explorer recorded that a Persona matches `standard_user`. They need a Verdict because they are rows, but they are not claims of a problem.
- **BUGS.md**: the judge left this column as `TBD` because `BUGS.md` was still being written. The orchestrator filled it in afterwards. Every Bug Verdict maps to a `BUGS.md` entry, so there are no coverage gaps.

## Summary

| Verdict | Count |
|---|---|
| Bug | 26 |
| UX Issue | 16 |
| Rejected | 38 (17 duplicates, 12 no-deviation/confirmation rows, 9 intended, no-impact or overstated) |
| **Total Findings judged** | **80** |

Breakdown: S1–S8 = 8; section 3 = 47 (locked_out 2, problem 13, performance_glitch 11, error 11, visual 10); U1–U19 = 19; M1–M6 = 6.

## 2. standard_user (S1–S8)

| ID | Finding (short) | Verdict | Evidence (re-check) | BUGS.md | Confidence |
|---|---|---|---|---|---|
| S1 | Reset App State leaves stale "Remove" button | Bug | Added Onesie (badge 1) → ☰ → Reset App State. Badge gone and `cart-contents` removed from localStorage, but the Onesie button still reads `Remove`; clicking it only flips it to `Add to cart` (badge stays absent). Reload shows `Add to cart`. The menu stays open (`.bm-menu-wrap` `aria-hidden="false"`). The button and the cart badge disagree about the same state. | BUG-01 | High. Reproduced exactly. |
| S2 | Checkout allowed with empty cart | UX Issue → **Bug (Overruled)** | Empty cart → Checkout → whitespace info → Continue → overview with 0 items → Finish → `/checkout-complete.html` "Thank you for your order!". The shop never claims a guard exists, so this is a missing guard rather than a contradiction. A Shopper can still "complete" an order of nothing. | BUG-02 | Medium. Reproduced. A human could reasonably Overrule to Bug if a completed empty order counts as a contradiction. |
| S3 | `Item total: $0` lacks decimals | Bug | Same empty-cart overview: `Item total: $0`, `Tax: $0.00`, `Total: $0.00`. Every other amount the shop shows has two decimals (e.g. `Item total: $103.96`). | BUG-03 | High. Reproduced. |
| S4 | Whitespace / non-zip / HTML accepted in checkout fields | UX Issue → **Bug (Overruled)** | Three spaces in all fields → Continue → `/checkout-step-two.html`. First name `<script>x</script>` + postal `ABCDE-not-a-zip` → also proceeds; nothing executes. The "required" rule is applied literally (non-empty). There is no stated format rule to contradict. | BUG-04 | High. Reproduced. Classification follows the rule above. |
| S5 | `/checkout-complete.html` reachable directly with cart intact | Bug | Backpack in cart (badge 1) → open `/checkout-complete.html` directly → "Thank you for your order!" while the badge still shows `1`. The real Finish path clears the cart, so the confirmation and the cart contradict each other. `/checkout-step-two.html` also opens directly (1 item listed). | BUG-05 | Medium. Reproduced. Shopper visibility is low (URL typing). |
| S6 | Back after Finish re-shows actionable empty overview | UX Issue | Finish → browser Back → `/checkout-step-two.html`, 0 items, `Total: $0.00`, Finish enabled. Clicking Finish again shows "Thank you for your order!" a second time. Back again → step one with all fields empty. Same missing guard as S2. | — | High. Reproduced. |
| S7 | Auth is client-side only (forged cookie) | Rejected | Confirmed: setting cookie `session-username=standard_user` (or `problem_user`) on a clean context opens `/inventory.html` with 6 items; `locked_out_user` / `nobody` are redirected to `/` with the "only access … when you are logged in" error. However, the site is a static demo with public credentials, so a forged cookie gives no access beyond what the login page already hands out. This is intended demo architecture and invisible to a Shopper. | — | High. Behaviour confirmed; only the classification is rejected. |
| S8 | Sort resets after visiting a PDP | UX Issue | Sort Price (high to low) → product → **Back to products** → select value `az`, label `Name (A to Z)`, Backpack first. However, the **browser Back** button keeps `Price (high to low)`. The explorer did not mention this. The Shopper loses the chosen sort only via the in-app button. | — | High. Reproduced, with the extra nuance. |

## 3. Per-Persona deviations

### locked_out_user

| ID | Finding (short) | Verdict | Evidence (re-check) | BUGS.md | Confidence |
|---|---|---|---|---|---|
| L1 | Login refused with locked-out error | Rejected | Reproduced: stays on `/`, `Epic sadface: Sorry, this user has been locked out.`, inputs get class `error`. Refusing a locked account with a clear message is correct, intended behaviour, not a defect. | — | High. Exact text matched. |
| L2 | Session cookie set on failed (locked) login | Rejected | Reproduced: cookie `session-username=locked_out_user`, TTL 599 s. `/inventory.html` still redirects to `/` with the "only access … when you are logged in" error. No observable consequence for a Shopper or the flow. | — | High. Confirmed, with no effect. |

### problem_user

| ID | Finding (short) | Verdict | Evidence (re-check) | BUGS.md | Confidence |
|---|---|---|---|---|---|
| P1 | All inventory images are the same 404 dog photo | Bug | All 6 `src` = `/assets/sl-404-Cq1a9k9X.jpg`; alt texts are still the product names. | BUG-06 | High |
| P2 | Sort does nothing | Bug | Selected `za`, `lohi`, `hilo` in turn: the select value reverts to `az`, the label stays `Name (A to Z)`, the order is unchanged, and there is no dialog or page error. | BUG-07 | High |
| P3 | Add to cart fails for Bolt T-Shirt, Fleece Jacket, Red T-Shirt | Bug | Clicked Add on all 6: Backpack, Bike Light and Onesie flip to Remove (badge 1→2→3). The other three stay `Add to cart` and the badge does not change. localStorage `[4,0,2]`. | BUG-09 | High |
| P4 | Remove on inventory does nothing | Bug | Remove on Backpack and on Onesie: the button stays `Remove`, the badge stays `3`, localStorage is unchanged. | BUG-10 | High |
| P5 | Title/image links open the wrong product | Bug | Title clicks: Backpack→`id=5` Fleece Jacket, Bike Light→`id=1` Bolt, Bolt→`id=2` Onesie, Fleece→`id=6` ITEM NOT FOUND, Onesie→`id=3` Red T-Shirt, Red T-Shirt→`id=4` Backpack. Onesie image link → `id=3`. Exactly as reported. | BUG-08 | High |
| P6 | `?id=6` "ITEM NOT FOUND" page has an active Add to cart | Bug (not problem_user-specific) | Reproduced for problem_user, and **also for `standard_user` via direct URL**: name `ITEM NOT FOUND`, price `$√-1`, sl-404 image, `Add to cart` enabled. Clicking it as `standard_user` sets localStorage `[6]` and badge `1`, but `/cart.html` lists 0 items while showing badge 1, and `/checkout-step-two.html` renders a blank page. A not-found page creates a phantom cart entry, and the badge and cart disagree. | BUG-26 | High. Reproduced for both Personas. |
| P7 | PDP add works only for ids 0/2/4; PDP remove never works | Rejected (duplicate of P3 + P4) | Confirmed: `?id=0,2,4` Add → Remove shown, but Remove never reverts; `?id=1,3,5` Add does nothing. Same item-specific add failure and same remove failure as P3/P4, on another surface. | — | High |
| P8 | Cart-page Remove works | Rejected (no deviation) | Confirmed: cart seeded with ids 0–5 (test setup), 6 UI Removes → 0 items. Matches `standard_user`. | — | High |
| P9 | Last Name keystrokes overwrite First Name | Bug | First Name `Jane`, then typed `D`,`o`,`e` into Last Name: First Name became `D`→`o`→`e` and Last Name stayed empty. Typing into Last Name on an empty form gives First Name `e`. **Not reproduced as stated:** Playwright `fill('Smith')` on Last Name gives First Name `Smith`, not `h`. The `h` result only follows from per-keystroke typing. | BUG-11 | High (core); the `fill` detail is wrong |
| P10 | Continue blocked with "Last Name is required" | Rejected (duplicate of P9) | Confirmed: First `Jane`, Last empty (cannot be typed), Zip `12345` → stays on step one with `Error: Last Name is required`. A direct consequence of P9. | — | High |
| P11 | Overview / Finish not reachable | Rejected (duplicate of P9) | Follows from P10; no separate defect. | — | High |
| P12 | About link points to saucelabs.com 404 | Bug | `[data-test=about-sidebar-link]` href = `https://saucelabs.com/error/404`; loading it returns HTTP 404, title "Not Found". `standard_user`/`error_user` href = `https://saucelabs.com/`. | BUG-12 | High |
| P13 | Reset / Logout / back / direct URL same as standard | Rejected (no deviation) | Reset re-checked: badge cleared, Onesie still `Remove` (same as S1). Logout → `/` re-checked. | — | Medium. Back/direct URL not re-run for this Persona; only `standard_user` was. |

### performance_glitch_user

Freeze confirmed. An in-page 50 ms `setInterval` recorded a single **5016 ms** gap during one sort change. `standard_user` showed no gap over 200 ms.

| ID | Finding (short) | Verdict | Evidence (re-check) | BUGS.md | Confidence |
|---|---|---|---|---|---|
| PG1 | Inventory render freezes ~5 s (login → inventory) | Bug | Login → inventory list visible: 6150 ms, 5082 ms (`standard_user`: 97, 70 ms). The freeze is on the main thread (see above). | BUG-25 | High. Two runs agree, and the gap measurement confirms the cause. |
| PG2 | Reload `/inventory.html` ~5 s | Rejected (duplicate of PG1) | 5137 ms vs 112 ms. Same inventory-render freeze. | — | High |
| PG3 | Sort change ~5 s | Rejected (duplicate of PG1) | 5020 ms until the label updates (the `selectOption` call itself blocked 5011 ms) vs 17 ms. | — | High |
| PG4 | PDP → Back to products ~5 s | Rejected (duplicate of PG1) | 5102 ms vs 62 ms. | — | High |
| PG5 | Cart → Continue Shopping ~5 s | Rejected (duplicate of PG1) | 5095 ms vs 63 ms. | — | High |
| PG6 | Complete → Back Home ~5 s | Rejected (duplicate of PG1) | 5143 ms vs 109 ms. | — | High |
| PG7 | Open PDP normal | Rejected (no deviation) | 66 ms vs 70 ms. | — | High |
| PG8 | Add to cart normal | Rejected (no deviation) | 64 ms vs 38 ms (inventory). | — | High |
| PG9 | Open cart normal | Rejected (no deviation) | 72 ms vs 67 ms. | — | High |
| PG10 | Checkout / Continue / Finish normal | Rejected (no deviation) | 99 / 72 / 62 ms vs 110 / 69 / 58 ms; overview math identical (`$29.99` / `$32.39`). | — | High |
| PG11 | Logout normal | Rejected (no deviation) | Not separately timed; logout was not slow in the walk. | — | Medium. Not timed; settle by timing the Logout click. |

### error_user

| ID | Finding (short) | Verdict | Evidence (re-check) | BUGS.md | Confidence |
|---|---|---|---|---|---|
| E1 | Sort shows "Sorting is broken!" alert, no reorder | Bug | Each of `za`/`lohi`/`hilo` raised `alert`: "Sorting is broken! This error has been reported to Backtrace."; the value reverts to `az`, the label stays `Name (A to Z)`, the order is unchanged. | BUG-13 | High. Exact text matched. |
| E2 | Add fails for Bolt, Fleece, Red T-Shirt | Bug | Same pattern as P3 on inventory (badge 1,2,2,2,3,3), plus 3× page error `Failed to add item to the cart.` On the PDP, `?id=1,3,5` Add also does nothing. | BUG-14 | High |
| E3 | Remove fails on inventory and PDP | Bug | Inventory Remove on Backpack: still `Remove`, badge 3, page error `Failed to remove item from cart.` PDP Remove fails for ids 0/2/4. Cart-page Remove works (6→0). | BUG-15 | High |
| E4 | PDP description missing | Bug | `[data-test=inventory-item-desc]` is absent on **every** PDP (ids 0–5, not only id 4). The console logs `Error: This component failed to render!` on PDP render. Title links map correctly (`id=4,0,1,5,2,3`). | BUG-16 | High |
| E5 | Last-name validation skipped (first-name-only → postal error) | Bug | Empty → `Error: First Name is required`; First Name only → `Error: Postal Code is required` (`standard_user` shows `Error: Last Name is required`). | BUG-18 | High |
| E6 | Last Name field rejects input | Bug | Typed `Doe` → field stays empty, 3× page error `Cannot read properties of undefined (reading 'value')`; `fill('Doe')` also leaves it empty. First Name unaffected. | BUG-17 | High |
| E7 | Proceeds to overview with empty Last Name | Rejected (duplicate of E5) | Confirmed: First `Jane`, Last empty, Zip `12345` → `/checkout-step-two.html`. Same missing last-name validation as E5. | — | High |
| E8 | Overview math correct | Rejected (no deviation) | Backpack + Bike Light + Onesie: `Item total: $47.97`, `Tax: $3.84`, `Total: $51.81`. Correct. | — | High |
| E9 | Finish does nothing | Bug | Click Finish → stays on `/checkout-step-two.html`, badge `3`, page error `wa.cesetRart is not a function`. The order cannot be completed. | BUG-19 | High |
| E10 | Console errors during walk | Rejected (duplicate of E2–E9) | The page errors are the ones listed under E2, E3, E6 and E9. The extra console error is `Error: This component failed to render!` (with stack) on PDP render, i.e. the cause of E4. **The explorer's `[object Object]` was not observed**; it is how the explorer's tool stringified the error. Not visible to a Shopper by itself. | — | High |
| E11 | Menu / Reset / Logout / About same as standard | Rejected (no deviation) | About href `https://saucelabs.com/`; Reset clears the badge; Logout → `/`. | — | High |

### visual_user

| ID | Finding (short) | Verdict | Evidence (re-check) | BUGS.md | Confidence |
|---|---|---|---|---|---|
| V1 | Backpack image is the 404 dog, wider | Bug | `src=/assets/sl-404-Cq1a9k9X.jpg`, box 262x238 vs `standard_user` backpack photo 159x238. | BUG-21 | High |
| V2 | Inventory prices random per render; mismatch with PDP/cart | Bug | Load: `$10, $22.48, $94.33, $87.65, $97.62, $63.81`; reload: `$43.44, $91.86, $65.5, $20.2, $79.09, $36.97` (inconsistent decimals: `$10`, `$65.5`). PDP and cart show the Backpack at `$29.99`; overview `$29.99` / `$32.39`. | BUG-20 | High |
| V3 | Price sort shows displayed prices unsorted | Rejected (duplicate of V2) | Price (low to high) order is the real-price order (Onesie, Bike Light, Bolt, Red, Backpack, Fleece), displayed `$38.73, $64.21, $35.25, $86.13, $24.8, $60.81`. A consequence of V2's random display prices. | — | High |
| V4 | Bolt / Fleece titles right-aligned | Bug | Both names have class `align_right`, computed `text-align: right`; the other four are `start`. | BUG-23 | High |
| V5 | Red T-Shirt Add button misaligned, overhangs card | Bug | Class `btn_inventory_misaligned`, `position:absolute`, x=1029 (std 975). The button's right edge is 1189 px vs the card's right edge 1170 px (overhang 19 px). | BUG-23 | High |
| V6 | Cart icon displaced | Bug | `.shopping_cart_container visual_failure` at 1034,39, 42x42 (std 1220,10, 40x40); badge 1055,40 (std 1240,10). Also rotated `matrix(0.99863, 0.052336, …)` (~3°), which the explorer did not report. The same position applies on PDP and cart. | BUG-22 | High |
| V7 | Burger / close icons rotated ~3° | Bug | `[data-test=open-menu]` and `[data-test=close-menu]` have class `visual_failure`, `transform: matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, 0)` (=3.0°), 21x21 vs 20x20. | BUG-22 | High |
| V8 | Checkout button floats over header | Bug | Class `btn_visual_failure`, `position:absolute` at x=1060, y=0, 220x32 (std: in the cart footer at y=412, 220x34). The screenshot shows it sitting top-right in the header, above the cart icon. | BUG-24 | High |
| V9 | PDP / checkout / complete bodies unchanged | Rejected (no deviation) | PDP price `$29.99` and description present; overview `$29.99`/`$32.39`; Finish → "Thank you for your order!". A pixel-level body comparison was not repeated. | — | Medium. Settle with a screenshot diff vs `standard_user`. |
| V10 | Login page unchanged | Rejected (no deviation) | The login page is shared and pre-login, so the Persona cannot affect it; no re-check needed. | — | High |

## 4. UX friction (U1–U19)

| ID | Finding (short) | Verdict | Evidence (re-check) | BUGS.md | Confidence |
|---|---|---|---|---|---|
| U1 | Credentials printed on login page | Rejected | Confirmed (`login-credentials`, `login-password`). Intended for a public demo; this is the rubric's own example. | — | High |
| U2 | No quantity control | UX Issue | Cart: 0 `input`/`select` in `.cart_list`; qty is `<div class="cart_quantity" data-test="item-quantity">1</div>`; re-adding is impossible because the button flips to Remove. A Shopper cannot buy two of an item. | — | High |
| U3 | No search or filtering | Rejected | Confirmed: the only form control on inventory is `select#product-sort-container`. With a 6-product catalogue, the absence does not confuse or block a Shopper. | — | Medium. Would become a UX Issue for a larger catalogue. |
| U4 | No thumbnails in cart / overview | UX Issue | 0 `<img>` in `.cart_list` on `/cart.html` and `/checkout-step-two.html`. A Shopper confirms items by name only. | — | Medium. Real but minor; a human may judge it cosmetic. |
| U5 | All three checkout inputs flagged red for one error; no aria wiring | UX Issue | Empty submit → `Error: First Name is required`; all 3 inputs get class `error`. After filling First Name → `Error: Last Name is required`, all 3 still `error`. `aria-invalid` and `aria-describedby` are null on all inputs. Errors show one at a time. | — | High |
| U6 | No input validation / empty-cart checkout | Rejected (duplicate of S2 + S4) | Same behaviour re-checked under S2/S4. | — | High |
| U7 | No address/payment entry; tax rate not disclosed | Rejected | Confirmed: overview shows the hard-coded `SauceCard #31337`, `Free Pony Express Delivery!`; tax = 8.00% (`$8.32` on `$103.96`), unlabeled. Collecting no real payment or address is an intended simplification of a demo shop. | — | Medium. A human could keep the "tax rate not shown" part as a minor UX Issue. |
| U8 | Jokey error copy; wrong password kept in field | Rejected | Confirmed: `Epic sadface: …`; after a wrong password the field still contains it. The copy is the demo's deliberate brand voice; keeping the typed password is a common pattern and does not block or confuse. | — | Medium. Clearing passwords on failure is a preference; a human may Overrule. |
| U9 | No `<label>`, no `autocomplete`/`inputmode` | UX Issue | Login and checkout: 0 `<label>`; inputs have only `placeholder` + `aria-label` (`Username`, `Password`, `First Name`, `Last Name`, `Zip/Postal Code`); `autocomplete` and `inputmode` are null; postal is `type=text`. The visible label disappears on typing, and there is no autofill hint (WCAG 1.3.5). | — | High |
| U10 | No visible keyboard focus indicator | UX Issue | Tab-focused Backpack `Add to cart` (`:focus-visible` true): outline style `none`, box-shadow `none`, border, background and colour identical before and after; the screenshot shows no ring. Login `#user-name` on Tab: identical styles. Checked in Chromium only. | — | High (Chromium). Firefox/WebKit unchecked. |
| U11 | Cart link not keyboard reachable | UX Issue | `<a class="shopping_cart_link" data-test="shopping-cart-link" role="button" aria-label="Cart, empty">` has no `href` and no `tabindex`. Tab from a fresh load: burger → sort select → item 4 image link → title link → Add…, skipping the cart; `focus()` does not focus it. The menu has no cart link, so a keyboard-only Shopper cannot reach checkout. | — | High |
| U12 | No headings on inventory | UX Issue | 0 `h1`–`h6`; "Products" title is a `SPAN`, "Swag Labs" logo a `DIV`. Screen-reader Shoppers lose heading navigation. | — | High |
| U13 | Product links are `href="#"` | UX Issue | e.g. `<a href="#" data-test="item-4-title-link" role="button" aria-label="View details for Sauce Labs Backpack">`. Opening a product in a new tab or sharing its link does not work. | — | Medium. Low impact. |
| U14 | Sort resets after PDP | Rejected (duplicate of S8) | See S8. | — | High |
| U15 | Reset leaves stale Remove | Rejected (duplicate of S1) | See S1. | — | High |
| U16 | Footer "Terms of Service" / "Privacy Policy" look like links | Rejected | 0 `<a>` in `[data-test=footer-copy]`, as stated. However, they do **not** look like links: they have the same white colour as the rest of the copyright line, `text-decoration: none`, `cursor: auto`. The claimed confusion does not reproduce, and the missing legal pages are expected for a demo. | — | Medium. Settle by deciding whether missing legal pages matter for this demo. |
| U17 | Dynamic Catalog pages list products that can't be bought; extra sized variants | UX Issue | Lazy Load / Spinner / Slider containers: no Add-to-cart, no `<a>`, item `cursor: auto`. Slider does have 6 dot buttons (`dynamic-catalog-slider-dot-0..5`), so "0 buttons" is wrong for that page. Lazy Load lists `Sauce Labs Fleece Jacket (XS)…(XXL)`, `Bolt T-Shirt (XS)`, etc., which are not in the main catalogue. Reached from the shop menu, these priced products are a dead end for a Shopper. | — | Medium. If these pages are meant only as automation-practice pages, a human may Overrule to Rejected. |
| U18 | Back after Finish shows actionable empty overview | Rejected (duplicate of S6) | See S6. | — | High |
| U19 | Colour contrast passes | Rejected | No problem is claimed. Measurement confirmed: Remove button `rgb(226,35,26)` on white = 4.68:1; product names `rgb(24,88,58)` on white = 8.41:1; body text 16.26:1. | — | High |

## Mobile 390x844 (M1–M6)

No horizontal overflow re-confirmed (`scrollWidth` 390 on login, inventory, cart and PDP); viewport meta `width=device-width, initial-scale=1`.

| ID | Finding (short) | Verdict | Evidence (re-check) | BUGS.md | Confidence |
|---|---|---|---|---|---|
| M1 | First product's Add to cart below the fold due to an empty gap | UX Issue | Inventory height 5349 px; Backpack description ends at y=517, price at y=773 (256 px of empty space), `Add to cart` at y=850 > 844. On real phones the browser chrome makes the visible viewport even shorter. | — | Medium. The measurement is exact, but the button is only 6 px below the fold in this viewport. |
| M2 | Sort collapses to an icon; active sort hidden | UX Issue | Select is 40x30; `[data-test=active-option]` is `display:none` (0x0). | — | High |
| M3 | Tap targets below 44 px | UX Issue | Burger 20x20, close 20x20, cart 40x40, sort 40x30, social icons 30x30, product title links 20 px tall, Add/Remove 34 px, Checkout 32 px, Finish 32 px. All match. The burger and close icons are below even the WCAG 2.2 AA 24x24 minimum. | — | High |
| M4 | Finish below the fold on overview | Rejected | Confirmed: with 1 item, Finish at y=860 (16 px below); with 4 items, y=1747. Putting the confirm button after the item list and totals is the standard checkout order; it neither confuses nor blocks. | — | Medium. A human may weigh it with M1. |
| M5 | Postal code opens text keyboard | Rejected (duplicate of U9) | Confirmed: postal `type=text`, `inputmode`/`autocomplete` null. Already covered by U9. | — | High |
| M6 | Credentials block shown on mobile login | Rejected (duplicate of U1; intended) | Confirmed: `login-credentials-container` at y=360, 390x336. | — | High |

## Explorer errors

Only Findings where the re-check contradicted the explorer, or where the explorer's framing went beyond what it observed, are listed. Findings that were confirmed and only re-classified as duplicates or no-deviation rows are not errors.

### Factually wrong

1. **P9**: "`fill('Smith')` → First Name=`h`". With Playwright `fill('Smith')` on Last Name, First Name became `Smith`. `h` is only the result of per-keystroke typing. The core bug (Last Name keystrokes overwrite First Name) is correct.
2. **E10**: "console.error `[object Object]` ×2". The actual console error is `Error: This component failed to render!` with a stack trace, logged on PDP render (the cause of E4). `[object Object]` is how the explorer's tool stringified the error object, not what the page logged.
3. **U16**: "look like links". The two phrases are styled exactly like the surrounding copyright text: white, no underline, `cursor: auto`.
4. **U17**: "0 buttons". True for Lazy Load and Spinner. The Slider page has 6 dot buttons (`dynamic-catalog-slider-dot-0..5`). No page has an Add-to-cart.

### Misattributed or incomplete

5. **P6**: filed as a problem_user deviation, but the `?id=6` "ITEM NOT FOUND" page with an active Add to cart renders identically for `standard_user` via direct URL. The explorer also missed the consequence: adding it gives badge `1` with an empty cart page and a blank `/checkout-step-two.html`.
6. **S8**: reported as "sort resets after PDP". It resets only through the in-app **Back to products** button; browser Back keeps `Price (high to low)`.
7. **E4**: reported for `?id=4`. The description is missing on every PDP (ids 0–5).
8. **V6**: the explorer reported position and size only. The cart container is also rotated ~3° (`matrix(0.99863, 0.052336, …)`), the same `visual_failure` transform as V7.

### Misclassified or overstated (behaviour confirmed, problem framing rejected)

9. **S7**: listed under "Bugs present even for standard_user". A forged session cookie gives nothing beyond the public credentials on a static demo with no server. This is intended demo architecture → Rejected.
10. **S2, S4, S6, S8**: listed as Bugs. None deviates from the Baseline Persona or contradicts the shop's stated behaviour; they are missing guards, validation or state persistence → UX Issue.
11. **U1 / M6**: credentials on the login page are intended for a public demo (the rubric's own example).
12. **U7**: hard-coded payment and shipping with no address entry is an intended demo simplification.
13. **U8**: "Epic sadface" copy is the demo's deliberate brand voice; a retained password does not confuse or block a Shopper.
14. **U3**: no search on a 6-product catalogue does not confuse or block a Shopper.
15. **M4**: Finish 16 px below the fold, after the totals, is the conventional checkout order, not friction.
16. **L2**: framed against an expectation ("No session on failed login"), but the stray cookie has no observable effect: `/inventory.html` still redirects with the logged-out error.

## Human review (candidate)

The orchestrator brought me the Verdicts that were contested or that changed the deliverable, and I decided those below. I accepted every other Verdict as the judge wrote it.

| ID | Judge's Verdict | My decision | Reason |
|---|---|---|---|
| S2 | UX Issue (medium) | **Overruled → Bug** (BUG-02) | The shop shows "Thank you for your order!" for an order with zero items. That contradicts what an order is. |
| S4 | UX Issue | **Overruled → Bug** (BUG-04) | Three spaces pass a "First Name is required" check, so the shop breaks its own required-field rule. |
| M4 | Rejected | Accepted | Finish coming after the totals is the normal checkout order. It was removed from UX-03. |
| S7 | Rejected | Accepted | It stays out of the bug list. `REPORT.md` mentions it once, as an out-of-scope security note (the session cookie is trusted on the client side only). |

### Found after judging

The suite builder found two Bugs that neither the explorer nor the judge reported. Both are on `problem_user`'s checkout overview, which the explorer had called unreachable:

- **BUG-27**: the item total is double the item prices.
- **BUG-28**: placing an order does not empty the cart.

The builder reached that page by URL, then re-confirmed both Bugs through the UI. They are pinned in `BUGS.md`.
