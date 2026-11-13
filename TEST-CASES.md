# Test Cases

Numbered, human-readable Test Cases for [saucedemo.com](https://www.saucedemo.com). Each one traces to the automated test(s) that cover it; test titles start with the Test Case ID, so `npx playwright test -g "TC-16"` runs exactly that Test Case.

**Personas.** "All shopping Personas" means `standard_user`, `problem_user`, `performance_glitch_user`, `error_user` and `visual_user`: the test runs once per Persona (`tests/<file> › <persona> › TC-NN …`). `standard_user` is the Baseline Persona. `locked_out_user` cannot log in, so only TC-02 covers it.

**Projects.** Every test runs in both Playwright projects: `desktop-chromium` (Desktop Chrome, 1280×720) and `mobile-chromium` (Pixel 7 emulation).

**Arranging state.** Several Test Cases put products in the cart by writing the shop's own cart storage (`localStorage['cart-contents']`, see `CartPage.seed`) and open a checkout step by URL. This keeps each test about one behavior: a broken Add-to-cart or a broken checkout form cannot hide a wrong total or a broken Finish button. Where a Persona fails because of a Known Bug, the test is pinned to it (see [BUGS.md](BUGS.md)).

| ID | Title | Technique | Automated test |
|---|---|---|---|
| TC-01 | Valid login opens the inventory | Equivalence partitioning | `tests/auth.spec.ts` |
| TC-02 | Locked-out Persona is refused | Equivalence partitioning | `tests/auth.spec.ts` |
| TC-03 | Invalid login input is rejected | Equivalence partitioning, error guessing | `tests/auth.spec.ts` |
| TC-04 | Logged-out access to shop pages is blocked | Error guessing | `tests/auth.spec.ts` |
| TC-05 | Inventory shows catalog prices | Equivalence partitioning | `tests/inventory.spec.ts` |
| TC-06 | Each product shows its own photo | Equivalence partitioning | `tests/inventory.spec.ts` |
| TC-07 | Sort by Name (A to Z) | Equivalence partitioning | `tests/inventory.spec.ts` |
| TC-08 | Sort by Name (Z to A) | Equivalence partitioning | `tests/inventory.spec.ts` |
| TC-09 | Sort by Price (low to high) | Equivalence partitioning, boundary value (price tie) | `tests/inventory.spec.ts` |
| TC-10 | Sort by Price (high to low) | Equivalence partitioning, boundary value (price tie) | `tests/inventory.spec.ts` |
| TC-11 | Product title opens its detail page | Equivalence partitioning | `tests/inventory.spec.ts` |
| TC-12 | Detail page shows name, description, price | Equivalence partitioning, boundary value (unknown id) | `tests/inventory.spec.ts` |
| TC-13 | Add / remove from the inventory | State transition | `tests/inventory.spec.ts` |
| TC-14 | Add / remove from the detail page | State transition | `tests/inventory.spec.ts` |
| TC-15 | Cart contents and removal | State transition | `tests/cart.spec.ts` |
| TC-16 | Checkout information is validated | Equivalence partitioning, boundary value | `tests/checkout.spec.ts` |
| TC-17 | Valid checkout information is accepted | Equivalence partitioning | `tests/checkout.spec.ts` |
| TC-18 | Overview totals are correct | Boundary value (empty cart), error guessing | `tests/checkout.spec.ts` |
| TC-19 | Finish places the order | State transition | `tests/checkout.spec.ts` |
| TC-20 | Logout ends the session | State transition | `tests/auth.spec.ts` |
| TC-21 | Reset App State clears the cart | State transition | `tests/menu.spec.ts` |
| TC-22 | About link targets Sauce Labs | Error guessing | `tests/menu.spec.ts` |
| TC-23 | Pages look the same as for the Baseline Persona | Equivalence partitioning (Persona vs Baseline) | `tests/visual.spec.ts` |
| TC-24 | Login is fast enough | Boundary value (time budget) | `tests/performance.spec.ts` |
| TC-25 | Checkout cannot be entered out of order | State transition, error guessing | `tests/checkout.spec.ts` |

---

## TC-01 Valid login opens the inventory

- **Preconditions:** logged out, on `/`.
- **Steps:** enter the Persona's username and `secret_sauce`; click **Login**.
- **Expected:** URL is `/inventory.html`, title reads "Products", 6 products are listed.
- **Technique:** equivalence partitioning (valid credentials class, one test per Persona).
- **Personas:** all shopping Personas.
- **Automated:** `tests/auth.spec.ts` › `TC-01 valid login opens the product inventory`.

## TC-02 Locked-out Persona is refused

- **Preconditions:** logged out, on `/`.
- **Steps:** log in as `locked_out_user`; then open each shop page by URL (`/inventory.html`, `/inventory-item.html?id=4`, `/cart.html`, the three checkout pages).
- **Expected:** error "Epic sadface: Sorry, this user has been locked out."; the URL stays `/`; every shop page sends the Persona back to the login form.
- **Technique:** equivalence partitioning (valid-but-blocked credentials class).
- **Personas:** `locked_out_user`.
- **Automated:** `tests/auth.spec.ts` › `TC-02 locked-out Persona is refused and cannot reach the shop`.

## TC-03 Invalid login input is rejected

- **Preconditions:** logged out, on `/`.
- **Steps:** submit the form with (a) empty username, (b) empty password, (c) wrong password, (d) username in the wrong case (`Standard_User`).
- **Expected:** stays on `/` with (a) "Username is required", (b) "Password is required", (c, d) "Username and password do not match any user in this service" (all prefixed "Epic sadface: ").
- **Technique:** equivalence partitioning (one representative per invalid class), error guessing (case sensitivity).
- **Personas:** none needed (no session); username `standard_user` where one is required.
- **Automated:** `tests/auth.spec.ts` › `TC-03 login is rejected for …` (4 tests).

## TC-04 Logged-out access to shop pages is blocked

- **Preconditions:** fresh browser, never logged in.
- **Steps:** open each shop page by URL: `/inventory.html`, `/inventory-item.html?id=4`, `/cart.html`, `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html`.
- **Expected:** redirected to `/` with "You can only access '…' when you are logged in."
- **Technique:** error guessing (deep links into a protected area).
- **Personas:** none needed (no session).
- **Automated:** `tests/auth.spec.ts` › `TC-04 direct access to <path> is blocked` (6 tests).

## TC-05 Inventory shows catalog prices

- **Preconditions:** logged in.
- **Steps:** look at the inventory.
- **Expected:** exactly 6 products; each shows its catalog price (Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Red T-Shirt $15.99).
- **Technique:** equivalence partitioning (every product is its own class; catalog from the Baseline Persona).
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-05 inventory lists every product with its catalog price`.
- **Known Bugs:** BUG-20 (visual_user).

## TC-06 Each product shows its own photo

- **Preconditions:** logged in.
- **Steps:** look at each product image on the inventory.
- **Expected:** each image is that product's photo (asset name, e.g. `sauce-backpack-1200x1500…`).
- **Technique:** equivalence partitioning.
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-06 each product shows its own photo`.
- **Known Bugs:** BUG-06 (problem_user), BUG-21 (visual_user).

## TC-07 Sort by Name (A to Z)

- **Preconditions:** logged in, inventory open.
- **Steps:** choose **Name (Z to A)**, then **Name (A to Z)**.
- **Expected:** products listed alphabetically; the sort control shows Name (A to Z). (A to Z is also the default, so the test first moves away from it.)
- **Technique:** equivalence partitioning (one class per sort option).
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-07 sort by Name (A to Z)`.

## TC-08 Sort by Name (Z to A)

- **Preconditions:** logged in, inventory open.
- **Steps:** choose **Name (Z to A)**.
- **Expected:** products listed in reverse alphabetical order; the sort control shows Name (Z to A).
- **Technique:** equivalence partitioning.
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-08 sort by Name (Z to A)`.
- **Known Bugs:** BUG-07 (problem_user), BUG-13 (error_user).

## TC-09 Sort by Price (low to high)

- **Preconditions:** logged in, inventory open.
- **Steps:** choose **Price (low to high)**.
- **Expected:** Onesie, Bike Light, Bolt T-Shirt, Red T-Shirt, Backpack, Fleece Jacket. The two $15.99 shirts are a tie; the shop keeps them in name order.
- **Technique:** equivalence partitioning; boundary value (equal prices).
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-09 sort by Price (low to high)`.
- **Known Bugs:** BUG-07 (problem_user), BUG-13 (error_user).

## TC-10 Sort by Price (high to low)

- **Preconditions:** logged in, inventory open.
- **Steps:** choose **Price (high to low)**.
- **Expected:** Fleece Jacket, Backpack, Bolt T-Shirt, Red T-Shirt, Bike Light, Onesie.
- **Technique:** equivalence partitioning; boundary value (equal prices).
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-10 sort by Price (high to low)`.
- **Known Bugs:** BUG-07 (problem_user), BUG-13 (error_user).

## TC-11 Product title opens its detail page

- **Preconditions:** logged in, inventory open.
- **Steps:** for each product, click its title; check the detail page; return to the inventory.
- **Expected:** the detail page (`/inventory-item.html?id=<id>`) shows the product that was clicked.
- **Technique:** equivalence partitioning (every product).
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-11 product title opens that product’s detail page`.
- **Known Bugs:** BUG-08 (problem_user).

## TC-12 Detail page shows name, description, price

- **Preconditions:** logged in.
- **Steps:** open `/inventory-item.html?id=<id>` for each product (ids 0–5); then open `?id=6`, the first id past the catalog.
- **Expected:** correct name, a non-empty description, and the catalog price. For id 6 nothing can be bought (no **Add to cart**; a redirect to the inventory also qualifies).
- **Technique:** equivalence partitioning (every product); boundary value (first id past the valid range).
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-12 detail page shows name, description and price`, `TC-12 unknown product id offers nothing to buy`.
- **Known Bugs:** BUG-16 (error_user), BUG-26 (all).

## TC-13 Add / remove from the inventory

- **Preconditions:** logged in. Add: empty cart. Remove: all 6 products in the cart.
- **Steps:** Add: click **Add to cart** on every product. Remove: click **Remove** on every product.
- **Expected:** Add: every button turns into **Remove**, cart badge shows 6. Remove: every button turns back into **Add to cart**, badge disappears.
- **Technique:** state transition (not in cart → in cart → not in cart).
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-13 add every product from the inventory`, `TC-13 remove every product from the inventory`.
- **Known Bugs:** BUG-09 and BUG-10 (problem_user), BUG-14 and BUG-15 (error_user).

## TC-14 Add / remove from the detail page

- **Preconditions:** logged in. Add: empty cart. Remove: all 6 products in the cart.
- **Steps:** for each product open its detail page and click **Add to cart** (or **Remove**).
- **Expected:** the button toggles; the badge counts up 1…6 (or down 5…0, then disappears).
- **Technique:** state transition.
- **Personas:** all shopping Personas.
- **Automated:** `tests/inventory.spec.ts` › `TC-14 add every product from its detail page`, `TC-14 remove every product from its detail page`.
- **Known Bugs:** BUG-09 and BUG-10 (problem_user), BUG-14 and BUG-15 (error_user).

## TC-15 Cart contents and removal

- **Preconditions:** logged in; Backpack and Bike Light in the cart.
- **Steps:** open the cart; then click **Remove** on the Backpack.
- **Expected:** cart lists both products with quantity 1 and catalog price, badge 2; after removal only Bike Light remains and the badge shows 1.
- **Technique:** state transition.
- **Personas:** all shopping Personas.
- **Automated:** `tests/cart.spec.ts` › `TC-15 cart lists each product once with its price`, `TC-15 remove a product from the cart`.

## TC-16 Checkout information is validated

- **Preconditions:** logged in; Backpack in the cart; on `/checkout-step-one.html`.
- **Steps:** fill two of the three fields with valid data (Jane / Doe / 12345) and leave the third empty, then **Continue**; repeat for each field. Finally enter only spaces as first name.
- **Expected:** stays on the form with "Error: First Name is required", "Error: Last Name is required" or "Error: Postal Code is required" respectively; spaces-only counts as empty.
- **Technique:** equivalence partitioning (one invalid field at a time); boundary value (whitespace-only is the edge between empty and filled).
- **Personas:** all shopping Personas.
- **Automated:** `tests/checkout.spec.ts` › `TC-16 empty first name is rejected`, `TC-16 empty last name is rejected`, `TC-16 empty postal code is rejected`, `TC-16 whitespace-only first name is rejected`.
- **Known Bugs:** BUG-11 (problem_user: first name, postal code and whitespace tests), BUG-18 (error_user: last name test), BUG-04 (all others: whitespace test).

## TC-17 Valid checkout information is accepted

- **Preconditions:** as TC-16.
- **Steps:** type Jane / Doe / 12345; **Continue**.
- **Expected:** each field shows what was typed; the overview `/checkout-step-two.html` opens.
- **Technique:** equivalence partitioning (valid class).
- **Personas:** all shopping Personas.
- **Automated:** `tests/checkout.spec.ts` › `TC-17 valid information is kept and leads to the overview`.
- **Known Bugs:** BUG-11 (problem_user), BUG-17 (error_user).

## TC-18 Overview totals are correct

- **Preconditions:** logged in. Totals: all 6 products in the cart. Formatting: empty cart.
- **Steps:** open `/checkout-step-two.html`.
- **Expected:** line prices sum to the catalog total ($129.94); Item total equals that sum; Total = Item total + Tax (compared in whole cents). With an empty cart every amount still shows cents (`$0.00`).
- **Technique:** error guessing (rounding, float maths); boundary value (empty cart = zero amounts).
- **Personas:** all shopping Personas.
- **Automated:** `tests/checkout.spec.ts` › `TC-18 overview totals add up`, `TC-18 overview amounts always show cents`.
- **Known Bugs:** BUG-27 (problem_user, totals), BUG-03 (all, cents).

## TC-19 Finish places the order

- **Preconditions:** logged in; Backpack in the cart; on the overview.
- **Steps:** click **Finish**.
- **Expected:** "Thank you for your order!"; the cart badge disappears.
- **Technique:** state transition (cart → order placed).
- **Personas:** all shopping Personas.
- **Automated:** `tests/checkout.spec.ts` › `TC-19 finish places the order and empties the cart`.
- **Known Bugs:** BUG-28 (problem_user), BUG-19 (error_user).

## TC-20 Logout ends the session

- **Preconditions:** logged in.
- **Steps:** open the burger menu, click **Logout**; then open `/inventory.html` by URL.
- **Expected:** the login form is shown; the inventory is refused with "You can only access '/inventory.html' when you are logged in."
- **Technique:** state transition (logged in → logged out).
- **Personas:** all shopping Personas.
- **Automated:** `tests/auth.spec.ts` › `TC-20 logout from the menu ends the session`.

## TC-21 Reset App State clears the cart

- **Preconditions:** logged in; Backpack and Onesie in the cart; inventory open (both show **Remove**, badge 2).
- **Steps:** burger menu → **Reset App State**.
- **Expected:** badge disappears and the cart is empty; both products show **Add to cart** again without a reload.
- **Technique:** state transition.
- **Personas:** all shopping Personas.
- **Automated:** `tests/menu.spec.ts` › `TC-21 reset empties the cart`, `TC-21 reset restores the "Add to cart" buttons`.
- **Known Bugs:** BUG-01 (all, buttons).

## TC-22 About link targets Sauce Labs

- **Preconditions:** logged in.
- **Steps:** open the burger menu; inspect **About**.
- **Expected:** links to `https://saucelabs.com/` (checked via `href`, without loading the third-party site).
- **Technique:** error guessing.
- **Personas:** all shopping Personas.
- **Automated:** `tests/menu.spec.ts` › `TC-22 About link points to the Sauce Labs website`.
- **Known Bugs:** BUG-12 (problem_user).

## TC-23 Pages look the same as for the Baseline Persona

- **Preconditions:** two fresh browser contexts in the same test, same device settings: one logged in as the Persona, one as `standard_user`.
- **Steps:** screenshot the same region in both: (a) header, (b) product list, (c) cart with the Backpack. Prices and product photos are masked in (b), because TC-05 and TC-06 already cover them.
- **Expected:** 0 differing pixels (pixelmatch, anti-aliasing tolerant). No screenshots are committed, so the check does not depend on the OS the suite runs on.
- **Technique:** equivalence partitioning (Persona compared to the Baseline Persona; `standard_user` vs itself is the control that proves the comparison is stable).
- **Personas:** all shopping Personas.
- **Automated:** `tests/visual.spec.ts` › `TC-23 header looks the same as for the Baseline Persona`, `TC-23 product list …`, `TC-23 cart …`.
- **Known Bugs:** BUG-22, BUG-23, BUG-24 (visual_user: header, product list, cart); BUG-06 (problem_user: product list, the wrong photo's size shifts the layout).

## TC-24 Login is fast enough

- **Preconditions:** logged out, credentials typed.
- **Steps:** click **Login**; measure until the product list is visible.
- **Expected:** at most 2.5 s (budget explained in `tests/performance.spec.ts`). Each run records the measured time as a `login-to-inventory` annotation in the HTML report.
- **Technique:** boundary value (time budget).
- **Personas:** all shopping Personas.
- **Automated:** `tests/performance.spec.ts` › `TC-24 login shows the inventory within 2500 ms`.
- **Known Bugs:** BUG-25 (performance_glitch_user).

## TC-25 Checkout cannot be entered out of order

- **Preconditions:** logged in.
- **Steps:** (a) with an empty cart, open the cart and click **Checkout**; (b) with the Backpack in the cart, open `/checkout-complete.html` by URL.
- **Expected:** (a) the Shopper stays on the cart; (b) no order confirmation is shown, because no order was placed.
- **Technique:** state transition (invalid transitions); error guessing.
- **Personas:** all shopping Personas.
- **Automated:** `tests/checkout.spec.ts` › `TC-25 checkout cannot start with an empty cart`, `TC-25 order confirmation is not reachable by URL with a full cart`.
- **Known Bugs:** BUG-02 and BUG-05 (all).
