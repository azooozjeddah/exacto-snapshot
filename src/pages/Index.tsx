import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import GallerySection from "@/components/GallerySection";
import ExperienceSection from "@/components/ExperienceSection";
import LocationSection from "@/components/LocationSection";
import PartnersSection from "@/components/PartnersSection";
import DeveloperSection from "@/components/DeveloperSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <PartnersSection />
      <GallerySection />
      <ExperienceSection />
      <LocationSection />
      <DeveloperSection />
      <FooterSection />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/966555610198"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="تواصل عبر واتساب"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.35 22.616c-.392 1.104-1.942 2.02-3.178 2.288-.846.18-1.95.324-5.67-1.218-4.762-1.972-7.826-6.802-8.064-7.116-.23-.314-1.904-2.536-1.904-4.836s1.204-3.432 1.632-3.902c.428-.47.936-.588 1.248-.588.312 0 .624.002.898.016.288.014.674-.11 1.054.804.392.94 1.33 3.242 1.446 3.478.118.234.196.508.04.82-.158.314-.236.508-.47.784-.236.274-.496.614-.708.824-.236.236-.482.49-.208.962.274.47 1.22 2.012 2.62 3.262 1.8 1.608 3.316 2.106 3.786 2.34.47.234.744.196 1.018-.118.274-.314 1.176-1.372 1.49-1.842.314-.47.628-.392 1.058-.236.432.158 2.73 1.288 3.198 1.522.47.236.782.352.898.548.118.196.118 1.126-.274 2.228z"/>
        </svg>
      </a>
    </main>
  );
};

export default Index;
