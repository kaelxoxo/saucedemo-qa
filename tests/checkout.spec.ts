import { expect, knownBugs, test } from '../fixtures/test';
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

      test(
        'TC-16 empty first name is rejected',
        // problem_user: the last name keystrokes land in First Name, so Last Name is reported instead.
        knownBugs([persona === 'problem_user', 'BUG-11']),
        async ({ checkoutPage }) => {
          await checkoutPage.submitInformation({ ...SHOPPER, firstName: '' });

          await expect(checkoutPage.error).toHaveText('Error: First Name is required');
        },
      );

      test(
        'TC-16 empty last name is rejected',
        knownBugs([persona === 'error_user', 'BUG-18']),
        async ({ checkoutPage }) => {
          await checkoutPage.submitInformation({ ...SHOPPER, lastName: '' });

          await expect(checkoutPage.error).toHaveText('Error: Last Name is required');
        },
      );

      test(
        'TC-16 empty postal code is rejected',
        knownBugs([persona === 'problem_user', 'BUG-11']),
        async ({ checkoutPage }) => {
          await checkoutPage.submitInformation({ ...SHOPPER, postalCode: '' });

          await expect(checkoutPage.error).toHaveText('Error: Postal Code is required');
        },
      );

      test(
        'TC-16 whitespace-only first name is rejected',
        knownBugs([persona !== 'problem_user', 'BUG-04'], [persona === 'problem_user', 'BUG-11']),
        async ({ checkoutPage }) => {
          await checkoutPage.submitInformation({ ...SHOPPER, firstName: '   ' });

          await expect(checkoutPage.error).toHaveText('Error: First Name is required');
        },
      );

      test(
        'TC-17 valid information is kept and leads to the overview',
        knownBugs([persona === 'problem_user', 'BUG-11'], [persona === 'error_user', 'BUG-17']),
        async ({ page, checkoutPage }) => {
          await checkoutPage.fillInformation(SHOPPER);
          await expect(checkoutPage.firstName).toHaveValue(SHOPPER.firstName);
          await expect(checkoutPage.lastName).toHaveValue(SHOPPER.lastName);
          await expect(checkoutPage.postalCode).toHaveValue(SHOPPER.postalCode);

          await checkoutPage.continueButton.click();
          await expect(page).toHaveURL(/checkout-step-two\.html$/);
        },
      );
    });

    test(
      'TC-18 overview totals add up',
      knownBugs([persona === 'problem_user', 'BUG-27']),
      async ({ cartPage, checkoutPage }) => {
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
      },
    );

    test('TC-18 overview amounts always show cents', knownBugs([true, 'BUG-03']), async ({ checkoutPage }) => {
      // Empty cart is the boundary case: every amount is zero.
      await checkoutPage.gotoOverview();

      for (const amount of [checkoutPage.subtotal, checkoutPage.tax, checkoutPage.total]) {
        await expect(amount).toHaveText(/\$\d+\.\d{2}$/);
      }
    });

    test(
      'TC-19 finish places the order and empties the cart',
      knownBugs([persona === 'problem_user', 'BUG-28'], [persona === 'error_user', 'BUG-19']),
      async ({ cartPage, checkoutPage, header }) => {
        await cartPage.seed([backpack]);
        await checkoutPage.gotoOverview();

        await checkoutPage.finishButton.click();

        await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
        await expect(header.cartBadge).toBeHidden();
      },
    );

    test('TC-25 checkout cannot start with an empty cart', knownBugs([true, 'BUG-02']), async ({ page, cartPage }) => {
      await cartPage.goto();
      await expect(cartPage.items).toHaveCount(0);

      await cartPage.checkoutButton.click();

      await expect(page).toHaveURL(/cart\.html$/);
    });

    test(
      'TC-25 order confirmation is not reachable by URL with a full cart',
      knownBugs([true, 'BUG-05']),
      async ({ page, cartPage, checkoutPage }) => {
        await cartPage.seed([backpack]);

        await checkoutPage.gotoComplete();
        await expect(page.getByTestId('title')).toBeVisible();

        await expect(checkoutPage.completeHeader).toBeHidden();
      },
    );
  });
}
