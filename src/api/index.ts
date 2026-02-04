/**
 * TEMPORARY compatibility layer
 * Do NOT add new logic here.
 * Will be removed once all pages are migrated.
 */

import * as labs from "./labs";
import * as users from "./users";

export const api = {
  ...labs,
  ...users,
};
