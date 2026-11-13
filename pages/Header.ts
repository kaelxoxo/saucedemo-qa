import type { Locator, Page } from '@playwright/test';

/** Header shown on every logged-in page: burger menu and cart badge. */
export class Header {
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly resetLink: Locator;
  readonly aboutLink: Locator;

  constructor(page: Page) {
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    // The clickable burger is a <button> without data-test; its icon <img> carries data-test="open-menu".
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetLink = page.getByTestId('reset-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.menuButton.click();
    await this.resetLink.click();
  }
}
