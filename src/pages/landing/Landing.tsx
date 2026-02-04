/*
 * @file Landing
 *
 * Public presentation page for Altaïr.
 * Route: /
 */

import Footer from "@/components/Footer";

import HeroSection from "./HeroSection";
import ExplorerSection from "./ExplorerSection";
import LabShowcaseSection from "./LabShowcaseSection";
import StarpathSection from "./StarpathSection";
import FutureSection from "./FutureSection";
import GamificationTeaser from "./GamificationTeaser";
import TeamSection from "./TeamSection";

import bgImg from "@/assets/banniere.png";

export default function Landing() {
  return (
    <div
      className="relative text-white overflow-x-hidden min-h-screen"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Explorer — présentation simple */}
      <ExplorerSection />

      {/* 3. Démo concrète d’un lab */}

      <LabShowcaseSection />


      {/* 4. Showcase du Starpath */}
      <StarpathSection />


      {/* 5. Roadmap */}
      <FutureSection />

      {/* 6. Gamification teaser */}
      <GamificationTeaser />

      {/* 7. Équipe */}
      <TeamSection />

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
