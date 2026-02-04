/*
 * @file Footer
 *
 * Global footer for public pages (landing / login).
 * Inspired by large educational platforms, adapted
 * to Altaïr's premium & technical identity.
 */

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B0D1A] text-slate-300">
      {/* Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Main content */}
      <div className="mx-auto max-w-[1440px] px-10 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Column — Altaïr */}
          <FooterColumn title="Altaïr">
            <FooterLink>Mission</FooterLink>
            <FooterLink>Vision</FooterLink>
            <FooterLink>Approche pédagogique</FooterLink>
            <FooterLink>Recherche</FooterLink>
            <FooterLink>Carrières</FooterLink>
          </FooterColumn>

          {/* Column — Plateforme */}
          <FooterColumn title="Plateforme">
            <FooterLink>Labs</FooterLink>
            <FooterLink>Starpaths</FooterLink>
            <FooterLink>Constellations</FooterLink>
            <FooterLink>Progression</FooterLink>
            <FooterLink>Certifications</FooterLink>
          </FooterColumn>

          {/* Column — Support */}
          <FooterColumn title="Support">
            <FooterLink>Centre d’aide</FooterLink>
            <FooterLink>FAQ</FooterLink>
            <FooterLink>Documentation</FooterLink>
            <FooterLink>Status</FooterLink>
            <FooterLink>Contact</FooterLink>
          </FooterColumn>

          {/* Column — Légal */}
          <FooterColumn title="Légal & Social">
            <FooterLink>Conditions d’utilisation</FooterLink>
            <FooterLink>Confidentialité</FooterLink>
            <FooterLink>Code de conduite</FooterLink>

            <div className="mt-6 flex gap-4 text-sm">
              <FooterSocial>GitHub</FooterSocial>
              <FooterSocial>LinkedIn</FooterSocial>
              <FooterSocial>Twitter</FooterSocial>
            </div>
          </FooterColumn>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-10 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} Altaïr — Tous droits réservés.
          </span>

          <div className="flex items-center gap-3">
            <span className="opacity-70">Langue :</span>
            <LanguageButton>FR</LanguageButton>
            <LanguageButton>EN</LanguageButton>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
        {title}
      </h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <a
        href="#"
        className="text-sm transition hover:text-white"
      >
        {children}
      </a>
    </li>
  );
}

function FooterSocial({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      className="text-sm text-slate-400 transition hover:text-white"
    >
      {children}
    </a>
  );
}

function LanguageButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-md px-2 py-1 text-sm transition hover:bg-white/10">
      {children}
    </button>
  );
}
