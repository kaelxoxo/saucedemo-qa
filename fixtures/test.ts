import { test as base, expect, type Page, type TestDetails } from '@playwright/test';
import { KNOWN_BUGS, type BugId } from '../data/known-bugs';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Header } from '../pages/Header';
import { InventoryPage } from '../pages/InventoryPage';
import { ItemPage } from '../pages/ItemPage';
import { LoginPage } from '../pages/LoginPage';

const KNOWN_BUG_TAG = '@known-bug';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  itemPage: ItemPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: Header;
  /**
   * A second, independent page in its own browser context with the same
   * device settings as `page`. Used to compare a Persona against the
   * Baseline Persona within the same run (no committed screenshots).
   */
  secondPage: Page;
  /** Marks every test tagged by `knownBugs(...)` as expected to fail. */
  knownBugPins: void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  itemPage: async ({ page }, use) => use(new ItemPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
  secondPage: async ({ browser, baseURL, viewport, deviceScaleFactor, isMobile, hasTouch, userAgent }, use) => {
    const context = await browser.newContext({ baseURL, viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });
    await use(await context.newPage());
    await context.close();
  },
  knownBugPins: [
    async ({}, use, testInfo) => {
      for (const tag of testInfo.tags) {
        const id = tag.slice(1) as BugId;
        if (!tag.startsWith('@') || !Object.hasOwn(KNOWN_BUGS, id)) continue;
        testInfo.fail(true, `${id}: ${KNOWN_BUGS[id]}`);
        testInfo.annotations.push({ type: 'bug', description: id });
      }
      await use();
    },
    { auto: true },
  ],
});

export { expect };

/**
 * Pins Known Bugs on a test declaration: each `[affected, id]` pair whose
 * `affected` is true tags the test `@known-bug` and `@BUG-NN`, so the report
 * shows and filters it, and the `knownBugPins` fixture marks it expected to
 * fail (green while the Bug exists, red once it is fixed) with a `bug`
 * annotation linking to BUGS.md.
 */
export function knownBugs(...pins: [affected: boolean, id: BugId][]): TestDetails {
  const ids = [...new Set(pins.filter(([affected]) => affected).map(([, id]) => id))];
  return { tag: ids.length ? [KNOWN_BUG_TAG, ...ids.map((id) => `@${id}`)] : [] };
}
