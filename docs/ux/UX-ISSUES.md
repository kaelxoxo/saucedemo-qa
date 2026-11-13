# UX Issues

Five UX Issues found on SauceDemo with the Baseline Persona (`standard_user`). Each one works as built but confuses, slows down, or blocks a real Shopper. Every claim below was measured on the live site, and `scripts/ux-screenshots.ts` checks the claims again each time it regenerates the annotated screenshots (`npm run ux:screenshots`). If a claim no longer holds, the script stops without saving that image.

**Order: ranked by how many Shoppers hit the issue, then by how badly.** The IDs are fixed labels that also appear in the screenshots, so they don't follow the ranking.

| Rank | Issue | Who hits it |
|---|---|---|
| 1 | [UX-01](#ux-01-the-cart-has-no-quantity-control-and-no-product-thumbnails) Cart has no quantity control or thumbnails | Every Shopper who wants more than one of an item, and anyone checking their cart |
| 2 | [UX-03](#ux-03-on-mobile-the-first-add-to-cart-sits-below-the-fold-and-tap-targets-are-tiny) Mobile: first Add to cart below the fold, tiny tap targets | Every phone Shopper |
| 3 | [UX-02](#ux-02-checkout-form-feedback-is-misleading-and-a-non-numeric-zip-is-accepted) Checkout form feedback | Every Shopper who makes a mistake at checkout |
| 4 | [UX-04](#ux-04-the-selected-sort-is-lost-after-viewing-a-product) Sort resets after viewing a product | Shoppers comparing several products |
| 5 | [UX-05](#ux-05-keyboard-only-shoppers-cant-see-focus-and-cant-reach-the-cart) Keyboard focus invisible, cart unreachable | Fewer Shoppers, but it blocks checkout completely for them, and it fails WCAG |

Viewports: desktop 1280x900 and phone 390x844 (deviceScaleFactor 2, touch), headless Chromium.

---

## UX-01: The cart has no quantity control and no product thumbnails

![Cart rows with a static quantity of 1 and no images](UX-01-cart-no-qty-no-thumbnails.png)

**What the Shopper experiences:** A Shopper who wants two backpacks can't add a second one: after the first click, the button on the product changes to "Remove". The cart rows show only text, so the Shopper has to read each name to check the order.

**Evidence:** With 2 items in the cart, each quantity is a static `<div data-test="item-quantity">1</div>`. The cart list has 0 `<input>`/`<select>` elements and 0 `<img>` elements. The checkout overview looks the same.

**Why it matters:** Shoppers can't buy multiples, which caps average order value. Without images, Shoppers are slower to spot a wrong item and more likely to abandon the cart.

**Improvement:** Replace the static quantity with a −/+ stepper (min 1, max 10, with the subtotal updating live) and allow repeat adds from inventory. Show a 64px thumbnail of the existing product image in each cart and overview row.

**Effort:** M

---

## UX-03: On mobile, the first Add to cart sits below the fold and tap targets are tiny

![Inventory on a phone: the first Add to cart starts at y=850, below the 844px fold; the menu button and sort icon are small](UX-03a-mobile-inventory-fold.png)

**What the Shopper experiences:** On a phone, the first product fills the whole screen, but its Add to cart button sits just out of view below a large blank area. The menu icon and the sort icon in the header are hard to hit.

**Evidence:** 390x844 viewport. The first Add to cart starts at y=850 and is 34px tall. It is pushed below the fold by a 256px empty gap between the description (bottom at y=517) and the price (y=773). The menu button is 20x20 px, and the sort control is 40x30 px.

**Why it matters:** The call to action is hidden at the moment the Shopper decides to buy, and the blank gap looks like the end of the card. The 20x20 menu button is below the 24px minimum of WCAG 2.5.8 Target Size (Minimum). It only passes through that criterion's spacing exception. It fails 2.5.5 Target Size (Enhanced, 44x44), and so do the sort control and Add to cart.

**Improvement:** Remove the fixed-height gap in product cards on narrow screens so the price and Add to cart sit directly under the description. Pad the menu button and sort control to 44x44 hit areas, and make Add to cart at least 44px tall.

**Effort:** S

---

## UX-02: Checkout form feedback is misleading and a non-numeric ZIP is accepted

![Only First Name is empty, but all three inputs are red](UX-02a-checkout-all-fields-red.png)
![Overview reached with Jane / Doe and the ZIP ABCDE-not-a-zip](UX-02b-non-numeric-zip-accepted.png)

**What the Shopper experiences:** The Shopper leaves only First Name empty, but all three fields turn red. Fixing that field reveals the next error on the next submit. A ZIP like `ABCDE-not-a-zip` goes straight through to the overview without any warning.

**Evidence:** All fields empty → `Error: First Name is required`. Fill First Name → `Error: Last Name is required`. With only First Name empty, all 3 inputs get class `error` (red border `rgb(226, 35, 26)`), and none has `aria-invalid`. The banner has `role="alert"`. `Jane` / `Doe` / `ABCDE-not-a-zip` → `/checkout-step-two.html`.

**Why it matters:** WCAG 3.3.1 Error Identification: valid fields are shown as errors. WCAG 3.3.3 Error Suggestion: the message gives no guidance. The extra round trips cause checkout drop-off, and a mistyped ZIP goes into the order unchecked.

**Improvement:** On submit, validate every field and check the ZIP against a postal-code format (for example 5 digits for the US). Mark only the invalid fields with `aria-invalid="true"` and an inline message connected through `aria-describedby`, for example "Enter your first name" or "Enter a 5-digit ZIP code". Show all errors at once.

Blank (spaces-only) names are tracked separately as Bug BUG-04 in [BUGS.md](../../BUGS.md).

**Effort:** S

---

## UX-04: The selected sort is lost after viewing a product

![After Back to products, the sort is Name (A to Z) again](UX-04a-sort-reset-after-back.png)
![On a phone, the sort control is an unlabeled icon](UX-04b-mobile-sort-label-hidden.png)

**What the Shopper experiences:** The Shopper sorts by Price (high to low), opens a product, and clicks "Back to products". The list is back in A–Z order, so the Shopper has to re-sort after every product visit. On a phone, nothing on screen shows which sort is active.

**Evidence:** Price (high to low) puts Sauce Labs Fleece Jacket ($49.99) first. After the PDP and "Back to products", the select value is `az` with label `Name (A to Z)`, and Sauce Labs Backpack is first. The browser Back button keeps `hilo`, so only the in-app button resets the sort. At 390px, `active-option` is `display:none` and the select is a 40x30 icon.

**Why it matters:** Comparison shopping across several products becomes tedious, and Shoppers lose their place.

**Improvement:** Store the sort in the URL (`/inventory.html?sort=hilo`) and keep it in the "Back to products" link, or restore it from `sessionStorage`. On mobile, show a short label next to the icon, for example "Price ↓".

**Effort:** S

---

## UX-05: Keyboard-only Shoppers can't see focus and can't reach the cart

![Add to cart has keyboard focus with no visible ring; the cart is skipped by Tab](UX-05-keyboard-no-focus-ring.png)

**What the Shopper experiences:** A keyboard-only Shopper presses Tab and sees no sign of where focus is. Even with careful counting, there is no way to reach the cart, so checkout can't be completed without a mouse.

**Evidence:** The Tab order is burger → sort → image link → title link → Add to cart → …. Add to cart matches `:focus-visible`, yet its computed `outline-style` and `box-shadow` are `none`, and the focused and unfocused element screenshots are pixel-identical. The cart is `<a role="button">` with no `href` or `tabindex`. It never receives Tab focus, and `focus()` has no effect. The menu has no Cart entry.

**Why it matters:** This fails WCAG 2.4.7 Focus Visible and 2.1.1 Keyboard. It is a hard blocker for keyboard-only and switch-device Shoppers.

**Improvement:** Add a `:focus-visible` outline (2px, offset 2px, contrast of at least 3:1). Make the cart `<a href="/cart.html">` so it gets native focus and Enter handling.

**Effort:** S

---

## Notes on the exploratory Findings

Every claim annotated here reproduced. One Finding was rejected and one needed a correction:

- The exploratory run reported "Finish below the fold on the mobile overview" as a UX Issue. The Findings judge rejected it: Finish coming after the items and totals is the normal checkout order, and the judge measured it only 16px below the fold with 1 item. The candidate accepted that Verdict, so it is not part of UX-03.
- "Sort resets after visiting a product page" is true only when the Shopper uses the in-app "Back to products" button. The browser Back button keeps the selected sort.
