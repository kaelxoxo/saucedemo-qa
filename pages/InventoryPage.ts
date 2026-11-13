import { expect, type Locator, type Page } from '@playwright/test';
import type { Product, SortOption } from '../data/products';

export class InventoryPage {
  readonly list: Locator;
  readonly items: Locator;
  readonly names: Locator;
  readonly sortSelect: Locator;

  constructor(private readonly page: Page) {
    this.list = page.getByTestId('inventory-list');
    this.items = page.getByTestId('inventory-item');
    this.names = page.getByTestId('inventory-item-name');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async goto() {
    await this.page.goto('/inventory.html');
    // performance_glitch_user freezes ~5 s on every inventory render, so allow more than the default.
    await expect(this.list).toBeVisible({ timeout: 15_000 });
  }

  /** The product card whose name matches exactly. */
  card(product: Product): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(product.name, { exact: true }),
    });
  }

  /**
   * The card's cart button; its data-test (and label) toggles between
   * add-to-cart-<slug> / "Add to cart" and remove-<slug> / "Remove".
   * (getByRole('button') would also match the card's links, which have role="button".)
   */
  cartButton(product: Product): Locator {
    return this.card(product).getByTestId(/^(add-to-cart|remove)-/);
  }

  image(product: Product): Locator {
    return this.card(product).getByRole('img');
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  async openDetails(product: Product) {
    await this.page.getByTestId(`item-${product.id}-title-link`).click();
  }
}
