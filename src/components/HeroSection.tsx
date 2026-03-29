import { useState, useEffect } from "react";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X } from "lucide-react";
import heroBgFallback from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo-transparent.png";

const navLinks: { href: string; label: string; external?: boolean }[] = [
  { href: "#features", label: "مميزات المشروع" },
  { href: "#partners", label: "المحلات والمطاعم" },
  { href: "#gallery", label: "معرض الصور" },
  { href: "#experience", label: "التجربة" },
  { href: "#location", label: "الموقع" },
];

const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroBg, setHeroBg] = useState(heroBgFallback);
  const { get } = useSiteSettings();

  useEffect(() => {
    const fetchHero = async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('url, category')
        .eq('category', 'hero')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1);

      console.log('[hero] fetched photos', data, error);
      if (data?.[0]?.url) setHeroBg(data[0].url);
      else setHeroBg(heroBgFallback);
    };

    fetchHero();

    const channel = supabase.channel('hero-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, fetchHero)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const subtitleAr = get('hero_subtitle', 'ar') || 'وجهة تجارية فاخرة تتطلع إليها الأنظار في قلب مدينة جدة، تجمع بين التصميم العصري والفخامة الاستثنائية لتقدم تجربة تسوق وعمل وترفيه لا مثيل لها';

  const { displayLine1, displayLine2, phase, hasLine2, colorSplitAt } = useTypewriter([
    { line1: "THE VIEW", line2: "AVENUE" },
    { line1: "ذا فيو أفينيو", colorSplitAt: 6 },
  ], { typeSpeed: 120, deleteSpeed: 70, holdTime: 3500 });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img src={heroBg} alt="The View Avenue" className="absolute inset-0 w-full h-full object-cover blur-[0.5px]" width={1920} height={1080} />
      <div className="absolute inset-0 bg-black/20" />
      <div className="hero-overlay absolute inset-0" />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-3 md:py-4 bg-black/80 backdrop-blur-[12px] border-b border-gold/20" dir="rtl">
        <img src={logo} alt="The View Avenue Logo" className="h-[50px] md:h-24 drop-shadow-[0_0_20px_rgba(201,169,97,0.5)] ml-4 md:ml-6 transition-all duration-300 hover:drop-shadow-[0_0_30px_rgba(201,169,97,0.7)]" />
        <div className="hidden md:flex flex-1 items-center justify-center gap-10 lg:gap-14 text-lg font-semibold font-body text-[#C9A961] mx-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="relative hover:text-[#E8D5B7] transition-colors duration-300 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#C9A961] after:transition-all after:duration-300 hover:after:w-full hover:drop-shadow-[0_0_8px_rgba(201,169,97,0.6)]">{link.label}</a>
          ))}
        </div>
        <a href="#contact" className="hidden md:block text-[#C9A961] text-lg font-semibold hover:text-white transition-all duration-300 bg-primary/5 border border-[#C9A961] px-6 py-2.5 rounded-sm whitespace-nowrap hover:bg-[#C9A961]/20 hover:drop-shadow-[0_0_10px_rgba(201,169,97,0.4)]">تواصل معنا</a>
        <button className="md:hidden text-[#C9A961] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-8" dir="rtl">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-[#C9A961] text-2xl font-body hover:text-[#E8D5B7] transition-colors tracking-wider" onClick={() => setMobileMenuOpen(false)}>{link.label}</a>
          ))}
          <a href="#contact" className="text-[#C9A961] text-xl border border-[#C9A961] px-8 py-3 rounded-sm hover:bg-[#C9A961]/20 transition-colors mt-4" onClick={() => setMobileMenuOpen(false)}>تواصل معنا</a>
        </div>
      )}

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-[120px] md:pt-[180px]">
        <div>
          <h1 className="font-display font-bold mb-8 leading-tight min-h-[4.5rem] md:min-h-[7rem] lg:min-h-[10rem]">
            {hasLine2 ? (
              <>
                <span className="hero-text-white block text-3xl md:text-5xl lg:text-7xl tracking-[0.15em] min-h-[1.2em]" style={{ color: '#F5F5F5' }}>
                  {displayLine1}
                  {(phase === "typing1" || phase === "deleting1") && <span className="inline-block w-[3px] h-[0.8em] bg-[#C9A961] ml-1 animate-pulse align-baseline" />}
                </span>
                <span className="hero-text-gold block text-3xl md:text-5xl lg:text-7xl tracking-[0.15em] min-h-[1.2em]" style={{ color: '#C9A961' }}>
                  {displayLine2}
                  {(phase === "typing2" || phase === "deleting2") && <span className="inline-block w-[3px] h-[0.8em] bg-[#C9A961] ml-1 animate-pulse align-baseline" />}
                </span>
              </>
            ) : (
              <span className="block text-4xl md:text-6xl lg:text-8xl tracking-[0.08em] min-h-[2.4em] flex items-center justify-center">
                <span className="hero-text-white" style={{ color: '#F5F5F5' }}>{displayLine1.slice(0, Math.min(colorSplitAt ?? displayLine1.length, displayLine1.length))}</span>
                <span className="hero-text-gold" style={{ color: '#C9A961' }}>{displayLine1.slice(colorSplitAt ?? displayLine1.length)}</span>
                {(phase === "typing1" || phase === "deleting1") && <span className="inline-block w-[3px] h-[0.8em] bg-[#C9A961] mr-1 animate-pulse align-baseline" />}
              </span>
            )}
          </h1>
          <p className="text-lg md:text-xl text-foreground/60 font-light tracking-[0.35em] uppercase mb-2">للفخامة تعلو</p>
        </div>
        <div className="animate-fade-up animation-delay-600">
          <div className="section-divider w-32 mx-auto mb-10 mt-6" />
          <p className="text-foreground/70 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">{subtitleAr}</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-gold rounded-full flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
