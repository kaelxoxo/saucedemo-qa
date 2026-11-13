/**
 * The Personas listed on the SauceDemo login page. All share one password.
 * standard_user is the Baseline Persona: its behavior defines "correct".
 */
export const PASSWORD = 'secret_sauce';

export const BASELINE_PERSONA = 'standard_user';

/** Personas that can log in and shop; the core-flow matrix runs once per entry. */
export const SHOPPING_PERSONAS = [
  'standard_user',
  'problem_user',
  'performance_glitch_user',
  'error_user',
  'visual_user',
] as const;

export const LOCKED_OUT_PERSONA = 'locked_out_user';

export type ShoppingPersona = (typeof SHOPPING_PERSONAS)[number];
export type Persona = ShoppingPersona | typeof LOCKED_OUT_PERSONA;
