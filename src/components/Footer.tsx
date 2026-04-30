import type { ReactNode } from "react";

type FooterLinkItem = {
  label: string;
  href: string;
  description?: string;
};

const footerSections: Array<{
  title: string;
  links: FooterLinkItem[];
}> = [
  {
    title: "Altair",
    links: [
      {
        label: "Mission",
        href: "/#explorer",
        description:
          "Altair is built to make technical learning concrete: learners face real workflows, observe consequences, and build confidence through practice instead of passive content.",
      },
      {
        label: "Learning philosophy",
        href: "/#labs",
        description:
          "The platform favors active experimentation, feedback, repetition, and progressive difficulty so knowledge becomes a skill that can be reused outside the course.",
      },
      {
        label: "Roadmap",
        href: "/#future",
        description:
          "A view of the product direction: stronger creator tools, clearer learner analytics, more reliable lab execution, and better team-based learning flows.",
      },
      {
        label: "Team",
        href: "/#team",
        description:
          "The people behind Altair: product, design, infrastructure, backend, learning systems, and the decisions that shape the experience.",
      },
    ],
  },
  {
    title: "Platform",
    links: [
      {
        label: "Interactive labs",
        href: "/#labs",
        description:
          "Labs are practical scenarios with objectives, instructions, execution environments, and validation steps so learners prove what they can actually do.",
      },
      {
        label: "Guided starpaths",
        href: "/#starpaths",
        description:
          "Starpaths organize labs into a coherent progression with prerequisites, milestones, and a clear path from discovery to mastery.",
      },
      {
        label: "Explorer workspace",
        href: "/#explorer",
        description:
          "Explorer is the learner workspace: browse available learning, launch activities, follow progress, and understand what to do next.",
      },
      {
        label: "Gamified progress",
        href: "/#gamification",
        description:
          "Progression systems make effort visible through collections, rewards, and completion signals while keeping the learning objective at the center.",
      },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/support#help-center" },
      { label: "Contact the team", href: "/support#contact" },
      { label: "Report an issue", href: "/support#report" },
      { label: "System status", href: "/support#status" },
      { label: "Documentation", href: "/support#documentation" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal#terms" },
      { label: "Privacy policy", href: "/legal#privacy" },
      { label: "Cookie preferences", href: "/legal#cookies" },
      { label: "Code of conduct", href: "/legal#conduct" },
      { label: "Accessibility", href: "/legal#accessibility" },
    ],
  },
  {
    title: "Social",
    links: [{ label: "GitHub", href: "/social#github" }],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#080B14] text-slate-300">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto grid max-w-[1440px] gap-14 px-6 py-16 sm:px-10 lg:grid-cols-[1.25fr_2fr] lg:gap-20 lg:py-20">
        <div className="max-w-md">
          <a href="/" className="inline-flex items-center text-2xl font-semibold text-white">
            Altair
          </a>
          <p className="mt-5 text-sm leading-7 text-slate-400">
            A hands-on learning platform for technical teams, creators, and
            students who want to build real skills through labs, guided paths,
            and measurable progress.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {footerSections.map((section) => (
            <FooterColumn key={section.title} title={section.title}>
              {section.links.map((link) => (
                <FooterLink
                  key={link.label}
                  href={link.href}
                  description={link.description}
                >
                  {link.label}
                </FooterLink>
              ))}
            </FooterColumn>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-6 py-6 text-sm text-slate-400 sm:px-10 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Altair. All rights reserved.</span>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-slate-500">Built for practical learning.</span>
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
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white">
        {title}
      </h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({
  children,
  href,
  description,
}: {
  children: ReactNode;
  href: string;
  description?: string;
}) {
  return (
    <li className="relative">
      <a
        href={href}
        className="group inline-flex text-sm leading-6 text-slate-400 transition hover:text-white focus-visible:text-white focus-visible:outline-none"
      >
        {children}
        {description ? (
          <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-3 w-72 translate-y-1 rounded-md border border-white/10 bg-[#11182A] p-4 text-left text-xs leading-5 text-slate-300 opacity-0 shadow-2xl shadow-black/40 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            {description}
          </span>
        ) : null}
      </a>
    </li>
  );
}
