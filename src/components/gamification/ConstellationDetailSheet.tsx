import { useRef, type ReactNode, type RefObject } from "react";
import ConstellationArtwork from "@/components/gamification/ConstellationArtwork";
import DashboardCard from "@/components/ui/DashboardCard";

const RARITY_LABEL: Record<string, string> = {
  legendary: "Legendary",
  epic: "Epic",
  rare: "Rare",
  common: "Common",
};

const RARITY_ACCENT: Record<string, string> = {
  legendary: "#F6C453",
  epic: "#C084FC",
  rare: "#60A5FA",
  common: "#94A3B8",
};

function getOfficialImageLabel(sourceUrl?: string) {
  if (!sourceUrl) {
    return "Official Sky View";
  }

  try {
    const hostname = new URL(sourceUrl).hostname.toLowerCase();

    if (hostname.includes("nasa.gov")) {
      return "NASA Sky View";
    }
    if (hostname.includes("eso.org")) {
      return "ESO Sky View";
    }
    if (hostname.includes("esa.int") || hostname.includes("spacetelescope.org")) {
      return "ESA/Hubble View";
    }
  } catch {
    return "Official Sky View";
  }

  return "Official Sky View";
}

type ConstellationSheetItem = {
  name: string;
  rarity?: string;
  image_url?: string | null;
  description_short?: string;
  description_full?: string;
  technical_details?: string;
  legend_text?: string;
  nasa_image_url?: string;
  nasa_image_title?: string;
  nasa_image_description?: string;
  astronomy_source_url?: string;
  mythology_source_url?: string;
  nasa_source_url?: string;
  location_label?: string;
  history_text?: string;
};

type Props = {
  item: ConstellationSheetItem;
  contextLabel: string;
  statusMessage?: ReactNode;
  stats?: Array<{ label: string; value: string }>;
  actions?: ReactNode;
  topRightAction?: ReactNode;
  artworkMaxWidthClassName?: string;
  compactHero?: boolean;
  scrollContainerRef?: RefObject<HTMLElement | null>;
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <DashboardCard className="border border-white/10 bg-transparent p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-white/35">{title}</p>
      <div className="mt-3 text-sm leading-7 text-white/78">{children}</div>
    </DashboardCard>
  );
}

export default function ConstellationDetailSheet({
  item,
  contextLabel,
  statusMessage,
  stats = [],
  actions,
  topRightAction,
  artworkMaxWidthClassName = "max-w-[720px]",
  compactHero = false,
  scrollContainerRef,
}: Props) {
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const rarity = item.rarity ?? "common";
  const accent = RARITY_ACCENT[rarity] ?? RARITY_ACCENT.common;
  const showLocation = item.location_label?.trim();
  const showHistory = item.history_text?.trim();
  const showTechnical = item.technical_details?.trim();
  const showLegend = item.legend_text?.trim() ?? showHistory;
  const officialImageLabel = getOfficialImageLabel(item.nasa_source_url);

  const handleExploreDetails = () => {
    if (!detailsRef.current) {
      return;
    }

    const topOffset = compactHero ? 88 : 112;
    const scrollContainer = scrollContainerRef?.current;

    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const detailsRect = detailsRef.current.getBoundingClientRect();
      const nextTop =
        scrollContainer.scrollTop + (detailsRect.top - containerRect.top) - topOffset;

      scrollContainer.scrollTo({
        top: Math.max(0, nextTop),
        behavior: "smooth",
      });
      return;
    }

    const y = detailsRef.current.getBoundingClientRect().top + window.scrollY - topOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <section
        className={[
          "relative flex min-h-screen overflow-hidden px-6",
          compactHero
            ? "items-center justify-center pb-12 pt-10"
            : "items-center justify-center pb-24 pt-10",
        ].join(" ")}
      >
        {topRightAction ? <div className="absolute right-6 top-6 z-30">{topRightAction}</div> : null}

        <div
          className={[
            "relative z-10 mx-auto w-full max-w-6xl text-center",
            compactHero ? "mt-0" : "",
          ].join(" ")}
        >
          <p
            className={
              compactHero
                ? "text-[10px] uppercase tracking-[0.34em] text-white/35"
                : "text-xs uppercase tracking-[0.36em] text-white/35"
            }
          >
            {contextLabel}
          </p>

          <div className={compactHero ? "mt-5 p-0.5 md:p-1" : "mt-8 p-2 md:p-4"}>
            <div
              className={[
                "relative mx-auto flex aspect-square w-full items-center justify-center overflow-hidden bg-transparent",
                compactHero ? "rounded-full" : "rounded-[32px]",
                artworkMaxWidthClassName,
              ].join(" ")}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-8 rounded-full blur-3xl"
                style={{ background: `${accent}18` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-8 rounded-full border border-white/8"
              />
              <ConstellationArtwork
                imageUrl={item.image_url}
                alt={item.name}
                containerClassName={[
                  "relative z-10 h-full w-full overflow-hidden",
                  compactHero ? "rounded-full" : "",
                ].join(" ")}
                imageClassName={[
                  "h-full w-full object-contain drop-shadow-[0_18px_70px_rgba(0,0,0,0.38)]",
                  compactHero ? "rounded-full p-4" : "p-8",
                ].join(" ")}
                fallbackClassName={compactHero ? "rounded-full bg-transparent" : "bg-transparent"}
                fallbackSymbolClassName="text-8xl text-white/25"
              />
            </div>

            <div className="mx-auto mt-8 max-w-3xl">
              <h1
                className={[
                  "font-semibold tracking-tight text-white",
                  compactHero ? "text-[2.2rem] leading-none md:text-[3.4rem]" : "text-4xl md:text-6xl",
                ].join(" ")}
              >
                {item.name}
              </h1>
              <div className={compactHero ? "mt-2 flex items-center justify-center gap-3" : "mt-4 flex items-center justify-center gap-3"}>
                <span
                  className={
                    compactHero
                      ? "rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                      : "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em]"
                  }
                  style={{
                    color: accent,
                    borderColor: `${accent}55`,
                    backgroundColor: `${accent}14`,
                  }}
                >
                  {RARITY_LABEL[rarity] ?? rarity}
                </span>
              </div>
              <p
                className={[
                  "mx-auto max-w-2xl leading-relaxed text-slate-300",
                  compactHero ? "mt-4 text-[13px]" : "mt-5 text-base",
                ].join(" ")}
              >
                {item.description_short ||
                  item.description_full ||
                  "A constellation identity revealed in your Altaïr collection."}
              </p>
            </div>

            {statusMessage ? <div className={compactHero ? "mx-auto mt-8 max-w-3xl" : "mx-auto mt-6 max-w-3xl"}>{statusMessage}</div> : null}

            {stats.length ? (
              <div
                className={[
                  "mx-auto grid max-w-3xl gap-3 sm:grid-cols-3",
                  compactHero ? "mt-3" : "mt-6",
                ].join(" ")}
              >
                {stats.map((stat) => (
                  <DashboardCard
                    key={stat.label}
                    className={[
                      "border border-white/10 bg-transparent",
                      compactHero ? "p-2.5" : "p-4",
                    ].join(" ")}
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                      {stat.label}
                    </p>
                    <p className={compactHero ? "mt-1 text-[1.05rem] font-semibold text-white" : "mt-2 text-lg font-semibold text-white"}>
                      {stat.value}
                    </p>
                  </DashboardCard>
                ))}
              </div>
            ) : null}

            {actions ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">{actions}</div>
            ) : null}

            {compactHero ? (
              <div className="mt-6 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExploreDetails}
                  className="text-[13px] font-medium tracking-wide text-violet-300 transition hover:text-violet-200"
                >
                  Explore the constellation
                </button>
                <span className="animate-bounce text-base text-violet-400">↓</span>
              </div>
            ) : null}
          </div>
        </div>

        {!compactHero ? (
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleExploreDetails}
              className="text-base font-medium tracking-wide text-violet-300 transition hover:text-violet-200"
            >
              Explore the constellation
            </button>
            <span className="animate-bounce text-xl text-violet-400">↓</span>
          </div>
        ) : null}
      </section>

      <section className="relative z-10 px-6 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div ref={detailsRef}>
              <SectionCard title="Overview">
                <p>{item.description_full || item.description_short}</p>
              </SectionCard>
            </div>

            {showTechnical ? (
              <SectionCard title="Technical Notes">
                <p>{showTechnical}</p>
              </SectionCard>
            ) : null}

            {showLegend ? (
              <SectionCard title="Legends">
                <p>{showLegend}</p>
              </SectionCard>
            ) : null}

            {showLocation ? (
              <SectionCard title="Sky Position">
                <p>{showLocation}</p>
              </SectionCard>
            ) : null}
          </div>

          <div className="space-y-6">
            {item.nasa_image_url ? (
              <DashboardCard className="overflow-hidden border border-white/10 bg-transparent">
                <div className="aspect-[4/3] overflow-hidden bg-transparent">
                  <img
                    src={item.nasa_image_url}
                    alt={item.nasa_image_title || `${item.name} official sky view`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                    {officialImageLabel}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-white">
                    {item.nasa_image_title || `${item.name} region`}
                  </h2>
                  {item.nasa_image_description ? (
                    <p className="mt-3 text-sm leading-7 text-white/70">
                      {item.nasa_image_description}
                    </p>
                  ) : null}
                </div>
              </DashboardCard>
            ) : null}

            <SectionCard title="Sources">
              <div className="space-y-3">
                {item.astronomy_source_url ? (
                  <p>
                    <span className="font-semibold text-white">Astronomy:</span>{" "}
                    <a
                      href={item.astronomy_source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-300 underline decoration-sky-300/40 underline-offset-4"
                    >
                      Open source
                    </a>
                  </p>
                ) : null}
                {item.mythology_source_url ? (
                  <p>
                    <span className="font-semibold text-white">Legend:</span>{" "}
                    <a
                      href={item.mythology_source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-300 underline decoration-violet-300/40 underline-offset-4"
                    >
                      Open source
                    </a>
                  </p>
                ) : null}
                {item.nasa_source_url ? (
                  <p>
                    <span className="font-semibold text-white">NASA image:</span>{" "}
                    <a
                      href={item.nasa_source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-300 underline decoration-amber-300/40 underline-offset-4"
                    >
                      Open source
                    </a>
                  </p>
                ) : null}
              </div>
            </SectionCard>

            <DashboardCard className="border border-white/10 bg-transparent p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Altair Note</p>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Rarity only affects drop rate. Your constellation remains a cosmetic identity,
                while stars represent duplicate progression inside the collection.
              </p>
            </DashboardCard>
          </div>
        </div>
      </section>
    </div>
  );
}
