/** Shared primary-key generator for all module rows. */
export const genId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
