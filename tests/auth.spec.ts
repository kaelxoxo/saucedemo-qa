import { expect, test } from '../fixtures/test';
import { LOCKED_OUT_PERSONA, PASSWORD, SHOPPING_PERSONAS } from '../data/personas';

const PROTECTED_PATHS = [
  '/inventory.html',
  '/inventory-item.html?id=4',
  '/cart.html',
  '/checkout-step-one.html',
  '/checkout-step-two.html',
  '/checkout-complete.html',
];

for (const persona of SHOPPING_PERSONAS) {
  test.describe(persona, () => {
    test.slow(persona === 'performance_glitch_user', 'every inventory render freezes the page for ~5 s');

    test('TC-01 valid login opens the product inventory', async ({ page, loginPage, inventoryPage }) => {
      await loginPage.goto();
      await loginPage.submit(persona, PASSWORD);

      await expect(page).toHaveURL(/\/inventory\.html$/);
      await expect(page.getByTestId('title')).toHaveText('Products');
      await expect(inventoryPage.items).toHaveCount(6);
    });

    test('TC-20 logout from the menu ends the session', async ({ page, loginPage, header }) => {
      await loginPage.loginAs(persona);

      await header.logout();
      await expect(loginPage.loginButton).toBeVisible();

      await page.goto('/inventory.html');
      await expect(loginPage.error).toHaveText(
        "Epic sadface: You can only access '/inventory.html' when you are logged in.",
      );
    });
  });
}

test.describe(LOCKED_OUT_PERSONA, () => {
  test('TC-02 locked-out Persona is refused and cannot reach the shop', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.submit(LOCKED_OUT_PERSONA, PASSWORD);

    await expect(loginPage.error).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL(/saucedemo\.com\/$/);

    for (const path of PROTECTED_PATHS) {
      await page.goto(path);
      await expect(page, `${path} must bounce back to login`).toHaveURL(/saucedemo\.com\/$/);
      await expect(loginPage.loginButton).toBeVisible();
    }
  });
});

test.describe('login form', () => {
  const invalidAttempts = [
    { case: 'empty username', username: '', password: PASSWORD, error: 'Username is required' },
    { case: 'empty password', username: 'standard_user', password: '', error: 'Password is required' },
    {
      case: 'wrong password',
      username: 'standard_user',
      password: 'wrong_sauce',
      error: 'Username and password do not match any user in this service',
    },
    {
      case: 'username in wrong case',
      username: 'Standard_User',
      password: PASSWORD,
      error: 'Username and password do not match any user in this service',
    },
  ];

  for (const attempt of invalidAttempts) {
    test(`TC-03 login is rejected for ${attempt.case}`, async ({ page, loginPage }) => {
      await loginPage.goto();
      await loginPage.submit(attempt.username, attempt.password);

      await expect(loginPage.error).toHaveText(`Epic sadface: ${attempt.error}`);
      await expect(page).toHaveURL(/saucedemo\.com\/$/);
    });
  }
});

test.describe('logged out', () => {
  for (const path of PROTECTED_PATHS) {
    test(`TC-04 direct access to ${path} is blocked`, async ({ page, loginPage }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/saucedemo\.com\/$/);
      await expect(loginPage.error).toContainText('when you are logged in');
    });
  }
});
