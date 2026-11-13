import { expect, test } from '../fixtures/test';
import { SHOPPING_PERSONAS } from '../data/personas';
import { formatPrice, productByName } from '../data/products';

const backpack = productByName('Sauce Labs Backpack');
const bikeLight = productByName('Sauce Labs Bike Light');

for (const persona of SHOPPING_PERSONAS) {
  test.describe(persona, () => {
    test.slow(persona === 'performance_glitch_user', 'every inventory render freezes the page for ~5 s');

    test.beforeEach(async ({ loginPage, cartPage }) => {
      await loginPage.loginAs(persona);
      await cartPage.seed([backpack, bikeLight]);
    });

    test('TC-15 cart lists each product once with its price', async ({ cartPage, header }) => {
      await cartPage.goto();

      await expect(cartPage.names).toHaveText([backpack.name, bikeLight.name]);
      await expect(cartPage.prices).toHaveText([formatPrice(backpack.price), formatPrice(bikeLight.price)]);
      await expect(cartPage.quantities).toHaveText(['1', '1']);
      await expect(header.cartBadge).toHaveText('2');
    });

    test('TC-15 remove a product from the cart', async ({ cartPage, header }) => {
      await cartPage.goto();

      await cartPage.removeButton(backpack).click();

      await expect(cartPage.names).toHaveText([bikeLight.name]);
      await expect(header.cartBadge).toHaveText('1');
    });
  });
}
