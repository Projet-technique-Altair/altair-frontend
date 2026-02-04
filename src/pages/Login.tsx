/*
 * @file Login
 *
 * Public presentation & authentication entry page for Altaïr.
 * Designed for narration, screenshots and credibility.
 *
 * Route: /login
 */

import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

import bgImg from "@/assets/banniere.png";
import logoImg from "@/assets/logo.png";

export default function Login() {
  const { loginSSO } = useAuth();

  return (
    <div className="bg-[#0B0D1A] text-white overflow-x-hidden">

      {/* ================= HERO (PARALLAX) ================= */}
      <section
        className="relative min-h-screen flex items-center justify-center
                   bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0B0D1A]/85" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-8 text-center">
          <img
            src={logoImg}
            alt="Altaïr logo"
            className="mx-auto mb-10 h-36 w-36 rounded-full
                       shadow-[0_0_40px_rgba(122,44,243,0.45)]
                       ring-1 ring-white/10"
          />

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Un parcours unique pour maîtriser la cybersécurité.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Explore des environnements réels, progresse intelligemment
            et transforme tes compétences en expertise concrète.
          </p>

          <button
            onClick={loginSSO}
            className="mt-10 rounded-full px-12 py-4 text-lg font-semibold
                       bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A]
                       shadow-[0_12px_32px_rgba(122,44,243,0.5)]
                       transition hover:shadow-[0_16px_42px_rgba(122,44,243,0.65)]
                       active:scale-[0.98]"
          >
            Commencer mon voyage
          </button>

          <p className="mt-4 text-sm text-slate-400">
            Authentification sécurisée via SSO · Aucun mot de passe stocké
          </p>
        </div>
      </section>

      {/* ================= EXPLORER ================= */}
      <Section
        title="Explorer"
        subtitle="Mettre les mains dans le réel"
        description="Accède à des labs pratiques et des environnements réalistes
                     pour comprendre les mécanismes de la cybersécurité
                     par l’expérimentation."
        variant="dark"
      />

      {/* ================= PARALLAX TRANSITION ================= */}
      <ParallaxBreak bgImg={bgImg} />

      {/* ================= APPRENDRE ================= */}
      <Section
        title="Apprendre"
        subtitle="Progresser avec méthode"
        description="Altaïr analyse ta progression pour te proposer
                     des défis adaptés, des feedbacks précis
                     et un chemin d’apprentissage clair."
        variant="darker"
      />

      {/* ================= PARALLAX TRANSITION ================= */}
      <ParallaxBreak bgImg={bgImg} />

      {/* ================= MAÎTRISER ================= */}
      <Section
        title="Maîtriser"
        subtitle="Valider ses compétences"
        description="Débloque des constellations, valide tes acquis
                     et visualise ton évolution à travers un parcours
                     structuré et mesurable."
        variant="dark"
      />

      {/* ================= FUTURE ================= */}
      <section className="relative bg-[#0B0D1A] py-32 px-8 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold md:text-4xl">
            L’avenir de l’apprentissage avec Altaïr
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Altaïr intègre l’intelligence artificielle et la gamification
            pour personnaliser l’apprentissage, maintenir la motivation
            et accélérer la montée en compétences.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
            <FutureItem
              title="IA adaptative"
              text="Analyse continue du niveau et adaptation dynamique du parcours."
            />
            <FutureItem
              title="Gamification"
              text="Progression visuelle, objectifs clairs et récompenses mesurables."
            />
            <FutureItem
              title="Personnalisation"
              text="Un apprentissage qui évolue avec toi, à ton rythme."
            />
          </div>
        </div>
      </section>

      {/* ================= TEAM ================= */}
      <section className="relative bg-[#0E1024] py-32 px-8 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold md:text-4xl">
            L’équipe derrière Altaïr
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Altaïr est conçu par des étudiants ingénieurs passionnés
            de cybersécurité, avec une approche mêlant rigueur académique
            et vision produit.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
            <TeamMember
              name="Architecture & Backend"
              role="Microservices • Sécurité • Infrastructure"
            />
            <TeamMember
              name="Frontend & UX"
              role="React • Design • Expérience utilisateur"
            />
            <TeamMember
              name="IA & Pédagogie"
              role="Adaptativité • Gamification • Parcours"
            />
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  subtitle,
  description,
  variant = "dark",
}: {
  title: string;
  subtitle: string;
  description: string;
  variant?: "dark" | "darker";
}) {
  return (
    <section
      className={`relative py-32 px-8 text-center
        ${variant === "dark" ? "bg-[#0E1024]" : "bg-[#0B0D1A]"}`}
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>

        <p className="mt-2 text-sm uppercase tracking-wide text-slate-400">
          {subtitle}
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          {description}
        </p>
      </div>

      {/* Soft separator */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px
                      bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
    </section>
  );
}

function ParallaxBreak({ bgImg }: { bgImg: string }) {
  return (
    <section
      className="relative h-[40vh] bg-fixed bg-center bg-cover"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="absolute inset-0 bg-[#0B0D1A]/90" />
    </section>
  );
}

function FutureItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-slate-300">{text}</p>
    </div>
  );
}

function TeamMember({ name, role }: { name: string; role: string }) {
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <p className="mt-2 text-slate-400">{role}</p>
    </div>
  );
}
