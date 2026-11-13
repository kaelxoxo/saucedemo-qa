/**
 * The shop catalog as the Baseline Persona sees it. Used as the oracle for
 * names, prices, images and sort orders. `image` is the asset name prefix;
 * the full file name carries a build hash that changes between deployments.
 */
export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export const PRODUCTS: readonly Product[] = [
  { id: 4, name: 'Sauce Labs Backpack', price: 29.99, image: 'sauce-backpack-1200x1500' },
  { id: 0, name: 'Sauce Labs Bike Light', price: 9.99, image: 'bike-light-1200x1500' },
  { id: 1, name: 'Sauce Labs Bolt T-Shirt', price: 15.99, image: 'bolt-shirt-1200x1500' },
  { id: 5, name: 'Sauce Labs Fleece Jacket', price: 49.99, image: 'sauce-pullover-1200x1500' },
  { id: 2, name: 'Sauce Labs Onesie', price: 7.99, image: 'red-onesie-1200x1500' },
  { id: 3, name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99, image: 'red-tatt-1200x1500' },
];

export const productByName = (name: string): Product => {
  const product = PRODUCTS.find((p) => p.name === name);
  if (!product) throw new Error(`Unknown product: ${name}`);
  return product;
};

/** Formats a price the way the shop displays it, e.g. 9.99 -> "$9.99". */
export const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

/** Parses "$29.99" or "Item total: $29.99" into whole cents, avoiding float drift. */
export const parseCents = (text: string): number => {
  const match = text.match(/\$(\d+)(?:\.(\d{1,2}))?/);
  if (!match) throw new Error(`No price in "${text}"`);
  return Number(match[1]) * 100 + Number((match[2] ?? '0').padEnd(2, '0'));
};

export const toCents = (price: number): number => Math.round(price * 100);

const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
// Ties on price keep A→Z order, matching what the shop does for the two $15.99 shirts.
const byPrice = (a: Product, b: Product) => a.price - b.price || byName(a, b);

/** Expected product name order for each value of the sort <select>. */
export const SORT_ORDERS = {
  az: { label: 'Name (A to Z)', names: [...PRODUCTS].sort(byName).map((p) => p.name) },
  za: { label: 'Name (Z to A)', names: [...PRODUCTS].sort(byName).reverse().map((p) => p.name) },
  lohi: { label: 'Price (low to high)', names: [...PRODUCTS].sort(byPrice).map((p) => p.name) },
  hilo: {
    label: 'Price (high to low)',
    names: [...PRODUCTS].sort((a, b) => b.price - a.price || byName(a, b)).map((p) => p.name),
  },
} as const;

export type SortOption = keyof typeof SORT_ORDERS;
