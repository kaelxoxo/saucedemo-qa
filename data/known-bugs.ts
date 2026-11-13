/**
 * Known Bugs, one per BUGS.md entry. Tests pin them with `knownBug(...)`
 * (fixtures/test.ts), so keep IDs and titles in sync with BUGS.md.
 */
export const KNOWN_BUGS = {
  'BUG-01': 'Reset App State leaves "Remove" buttons on the inventory',
  'BUG-02': 'Checkout can be started with an empty cart',
  'BUG-03': 'Empty-cart overview shows "Item total: $0" without decimals',
  'BUG-04': 'Checkout accepts whitespace-only customer information',
  'BUG-05': 'Order confirmation page reachable by URL while the cart still holds items',
  'BUG-06': 'problem_user: every product image is the same placeholder photo',
  'BUG-07': 'problem_user: sorting the inventory has no effect',
  'BUG-08': 'problem_user: product links open a different product',
  'BUG-09': 'problem_user: three products cannot be added to the cart',
  'BUG-10': 'problem_user: Remove does nothing on inventory and detail pages',
  'BUG-11': 'problem_user: typing a last name overwrites the first name',
  'BUG-12': 'problem_user: About menu link points to a 404 page',
  'BUG-13': 'error_user: sorting shows "Sorting is broken!" and does not sort',
  'BUG-14': 'error_user: three products cannot be added to the cart',
  'BUG-15': 'error_user: Remove does nothing on inventory and detail pages',
  'BUG-16': 'error_user: product detail page has no description',
  'BUG-17': 'error_user: last name field does not accept input',
  'BUG-18': 'error_user: checkout continues without a last name',
  'BUG-19': 'error_user: Finish does not complete the order',
  'BUG-20': 'visual_user: inventory shows wrong, changing prices',
  'BUG-21': 'visual_user: Sauce Labs Backpack shows the wrong image',
  'BUG-22': 'visual_user: header cart icon and menu icon are out of place',
  'BUG-23': 'visual_user: product cards are misaligned',
  'BUG-24': 'visual_user: cart Checkout button is out of place',
  'BUG-25': 'performance_glitch_user: login takes about 5 seconds',
  'BUG-26': 'Unknown product id shows "ITEM NOT FOUND" that can be added to the cart',
  'BUG-27': 'problem_user: checkout overview item total is double the item prices',
  'BUG-28': 'problem_user: placing an order does not empty the cart',
} as const;

export type BugId = keyof typeof KNOWN_BUGS;
