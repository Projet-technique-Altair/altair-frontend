import type { UserRole } from "@/context/AuthContext";

/**
 * Returns the default dashboard route for a given role.
 */
export function routeForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "creator":
      return "/creator/dashboard";
    case "learner":
    default:
      return "/learner/dashboard";
  }
}
