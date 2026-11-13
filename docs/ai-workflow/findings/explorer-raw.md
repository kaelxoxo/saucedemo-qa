# SauceDemo ground-truth findings (explored 2026-11-13)

> Raw, unreviewed output of the exploratory agent, committed verbatim apart from this header. Each Finding was later classified in `../../judging/findings-verdicts.md`. `SS/` refers to the agent's 117 working screenshots, which are not committed; reviewed evidence lives in `docs/bugs/` and `docs/ux/`.

Environment: headless Chromium driven by a scripted browser (Puppeteer). Desktop viewport 1280x900 unless noted; mobile viewport 390x844 (DPR 3, touch). Site build: `/assets/index-DnLqFcJI.js`.

Each user was walked from a clean state (localStorage + cookies cleared): login → inventory (images/names/prices) → sort (za, lohi, hilo, az) → inventory add ×4 (Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket) + remove ×2 (Bike Light, Backpack) → PDP via title (Backpack) and via image (Onesie), add/remove/add on each → cart → checkout step one (empty submit, first only, first+last, all) → overview math → finish → back home → menu (Reset App State, All Items, About href, X close) → Logout → browser Back → direct `/inventory.html`.

---

## 1. Login page (verbatim)

```
Accepted usernames are:
standard_user
locked_out_user
problem_user
performance_glitch_user
error_user
visual_user

Password for all users:
secret_sauce
```
Screenshot: `SS/login-page.png`

Login error messages (verbatim, all prefixed with "Epic sadface: "):

| Input | Message |
|---|---|
| empty username | `Epic sadface: Username is required` (`SS/login-error-empty.png`) |
| username, empty password | `Epic sadface: Password is required` |
| wrong password | `Epic sadface: Username and password do not match any user in this service` (`SS/login-error-wrong-password.png`) |
| `Standard_User` (case) or ` standard_user ` (spaces) | same "do not match" message (no trimming, case-sensitive) |
| `locked_out_user` | `Epic sadface: Sorry, this user has been locked out.` |
| `/inventory.html` (or back button) while logged out | `Epic sadface: You can only access '/inventory.html' when you are logged in.` |

- Enter key in password field submits the form.
- Error has a dismiss `X` (`[data-test="error-button"]`, aria-label "Dismiss error"); clicking it removes the message and the red `error` class from inputs.
- Wrong password is NOT cleared from the field after failure.

Session: cookie `session-username=<user>`, `path=/`, `httpOnly=false`, `secure=false`, `SameSite=Lax`, expires ≈600 s after login (observed expires − now = 599 s). Cart lives in `localStorage['cart-contents']` as a JSON array of item ids (e.g. `[4,0]`). Logout deletes the cookie. Session-timeout behaviour after 10 min: UNVERIFIED (not waited out).

---

## 2. Baseline: standard_user (all steps pass)

- Login→inventory: 75–90 ms (button click → `[data-test="inventory-list"]` visible).
- 6 products, all images load (naturalWidth 640, Bike Light 320), alt = product name:

| id | Name | Price |
|---|---|---|
| 4 | Sauce Labs Backpack | $29.99 |
| 0 | Sauce Labs Bike Light | $9.99 |
| 1 | Sauce Labs Bolt T-Shirt | $15.99 |
| 5 | Sauce Labs Fleece Jacket | $49.99 |
| 2 | Sauce Labs Onesie | $7.99 |
| 3 | Test.allTheThings() T-Shirt (Red) | $15.99 |

- Sort options (value → label): `az` Name (A to Z), `za` Name (Z to A), `lohi` Price (low to high), `hilo` Price (high to low). All 4 sort correctly; ties (two $15.99) keep Bolt T-Shirt before Red T-Shirt.
- Add/remove on inventory and PDP toggles button text `Add to cart`↔`Remove`, badge increments/decrements correctly, data-test switches `add-to-cart-<slug>`↔`remove-<slug>` (PDP: `add-to-cart`↔`remove`).
- Cart lists items in the order added, qty always `1`.
- Checkout step one errors (one at a time, in order): `Error: First Name is required`, `Error: Last Name is required`, `Error: Postal Code is required`.
- Overview for Bolt+Fleece+Backpack+Onesie: `Item total: $103.96`, `Tax: $8.32`, `Total: $112.28` — subtotal = sum of items, tax = 8.00% rounded to cents, total = subtotal + tax. All correct. Payment `SauceCard #31337`, Shipping `Free Pony Express Delivery!`.
- Finish → `/checkout-complete.html`, header `Thank you for your order!`, text `Your order has been dispatched, and will arrive just as fast as the pony can get there!`; badge cleared; `Back Home` → `/inventory.html`.
- Complete page also has `Generate PDF order` button (`[data-test="generate-pdf-order"]`) → downloads `swag-labs-order-<date>.pdf` (2.9 KB) containing order date, "SHIP TO <first> <last> <zip>", items, Item total, Tax, Total. `SS/standard_user-complete-page.png`. (Not checked for other users: UNVERIFIED.)
- Menu: All Items, **Dynamic Catalog** (new submenu: Lazy Load / Spinner / Slider), About (`href=https://saucelabs.com/`, same tab), Logout, Reset App State. `SS/menu-dynamic-catalog-standard.png`, `SS/standard_user-11-menu-open.png`.
- Logout → `/`; browser Back → redirected to `/` with "You can only access '/inventory.html'…" error; direct `/inventory.html` → same. `SS/standard_user-13-back-after-logout.png`, `SS/standard_user-14-direct-inventory-logged-out.png`.
- Footer: `X` (https://x.com/saucelabs), `Facebook` (https://www.facebook.com/saucelabs), `LinkedIn` (https://www.linkedin.com/company/sauce-labs/), all `target=_blank rel=noreferrer`. Copy text `© 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy` — "Terms of Service" and "Privacy Policy" are plain text, not links.

### Bugs present even for standard_user

| # | Area | Steps | Expected | Observed | Screenshot |
|---|---|---|---|---|---|
| S1 | Reset App State | Login → Add Onesie (badge 1) → ☰ → Reset App State | Badge cleared AND Onesie button back to "Add to cart" | Badge + localStorage cleared, but Onesie button still says **Remove** until page reload; clicking stale Remove just flips it to "Add to cart". Menu stays open after reset. | `SS/standard_user-reset-stale-remove-button.png`, `SS/standard_user-12-after-reset.png` |
| S2 | Checkout with empty cart | Login → cart (empty) → Checkout → fill → Continue → Finish | Checkout blocked when cart is empty | Allowed; overview shows `Item total: $0` / `Tax: $0.00` / `Total: $0.00`; Finish shows "Thank you for your order!" | `SS/standard_user-empty-cart-whitespace-checkout-overview.png`, `SS/standard_user-empty-order-completed.png` |
| S3 | Price formatting | Same as S2 | `Item total: $0.00` | `Item total: $0` (no decimals) while Tax/Total show `$0.00` | `SS/standard_user-empty-cart-whitespace-checkout-overview.png` |
| S4 | Checkout validation | Enter `"   "` (spaces) in all three fields → Continue | Rejected as blank | Accepted, proceeds to overview. Postal `ABCDE-not-a-zip` and first name `<script>x</script>` also accepted. | `SS/standard_user-empty-cart-whitespace-checkout-overview.png` |
| S5 | Direct URL | With 1 item in cart, open `/checkout-complete.html` directly | Redirect / guard | Shows "Thank you for your order!" while badge still shows 1. `/checkout-step-two.html` is also directly reachable. | `SS/standard_user-direct-complete-with-cart.png` |
| S6 | Back after finish | Finish order → browser Back | Order page not re-shown | Back shows `/checkout-step-two.html` with 0 items, Total $0.00, Finish button active; Back again → step one with empty fields | `SS/standard_user-back-after-finish.png` |
| S7 | Auth is client-side only | Clear cookies → set `document.cookie='session-username=standard_user; path=/'` → open `/inventory.html` | Server-validated session | Inventory loads with forged cookie. (Forged `locked_out_user` or `nobody` cookie is rejected.) | — |
| S8 | Sort state | Sort Price (high to low) → open a PDP → Back to products | Sort preserved | Sort resets to Name (A to Z) | `SS/standard_user-sort-reset-after-pdp-back.png` |

---

## 3. Per-user deviations vs standard_user

### locked_out_user

| Area | Steps | Expected (std) | Observed | Screenshot |
|---|---|---|---|---|
| Login | username `locked_out_user` / `secret_sauce` → Login | Lands on `/inventory.html` | Stays on `/`, error `Epic sadface: Sorry, this user has been locked out.`, inputs get red error styling. No further flow possible. | `SS/locked_out_user-01-login-result.png` |
| Session cookie | Same as above, inspect cookies | No session on failed login | Cookie `session-username=locked_out_user` IS set (expires +600 s), but `/inventory.html` still redirects to `/` with the "only access when logged in" error | `SS/locked_out_user-cookie-bypass.png` |

### problem_user

| Area | Steps | Expected (std) | Observed | Screenshot |
|---|---|---|---|---|
| Inventory images | Login | Product photos | All 6 images are `/assets/sl-404-Cq1a9k9X.jpg` (same dog photo; alt text still the product name) | `SS/problem_user-inventory.png`, `SS/problem_user-01-login-result.png` |
| Sort | Select any of Z→A / Price lo→hi / Price hi→lo | List reorders, label changes | Nothing happens: select value reverts to `az`, label stays `Name (A to Z)`, order unchanged. No alert, no console error. | `SS/problem_user-02-sort-za.png` |
| Add to cart (inventory) | Click Add on each product | All 6 add | Backpack, Bike Light, Onesie add OK; **Bolt T-Shirt, Fleece Jacket, Test.allTheThings() T-Shirt (Red)** do nothing (button stays "Add to cart", badge unchanged) | `SS/problem_user-03-inventory-after-add.png` |
| Remove (inventory) | Add Backpack → click Remove | Button → Add to cart, badge −1 | Remove does nothing for any item (button stays "Remove", badge unchanged, localStorage unchanged) | `SS/problem_user-04-inventory-after-remove.png` |
| PDP link mapping | Click product title on inventory | Opens that product | Opens the wrong product: Backpack→id 5 (Fleece Jacket), Bike Light→id 1 (Bolt T-Shirt), Bolt T-Shirt→id 2 (Onesie), Fleece Jacket→**id 6 "ITEM NOT FOUND"**, Onesie→id 3 (Red T-Shirt), Red T-Shirt→id 4 (Backpack). Image links behave the same (Onesie img → id 3). | `SS/problem_user-05-pdp-title.png`, `SS/problem_user-05-pdp-img.png` |
| PDP id=6 | `/inventory-item.html?id=6` | — | Name `ITEM NOT FOUND`, description "We're sorry, but your call could not be completed as dialled…", price `$√-1`, sl-404 image, and an active **Add to cart** button | `SS/problem_user-pdp-item-not-found.png` |
| PDP add/remove | Open `/inventory-item.html?id=N`, click Add then Remove | Both work | Add works for ids 0, 2, 4; does nothing for ids 1, 3, 5. Remove does nothing on any PDP. | `SS/problem_user-05-pdp-title.png` |
| Cart remove | Cart with items → Remove | Removes | Works (all 6) — the only working remove path | `SS/problem_user-06-cart.png` |
| Checkout last name | Step one: type `Jane` in First Name, then type `Doe` in Last Name | Last Name = `Doe` | Each keystroke in Last Name overwrites **First Name** with that single character (F=`D`→`o`→`e`), Last Name stays empty. `fill('Smith')` → First Name=`h`. | `SS/problem_user-checkout-lastname-bug.png` |
| Checkout continue | All three fields "filled" → Continue | Overview | Blocked: `Error: Last Name is required` — checkout cannot be completed via UI | `SS/problem_user-08b-checkout-error.png` |
| Overview / Finish | — | — | Not reachable (blocked above) | — |
| About link | ☰ → About | `https://saucelabs.com/` | `href=https://saucelabs.com/error/404` → page titled "Not Found" | `SS/problem_user-about-link-result.png` |
| Reset/Logout/back/direct URL | — | — | Same as standard_user (incl. S1 stale-Remove bug) | `SS/problem_user-12-after-reset.png`, `SS/problem_user-13-…`, `SS/problem_user-14-…` |

### performance_glitch_user

Functionally identical to standard_user (cart, PDP, checkout math, finish, menu, logout all match). Only timing differs. The delay is a **main-thread freeze**: an in-page 50 ms `setInterval` recorded a single 5066 ms gap during login; a screenshot requested 1 s after click was blocked for 4136 ms.

| Action (click → selector visible) | performance_glitch_user (ms) | standard_user (ms) |
|---|---|---|
| Login → inventory (3 runs) | 5107, 5101, 5106 (walk run: 5099) | 75, 80, 75 (walk run: 90) |
| Reload `/inventory.html` | 5164 | 168 |
| Sort change (any option) | 5037 (walk: 5341–5408 incl. 300 ms settle) | 31 |
| PDP → Back to products | 5061 | 51 |
| Cart → Continue Shopping | 5065 | 60 |
| Complete → Back Home | 5063 | 61 |
| Open PDP | 66 | 62 |
| Add to cart (PDP / inventory) | 48 / 41 | 43 / 42 |
| Open cart | 58 | 72 |
| Checkout / Continue / Finish | 54 / 60 / 56 | 61 / 60 / 52 |
| Logout | 69 | 59 |

Pattern: every render of the inventory list (login, reload, sort, returning to inventory) costs ≈5 s; other pages are normal. Screenshots: `SS/performance_glitch_user-01-login-result.png` … `-14-…` (states identical to standard).

### error_user

| Area | Steps | Expected (std) | Observed | Screenshot |
|---|---|---|---|---|
| Sort | Select Name (Z to A) (any non-default) | Reorders | Native `alert`: **"Sorting is broken! This error has been reported to Backtrace."**; order and label stay Name (A to Z) (native dialog not capturable in screenshot) | `SS/error_user-02-sort-za.png` |
| Add to cart (inventory + PDP) | Click Add on each product | All add | Same as problem_user: ids 1, 3, 5 (Bolt T-Shirt, Fleece Jacket, Red T-Shirt) fail; page error `Error: Failed to add item to the cart.` | `SS/error_user-03-inventory-after-add.png` |
| Remove (inventory + PDP) | Click Remove | Removes | Never works on inventory/PDP; page error `Error: Failed to remove item from cart.` Cart-page Remove works. | `SS/error_user-04-inventory-after-remove.png` |
| PDP | Open `/inventory-item.html?id=4` | Name, description, price, button | **Description element missing** (`[data-test="inventory-item-desc"]` absent); links go to the correct product (unlike problem_user) | `SS/error_user-pdp-backpack.png`, `SS/error_user-05-pdp-title.png` |
| Checkout first-name-only | First Name only → Continue | `Error: Last Name is required` | `Error: Postal Code is required` (last-name validation skipped) | `SS/error_user-07-checkout-empty.png` |
| Checkout last name | Type `Doe` in Last Name | Field = Doe | Field stays empty; page error `TypeError: Cannot read properties of undefined (reading 'value')` per keystroke | `SS/error_user-08-checkout-filled.png` |
| Checkout continue | First=Jane, Last=(empty), Zip=12345 → Continue | Blocked by last-name error | **Proceeds to overview with empty last name** | `SS/error_user-09-overview.png` |
| Overview math | Cart Backpack+Bike Light+Onesie | — | `Item total: $47.97`, `Tax: $3.84`, `Total: $51.81` — math correct | `SS/error_user-09-overview.png` |
| Finish | Click Finish | `/checkout-complete.html`, cart cleared | Nothing happens: stays on `/checkout-step-two.html`, badge stays 3, page error `TypeError: wa.cesetRart is not a function` | `SS/error_user-10-finish.png` |
| Console | whole walk | no errors | console.error `[object Object]` ×2 plus the page errors above | — |
| Menu/Reset/Logout/back/direct URL/About | — | — | Same as standard_user | `SS/error_user-11…14` |

### visual_user

Functional flow (add/remove, PDP, cart, checkout, overview math, finish, logout) matches standard_user. Visual/data differences (measured by bounding boxes + computed styles vs standard_user at 1280x900):

| Area | Element | standard_user | visual_user | Screenshot |
|---|---|---|---|---|
| Inventory | Backpack image `[data-test="inventory-item-sauce-labs-backpack-img"]` | backpack photo, 159 px wide | `/assets/sl-404-Cq1a9k9X.jpg` (dog), 262 px wide | `SS/visual_user-inventory-top-loaded.png` vs `SS/standard_user-inventory-top.png` |
| Inventory | All `[data-test="inventory-item-price"]` | real prices ($29.99 …) | **Random prices regenerated on every render** (login, reload, each sort), e.g. load 1: $36.57, $0.08, $86, $70.56, $57.47, $30.73; reload: $36.44, $90.85, $94.97, $28.71, $11.15, $49.02. Formatting inconsistent (`$86`, `$8.9`). PDP, cart and overview show the real price ($29.99) → price mismatch inventory vs cart. | `SS/visual_user-inventory-top-loaded.png`, `SS/visual_user-pdp.png`, `SS/visual_user-cart-checkout-button.png` |
| Inventory sort | Price lo→hi / hi→lo | displayed prices ascend/descend | Item order identical to standard (sorted by real price), but displayed random prices appear unsorted (e.g. lohi: $0.38, $9.31, $83.45, $46.77, $19.74, $15.57) | `SS/visual_user-02-sort-za.png` |
| Inventory | Names of Bolt T-Shirt and Fleece Jacket | text-align start | class `align_right`, `text-align: right` (title shifted right) | `SS/visual_user-inventory-top-loaded.png` |
| Inventory | `add-to-cart-test.allthethings()-t-shirt-(red)` | static, x=975 | class `btn_inventory_misaligned`, `position:absolute`, x=1029 (≈54 px right, overhangs card edge) | `SS/visual_user-inventory-top-loaded.png` |
| All pages | Cart icon `.shopping_cart_container` / `[data-test="shopping-cart-link"]` | x=1220,y=10, 40x40 (top-right) | class `visual_failure`, x=1034,y=39, 42x42 — sits lower-left, above sort dropdown; badge moves with it (1240,10 → 1055,40) | `SS/visual_user-inventory-top-loaded.png`, `SS/visual_user-cart-checkout-button.png` |
| All pages | Burger icon `[data-test="open-menu"]` and close icon `[data-test="close-menu"]` | no transform, 20x20 | class `visual_failure`, `transform: matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, 0)` (≈3° rotation), 21x21 | `SS/visual_user-11-menu-open.png` |
| Cart | Checkout button `[data-test="checkout"]` | in cart footer at y=412 | class `btn_visual_failure`, `position:absolute` at top-right (x=1060, y=0, 220x32), overlapping header above cart icon | `SS/visual_user-cart-checkout-button.png` vs `SS/standard_user-06-cart.png` |
| PDP / step one / step two / complete | page body | — | No body differences detected beyond the header (cart icon, burger) | `SS/visual_user-05-pdp-title.png`, `-07-`, `-09-`, `-10-` |
| Login page | — | — | No difference (pre-login) | `SS/visual_user-01-login-result.png` |

---

## 4. UX friction for a real shopper (standard_user)

| # | Friction | Evidence | Screenshot |
|---|---|---|---|
| U1 | Credentials (all usernames + shared password) printed on the login page | Login page text (section 1) | `SS/login-page.png`, `SS/mobile-login.png`, `SS/mobile-login-scrolled.png` |
| U2 | No quantity control anywhere: cart qty is a static `<div class="cart_quantity">1</div>`; adding again is impossible (button flips to Remove) | Cart DOM: 0 inputs/selects in `.cart_list` | `SS/standard_user-06-cart.png` |
| U3 | No search, no filtering (category/size/price range); only sort `<select>`. Only inputs on inventory: `product-sort-container` | DOM check | `SS/standard_user-inventory-top.png` |
| U4 | Cart and overview show no product thumbnails (0 `<img>` in `.cart_list`) | DOM check | `SS/standard_user-06-cart.png`, `SS/standard_user-09-overview.png` |
| U5 | Checkout errors shown one at a time, generic "Error: X is required", but **all three inputs** turn red even when only one is missing; no `aria-invalid`/`aria-describedby` on inputs | First Name empty → all 3 inputs get class `error` | `SS/standard_user-checkout-error-all-fields-flagged.png`, `SS/standard_user-07-checkout-empty.png` |
| U6 | No input validation: whitespace-only names, non-numeric postal code, HTML in names all accepted; empty-cart checkout allowed (see S2–S4) | — | `SS/standard_user-empty-cart-whitespace-checkout-overview.png` |
| U7 | Checkout collects only name + postal code; no shipping address, no payment entry; tax rate (8%) not disclosed | Overview shows hard-coded `SauceCard #31337`, `Free Pony Express Delivery!` | `SS/standard_user-09-overview.png` |
| U8 | Login error copy "Epic sadface: …" is jokey; wrong password is retained in field after failure | — | `SS/login-error-wrong-password.png` |
| U9 | Login inputs have no `<label>` (0 labels); rely on placeholder + `aria-label`. Same for checkout inputs (`aria-label` "First Name" / "Last Name" / "Zip/Postal Code"). No `autocomplete` or `inputmode` attributes (postal code `type=text`, no numeric keypad on mobile) | DOM check | `SS/mobile-checkout-step-one.png` |
| U10 | No visible keyboard focus indicator: on Tab focus, buttons/links/inputs have `outline-style:none`, no box-shadow, and no border/background change (checked on Add to cart button and username input in headless Chromium) | computed styles before/after Tab focus identical | `SS/a11y-keyboard-focus-add-to-cart.png`, `SS/a11y-login-focus-username.png` |
| U11 | Cart link not keyboard reachable: `<a data-test="shopping-cart-link" role="button">` has no `href` and no `tabindex`; Tab order goes burger → sort → products, skipping cart; `focus()` has no effect | Tab sequence recorded | `SS/a11y-focus-state-inventory.png` |
| U12 | No heading elements on inventory page (0 h1–h6); page title "Products" is a `<span>`; app logo "Swag Labs" is a `<div>` | DOM check | — |
| U13 | Product title/image links are `<a href="#">` (JS navigation; no real URL to open in new tab / share) | DOM check | — |
| U14 | Sort resets to A→Z after visiting a PDP and returning (S8) | — | `SS/standard_user-sort-reset-after-pdp-back.png` |
| U15 | Reset App State leaves stale "Remove" buttons (S1) | — | `SS/standard_user-reset-stale-remove-button.png` |
| U16 | Footer "Terms of Service" / "Privacy Policy" look like links but are plain text | 0 `<a>` in `[data-test="footer-copy"]` | `SS/standard_user-06-cart.png` (footer visible) |
| U17 | Dynamic Catalog pages (Lazy Load / Spinner / Slider) list products and prices but have no Add-to-cart and items are not clickable (0 buttons, 0 links, `cursor:auto`); Lazy Load shows sized variants e.g. "Sauce Labs Fleece Jacket (XS)…(XXL)" that don't exist in the main catalog | — | `SS/standard_user-dynamic-catalog-lazy-load.png`, `-spinner.png`, `-slider.png` |
| U18 | Back after Finish re-shows an empty, still-actionable overview (S6) | — | `SS/standard_user-back-after-finish.png` |
| U19 | Color contrast: red text/badge `rgb(226,35,26)` on white / white on red = 4.68:1 (passes AA normal text, just above 4.5). Other measured text ≥ 8:1. No contrast failure found. | computed | — |

### Mobile 390x844 (standard_user)

No horizontal overflow on any page (`scrollWidth` = 390; off-screen elements only the closed off-canvas menu). `<meta name=viewport content="width=device-width, initial-scale=1">`.

| # | Issue | Evidence | Screenshot |
|---|---|---|---|
| M1 | Inventory is a single column 5349 px tall; first product's **Add to cart is below the fold** (button top y=850 > 844) because of a large empty gap between description and price | box measurements | `SS/mobile-inventory.png` |
| M2 | Sort control collapses to a 40x30 filter icon; the current sort label (`active-option`) is hidden, so the shopper can't see the active sort | `active-option` has no box; select 40x30 | `SS/mobile-inventory.png` |
| M3 | Tap targets < 44 px: burger `react-burger-menu-btn` 20x20, close X 20x20, cart 40x40, sort 40x30, footer social icons 30x30, product title links 20 px tall, Add/Remove buttons 34 px tall, Checkout 32 px, Finish 32 px | measured | `SS/mobile-cart.png`, `SS/mobile-pdp.png`, `SS/mobile-menu.png` |
| M4 | Overview: **Finish button below the fold** (y=860) — shopper must scroll past item list and totals | box measurement | `SS/mobile-checkout-step-two.png` |
| M5 | Postal code field opens a text keyboard (no `inputmode=numeric`, no autocomplete) | DOM | `SS/mobile-checkout-step-one.png`, `SS/mobile-checkout-step-one-error.png` |
| M6 | Login page shows the credentials block in full under the form | — | `SS/mobile-login.png`, `SS/mobile-login-scrolled.png` |

---

## 5. Stable selectors (all `data-test` unless noted)

Login
- `[data-test="username"]` (`#user-name`), `[data-test="password"]` (`#password`), `[data-test="login-button"]` (`#login-button`)
- `[data-test="error"]` (h3, role=alert), `[data-test="error-button"]` (dismiss X)
- `[data-test="login-credentials"]`, `[data-test="login-password"]`, `[data-test="login-container"]`, `[data-test="login-credentials-container"]`

Header / menu (all logged-in pages)
- Burger: `#react-burger-menu-btn` (clickable button; `[data-test="open-menu"]` is the icon img). Close: `#react-burger-cross-btn` (`[data-test="close-menu"]` img). Menu wrapper `.bm-menu-wrap` (`aria-hidden` true/false).
- `[data-test="inventory-sidebar-link"]`, `[data-test="about-sidebar-link"]`, `[data-test="logout-sidebar-link"]`, `[data-test="reset-sidebar-link"]`, `[data-test="dynamic-catalog-sidebar-link"]` → submenu `[data-test="dynamic-catalog-submenu"]` with `dynamic-catalog-lazy-load-link`, `dynamic-catalog-spinner-link`, `dynamic-catalog-slider-link`
- `[data-test="shopping-cart-link"]` (aria-label "Cart, empty" / "Cart, N items"), `[data-test="shopping-cart-badge"]` (absent when cart empty)
- `[data-test="title"]` (Products / Your Cart / Checkout: Your Information / Checkout: Overview / Checkout: Complete!), `[data-test="primary-header"]`, `[data-test="secondary-header"]`, `[data-test="header-container"]`

Inventory `/inventory.html`
- `[data-test="product-sort-container"]` (select; values `az|za|lohi|hilo`), `[data-test="active-option"]`
- `[data-test="inventory-container"]`, `[data-test="inventory-list"]`, `[data-test="inventory-item"]` (×6), `[data-test="inventory-item-description"]`
- Per item: `[data-test="inventory-item-name"]`, `[data-test="inventory-item-desc"]`, `[data-test="inventory-item-price"]`
- Links: `[data-test="item-<id>-title-link"]`, `[data-test="item-<id>-img-link"]` (ids: backpack 4, bike-light 0, bolt-t-shirt 1, fleece-jacket 5, onesie 2, red t-shirt 3)
- Image: `[data-test="inventory-item-<slug>-img"]`
- Buttons: `[data-test="add-to-cart-<slug>"]` ↔ `[data-test="remove-<slug>"]`; slugs: `sauce-labs-backpack`, `sauce-labs-bike-light`, `sauce-labs-bolt-t-shirt`, `sauce-labs-fleece-jacket`, `sauce-labs-onesie`, `test.allthethings()-t-shirt-(red)` (the last contains `.()` — must be quoted in CSS attribute selector)

PDP `/inventory-item.html?id=<id>`
- `[data-test="back-to-products"]`, `[data-test="inventory-item-name"]`, `[data-test="inventory-item-desc"]` (missing for error_user), `[data-test="inventory-item-price"]`, `[data-test="item-<slug>-img"]`, `[data-test="add-to-cart"]` ↔ `[data-test="remove"]`

Cart `/cart.html`
- `[data-test="cart-contents-container"]`, `[data-test="cart-list"]`, `[data-test="cart-quantity-label"]`, `[data-test="cart-desc-label"]`, `[data-test="inventory-item"]`, `[data-test="item-quantity"]`, `[data-test="remove-<slug>"]`, `[data-test="continue-shopping"]`, `[data-test="checkout"]`

Checkout step one `/checkout-step-one.html`
- `[data-test="checkout-info-container"]`, `[data-test="firstName"]`, `[data-test="lastName"]`, `[data-test="postalCode"]`, `[data-test="continue"]`, `[data-test="cancel"]` (→ cart), `[data-test="error"]`, `[data-test="error-button"]`

Checkout step two `/checkout-step-two.html`
- `[data-test="checkout-summary-container"]`, `[data-test="cart-list"]`, `[data-test="inventory-item"]`, `[data-test="item-quantity"]`, `[data-test="payment-info-label"]`, `[data-test="payment-info-value"]`, `[data-test="shipping-info-label"]`, `[data-test="shipping-info-value"]`, `[data-test="total-info-label"]`, `[data-test="subtotal-label"]` ("Item total: $X"), `[data-test="tax-label"]` ("Tax: $X"), `[data-test="total-label"]` ("Total: $X"), `[data-test="finish"]`, `[data-test="cancel"]` (→ inventory, cart kept)

Complete `/checkout-complete.html`
- `[data-test="checkout-complete-container"]`, `[data-test="pony-express"]` (img), `[data-test="complete-header"]`, `[data-test="complete-text"]`, `[data-test="back-to-products"]`, `[data-test="generate-pdf-order"]`

Footer
- `[data-test="social-x"]`, `[data-test="social-facebook"]`, `[data-test="social-linkedin"]`, `[data-test="footer-copy"]`

Dynamic Catalog pages
- `/dynamic-catalog-lazy-load.html`: `dynamic-catalog-lazy-load-container`, `lazy-load-item-<n>`, `lazy-load-item-<n>-img|-name|-price`
- `/dynamic-catalog-spinner.html`: `dynamic-catalog-spinner-container`, `dynamic-catalog-spinner-grid`, `spinner-item-<n>[-img|-name|-price]`
- `/dynamic-catalog-slider.html`: `dynamic-catalog-slider-container`, `dynamic-catalog-slider-item[-img|-name|-price]`, `dynamic-catalog-slider-dots`, `dynamic-catalog-slider-dot-<0..5>`

State hooks for test setup: `localStorage['cart-contents']` (JSON id array), cookie `session-username`.

---

## 6. Blockers / limits / UNVERIFIED

- Native `alert` for error_user sort cannot be screenshotted; captured via Puppeteer `dialog` event (message text verbatim above).
- performance_glitch_user freeze: a mid-freeze screenshot is impossible (screenshot itself waits for the main thread); timing captured instead.
- The cart-page Remove matrix for problem_user/error_user was set up by writing `localStorage['cart-contents']='[0,1,2,3,4,5]'` (test setup only); removal itself was done through the UI.
- Focus-indicator check (U10) done in headless Chromium via Tab key; not checked in Firefox/WebKit — UNVERIFIED there.
- Session expiry after ~10 min (cookie `expires`) — actual logout behaviour UNVERIFIED.
- Generate PDF order for non-standard users — UNVERIFIED.
- Dynamic Catalog pages explored only for standard_user; lazy-load beyond the first 12 items (scroll) — UNVERIFIED.
- Screen-reader behaviour (actual announcements) — UNVERIFIED; only DOM attributes inspected.
