import GachaCurtain from "@/components/gacha/GachaCurtain";
import { GACHA_LAST_FRAME } from "@/components/gacha/gachaScene";
import ConstellationDetailSheet from "@/components/gamification/ConstellationDetailSheet";
import type { GachaOpenResponse } from "@/contracts/gacha";

type Props = {
  result: GachaOpenResponse;
  onBack: () => void;
  onOpenAgain: () => void;
};

export default function GachaResult({ result, onBack, onOpenAgain }: Props) {
  const roll = result.roll;

  const statusClassName = roll.was_duplicate
    ? "border-amber-400/25 bg-amber-400/10 text-amber-100"
    : "border-emerald-400/25 bg-emerald-400/10 text-emerald-100";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-black" />
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <img
          src={GACHA_LAST_FRAME}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.26)_48%,rgba(0,0,0,0.72)_100%)]" />

      <div className="relative z-10">
        <ConstellationDetailSheet
          item={roll}
          contextLabel="Capsule result"
          artworkMaxWidthClassName="max-w-[292px] md:max-w-[344px]"
          compactHero
          statusMessage={
            <div className={`rounded-2xl border px-4 py-2 text-sm ${statusClassName}`}>
              {roll.was_duplicate
                ? `Duplicate detected. Star progression was applied${roll.conversion_amount > 0 ? `, then converted to ${roll.conversion_amount} Stardust at max rank.` : "."}`
                : "New constellation unlocked."}
            </div>
          }
          actions={
            <>
              <button
                onClick={onOpenAgain}
                className="rounded-2xl bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(122,44,243,0.25)] transition-all hover:-translate-y-0.5 hover:opacity-95"
              >
                Open another
              </button>
              <button
                onClick={onBack}
                className="rounded-2xl border border-white/15 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white/80 transition-all hover:border-white/25 hover:text-white"
              >
                Back to menu
              </button>
            </>
          }
        />
      </div>
      <GachaCurtain mode="fade-out" durationMs={920} />
    </div>
  );
}
