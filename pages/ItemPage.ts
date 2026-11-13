import type { Locator, Page } from '@playwright/test';
import type { Product } from '../data/products';

/** Product detail page: /inventory-item.html?id=N */
export class ItemPage {
  /** Only on the detail page; wait for it before reading fields, because the inventory reuses the same data-test names. */
  readonly backButton: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addButton: Locator;
  readonly removeButton: Locator;

  constructor(private readonly page: Page) {
    this.backButton = page.getByTestId('back-to-products');
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.addButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
  }

  async goto(product: Product) {
    await this.page.goto(`/inventory-item.html?id=${product.id}`);
    await this.backButton.waitFor();
  }
}
