type Props = {
  title: string;
  subtitle?: string;
  mock?: boolean;
};

export default function StarpathTitle({ title, subtitle, mock }: Props) {
  return (
    <div className="select-none pointer-events-none">
      <div className="text-[11px] tracking-[0.22em] text-white/35">STARPATH</div>

      <h1
        className="mt-3 text-5xl sm:text-6xl font-semibold leading-[1.05]"
        style={{
          background:
            "linear-gradient(90deg, rgba(56,189,248,1) 0%, rgba(99,102,241,1) 45%, rgba(122,44,243,1) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h1>

      {mock && <div className="mt-2 text-sm text-white/40">mock mode enabled</div>}

      {subtitle && <div className="mt-2 text-sm text-white/50">{subtitle}</div>}
    </div>
  );
}
