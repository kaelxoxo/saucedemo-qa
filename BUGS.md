# Known Bugs

Every Bug below was reproduced against the live site (www.saucedemo.com, November 2026) and is pinned by an automated test that is expected to fail while the Bug exists. The pin is declared on the test with `knownBugs(...)` (`fixtures/test.ts`, ID list in `data/known-bugs.ts`): it tags the test `@known-bug` and `@BUG-NN`, so pinned tests are labelled in the HTML report and can be filtered there or with `--grep @known-bug`, and a fixture marks every tagged test as expected to fail. When a Bug is fixed, its test starts passing, Playwright reports it as an unexpected pass, and the pin must be removed.

**Environment (all entries).** Chromium (Playwright 1.65 / Chrome Headless Shell 158), project `desktop-chromium` (Desktop Chrome, 1280×720) and project `mobile-chromium` (Pixel 7 emulation, 412×839). Every Bug reproduces in both projects. Evidence screenshots were taken at 1280×800. Password for every Persona: `secret_sauce`.

**Scales.**
- **Severity** (harm to the Shopper or the shop, regardless of when it is fixed): Critical = a purchase is impossible or the money is wrong; High = the Shopper buys or sees the wrong thing, or order data is lost; Medium = a feature is broken but there is a workaround; Low = cosmetic or rarely reached.
- **Priority** (how soon to fix): P1 = now, P2 = this sprint, P3 = next sprint, P4 = backlog. Weighs Severity against how many Shoppers hit it, how visible it is and what it costs the business.

**How state is arranged in tests.** Some steps below say "put X in the cart". A Shopper does that with **Add to cart**; the tests write the shop's own cart storage (`localStorage['cart-contents']`) instead, so that an Add-to-cart Bug cannot hide the Bug under test. Every Bug was also reproduced by hand through the UI unless noted.

| ID | Title | Persona | Severity | Priority |
|---|---|---|---|---|
| BUG-01 | Reset App State leaves "Remove" buttons on the inventory | all | Low | P3 |
| BUG-02 | Checkout can be started with an empty cart | all | Medium | P2 |
| BUG-03 | Empty-cart overview shows "Item total: $0" without decimals | all | Low | P4 |
| BUG-04 | Checkout accepts whitespace-only names and postal code | all except problem_user | Medium | P2 |
| BUG-05 | Order confirmation page reachable by URL while the cart still holds items | all | Medium | P3 |
| BUG-06 | Every product image is the same placeholder photo | problem_user | High | P1 |
| BUG-07 | Sorting the inventory has no effect | problem_user | Medium | P2 |
| BUG-08 | Product links open a different product | problem_user | High | P1 |
| BUG-09 | Three products cannot be added to the cart | problem_user | Critical | P1 |
| BUG-10 | Remove does nothing on inventory and detail pages | problem_user | Medium | P2 |
| BUG-11 | Typing a last name overwrites the first name | problem_user | Critical | P1 |
| BUG-12 | About menu link points to a 404 page | problem_user | Low | P4 |
| BUG-13 | Sorting shows "Sorting is broken!" and does not sort | error_user | Medium | P2 |
| BUG-14 | Three products cannot be added to the cart | error_user | Critical | P1 |
| BUG-15 | Remove does nothing on inventory and detail pages | error_user | Medium | P2 |
| BUG-16 | Product detail page has no description | error_user | Medium | P3 |
| BUG-17 | Last name field does not accept input | error_user | High | P1 |
| BUG-18 | Checkout continues without a last name | error_user | High | P1 |
| BUG-19 | Finish does not complete the order | error_user | Critical | P1 |
| BUG-20 | Inventory shows wrong, changing prices | visual_user | High | P1 |
| BUG-21 | Sauce Labs Backpack shows the wrong image | visual_user | Medium | P2 |
| BUG-22 | Header cart icon and menu icon are out of place | visual_user | Low | P3 |
| BUG-23 | Product cards are misaligned | visual_user | Low | P4 |
| BUG-24 | Cart Checkout button is out of place | visual_user | Medium | P2 |
| BUG-25 | Login takes about 5 seconds | performance_glitch_user | Medium | P2 |
| BUG-26 | Unknown product id shows "ITEM NOT FOUND" that can be added to the cart | all | Medium | P3 |
| BUG-27 | Checkout overview item total is double the item prices | problem_user | Critical | P2 |
| BUG-28 | Placing an order does not empty the cart | problem_user | High | P2 |

---

## BUG-01 Reset App State leaves "Remove" buttons on the inventory

- **Persona:** all (found with `standard_user`).
- **Environment:** see top; desktop and mobile.
- **Steps to reproduce:**
  1. Log in; add Sauce Labs Backpack and Sauce Labs Onesie (badge shows 2).
  2. Open the burger menu and click **Reset App State**.
- **Expected:** the badge disappears and both products show **Add to cart** again.
- **Actual:** the badge disappears and the cart is emptied, but both products still show **Remove** until the page is reloaded. Clicking a stale **Remove** only flips it back to **Add to cart**.
- **Severity: Low.** The cart itself is correct; only the buttons lie, and a reload fixes them.
- **Priority: P3.** Every Persona hits it and it makes the Shopper doubt the cart, but Reset App State is a demo helper rather than a shopping step.
- **Evidence:** [docs/bugs/BUG-01.png](docs/bugs/BUG-01.png)
- **Linked test:** `tests/menu.spec.ts` › `<persona> › Reset App State › TC-21 reset restores the "Add to cart" buttons`

## BUG-02 Checkout can be started with an empty cart

- **Persona:** all.
- **Environment:** see top.
- **Steps to reproduce:**
  1. Log in; do not add anything.
  2. Open the cart and click **Checkout**; enter Jane / Doe / 12345; **Continue**; **Finish**.
- **Expected:** with an empty cart, **Checkout** is unavailable or shows a message; the Shopper stays on the cart.
- **Actual:** checkout opens; the overview shows `Item total: $0`, `Tax: $0.00`, `Total: $0.00`; **Finish** shows "Thank you for your order!" for an order with no items.
- **Severity: Medium.** Nothing is charged, but the shop records empty orders and tells the Shopper an order was placed.
- **Priority: P2.** Easy to hit by accident (one click from an empty cart) on every Persona, and a guard is a small change.
- **Evidence:** [docs/bugs/BUG-02.png](docs/bugs/BUG-02.png)
- **Linked test:** `tests/checkout.spec.ts` › `<persona> › TC-25 checkout cannot start with an empty cart`

## BUG-03 Empty-cart overview shows "Item total: $0" without decimals

- **Persona:** all.
- **Environment:** see top.
- **Steps to reproduce:**
  1. Log in with an empty cart.
  2. Reach the checkout overview (as in BUG-02, or open `/checkout-step-two.html`).
- **Expected:** `Item total: $0.00`, matching `Tax: $0.00` and `Total: $0.00`.
- **Actual:** `Item total: $0`.
- **Severity: Low.** Cosmetic; the amount is right.
- **Priority: P4.** Only reachable through BUG-02; fixing BUG-02 hides it.
- **Evidence:** [docs/bugs/BUG-03.png](docs/bugs/BUG-03.png)
- **Linked test:** `tests/checkout.spec.ts` › `<persona> › TC-18 overview amounts always show cents`

## BUG-04 Checkout accepts whitespace-only names and postal code

- **Persona:** all except `problem_user` (where BUG-11 stops the form earlier).
- **Environment:** see top.
- **Steps to reproduce:**
  1. Log in; add any product; open the cart; **Checkout**.
  2. Type three spaces into First Name (or into every field), Doe as last name, 12345 as postal code; **Continue**.
- **Expected:** "Error: First Name is required"; a name made of spaces is still an empty name.
- **Actual:** the overview opens; the order can be finished with a blank name and blank postal code.
- **Severity: Medium.** Orders without a usable name or address cannot be delivered.
- **Priority: P2.** Cheap to fix (trim before the required check) and protects order data for every Shopper.
- **Evidence:** [docs/bugs/BUG-04.png](docs/bugs/BUG-04.png) (all three fields filled with spaces, overview reached)
- **Linked test:** `tests/checkout.spec.ts` › `<persona> › information step › TC-16 whitespace-only first name is rejected`

## BUG-05 Order confirmation page reachable by URL while the cart still holds items

- **Persona:** all.
- **Environment:** see top.
- **Steps to reproduce:**
  1. Log in; add Sauce Labs Backpack (badge 1).
  2. Type `https://www.saucedemo.com/checkout-complete.html` into the address bar.
- **Expected:** no confirmation, because no order was placed (e.g. redirect to the cart).
- **Actual:** "Thank you for your order!" is shown while the badge still shows 1.
- **Severity: Medium.** A Shopper who lands there (bookmark, history, shared link) believes an order was placed that never was.
- **Priority: P3.** Needs a typed or remembered URL, so few Shoppers hit it.
- **Evidence:** [docs/bugs/BUG-05.png](docs/bugs/BUG-05.png)
- **Linked test:** `tests/checkout.spec.ts` › `<persona> › TC-25 order confirmation is not reachable by URL with a full cart`

## BUG-06 Every product image is the same placeholder photo

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; look at the inventory.
- **Expected:** each product shows its own photo (as for `standard_user`).
- **Actual:** all six products show the same dog photo (`/assets/sl-404-….jpg`); alt texts still name the products. The photo also has a different size, which shifts the card layout (most visible on mobile).
- **Severity: High.** The Shopper cannot see what they are buying.
- **Priority: P1.** First thing every Shopper sees on every visit.
- **Evidence:** [docs/bugs/BUG-06.png](docs/bugs/BUG-06.png)
- **Linked tests:** `tests/inventory.spec.ts` › `problem_user › TC-06 each product shows its own photo`; `tests/visual.spec.ts` › `problem_user › TC-23 product list looks the same as for the Baseline Persona`

## BUG-07 Sorting the inventory has no effect

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; choose **Name (Z to A)**, **Price (low to high)** or **Price (high to low)**.
- **Expected:** the list is reordered and the control shows the chosen option.
- **Actual:** nothing changes; the control snaps back to Name (A to Z). No error is shown.
- **Severity: Medium.** A shopping aid is broken; with six products the Shopper can still scan by eye.
- **Priority: P2.** Visible and silent (the Shopper does not know why), but not blocking.
- **Evidence:** [docs/bugs/BUG-07.png](docs/bugs/BUG-07.png) (after choosing Price (low to high))
- **Linked tests:** `tests/inventory.spec.ts` › `problem_user › TC-08 sort by Name (Z to A)`, `TC-09 sort by Price (low to high)`, `TC-10 sort by Price (high to low)`

## BUG-08 Product links open a different product

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; click the title (or image) of Sauce Labs Backpack.
- **Expected:** the Backpack detail page (`?id=4`).
- **Actual:** the Fleece Jacket page (`?id=5`). Every link points to the next id: Bike Light → Bolt T-Shirt, Bolt T-Shirt → Onesie, Onesie → Red T-Shirt, Red T-Shirt → Backpack, Fleece Jacket → `?id=6` "ITEM NOT FOUND".
- **Severity: High.** The Shopper reads about, and can add, a different product than the one chosen.
- **Priority: P1.** Hits every product view.
- **Evidence:** [docs/bugs/BUG-08.png](docs/bugs/BUG-08.png) (clicked Backpack, got Fleece Jacket)
- **Linked test:** `tests/inventory.spec.ts` › `problem_user › TC-11 product title opens that product’s detail page`

## BUG-09 Three products cannot be added to the cart

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; click **Add to cart** on Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket and Test.allTheThings() T-Shirt (Red), on the inventory or on their detail pages.
- **Expected:** each button turns into **Remove** and the badge counts up.
- **Actual:** nothing happens for these three; Backpack, Bike Light and Onesie work.
- **Severity: Critical.** Half the catalog cannot be bought.
- **Priority: P1.** Direct loss of sales.
- **Evidence:** [docs/bugs/BUG-09.png](docs/bugs/BUG-09.png) (clicked Backpack, Bolt T-Shirt, Fleece Jacket: only Backpack added)
- **Linked tests:** `tests/inventory.spec.ts` › `problem_user › TC-13 add every product from the inventory`, `TC-14 add every product from its detail page`

## BUG-10 Remove does nothing on inventory and detail pages

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; add Sauce Labs Backpack; click **Remove** on the inventory or on its detail page.
- **Expected:** the button turns back into **Add to cart** and the badge counts down.
- **Actual:** nothing happens. Removing from the cart page works.
- **Severity: Medium.** Workaround via the cart page.
- **Priority: P2.**
- **Evidence:** [docs/bugs/BUG-10.png](docs/bugs/BUG-10.png) (after clicking Remove on Backpack and Bike Light)
- **Linked tests:** `tests/inventory.spec.ts` › `problem_user › TC-13 remove every product from the inventory`, `TC-14 remove every product from its detail page`

## BUG-11 Typing a last name overwrites the first name

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; add any product; cart → **Checkout**; type Jane in First Name, then type Doe in Last Name; type 12345; **Continue**.
- **Expected:** First Name = Jane, Last Name = Doe; the overview opens.
- **Actual:** each key typed in Last Name replaces First Name with that one character (First Name ends as `e`), Last Name stays empty, and **Continue** shows "Error: Last Name is required". (A programmatic paste/fill moves the whole value into First Name instead.) Checkout cannot be completed.
- **Severity: Critical.** No order can be placed.
- **Priority: P1.**
- **Evidence:** [docs/bugs/BUG-11.png](docs/bugs/BUG-11.png)
- **Linked tests:** `tests/checkout.spec.ts` › `problem_user › information step › TC-16 empty first name is rejected`, `TC-16 empty postal code is rejected`, `TC-16 whitespace-only first name is rejected`, `TC-17 valid information is kept and leads to the overview` (each of these types a last name, which lands in First Name)

## BUG-12 About menu link points to a 404 page

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; open the burger menu; click **About**.
- **Expected:** `https://saucelabs.com/`.
- **Actual:** `https://saucelabs.com/error/404` ("Not Found").
- **Severity: Low.** Off the shopping path.
- **Priority: P4.**
- **Evidence:** [docs/bugs/BUG-12.png](docs/bugs/BUG-12.png)
- **Linked test:** `tests/menu.spec.ts` › `problem_user › TC-22 About link points to the Sauce Labs website`

## BUG-13 Sorting shows "Sorting is broken!" and does not sort

- **Persona:** error_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `error_user`; choose any sort option other than Name (A to Z).
- **Expected:** the list is reordered.
- **Actual:** a browser alert "Sorting is broken! This error has been reported to Backtrace." appears; the order and the control stay on Name (A to Z).
- **Severity: Medium.** Shopping aid broken; an alarming technical message is shown to the Shopper.
- **Priority: P2.**
- **Evidence:** [docs/bugs/BUG-13.png](docs/bugs/BUG-13.png) (native alerts are not part of page screenshots; the alert text captured by the script is overlaid at the top, marked "[evidence overlay]")
- **Linked tests:** `tests/inventory.spec.ts` › `error_user › TC-08 sort by Name (Z to A)`, `TC-09 sort by Price (low to high)`, `TC-10 sort by Price (high to low)`

## BUG-14 Three products cannot be added to the cart

- **Persona:** error_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `error_user`; click **Add to cart** on Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket or Test.allTheThings() T-Shirt (Red), on the inventory or their detail pages.
- **Expected:** button turns into **Remove**, badge counts up.
- **Actual:** nothing happens (page error "Failed to add item to the cart."); the other three products work.
- **Severity: Critical.** Half the catalog cannot be bought.
- **Priority: P1.**
- **Evidence:** [docs/bugs/BUG-14.png](docs/bugs/BUG-14.png)
- **Linked tests:** `tests/inventory.spec.ts` › `error_user › TC-13 add every product from the inventory`, `TC-14 add every product from its detail page`

## BUG-15 Remove does nothing on inventory and detail pages

- **Persona:** error_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `error_user`; add Sauce Labs Backpack; click **Remove** on the inventory or its detail page.
- **Expected:** button turns back into **Add to cart**, badge counts down.
- **Actual:** nothing happens (page error "Failed to remove item from cart."). Removing from the cart page works.
- **Severity: Medium.** Workaround via the cart page.
- **Priority: P2.**
- **Evidence:** [docs/bugs/BUG-15.png](docs/bugs/BUG-15.png)
- **Linked tests:** `tests/inventory.spec.ts` › `error_user › TC-13 remove every product from the inventory`, `TC-14 remove every product from its detail page`

## BUG-16 Product detail page has no description

- **Persona:** error_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `error_user`; open any product's detail page (`/inventory-item.html?id=0` … `?id=5`).
- **Expected:** name, description, price (the description shows on the inventory card).
- **Actual:** the description is missing on every detail page.
- **Severity: Medium.** The Shopper loses product information on the page meant for it.
- **Priority: P3.** The same text is still on the inventory card.
- **Evidence:** [docs/bugs/BUG-16.png](docs/bugs/BUG-16.png)
- **Linked test:** `tests/inventory.spec.ts` › `error_user › TC-12 detail page shows name, description and price`

## BUG-17 Last name field does not accept input

- **Persona:** error_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `error_user`; add any product; cart → **Checkout**; type Doe in Last Name.
- **Expected:** Last Name shows Doe.
- **Actual:** the field stays empty (page error "Cannot read properties of undefined (reading 'value')" per key).
- **Severity: High.** Orders are placed without a last name (see BUG-18).
- **Priority: P1.** Every checkout is affected.
- **Evidence:** [docs/bugs/BUG-17.png](docs/bugs/BUG-17.png) (Jane, Doe, 12345 typed; Last Name empty)
- **Linked test:** `tests/checkout.spec.ts` › `error_user › information step › TC-17 valid information is kept and leads to the overview`

## BUG-18 Checkout continues without a last name

- **Persona:** error_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `error_user`; add any product; cart → **Checkout**; enter Jane and 12345, leave Last Name empty; **Continue**.
- **Expected:** "Error: Last Name is required".
- **Actual:** the overview opens.
- **Severity: High.** Incomplete order data reaches fulfilment.
- **Priority: P1.** Fix together with BUG-17; together they mean every error_user order lacks a last name.
- **Evidence:** [docs/bugs/BUG-18.png](docs/bugs/BUG-18.png)
- **Linked test:** `tests/checkout.spec.ts` › `error_user › information step › TC-16 empty last name is rejected`

## BUG-19 Finish does not complete the order

- **Persona:** error_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `error_user`; add Sauce Labs Backpack; go through checkout to the overview; click **Finish**.
- **Expected:** "Thank you for your order!", cart emptied.
- **Actual:** nothing happens; the overview stays, the badge still shows 1 (page error "wa.cesetRart is not a function").
- **Severity: Critical.** No order can be placed.
- **Priority: P1.**
- **Evidence:** [docs/bugs/BUG-19.png](docs/bugs/BUG-19.png) (after clicking Finish)
- **Linked test:** `tests/checkout.spec.ts` › `error_user › TC-19 finish places the order and empties the cart`

## BUG-20 Inventory shows wrong, changing prices

- **Persona:** visual_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `visual_user`; look at the prices; reload.
- **Expected:** catalog prices (Backpack $29.99, Bike Light $9.99, …), the same as in the cart.
- **Actual:** random prices that change on every render (e.g. Backpack $60.56, then $50.67); the cart and overview charge the real price.
- **Severity: High.** The advertised price differs from the charged price.
- **Priority: P1.** Visible to every Shopper on the main page, and a shown-vs-charged mismatch is a legal and trust risk beyond the technical harm.
- **Evidence:** [docs/bugs/BUG-20.png](docs/bugs/BUG-20.png)
- **Linked test:** `tests/inventory.spec.ts` › `visual_user › TC-05 inventory lists every product with its catalog price`

## BUG-21 Sauce Labs Backpack shows the wrong image

- **Persona:** visual_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `visual_user`; look at the first product.
- **Expected:** backpack photo.
- **Actual:** the dog placeholder photo (`/assets/sl-404-….jpg`), wider than the other photos.
- **Severity: Medium.** One product shown wrongly; its name and description are still right.
- **Priority: P2.** It is the first card on the page.
- **Evidence:** [docs/bugs/BUG-21.png](docs/bugs/BUG-21.png)
- **Linked test:** `tests/inventory.spec.ts` › `visual_user › TC-06 each product shows its own photo`

## BUG-22 Header cart icon and menu icon are out of place

- **Persona:** visual_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `visual_user` and as `standard_user` in two windows; compare the header.
- **Expected:** identical header.
- **Actual:** the cart icon sits lower and further left than for `standard_user`, and the burger menu icon is slightly rotated.
- **Severity: Low.** Still usable.
- **Priority: P3.** Visible on every page, so it looks careless, but blocks nothing.
- **Evidence:** [docs/bugs/BUG-22.png](docs/bugs/BUG-22.png)
- **Linked test:** `tests/visual.spec.ts` › `visual_user › TC-23 header looks the same as for the Baseline Persona`

## BUG-23 Product cards are misaligned

- **Persona:** visual_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `visual_user` and as `standard_user`; compare the product list.
- **Expected:** identical card layout.
- **Actual:** the names of Bolt T-Shirt and Fleece Jacket are right-aligned, and the Red T-Shirt's **Add to cart** button is shifted to the right over the card edge. (The wrong Backpack photo, BUG-21, also changes its card's height on mobile, so this test only passes once both are fixed.)
- **Severity: Low.** Cosmetic.
- **Priority: P4.**
- **Evidence:** [docs/bugs/BUG-23.png](docs/bugs/BUG-23.png)
- **Linked test:** `tests/visual.spec.ts` › `visual_user › TC-23 product list looks the same as for the Baseline Persona`

## BUG-24 Cart Checkout button is out of place

- **Persona:** visual_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `visual_user`; add any product; open the cart.
- **Expected:** **Checkout** sits at the bottom right of the cart, next to **Continue Shopping**.
- **Actual:** **Checkout** floats at the top of the page over the header.
- **Severity: Medium.** The main call to action is hard to find and overlaps the header.
- **Priority: P2.** It is the conversion button.
- **Evidence:** [docs/bugs/BUG-24.png](docs/bugs/BUG-24.png)
- **Linked test:** `tests/visual.spec.ts` › `visual_user › TC-23 cart looks the same as for the Baseline Persona`

## BUG-25 Login takes about 5 seconds

- **Persona:** performance_glitch_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `performance_glitch_user`; measure from the **Login** click until the product list is visible. Repeat with `standard_user`.
- **Expected:** within the 2.5 s budget set in `tests/performance.spec.ts` (`standard_user` measured 0.09–0.18 s).
- **Actual:** 5.11–5.20 s in every measurement; the page is frozen meanwhile. The exploratory session measured the same ~5 s on later inventory renders too (sort, back to products), which is why the suite marks this Persona's tests as slow.
- **Severity: Medium.** Slow, not broken.
- **Priority: P2.** Every visit to the main page; slow shops lose Shoppers.
- **Evidence:** [docs/bugs/BUG-25.png](docs/bugs/BUG-25.png) (timing table produced while capturing evidence; a frozen page cannot be screenshotted)
- **Linked test:** `tests/performance.spec.ts` › `performance_glitch_user › TC-24 login shows the inventory within 2500 ms`

## BUG-26 Unknown product id shows "ITEM NOT FOUND" that can be added to the cart

- **Persona:** all (reachable for `problem_user` by clicking Fleece Jacket, see BUG-08).
- **Environment:** see top.
- **Steps to reproduce:** log in; open `/inventory-item.html?id=6`; click **Add to cart**; open the cart.
- **Expected:** a not-found page without anything to buy (or a redirect to the inventory).
- **Actual:** a product "ITEM NOT FOUND" with price `$√-1` and an active **Add to cart**; after clicking it the badge shows 1, but the cart page lists nothing.
- **Severity: Medium.** The cart count and contents disagree.
- **Priority: P3.** Needs a typed URL, except for problem_user.
- **Evidence:** [docs/bugs/BUG-26.png](docs/bugs/BUG-26.png)
- **Linked test:** `tests/inventory.spec.ts` › `<persona> › TC-12 unknown product id offers nothing to buy`

## BUG-27 Checkout overview item total is double the item prices

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; add Sauce Labs Backpack; open `/checkout-step-two.html` (the normal route is blocked by BUG-11).
- **Expected:** `Item total: $29.99`, `Tax: $2.40`, `Total: $32.39` (as for `standard_user`).
- **Actual:** the line shows $29.99 but `Item total: $59.98`, `Tax: $4.80`, `Total: $64.78`. With all six products: $259.88 instead of $129.94.
- **Severity: Critical.** The Shopper would be charged twice the price.
- **Priority: P2.** Today BUG-11 stops Shoppers before the overview; it becomes P1 the moment BUG-11 is fixed, so fix it in the same release.
- **Evidence:** [docs/bugs/BUG-27.png](docs/bugs/BUG-27.png)
- **Linked test:** `tests/checkout.spec.ts` › `problem_user › TC-18 overview totals add up`

## BUG-28 Placing an order does not empty the cart

- **Persona:** problem_user.
- **Environment:** see top.
- **Steps to reproduce:** log in as `problem_user`; add Sauce Labs Backpack; open `/checkout-step-two.html` (normal route blocked by BUG-11); click **Finish**; open the cart.
- **Expected:** "Thank you for your order!", badge gone, cart empty.
- **Actual:** the confirmation is shown but the badge still shows 1 and the cart still holds the Backpack; the inventory shows **Remove** for it.
- **Severity: High.** Invites a duplicate order.
- **Priority: P2.** Same reachability argument as BUG-27.
- **Evidence:** [docs/bugs/BUG-28.png](docs/bugs/BUG-28.png)
- **Linked test:** `tests/checkout.spec.ts` › `problem_user › TC-19 finish places the order and empties the cart`
