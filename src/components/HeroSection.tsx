import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.jpg";

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
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <img src={logo} alt="The View Avenue Logo" className="h-12 md:h-16 rounded" />
        <div className="hidden md:flex items-center gap-8 text-sm font-body text-foreground/80">
          <a href="#features" className="hover:text-primary transition-colors">مميزات المشروع</a>
          <a href="#experience" className="hover:text-primary transition-colors">التجربة</a>
          <a href="#location" className="hover:text-primary transition-colors">الموقع</a>
          <a href="#partners" className="hover:text-primary transition-colors">شركاء الجودة</a>
          <a href="#contact" className="hover:text-primary transition-colors bg-primary/10 border border-gold px-5 py-2 rounded-sm">تواصل معنا</a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-up">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-wide mb-4" dir="ltr">
            <span className="text-gold-gradient">THE VIEW</span>
            <br />
            <span className="text-foreground">AVENUE</span>
          </h1>
        </div>
        <div className="animate-fade-up animation-delay-200">
          <p className="text-2xl md:text-3xl font-body text-primary mb-2">
            ذا فيو أفينيو
          </p>
        </div>
        <div className="animate-fade-up animation-delay-400">
          <p className="text-lg md:text-xl text-muted-foreground font-light mb-10">
            للفخامة تعلو
          </p>
        </div>
        <div className="animate-fade-up animation-delay-600">
          <div className="section-divider w-32 mx-auto mb-10" />
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
