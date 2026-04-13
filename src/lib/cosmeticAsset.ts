const DEV_ASSET_CACHE_BUSTER = import.meta.env.DEV ? `assetv=${Date.now()}` : "";

function gatewayBaseUrl() {
  return (import.meta.env.VITE_GATEWAY_URL ?? "").replace(/\/$/, "");
}

export function cosmeticAssetUrl(filename: string): string {
  const transparentFilename = filename.replace(
    /aura-animated\/binary-orbit\.mp4$/i,
    "aura-animated/binary-orbit.webm",
  );

  const normalized = transparentFilename.replace(/^https?:\/\/[^/]+/, "");
  const path = normalized.startsWith("/gamification/assets/cosmetics/")
    ? normalized
    : normalized.startsWith("/assets/cosmetics/")
      ? `/gamification${normalized}`
      : `/gamification/assets/cosmetics/${normalized.replace(/^\/+/, "")}`;

  const base = gatewayBaseUrl();
  const resolved = base ? `${base}${path}` : path;

  if (!DEV_ASSET_CACHE_BUSTER) {
    return resolved;
  }

  return resolved.includes("?")
    ? `${resolved}&${DEV_ASSET_CACHE_BUSTER}`
    : `${resolved}?${DEV_ASSET_CACHE_BUSTER}`;
}
