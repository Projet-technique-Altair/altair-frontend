import { useEffect, useState } from "react";
import { cosmeticAssetUrl } from "@/lib/cosmeticAsset";

type ConstellationArtworkProps = {
  imageUrl?: string | null;
  alt: string;
  containerClassName?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  fallbackSymbolClassName?: string;
};

export default function ConstellationArtwork({
  imageUrl,
  alt,
  containerClassName = "",
  imageClassName = "",
  fallbackClassName = "",
  fallbackSymbolClassName = "text-4xl text-white/25",
}: ConstellationArtworkProps) {
  const normalizedUrl = imageUrl?.trim() ?? "";
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    setHasLoadError(false);
  }, [normalizedUrl]);

  if (!normalizedUrl || hasLoadError) {
    return (
      <div
        className={`flex items-center justify-center ${containerClassName} ${fallbackClassName}`.trim()}
      >
        <span className={fallbackSymbolClassName}>✦</span>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <img
        src={cosmeticAssetUrl(normalizedUrl)}
        alt={alt}
        className={imageClassName}
        onError={() => setHasLoadError(true)}
      />
    </div>
  );
}
