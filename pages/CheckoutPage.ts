import type { Locator, Page } from '@playwright/test';

export type CustomerInfo = { firstName: string; lastName: string; postalCode: string };

/** The three checkout steps: information, overview, complete. */
export class CheckoutPage {
  // Step one: /checkout-step-one.html
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly error: Locator;
  // Step two: /checkout-step-two.html
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  // Complete: /checkout-complete.html
  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.error = page.getByTestId('error');
    this.itemPrices = page.getByTestId('cart-list').getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
  }

  async gotoInformation() {
    await this.page.goto('/checkout-step-one.html');
  }

  async gotoOverview() {
    await this.page.goto('/checkout-step-two.html');
  }

  async gotoComplete() {
    await this.page.goto('/checkout-complete.html');
  }

  /**
   * Types key by key like a Shopper (some Persona Bugs only show up per keystroke,
   * not with a programmatic fill). Empty strings mean "leave the field untouched".
   */
  async fillInformation(info: CustomerInfo) {
    if (info.firstName) await this.firstName.pressSequentially(info.firstName);
    if (info.lastName) await this.lastName.pressSequentially(info.lastName);
    if (info.postalCode) await this.postalCode.pressSequentially(info.postalCode);
  }

  async submitInformation(info: CustomerInfo) {
    await this.fillInformation(info);
    await this.continueButton.click();
  }
}
