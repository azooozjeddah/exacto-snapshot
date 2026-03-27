import { useState } from "react";
import { useTypewriter } from "@/hooks/use-typewriter";
import { Menu, X } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo-transparent.png";

const navLinks = [
  { href: "#features", label: "مميزات المشروع" },
  { href: "#partners", label: "المحلات والمطاعم" },
  { href: "#gallery", label: "معرض الصور" },
  { href: "#experience", label: "التجربة" },
  { href: "#location", label: "الموقع" },
];

const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { displayLine1, displayLine2, phase, hasLine2, colorSplitAt } = useTypewriter([
    { line1: "THE VIEW", line2: "AVENUE" },
    { line1: "ذا فيو أفينيو", colorSplitAt: 6 },
  ], { typeSpeed: 120, deleteSpeed: 70, holdTime: 3500 });

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

      {/* Navbar - sticky */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-3 md:py-4 bg-black/65 backdrop-blur-[8px]" dir="rtl">
        <img src={logo} alt="The View Avenue Logo" className="h-[45px] md:h-20 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] ml-4 md:ml-6" />

        {/* Desktop links */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-10 lg:gap-14 text-lg font-semibold font-body text-[#D4AF37] mx-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative hover:text-[#FFD700] transition-colors duration-300 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#D4AF37] after:transition-all after:duration-300 hover:after:w-full hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]"
            >
              {link.label}
            </a>
          ))}
        </div>
        <a href="#contact" className="hidden md:block text-[#FFD700] text-lg font-semibold hover:text-white transition-colors bg-primary/10 border border-[#FFD700] px-6 py-2.5 rounded-sm whitespace-nowrap">تواصل معنا</a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#D4AF37] p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-8" dir="rtl">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#D4AF37] text-2xl font-body hover:text-[#FFD700] transition-colors tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="text-[#FFD700] text-xl border border-[#FFD700] px-8 py-3 rounded-sm hover:bg-[#D4AF37]/10 transition-colors mt-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            تواصل معنا
          </a>
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-[120px] md:pt-[180px]">
        <div>
          <h1 className="font-display font-bold mb-8 leading-tight min-h-[4.5rem] md:min-h-[7rem] lg:min-h-[10rem]">
            {hasLine2 ? (
              <>
                <span className="hero-text-white block text-3xl md:text-5xl lg:text-7xl tracking-[0.15em] min-h-[1.2em]" style={{ color: '#FFFFFF' }}>
                  {displayLine1}
                  {(phase === "typing1" || phase === "deleting1") && (
                    <span className="inline-block w-[3px] h-[0.8em] bg-[#D4AF37] ml-1 animate-pulse align-baseline" />
                  )}
                </span>
                <span className="hero-text-gold block text-3xl md:text-5xl lg:text-7xl tracking-[0.15em] min-h-[1.2em]" style={{ color: '#D4AF37' }}>
                  {displayLine2}
                  {(phase === "typing2" || phase === "deleting2") && (
                    <span className="inline-block w-[3px] h-[0.8em] bg-[#D4AF37] ml-1 animate-pulse align-baseline" />
                  )}
                </span>
              </>
            ) : (
              <span className="block text-2xl md:text-4xl lg:text-6xl tracking-[0.08em] min-h-[2.4em] flex items-center justify-center">
                <span className="hero-text-white" style={{ color: '#FFFFFF' }}>{displayLine1.slice(0, Math.min(colorSplitAt ?? displayLine1.length, displayLine1.length))}</span>
                <span className="hero-text-gold" style={{ color: '#D4AF37' }}>{displayLine1.slice(colorSplitAt ?? displayLine1.length)}</span>
                {(phase === "typing1" || phase === "deleting1") && (
                  <span className="inline-block w-[3px] h-[0.8em] bg-[#D4AF37] mr-1 animate-pulse align-baseline" />
                )}
              </span>
            )}
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
