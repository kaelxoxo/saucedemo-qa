import { expect, knownBugs, test } from '../fixtures/test';
import { SHOPPING_PERSONAS } from '../data/personas';
import { productByName } from '../data/products';

const cartContents = [productByName('Sauce Labs Backpack'), productByName('Sauce Labs Onesie')];

for (const persona of SHOPPING_PERSONAS) {
  test.describe(persona, () => {
    test.slow(persona === 'performance_glitch_user', 'every inventory render freezes the page for ~5 s');

    test.beforeEach(async ({ loginPage }) => {
      await loginPage.loginAs(persona);
    });

    test.describe('Reset App State', () => {
      test.beforeEach(async ({ cartPage, inventoryPage, header }) => {
        await cartPage.seed(cartContents);
        await inventoryPage.goto();
        await expect(header.cartBadge).toHaveText('2');
        await header.resetAppState();
      });

      test('TC-21 reset empties the cart', async ({ cartPage, header }) => {
        await expect(header.cartBadge).toBeHidden();
        await cartPage.goto();
        await expect(cartPage.items).toHaveCount(0);
      });

      test('TC-21 reset restores the "Add to cart" buttons', knownBugs([true, 'BUG-01']), async ({ inventoryPage }) => {
        for (const product of cartContents) {
          await expect(inventoryPage.cartButton(product), product.name).toHaveText('Add to cart');
        }
      });
    });

    test(
      'TC-22 About link points to the Sauce Labs website',
      knownBugs([persona === 'problem_user', 'BUG-12']),
      async ({ header }) => {
        await header.menuButton.click();

        await expect(header.aboutLink).toHaveAttribute('href', 'https://saucelabs.com/');
      },
    );
  });
}
