import type { Locator, Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { expect, knownBugs, test } from '../fixtures/test';
import type { BugId } from '../data/known-bugs';
import { BASELINE_PERSONA, SHOPPING_PERSONAS, type ShoppingPersona } from '../data/personas';
import { productByName } from '../data/products';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';

/**
 * TC-23: each test renders the same region for the Persona under test and
 * for the Baseline Persona, in two fresh contexts of the same run, and
 * counts differing pixels. Nothing is committed as a baseline, so OS font
 * rendering differences between machines cannot cause false failures.
 * standard_user vs itself is the control: it must always be 0.
 */
type Region = {
  name: string;
  locate: (page: Page) => Locator;
  /** Parts already covered by other Test Cases (prices: TC-05, photos: TC-06). */
  mask?: (page: Page) => Locator[];
  /** Brings a logged-in page (on the inventory) to the state to compare. */
  open?: (page: Page) => Promise<void>;
  knownBugs: Partial<Record<ShoppingPersona, BugId>>;
};

const REGIONS: Region[] = [
  {
    name: 'header',
    locate: (page) => page.getByTestId('header-container'),
    knownBugs: { visual_user: 'BUG-22' },
  },
  {
    name: 'product list',
    locate: (page) => page.getByTestId('inventory-list'),
    mask: (page) => [page.getByTestId('inventory-item-price'), page.getByTestId('inventory-list').getByRole('img')],
    // A wrong photo has a different size and shifts the layout around it, so the
    // photo Bugs (BUG-06, BUG-21) also show up here even with photos masked.
    knownBugs: { problem_user: 'BUG-06', visual_user: 'BUG-23' },
  },
  {
    name: 'cart',
    locate: (page) => page.getByTestId('cart-contents-container'),
    open: async (page) => {
      const cartPage = new CartPage(page);
      await cartPage.seed([productByName('Sauce Labs Backpack')]);
      await cartPage.goto();
    },
    knownBugs: { visual_user: 'BUG-24' },
  },
];

async function capture(page: Page, region: Region): Promise<PNG> {
  await region.open?.(page);
  const target = region.locate(page);
  await expect(target).toBeVisible();
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete));
  return PNG.sync.read(await target.screenshot({ animations: 'disabled', mask: region.mask?.(page) }));
}

/** Differing pixels; a size mismatch counts every pixel of the larger image. */
function countDifferentPixels(actual: PNG, baseline: PNG, diff: PNG): number {
  if (actual.width !== baseline.width || actual.height !== baseline.height) {
    return Math.max(actual.width * actual.height, baseline.width * baseline.height);
  }
  return pixelmatch(actual.data, baseline.data, diff.data, actual.width, actual.height, { threshold: 0.1 });
}

for (const persona of SHOPPING_PERSONAS) {
  test.describe(persona, () => {
    test.slow(true, 'logs in two Personas in one test');

    for (const region of REGIONS) {
      test(
        `TC-23 ${region.name} looks the same as for the Baseline Persona`,
        knownBugs(
          ...Object.entries(region.knownBugs).map(([affected, bug]): [boolean, BugId] => [persona === affected, bug]),
        ),
        async ({ loginPage, page, secondPage }, testInfo) => {
          await loginPage.loginAs(persona);
          await new LoginPage(secondPage).loginAs(BASELINE_PERSONA);

          const actual = await capture(page, region);
          const baseline = await capture(secondPage, region);
          const diff = new PNG({ width: actual.width, height: actual.height });
          const differentPixels = countDifferentPixels(actual, baseline, diff);

          await testInfo.attach(`${persona}.png`, { body: PNG.sync.write(actual), contentType: 'image/png' });
          await testInfo.attach(`${BASELINE_PERSONA}.png`, { body: PNG.sync.write(baseline), contentType: 'image/png' });
          if (differentPixels > 0) {
            await testInfo.attach('diff.png', { body: PNG.sync.write(diff), contentType: 'image/png' });
          }
          expect(differentPixels, `${actual.width}x${actual.height} vs Baseline ${baseline.width}x${baseline.height}`).toBe(0);
        },
      );
    }
  });
}
