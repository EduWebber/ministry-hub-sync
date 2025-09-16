import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import Features from "@/components/Features";
import FAQSection from "@/components/FAQSection";
import Benefits from "@/components/Benefits";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import TestEnvVars from "@/components/TestEnvVars";
import SupabaseTest from "@/components/SupabaseTest";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <TestEnvVars />
      <SupabaseTest />
      <Header />
      <LandingHero />
      <Features />
      <FAQSection />
      <Benefits />
      <Footer />
      
      {/* CTA Flutuante */}
      <button
        className="floating-cta"
        onClick={() => window.location.href = '/auth'}
        aria-label={t('hero.getStarted')}
      >
        {t('navigation.getStarted')}
      </button>
    </div>
  );
};

export default Index;