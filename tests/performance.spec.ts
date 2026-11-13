import { expect, knownBug, test } from '../fixtures/test';
import { PASSWORD, SHOPPING_PERSONAS } from '../data/personas';

/**
 * Budget from the click on "Login" until the product list is visible.
 * Measured over three full runs of this suite (4 parallel workers, desktop
 * and Pixel 7 projects): standard_user 95–177 ms, the other shopping
 * Personas 94–160 ms, performance_glitch_user 5114–5195 ms (its main thread freezes ~5 s).
 * 2.5 s is more than 10x the normal time, so a slow network or CI runner
 * does not trip it, and still about half the glitch, so the freeze is
 * caught every time. Each run records its measurement in the report.
 */
const LOGIN_BUDGET_MS = 2_500;

for (const persona of SHOPPING_PERSONAS) {
  test.describe(persona, () => {
    test(`TC-24 login shows the inventory within ${LOGIN_BUDGET_MS} ms`, async ({ loginPage, inventoryPage }) => {
      knownBug(persona === 'performance_glitch_user', 'BUG-25');
      await loginPage.goto();
      await loginPage.username.fill(persona);
      await loginPage.password.fill(PASSWORD);

      const started = performance.now();
      await loginPage.loginButton.click();
      await inventoryPage.list.waitFor({ timeout: 15_000 });
      const elapsedMs = Math.round(performance.now() - started);

      test.info().annotations.push({ type: 'login-to-inventory', description: `${elapsedMs} ms` });
      expect(elapsedMs).toBeLessThanOrEqual(LOGIN_BUDGET_MS);
    });
  });
}
