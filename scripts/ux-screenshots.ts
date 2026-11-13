// Regenerates the annotated UX Issue screenshots in docs/ux/.
// Standalone script (not a test): `node scripts/ux-screenshots.ts` (Node >= 22.18, type stripping).
// Every annotated claim is re-checked against the live site first; a claim that no longer
// reproduces aborts the run instead of producing a misleading screenshot.

import type { Browser, Locator, Page } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com/';
const DESKTOP = { viewport: { width: 1280, height: 900 } };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

type Side = 'above' | 'below' | 'left' | 'right';

interface Target {
  locator: Locator;
  note?: string; // short per-element tag, e.g. "20x20 px"
  side?: Side; // where the note goes, default 'below'
}

interface Rect { x: number; y: number; width: number; height: number }

function check(condition: boolean, claim: string): void {
  if (!condition) throw new Error(`Claim did not reproduce: ${claim}`);
  console.log(`  ok  ${claim}`);
}

async function login(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');
  await page.locator('[data-test="inventory-list"]').waitFor();
  // Product images change the layout (and the fold position) once loaded.
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete && img.naturalHeight > 0));
}

async function openCartWithTwoItems(page: Page): Promise<void> {
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.waitForURL('**/cart.html');
  await page.locator('[data-test="cart-list"]').waitFor();
}

async function docRect(locator: Locator): Promise<Rect> {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
  });
}

// Draws red 3px outlines (document coordinates, so full-page shots work), optional per-target
// notes, an optional dashed fold line, and one red label box "<id> — <caption>" next to
// targets[0]. Tags on the same side of the same outline stack instead of overlapping.
async function annotate(page: Page, id: string, caption: string, targets: Target[], opts: { foldY?: number; gap?: number; labelSide?: Side } = {}): Promise<void> {
  const rects: Rect[] = [];
  for (const t of targets) rects.push(await docRect(t.locator));
  await page.evaluate(
    ({ id, caption, rects, notes, sides, foldY, gap, labelSide }) => {
      const layer = document.createElement('div');
      layer.id = 'ux-annotation-layer';
      layer.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
      // Attach first so tags can be measured while placing them.
      document.documentElement.appendChild(layer);
      const pageWidth = document.documentElement.clientWidth;
      const tag = (text: string, size: number): HTMLDivElement => {
        const d = document.createElement('div');
        d.textContent = text;
        d.style.cssText = `position:absolute;background:#d00000;color:#fff;padding:3px 6px;border-radius:3px;white-space:nowrap;font:600 ${size}px/1.25 Arial,Helvetica,sans-serif;`;
        layer.appendChild(d);
        return d;
      };
      const stacks = new Map<string, number>();
      const place = (d: HTMLDivElement, i: number, side: string): void => {
        const r = rects[i];
        const o = { left: r.x - gap - 3, top: r.y - gap - 3, right: r.x + r.width + gap + 3, bottom: r.y + r.height + gap + 3 };
        const { width: w, height: h } = d.getBoundingClientRect();
        const key = `${i}:${side}`;
        const shift = stacks.get(key) ?? 0;
        let x = o.left;
        let y = o.bottom + 4 + shift;
        if (side === 'above') y = o.top - h - 4 - shift;
        if (side === 'right') { x = o.right + 6; y = (o.top + o.bottom - h) / 2 + shift; }
        if (side === 'left') { x = o.left - w - 6; y = (o.top + o.bottom - h) / 2 + shift; }
        stacks.set(key, shift + h + 4);
        d.style.left = `${Math.max(4, Math.min(x, pageWidth - w - 4))}px`;
        d.style.top = `${Math.max(2, y)}px`;
      };
      rects.forEach((r, i) => {
        const box = document.createElement('div');
        box.style.cssText = `position:absolute;left:${r.x - gap - 3}px;top:${r.y - gap - 3}px;width:${r.width + 2 * gap}px;height:${r.height + 2 * gap}px;border:3px solid #d00000;border-radius:4px;`;
        layer.appendChild(box);
        if (notes[i]) place(tag(notes[i], 13), i, sides[i]);
      });
      if (foldY !== undefined) {
        const line = document.createElement('div');
        line.style.cssText = `position:absolute;left:0;top:${foldY - 1}px;width:${pageWidth}px;border-top:3px dashed #d00000;`;
        layer.appendChild(line);
        const fold = tag(`Fold: ${foldY}px viewport`, 13);
        const { width: w, height: h } = fold.getBoundingClientRect();
        fold.style.left = `${pageWidth - w - 4}px`;
        fold.style.top = `${foldY - h - 4}px`;
      }
      place(tag(`${id} — ${caption}`, 15), 0, labelSide);
    },
    { id, caption, rects, notes: targets.map((t) => t.note ?? ''), sides: targets.map((t) => t.side ?? 'below'), foldY: opts.foldY, gap: opts.gap ?? 2, labelSide: opts.labelSide ?? 'above' },
  );
}

async function shoot(page: Page, outDir: string, name: string, clip?: Rect): Promise<void> {
  const path = `${outDir}/${name}`;
  await page.mouse.move(0, 0); // drop hover styling left by the last click
  await page.screenshot(clip ? { path, fullPage: true, clip } : { path });
  console.log(`  saved docs/ux/${name}`);
}

async function ux01Cart(browser: Browser, outDir: string): Promise<void> {
  console.log('UX-01 cart: no quantity control, no thumbnails');
  const ctx = await browser.newContext(DESKTOP);
  const page = await ctx.newPage();
  await login(page);
  await openCartWithTwoItems(page);
  const list = page.locator('[data-test="cart-list"]');
  const rows = list.locator('[data-test="inventory-item"]');
  const qty = list.locator('[data-test="item-quantity"]');
  check((await rows.count()) === 2, 'cart shows 2 rows after adding 2 products');
  check((await list.locator('input, select').count()) === 0, 'cart has no quantity input/select');
  check((await qty.evaluateAll((els) => els.map((e) => `${e.tagName}:${e.textContent}`))).every((s) => s === 'DIV:1'), 'quantity is a static <div>1</div>');
  check((await list.locator('img').count()) === 0, 'cart rows contain no <img> thumbnails');
  await annotate(page, 'UX-01', 'No qty control, no thumbnails', [
    { locator: rows.nth(1), note: 'No product images in the cart' },
    { locator: rows.nth(0) },
    { locator: qty.nth(0), note: 'Static "1"' },
    { locator: qty.nth(1), note: 'Static "1"' },
  ], { gap: 4, labelSide: 'below' });
  await shoot(page, outDir, 'UX-01-cart-no-qty-no-thumbnails.png');
  await ctx.close();
}

async function ux02Checkout(browser: Browser, outDir: string): Promise<void> {
  console.log('UX-02 checkout form feedback');
  const ctx = await browser.newContext(DESKTOP);
  const page = await ctx.newPage();
  await login(page);
  await openCartWithTwoItems(page);
  await page.locator('[data-test="checkout"]').click();
  await page.waitForURL('**/checkout-step-one.html');
  const first = page.locator('[data-test="firstName"]');
  const last = page.locator('[data-test="lastName"]');
  const zip = page.locator('[data-test="postalCode"]');
  const error = page.locator('[data-test="error"]');
  const cont = page.locator('[data-test="continue"]');

  // Errors appear one at a time.
  await cont.click();
  check((await error.textContent()) === 'Error: First Name is required', 'all fields empty -> only "First Name is required" shown');
  await first.fill('Jane');
  await cont.click();
  check((await error.textContent()) === 'Error: Last Name is required', 'next submit reveals the next error ("Last Name is required")');

  // Only First Name empty -> all three inputs red.
  await page.reload();
  await last.fill('Doe');
  await zip.fill('12345');
  await cont.click();
  check((await error.textContent()) === 'Error: First Name is required', 'only First Name empty -> "Error: First Name is required"');
  for (const [name, input] of [['First Name', first], ['Last Name', last], ['Postal Code', zip]] as const) {
    const state = await input.evaluate((e) => ({ cls: e.className, border: getComputedStyle(e).borderBottomColor, invalid: e.getAttribute('aria-invalid') }));
    check(state.cls.split(' ').includes('error') && state.border === 'rgb(226, 35, 26)', `${name} input styled as error (red border)`);
    check(state.invalid === null, `${name} input has no aria-invalid`);
  }
  await annotate(page, 'UX-02', 'All fields red, one empty', [
    { locator: first, note: 'Empty: the only real error', side: 'right' },
    { locator: last, note: 'Valid, but red', side: 'right' },
    { locator: zip, note: 'Valid, but red', side: 'right' },
    { locator: error, note: 'Generic copy, one error at a time', side: 'right' },
  ], { gap: 3 });
  await shoot(page, outDir, 'UX-02a-checkout-all-fields-red.png');

  // A non-numeric postal code is accepted (with valid names).
  await page.reload();
  await first.fill('Jane');
  await last.fill('Doe');
  await zip.fill('ABCDE-not-a-zip');
  await cont.click();
  await page.waitForURL('**/checkout-step-two.html');
  check(page.url().endsWith('/checkout-step-two.html'), 'Jane / Doe / "ABCDE-not-a-zip" proceeds to overview');
  const overviewTitle = page.locator('[data-test="title"]', { hasText: 'Checkout: Overview' });
  await overviewTitle.waitFor();
  await annotate(page, 'UX-02', 'Non-numeric ZIP accepted', [
    { locator: overviewTitle, note: 'Reached with ZIP "ABCDE-not-a-zip"', side: 'right' },
  ], { gap: 4, labelSide: 'below' });
  await shoot(page, outDir, 'UX-02b-non-numeric-zip-accepted.png');
  await ctx.close();
}

async function ux03Mobile(browser: Browser, outDir: string): Promise<void> {
  console.log('UX-03 mobile: first Add to cart below the fold, tiny tap targets');
  const ctx = await browser.newContext(MOBILE);
  const page = await ctx.newPage();
  await login(page);
  const fold = MOBILE.viewport.height;
  const burger = page.locator('#react-burger-menu-btn');
  const sort = page.locator('[data-test="product-sort-container"]');
  const firstItem = page.locator('[data-test="inventory-item"]').first();
  const firstAdd = firstItem.locator('button');
  const burgerBox = await docRect(burger);
  const sortBox = await docRect(sort);
  const addBox = await docRect(firstAdd);
  const descBox = await docRect(firstItem.locator('[data-test="inventory-item-desc"]'));
  const priceBox = await docRect(firstItem.locator('[data-test="inventory-item-price"]'));
  const gap = Math.round(priceBox.y - (descBox.y + descBox.height));
  check(Math.round(burgerBox.width) === 20 && Math.round(burgerBox.height) === 20, `burger button is ${Math.round(burgerBox.width)}x${Math.round(burgerBox.height)} px`);
  check(Math.round(sortBox.width) === 40 && Math.round(sortBox.height) === 30, `sort control is ${Math.round(sortBox.width)}x${Math.round(sortBox.height)} px`);
  check(Math.round(addBox.height) < 44, `Add to cart is ${Math.round(addBox.height)} px tall`);
  check(addBox.y >= fold, `first product's Add to cart starts at y=${Math.round(addBox.y)} (fold ${fold})`);
  check(gap > 200, `empty gap between description and price is ${gap} px`);
  await annotate(page, 'UX-03', 'Add to cart below fold', [
    { locator: firstAdd, note: `Top at y=${Math.round(addBox.y)}px, ${Math.round(addBox.height)}px tall` },
    { locator: burger, note: 'Menu button: 20x20 px' },
    { locator: sort, note: 'Sort: 40x30 px', side: 'left' },
  ], { foldY: fold, gap: 3, labelSide: 'below' });
  await shoot(page, outDir, 'UX-03a-mobile-inventory-fold.png', { x: 0, y: 0, width: MOBILE.viewport.width, height: Math.ceil(addBox.y + addBox.height + 90) });
  await ctx.close();
}

async function ux04SortReset(browser: Browser, outDir: string): Promise<void> {
  console.log('UX-04 browsing state lost');
  const ctx = await browser.newContext(DESKTOP);
  const page = await ctx.newPage();
  await login(page);
  const sort = page.locator('[data-test="product-sort-container"]');
  const active = page.locator('[data-test="active-option"]');
  const firstName = page.locator('[data-test="inventory-item-name"]').first();
  await sort.selectOption('hilo');
  check((await active.textContent()) === 'Price (high to low)' && (await firstName.textContent()) === 'Sauce Labs Fleece Jacket', 'sort Price (high to low) puts Fleece Jacket first');
  await firstName.click();
  await page.waitForURL('**/inventory-item.html*');
  await page.locator('[data-test="back-to-products"]').click();
  await page.waitForURL('**/inventory.html');
  check((await sort.inputValue()) === 'az' && (await active.textContent()) === 'Name (A to Z)', 'after "Back to products" sort is Name (A to Z)');
  check((await firstName.textContent()) === 'Sauce Labs Backpack', 'after "Back to products" first item is Sauce Labs Backpack');
  await annotate(page, 'UX-04', 'Sort reset after product page', [
    { locator: page.locator('.select_container'), note: 'Was "Price (high to low)"' },
    { locator: page.locator('[data-test="inventory-item"]').first(), note: 'Was Fleece Jacket ($49.99)' },
  ], { gap: 4, labelSide: 'left' });
  await shoot(page, outDir, 'UX-04a-sort-reset-after-back.png');
  await ctx.close();

  const mctx = await browser.newContext(MOBILE);
  const m = await mctx.newPage();
  await login(m);
  const msort = m.locator('[data-test="product-sort-container"]');
  await msort.selectOption('hilo');
  const sortBox = await docRect(msort);
  check((await m.locator('[data-test="active-option"]').evaluate((e) => getComputedStyle(e).display)) === 'none', 'mobile: active sort label is display:none');
  check(Math.round(sortBox.width) === 40 && Math.round(sortBox.height) === 30, `mobile: sort control is a ${Math.round(sortBox.width)}x${Math.round(sortBox.height)} px icon`);
  await annotate(m, 'UX-04', 'Active sort not shown', [
    { locator: msort, note: 'Sorted high→low; no label' },
  ], { gap: 3, labelSide: 'below' });
  await shoot(m, outDir, 'UX-04b-mobile-sort-label-hidden.png', { x: 0, y: 0, width: MOBILE.viewport.width, height: 480 });
  await mctx.close();
}

async function ux05Keyboard(browser: Browser, outDir: string): Promise<void> {
  console.log('UX-05 keyboard: no focus indicator, cart skipped by Tab');
  const ctx = await browser.newContext(DESKTOP);
  const page = await ctx.newPage();
  await login(page);
  const cart = page.locator('[data-test="shopping-cart-link"]');
  const addBtn = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');

  const cartAttrs = await cart.evaluate((e) => ({ href: e.getAttribute('href'), tabindex: e.getAttribute('tabindex') }));
  check(cartAttrs.href === null && cartAttrs.tabindex === null, 'cart link <a> has no href and no tabindex');
  await cart.evaluate((e) => (e as HTMLElement).focus());
  check(!(await cart.evaluate((e) => e === document.activeElement)), 'cart link cannot receive focus via focus()');

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  const unfocused = await addBtn.screenshot();
  const unfocusedStyle = await addBtn.evaluate((e) => { const s = getComputedStyle(e); return [s.outlineStyle, s.boxShadow, s.borderColor, s.backgroundColor, s.color].join('|'); });

  const order: string[] = [];
  for (let i = 0; i < 20 && !(await addBtn.evaluate((e) => e === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => { const e = document.activeElement; return e ? e.getAttribute('data-test') ?? e.id ?? e.tagName : ''; }));
  }
  console.log(`  Tab order: ${order.join(' -> ')}`);
  check(order[0] === 'react-burger-menu-btn' && order[1] === 'product-sort-container', 'Tab goes burger -> sort -> products');
  check(!order.includes('shopping-cart-link'), 'cart link never receives Tab focus');
  check(await addBtn.evaluate((e) => e === document.activeElement && e.matches(':focus-visible')), 'Add to cart is keyboard-focused (:focus-visible)');
  const focusedStyle = await addBtn.evaluate((e) => { const s = getComputedStyle(e); return [s.outlineStyle, s.boxShadow, s.borderColor, s.backgroundColor, s.color].join('|'); });
  check(focusedStyle === unfocusedStyle && focusedStyle.startsWith('none|none|'), `focused style identical to unfocused (outline/box-shadow none): ${focusedStyle}`);
  check(unfocused.equals(await addBtn.screenshot()), 'focused button is pixel-identical to unfocused');

  await annotate(page, 'UX-05', 'Focused, but no focus ring', [
    { locator: addBtn, note: `Has keyboard focus (Tab ×${order.length})` },
    { locator: cart, note: 'Skipped by Tab' },
  ], { gap: 8 });
  await shoot(page, outDir, 'UX-05-keyboard-no-focus-ring.png');
  await ctx.close();
}

async function main(): Promise<void> {
  // Dynamic imports on purpose: package.json is "type": "commonjs", where Node rejects static
  // `import` statements in .ts files; dynamic import() works in both CommonJS and ESM.
  const path = await import('node:path');
  const fs = await import('node:fs');
  const { chromium } = await import('@playwright/test');
  const outDir = path.resolve(path.dirname(path.resolve(process.argv[1])), '..', 'docs', 'ux');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  try {
    await ux01Cart(browser, outDir);
    await ux02Checkout(browser, outDir);
    await ux03Mobile(browser, outDir);
    await ux04SortReset(browser, outDir);
    await ux05Keyboard(browser, outDir);
  } finally {
    await browser.close();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
