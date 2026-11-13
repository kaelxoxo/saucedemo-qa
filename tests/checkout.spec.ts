import { expect, knownBug, test } from '../fixtures/test';
import { SHOPPING_PERSONAS } from '../data/personas';
import { PRODUCTS, parseCents, productByName, toCents } from '../data/products';
import type { CustomerInfo } from '../pages/CheckoutPage';

const SHOPPER: CustomerInfo = { firstName: 'Jane', lastName: 'Doe', postalCode: '12345' };
const backpack = productByName('Sauce Labs Backpack');

for (const persona of SHOPPING_PERSONAS) {
  test.describe(persona, () => {
    test.slow(persona === 'performance_glitch_user', 'every inventory render freezes the page for ~5 s');

    test.beforeEach(async ({ loginPage }) => {
      await loginPage.loginAs(persona);
    });

    test.describe('information step', () => {
      test.beforeEach(async ({ cartPage, checkoutPage }) => {
        await cartPage.seed([backpack]);
        await checkoutPage.gotoInformation();
      });

      test('TC-16 empty first name is rejected', async ({ checkoutPage }) => {
        // problem_user: the last name keystrokes land in First Name, so Last Name is reported instead.
        knownBug(persona === 'problem_user', 'BUG-11');

        await checkoutPage.submitInformation({ ...SHOPPER, firstName: '' });

        await expect(checkoutPage.error).toHaveText('Error: First Name is required');
      });

      test('TC-16 empty last name is rejected', async ({ checkoutPage }) => {
        knownBug(persona === 'error_user', 'BUG-18');

        await checkoutPage.submitInformation({ ...SHOPPER, lastName: '' });

        await expect(checkoutPage.error).toHaveText('Error: Last Name is required');
      });

      test('TC-16 empty postal code is rejected', async ({ checkoutPage }) => {
        knownBug(persona === 'problem_user', 'BUG-11');

        await checkoutPage.submitInformation({ ...SHOPPER, postalCode: '' });

        await expect(checkoutPage.error).toHaveText('Error: Postal Code is required');
      });

      test('TC-16 whitespace-only first name is rejected', async ({ checkoutPage }) => {
        knownBug(persona !== 'problem_user', 'BUG-04');
        knownBug(persona === 'problem_user', 'BUG-11');

        await checkoutPage.submitInformation({ ...SHOPPER, firstName: '   ' });

        await expect(checkoutPage.error).toHaveText('Error: First Name is required');
      });

      test('TC-17 valid information is kept and leads to the overview', async ({ page, checkoutPage }) => {
        knownBug(persona === 'problem_user', 'BUG-11');
        knownBug(persona === 'error_user', 'BUG-17');

        await checkoutPage.fillInformation(SHOPPER);
        await expect(checkoutPage.firstName).toHaveValue(SHOPPER.firstName);
        await expect(checkoutPage.lastName).toHaveValue(SHOPPER.lastName);
        await expect(checkoutPage.postalCode).toHaveValue(SHOPPER.postalCode);

        await checkoutPage.continueButton.click();
        await expect(page).toHaveURL(/checkout-step-two\.html$/);
      });
    });

    test('TC-18 overview totals add up', async ({ cartPage, checkoutPage }) => {
      knownBug(persona === 'problem_user', 'BUG-27');
      await cartPage.seed(PRODUCTS);
      await checkoutPage.gotoOverview();
      await expect(checkoutPage.itemPrices).toHaveCount(PRODUCTS.length);

      const catalogCents = PRODUCTS.reduce((sum, p) => sum + toCents(p.price), 0);
      const lineCents = (await checkoutPage.itemPrices.allTextContents()).map(parseCents);
      expect(lineCents.reduce((a, b) => a + b, 0), 'line prices = catalog prices').toBe(catalogCents);

      const subtotal = parseCents(await checkoutPage.subtotal.innerText());
      const tax = parseCents(await checkoutPage.tax.innerText());
      const total = parseCents(await checkoutPage.total.innerText());
      expect(subtotal, 'item total = sum of line prices').toBe(catalogCents);
      expect(total, 'total = item total + tax').toBe(subtotal + tax);
    });

    test('TC-18 overview amounts always show cents', async ({ checkoutPage }) => {
      knownBug(true, 'BUG-03');
      // Empty cart is the boundary case: every amount is zero.
      await checkoutPage.gotoOverview();

      for (const amount of [checkoutPage.subtotal, checkoutPage.tax, checkoutPage.total]) {
        await expect(amount).toHaveText(/\$\d+\.\d{2}$/);
      }
    });

    test('TC-19 finish places the order and empties the cart', async ({ cartPage, checkoutPage, header }) => {
      knownBug(persona === 'problem_user', 'BUG-28');
      knownBug(persona === 'error_user', 'BUG-19');
      await cartPage.seed([backpack]);
      await checkoutPage.gotoOverview();

      await checkoutPage.finishButton.click();

      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
      await expect(header.cartBadge).toBeHidden();
    });

    test('TC-25 checkout cannot start with an empty cart', async ({ page, cartPage }) => {
      knownBug(true, 'BUG-02');
      await cartPage.goto();
      await expect(cartPage.items).toHaveCount(0);

      await cartPage.checkoutButton.click();

      await expect(page).toHaveURL(/cart\.html$/);
    });

    test('TC-25 order confirmation is not reachable by URL with a full cart', async ({
      page,
      cartPage,
      checkoutPage,
    }) => {
      knownBug(true, 'BUG-05');
      await cartPage.seed([backpack]);

      await checkoutPage.gotoComplete();
      await expect(page.getByTestId('title')).toBeVisible();

      await expect(checkoutPage.completeHeader).toBeHidden();
    });
  });
}
