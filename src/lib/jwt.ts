// // src/lib/jwt.ts

// export type KeycloakJwtPayload = {
//   preferred_username?: string;
//   realm_access?: {
//     roles?: string[];
//   };
//   exp?: number;
// };

// /**
//  * Decode a JWT payload without validating the signature.
//  * Frontend usage ONLY (UX, routing). Backend/Gateway must validate the token.
//  */
// export function decodeJwtPayload(token: string): KeycloakJwtPayload {
//   const parts = token.split(".");
//   if (parts.length !== 3) {
//     throw new Error("Invalid JWT format");
//   }

//   const payloadB64Url = parts[1];
//   const payloadJson = base64UrlDecodeToString(payloadB64Url);

//   const parsed = JSON.parse(payloadJson);
//   if (typeof parsed !== "object" || parsed === null) {
//     throw new Error("Invalid JWT payload");
//   }

//   return parsed as KeycloakJwtPayload;
// }

// function base64UrlDecodeToString(input: string): string {
//   const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
//   const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
//   return atob(padded);
// }

/**
 * Decodes a JWT payload WITHOUT validating the signature.
 * Frontend usage only (UX, routing, role display).
 */



export function decodeJwt<T = unknown>(token: string): T {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const payload = parts[1];

  // Base64URL → Base64
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = atob(base64);

  return JSON.parse(json) as T;
}

export type KeycloakJwtPayload = {
  preferred_username?: string;
  realm_access?: {
    roles?: string[];
  };
};