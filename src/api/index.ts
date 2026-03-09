/**
 * TEMPORARY compatibility layer
 * Do NOT add new logic here.
 * Will be removed once all pages are migrated.
 */

import * as labs from "./labs";
import * as users from "./users";
import * as groups from "./groups";
import * as sessions from "./sessions";
import * as starpaths from "./starpaths";

export const api = {
  ...labs,
  ...users,
  ...groups,
  ...sessions,
  ...starpaths,
};
