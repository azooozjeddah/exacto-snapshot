import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo-transparent.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="The View Avenue"
        className="absolute inset-0 w-full h-full object-cover blur-[0.5px]"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="hero-overlay absolute inset-0" />

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-4 bg-black/65 backdrop-blur-[8px]" dir="rtl">
        <img src={logo} alt="The View Avenue Logo" className="h-14 md:h-20 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] ml-6" />
        <div className="hidden md:flex items-center gap-8 text-sm font-body text-[#D4AF37]">
          <a href="#features" className="hover:text-[#FFD700] transition-colors">مميزات المشروع</a>
          <a href="#partners" className="hover:text-[#FFD700] transition-colors">المحلات والمطاعم</a>
          <a href="#gallery" className="hover:text-[#FFD700] transition-colors">معرض الصور</a>
          <a href="#experience" className="hover:text-[#FFD700] transition-colors">التجربة</a>
          <a href="#location" className="hover:text-[#FFD700] transition-colors">الموقع</a>
          <a href="#contact" className="text-[#FFD700] hover:text-white transition-colors bg-primary/10 border border-[#FFD700] px-5 py-2 rounded-sm">تواصل معنا</a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-up">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-bold tracking-[0.25em] mb-8 leading-tight">
            <span className="text-white block">THE VIEW</span>
            <span className="text-primary block">AVENUE</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/60 font-light tracking-[0.35em] uppercase mb-2">
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
