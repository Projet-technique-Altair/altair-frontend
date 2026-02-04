import bgImg from "@/assets/banniere.png";

export default function LandingBackground() {
  return (
    <>
      {/* Image de fond globale */}
      <div
        className="fixed inset-0 -z-20 bg-center bg-cover will-change-transform"
        style={{
          backgroundImage: `url(${bgImg})`,
        }}
      />

      {/* Overlay global pour lisibilité */}
      <div
        className="fixed inset-0 -z-10
                   bg-gradient-to-b
                   from-[#0B0D1A]/25
                   via-[#0B0D1A]/35
                   to-[#0B0D1A]/40"
      />
    </>
  );
}
