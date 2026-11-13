import type { Locator, Page } from '@playwright/test';
import type { Product } from '../data/products';

export class CartPage {
  readonly items: Locator;
  readonly names: Locator;
  readonly prices: Locator;
  readonly quantities: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    const list = page.getByTestId('cart-list');
    this.items = list.getByTestId('inventory-item');
    this.names = list.getByTestId('inventory-item-name');
    this.prices = list.getByTestId('inventory-item-price');
    this.quantities = list.getByTestId('item-quantity');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  removeButton(product: Product): Locator {
    return this.items
      .filter({ has: this.page.getByTestId('inventory-item-name').getByText(product.name, { exact: true }) })
      .getByRole('button', { name: 'Remove' });
  }

  /**
   * Puts products in the cart directly, the way the shop stores it
   * (localStorage['cart-contents'] = JSON array of product ids).
   * Lets a test arrange a cart without depending on Add-to-cart, so an
   * add-to-cart Bug cannot mask the behavior under test. Must be called
   * while on a saucedemo.com page; navigate afterwards so the app reads it.
   */
  async seed(products: readonly Product[]) {
    const ids = products.map((p) => p.id);
    await this.page.evaluate((value) => localStorage.setItem('cart-contents', value), JSON.stringify(ids));
  }
}
