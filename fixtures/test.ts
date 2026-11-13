import { test as base, expect, type Page } from '@playwright/test';
import { KNOWN_BUGS, type BugId } from '../data/known-bugs';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Header } from '../pages/Header';
import { InventoryPage } from '../pages/InventoryPage';
import { ItemPage } from '../pages/ItemPage';
import { LoginPage } from '../pages/LoginPage';

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
});

export { expect };

/**
 * Pins a Known Bug: when `affected` is true the test is expected to fail
 * (it stays green while the Bug exists and turns red once it is fixed),
 * and the report gets a `bug` annotation linking to BUGS.md.
 */
export function knownBug(affected: boolean, id: BugId) {
  test.fail(affected, `${id}: ${KNOWN_BUGS[id]}`);
  if (affected) test.info().annotations.push({ type: 'bug', description: id });
}
