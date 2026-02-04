type Props = {
  progress: number;
  coreP: number;
  step1P: number;
  step2P: number;
  step3P: number;
};

export default function ExplorerConstellation({
  progress,
  coreP,
  step1P,
  step2P,
  step3P,
}: Props) {
  // On ne trace rien tant que le core n’est pas visible
  const base = coreP;

  // Chaque ligne se trace avec son propre “local progress”
  const l1 = base * step1P;
  const l2 = base * step2P;
  const l3 = base * step3P;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Lignes (pathLength=1 => dashoffset simple) */}
      <Line x1={50} y1={45} x2={18} y2={43} t={l1} />
      <Line x1={50} y1={45} x2={82} y2={43} t={l2} />
      <Line x1={50} y1={45} x2={50} y2={78} t={l3} />

      {/* Petits points aux extrémités (apparaissent avec le progress) */}
      <Dot x={50} y={45} a={clamp01(progress)} />
      <Dot x={18} y={43} a={l1} />
      <Dot x={82} y={43} a={l2} />
      <Dot x={50} y={78} a={l3} />
    </svg>
  );
}

function Line({
  x1,
  y1,
  x2,
  y2,
  t,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  t: number;
}) {
  const dashOffset = 1 - clamp01(t);

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="rgba(139,92,246,0.55)"
      strokeWidth="0.35"
      pathLength={1}
      strokeDasharray="1"
      strokeDashoffset={dashOffset}
      strokeLinecap="round"
    />
  );
}

function Dot({ x, y, a }: { x: number; y: number; a: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={0.7}
      fill={`rgba(200,180,255,${clamp01(a) * 0.9})`}
    />
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
