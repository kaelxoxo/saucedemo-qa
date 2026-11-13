import { expect, knownBug, test } from '../fixtures/test';
import { SHOPPING_PERSONAS } from '../data/personas';
import { PRODUCTS, SORT_ORDERS, formatPrice, type SortOption } from '../data/products';

for (const persona of SHOPPING_PERSONAS) {
  test.describe(persona, () => {
    test.slow(persona === 'performance_glitch_user', 'every inventory render freezes the page for ~5 s');

    test.beforeEach(async ({ loginPage }) => {
      await loginPage.loginAs(persona);
    });

    test('TC-05 inventory lists every product with its catalog price', async ({ inventoryPage }) => {
      knownBug(persona === 'visual_user', 'BUG-20');

      for (const product of PRODUCTS) {
        await expect(inventoryPage.card(product).getByTestId('inventory-item-price')).toHaveText(
          formatPrice(product.price),
        );
      }
      await expect(inventoryPage.items).toHaveCount(PRODUCTS.length);
    });

    test('TC-06 each product shows its own photo', async ({ inventoryPage }) => {
      knownBug(persona === 'problem_user', 'BUG-06');
      knownBug(persona === 'visual_user', 'BUG-21');

      for (const product of PRODUCTS) {
        await expect(inventoryPage.image(product)).toHaveAttribute('src', new RegExp(product.image));
      }
    });

    const sortCases: { option: SortOption; tc: string }[] = [
      { option: 'az', tc: 'TC-07' },
      { option: 'za', tc: 'TC-08' },
      { option: 'lohi', tc: 'TC-09' },
      { option: 'hilo', tc: 'TC-10' },
    ];
    for (const { option, tc } of sortCases) {
      const { label, names } = SORT_ORDERS[option];
      test(`${tc} sort by ${label}`, async ({ inventoryPage }) => {
        // A→Z is the default order, so for it we first move away to prove it re-sorts.
        if (option === 'az') await inventoryPage.sortBy('za');
        knownBug(persona === 'problem_user' && option !== 'az', 'BUG-07');
        knownBug(persona === 'error_user' && option !== 'az', 'BUG-13');

        await inventoryPage.sortBy(option);

        await expect(inventoryPage.names).toHaveText(names);
        await expect(inventoryPage.sortSelect).toHaveValue(option);
      });
    }

    test('TC-11 product title opens that product’s detail page', async ({ page, inventoryPage, itemPage }) => {
      knownBug(persona === 'problem_user', 'BUG-08');

      for (const product of PRODUCTS) {
        await inventoryPage.openDetails(product);
        await expect(itemPage.backButton).toBeVisible();
        await expect(itemPage.name).toHaveText(product.name);
        await expect(page).toHaveURL(new RegExp(`inventory-item\\.html\\?id=${product.id}$`));
        await inventoryPage.goto();
      }
    });

    test('TC-12 detail page shows name, description and price', async ({ itemPage }) => {
      knownBug(persona === 'error_user', 'BUG-16');

      for (const product of PRODUCTS) {
        await itemPage.goto(product);
        await expect(itemPage.name).toHaveText(product.name);
        await expect(itemPage.description).toHaveText(/\S/);
        await expect(itemPage.price).toHaveText(formatPrice(product.price));
      }
    });

    test('TC-12 unknown product id offers nothing to buy', async ({ page, itemPage }) => {
      knownBug(true, 'BUG-26');
      // Valid ids are 0–5; 6 is the first id past the catalog.
      await page.goto(`/inventory-item.html?id=${PRODUCTS.length}`);
      // Present both on a detail page and on the inventory, so a redirect also counts as a fix.
      await expect(page.getByTestId('inventory-container')).toBeVisible();

      await expect(itemPage.addButton).toBeHidden();
    });

    test('TC-13 add every product from the inventory', async ({ inventoryPage, header }) => {
      knownBug(persona === 'problem_user', 'BUG-09');
      knownBug(persona === 'error_user', 'BUG-14');

      for (const product of PRODUCTS) {
        await inventoryPage.cartButton(product).click();
      }

      for (const product of PRODUCTS) {
        await expect(inventoryPage.cartButton(product), product.name).toHaveText('Remove');
      }
      await expect(header.cartBadge).toHaveText(String(PRODUCTS.length));
    });

    test('TC-13 remove every product from the inventory', async ({ inventoryPage, cartPage, header }) => {
      knownBug(persona === 'problem_user', 'BUG-10');
      knownBug(persona === 'error_user', 'BUG-15');
      await cartPage.seed(PRODUCTS);
      await inventoryPage.goto();
      await expect(header.cartBadge).toHaveText(String(PRODUCTS.length));

      for (const product of PRODUCTS) {
        await inventoryPage.cartButton(product).click();
      }

      for (const product of PRODUCTS) {
        await expect(inventoryPage.cartButton(product), product.name).toHaveText('Add to cart');
      }
      await expect(header.cartBadge).toBeHidden();
    });

    test('TC-14 add every product from its detail page', async ({ itemPage, header }) => {
      knownBug(persona === 'problem_user', 'BUG-09');
      knownBug(persona === 'error_user', 'BUG-14');

      for (const [index, product] of PRODUCTS.entries()) {
        await itemPage.goto(product);
        await itemPage.addButton.click();
        await expect(itemPage.removeButton, product.name).toBeVisible();
        await expect(header.cartBadge).toHaveText(String(index + 1));
      }
    });

    test('TC-14 remove every product from its detail page', async ({ itemPage, cartPage, header }) => {
      knownBug(persona === 'problem_user', 'BUG-10');
      knownBug(persona === 'error_user', 'BUG-15');
      await cartPage.seed(PRODUCTS);

      for (const [index, product] of PRODUCTS.entries()) {
        await itemPage.goto(product);
        await itemPage.removeButton.click();
        await expect(itemPage.addButton, product.name).toBeVisible();
        const left = PRODUCTS.length - index - 1;
        if (left > 0) await expect(header.cartBadge).toHaveText(String(left));
        else await expect(header.cartBadge).toBeHidden();
      }
    });
  });
}
