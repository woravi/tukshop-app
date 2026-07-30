import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsTicker from "@/components/StatsTicker";
import FeaturesSection from "@/components/FeaturesSection";
import PortfolioSection from "@/components/PortfolioSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CtaFooter from "@/components/CtaFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#CCFF00] selection:text-[#0A0A0A] overflow-x-hidden">
      {/* Floating Neo Navbar */}
      <Navbar />

      {/* Hero Section with Giant Typography & Text Reveal */}
      <HeroSection />

      {/* Realtime Stats & Neo Ticker */}
      <StatsTicker />

      {/* Features Section with Glassmorphism Cards & Staggered Motion */}
      <FeaturesSection />

      {/* Portfolio Showcase Section with Hover Zoom Effects */}
      <PortfolioSection />

      {/* Pricing Section with Neo Cards & Confetti */}
      <PricingSection />

      {/* Testimonials & Customer Reviews */}
      <TestimonialsSection />

      {/* Final Conversion CTA & Footnote */}
      <CtaFooter />
    </main>
  );
}
