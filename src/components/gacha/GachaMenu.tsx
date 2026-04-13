import DashboardCard from "@/components/ui/DashboardCard";
import { useState } from "react";
import GachaCurtain from "@/components/gacha/GachaCurtain";
import type {
  CurrencyBalance,
  GachaConfig,
  GachaHistoryEntry,
} from "@/contracts/gacha";
import { GACHA_FIRST_FRAME } from "@/components/gacha/gachaScene";
import { ALT_COLORS } from "@/lib/theme";

type Props = {
  config: GachaConfig;
  balance: CurrencyBalance;
  history: GachaHistoryEntry[];
  onOpen: () => void;
};

const RARITY_STYLES: Record<string, string> = {
  common: "text-slate-300",
  rare: "text-sky-300",
  epic: "text-purple-300",
  legendary: "text-amber-300",
};

export default function GachaMenu({
  config,
  balance,
  history,
  onOpen,
}: Props) {
  const capsule = config.capsules[0];
  const freeDrawsRemaining = balance.free_draws_remaining ?? 0;
  const canOpen =
    freeDrawsRemaining > 0 || balance.starlight >= capsule.price_starlight;
  const [isLaunching, setIsLaunching] = useState(false);

  const handleOpenClick = () => {
    if (!canOpen || isLaunching) {
      return;
    }

    setIsLaunching(true);
    window.setTimeout(() => {
      onOpen();
    }, 520);
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 bg-black" />
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <img
          src={GACHA_FIRST_FRAME}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
      </div>
      <div
        className={[
          "relative z-10 space-y-8 transition-all duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          isLaunching
            ? "scale-[0.99] translate-y-3 opacity-0 blur-2xl"
            : "scale-100 translate-y-0 opacity-100 blur-0",
        ].join(" ")}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Gacha Observatory
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-white/45">
              Open a standard capsule to unlock constellations and grow your
              collection.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-black/62 px-4 py-2 backdrop-blur-md">
            <span className="text-xl">🌟</span>
            <div>
              <p className="text-xs leading-none text-white/40">Balance</p>
              <p className="text-sm font-bold" style={{ color: ALT_COLORS.blue }}>
                {balance.starlight.toLocaleString()} Starlight
              </p>
              {freeDrawsRemaining > 0 ? (
                <p className="mt-1 text-xs font-medium text-emerald-300">
                  {freeDrawsRemaining} free starter draw
                  {freeDrawsRemaining > 1 ? "s" : ""}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <DashboardCard className="border border-white/10 bg-black/68 p-6 backdrop-blur-md">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Standard Capsule
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {capsule.capsule_type}
                  </h2>
                  <p className="mt-2 text-sm text-white/50">
                    Constellations only. No auras, UI skins, badges, or titles
                    in this capsule.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/48 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                      Cost
                    </p>
                    {freeDrawsRemaining > 0 ? (
                      <>
                        <p className="mt-2 text-lg font-semibold text-emerald-300">
                          Free starter test
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          First free draw guarantees Orion.
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-lg font-semibold text-white">
                        {capsule.price_starlight.toLocaleString()} Starlight
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/48 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                      Rare pity
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {capsule.pity.rare_or_better_after} pulls
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/48 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                      Epic pity
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {capsule.pity.epic_or_better_after} pulls
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/44 p-4">
                  <p className="text-sm font-semibold text-white">
                    Drop rates
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl bg-black/50 px-3 py-2 text-sm">
                      <span className={RARITY_STYLES.common}>Common</span>
                      <span className="text-white/70">
                        {capsule.drop_rates.common / 100}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-black/50 px-3 py-2 text-sm">
                      <span className={RARITY_STYLES.rare}>Rare</span>
                      <span className="text-white/70">
                        {capsule.drop_rates.rare / 100}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-black/50 px-3 py-2 text-sm">
                      <span className={RARITY_STYLES.epic}>Epic</span>
                      <span className="text-white/70">
                        {capsule.drop_rates.epic / 100}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-black/50 px-3 py-2 text-sm">
                      <span className={RARITY_STYLES.legendary}>Legendary</span>
                      <span className="text-white/70">
                        {capsule.drop_rates.legendary / 100}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(0,0,0,0.76),rgba(8,12,24,0.68))] p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    Ready to pull
                  </p>
                  <div className="mt-6 flex h-40 items-center justify-center rounded-[24px] border border-white/10 bg-black/58 text-7xl shadow-[0_0_40px_rgba(122,44,243,0.18)]">
                    ✦
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {!canOpen && (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                      You need more Starlight to open this capsule.
                    </div>
                  )}

                  {freeDrawsRemaining > 0 ? (
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                      Your first free gacha test is ready and will unlock Orion.
                    </div>
                  ) : null}

                  <button
                    disabled={!canOpen || isLaunching}
                    onClick={handleOpenClick}
                    className={[
                      "w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-all",
                      canOpen && !isLaunching
                        ? "bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500 shadow-[0_0_30px_rgba(122,44,243,0.25)] hover:-translate-y-0.5 hover:opacity-95"
                        : "cursor-not-allowed bg-white/10 text-white/30",
                    ].join(" ")}
                  >
                    {isLaunching
                      ? "Launching..."
                      : freeDrawsRemaining > 0
                        ? "Open your free Orion draw"
                        : "Open a capsule"}
                  </button>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="border border-white/10 bg-black/68 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                  Recent history
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Last constellation pulls
                </h2>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
                <span className="text-5xl">🌌</span>
                <p className="font-semibold text-white/60">
                  No capsule opened yet
                </p>
                <p className="max-w-xs text-sm text-white/35">
                  Your recent pulls will appear here after your first opening.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.request_id}
                    className="rounded-2xl border border-white/10 bg-black/46 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">
                          {entry.item_name}
                        </p>
                        <p
                          className={[
                            "mt-1 text-xs font-medium uppercase tracking-[0.22em]",
                            RARITY_STYLES[entry.rarity] ?? "text-white/50",
                          ].join(" ")}
                        >
                          {entry.rarity}
                        </p>
                      </div>

                      <span className="text-right text-xs text-white/45">
                        {entry.was_duplicate
                          ? `Duplicate +${entry.conversion_amount} Stardust`
                          : "New unlock"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      {isLaunching ? <GachaCurtain mode="fade-in" durationMs={420} /> : null}
    </div>
  );
}
