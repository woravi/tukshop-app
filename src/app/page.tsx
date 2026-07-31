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
    <main className="min-h-screen bg-white text-black overflow-x-hidden selection:bg-black selection:text-white">
      {/* Studiofour Style Luxury Header & Nav */}
      <Navbar />

      {/* Hero Boutique Section */}
      <HeroSection />

      {/* Brand Partner Ticker & Realtime Stats */}
      <StatsTicker />

      {/* Digital Features Collection */}
      <FeaturesSection />

      {/* System Showcase & Product Grid */}
      <PortfolioSection />

      {/* Transparent Minimalist Pricing */}
      <PricingSection />

      {/* Editorial Customer Testimonials */}
      <TestimonialsSection />

      {/* Studiofour Final CTA & Footer */}
      <CtaFooter />
    </main>
  );
}
