import { useState } from "react";
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
        <div className="hidden md:flex items-center gap-8 text-sm font-body text-[#D4AF37]">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[#FFD700] transition-colors">
              {link.label}
            </a>
          ))}
          <a href="#contact" className="text-[#FFD700] hover:text-white transition-colors bg-primary/10 border border-[#FFD700] px-5 py-2 rounded-sm">تواصل معنا</a>
        </div>

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
