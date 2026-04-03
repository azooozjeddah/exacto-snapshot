import { useState, useEffect } from "react";
import { useTypewriter } from "@/hooks/use-typewriter";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-luxury.png";

const navLinks: { href: string; label: string; external?: boolean }[] = [
  { href: "#features", label: "المميزات" },
  { href: "#partners", label: "المرافق" },
  { href: "#gallery", label: "جولة في المشروع" },
  { href: "#experience", label: "التجربة" },
  { href: "#location", label: "الموقع" },
];

const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroBg, setHeroBg] = useState('');
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

      if (data?.[0]?.url) setHeroBg(data[0].url);
      else setHeroBg('');
    };

    fetchHero();

    const channel = supabase.channel('hero-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, fetchHero)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const subtitleAr = get('hero_subtitle', 'ar') || 'وجهة تجارية فريدة تجمع بين الأناقة والعصرية في أبحر الشمالية بجدة، حيث تلتقي الفخامة بالابتكار';

  const { displayLine1, displayLine2, phase, hasLine2, colorSplitAt } = useTypewriter([
    { line1: "THE VIEW", line2: "AVENUE" },
    { line1: "ذا فيو أفينيو", colorSplitAt: 6 },
  ], { typeSpeed: 120, deleteSpeed: 70, holdTime: 3500 });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#161618]">
      {heroBg && <img src={heroBg} alt="The View Avenue" className="absolute inset-0 w-full h-full object-cover opacity-60" width={1920} height={1080} />}
      <div className="absolute inset-0 bg-black/40" />
      <div className="hero-overlay absolute inset-0" />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-4 bg-[#161618]/90 backdrop-blur-md border-b border-[#DBB155]/20" dir="rtl">
        <div className="flex items-center gap-4">
          <img src={logo} alt="The View Avenue Logo" className="h-12 md:h-16 ml-4 transition-all duration-300" />
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center gap-8 text-lg font-bold text-[#F5EEE0] mx-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[#DBB155] transition-colors duration-300">{link.label}</a>
          ))}
        </div>
        <a href="#contact" className="hidden md:block btn-luxury text-sm px-6 py-2">تواصل معنا</a>
        <button className="md:hidden text-[#DBB155] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#161618]/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8" dir="rtl">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-[#F5EEE0] text-2xl font-bold hover:text-[#DBB155] transition-colors" onClick={() => setMobileMenuOpen(false)}>{link.label}</a>
          ))}
          <a href="#contact" className="btn-luxury text-xl px-10 py-3 mt-4" onClick={() => setMobileMenuOpen(false)}>تواصل معنا</a>
        </div>
      )}

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-28 md:pt-32">
        <div className="animate-fade-in">
          <img src={logo} alt="The View Avenue Logo" className="h-24 md:h-44 mx-auto mb-6 transition-all duration-500 hover:scale-105" />
          <p className="text-[#DBB155] text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-4">أيقونة الرفاهية في جدة</p>
          <h1 className="font-bold mb-4 leading-tight min-h-[3.5rem] md:min-h-[5rem]">
            <span className="text-[#F5EEE0] block text-4xl md:text-5xl lg:text-6xl tracking-wider">
              {displayLine1}
              {(phase === "typing1" || phase === "deleting1") && <span className="inline-block w-[2px] h-[0.8em] bg-[#DBB155] ml-1 animate-pulse" />}
            </span>
          </h1>
          <p className="text-[#DBB155] text-xl md:text-2xl font-bold mb-8">للفخامة تعلو</p>
          <p className="text-[#F5EEE0]/80 max-w-2xl mx-auto leading-relaxed text-lg md:text-xl">{subtitleAr}</p>
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn-luxury w-full md:w-auto px-10 py-4">اكتشف المشروع</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="border border-[#DBB155] text-[#DBB155] hover:bg-[#DBB155]/10 transition-all px-10 py-4 w-full md:w-auto font-bold">تواصل معنا</a>
          </div>
        </div>
      </div>


    </section>
  );
};

export default HeroSection;
