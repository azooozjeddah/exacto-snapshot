import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
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
      <ExperienceSection />
      <LocationSection />
      <PartnersSection />
      <DeveloperSection />
      <FooterSection />
    </main>
  );
};

export default Index;
