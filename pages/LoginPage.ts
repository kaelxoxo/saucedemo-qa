import { expect, type Locator, type Page } from '@playwright/test';
import { PASSWORD, type Persona } from '../data/personas';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async goto() {
    await this.page.goto('/');
  }

  async submit(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  /** Logs in through the UI and waits until the product list is rendered. */
  async loginAs(persona: Persona) {
    await this.goto();
    await this.submit(persona, PASSWORD);
    // performance_glitch_user freezes ~5 s on every inventory render, so allow more than the default.
    await expect(this.page.getByTestId('inventory-list')).toBeVisible({ timeout: 15_000 });
  }
}
