import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo-transparent.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="The View Avenue"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="hero-overlay absolute inset-0" />

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-6 bg-gradient-to-b from-black/70 via-black/40 to-transparent" dir="rtl">
        <img src={logo} alt="The View Avenue Logo" className="h-16 md:h-24 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground">
          <a href="#features" className="hover:text-primary transition-colors duration-300">مميزات المشروع</a>
          <a href="#gallery" className="hover:text-primary transition-colors duration-300">معرض الصور</a>
          <a href="#experience" className="hover:text-primary transition-colors duration-300">التجربة</a>
          <a href="#location" className="hover:text-primary transition-colors duration-300">الموقع</a>
          <a href="#partners" className="hover:text-primary transition-colors duration-300">شركاء الجودة</a>
          <a href="#contact" className="text-primary font-bold hover:text-foreground transition-colors duration-300 bg-primary/10 border border-gold px-5 py-2 rounded-sm">تواصل معنا</a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-up">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-display font-bold tracking-[0.15em] mb-4">
            <span className="text-gold-gradient">THE VIEW AVENUE</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/60 font-light tracking-[0.3em] uppercase mb-2">
            للفخامة تعلو
          </p>
        </div>
        <div className="animate-fade-up animation-delay-600">
          <div className="section-divider w-32 mx-auto mb-10 mt-6" />
          <p className="text-foreground/70 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            وجهة تجارية فاخرة تتطلع إليها الأنظار في قلب مدينة جدة، تجمع بين التصميم العصري والفخامة الاستثنائية لتقدم تجربة تسوق وعمل وترفيه لا مثيل لها
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-gold rounded-full flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
