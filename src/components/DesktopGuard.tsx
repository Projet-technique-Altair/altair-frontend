// src/components/DesktopGuard.tsx

/**
 * @file Viewport guard component enforcing desktop-only access in Altair.
 *
 * @remarks
 * The `DesktopGuard` component ensures that Altair’s interface is only accessible
 * on desktop-sized screens. It checks the browser window width dynamically and
 * prevents rendering of main routes when the viewport is below the minimum
 * desktop threshold.
 *
 * On smaller devices, it displays a branded warning screen with Altair’s
 * logo, title, and background assets, maintaining full design consistency
 * while clearly indicating desktop-only availability.
 *
 * @packageDocumentation
 */
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import bgImg from "@/assets/banniere.png";
import logoImg from "@/assets/logo.png";
import titleImg from "@/assets/titre.png";


/** Minimum screen width required to enable desktop layout. */
const MIN_DESKTOP_WIDTH = 1280; // bloque tablettes


/**
 * Guards Altair routes to restrict access to desktop devices only.
 *
 * @remarks
 * Features:
 * - Dynamic viewport detection on resize
 * - Branded warning overlay for non-desktop users
 * - Graceful handling of background and assets
 * - Automatically re-renders when the window is resized
 *
 * Returns an `<Outlet />` when the viewport width meets the minimum requirement,
 * otherwise displays a full-screen message overlay.
 *
 * @returns A React JSX element rendering either the main app content or the desktop warning screen.
 *
 * @public
 */
export default function DesktopGuard() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MIN_DESKTOP_WIDTH);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isDesktop) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center text-white bg-[#0B0D1A]"
        style={{ backgroundImage: `url(${bgImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-[#0B0D1A]/85 backdrop-blur-[1px]" />
        <div className="relative z-10 flex flex-col items-center select-none">
          <img
            src={logoImg}
            alt="Altair logo"
            className="h-24 w-24 rounded-full ring-1 ring-white/10 shadow-[0_0_40px_rgba(122,44,243,0.45)]"
          />
          <img
            src={titleImg}
            alt="Altair"
            className="mt-4 h-8 object-contain opacity-90 drop-shadow-[0_0_18px_rgba(122,44,243,0.5)]"
          />
          <div className="mt-6 text-center text-base font-medium text-red-300 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10">
            ⚠️ Only available on PC
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
