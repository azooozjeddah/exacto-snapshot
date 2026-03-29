import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const defaultFacilities = [
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663383033257/mklqtCWrielPznkj.webp", title: "الواجهة الرئيسية", subtitle: "Main Facade" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663383033257/dAknYcCQLpneEHrU.webp", title: "المنظر الجوي", subtitle: "Aerial View" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663383033257/FhsyvhjJeuTChZtW.webp", title: "الساحة والنوافير", subtitle: "Fountain Square" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663383033257/ZyFBSigFcnCrXiLZ.webp", title: "البلازا المفتوحة", subtitle: "Open Plaza" },
  { src: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663383033257/pgEdBwTDFJeSUNug.webp", title: "الممشى المائي", subtitle: "Water Walkway" },
];

const FacilitiesSection = () => {
  const [facilities, setFacilities] = useState(defaultFacilities);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('category', 'project_tour')
        .eq('is_active', true)
        .order('sort_order');

      console.log('[project_tour] fetched photos', data, error);
      if (data && data.length > 0) {
        setFacilities(data.map((p) => ({
          src: p.url,
          title: p.alt_text_ar || '',
          subtitle: p.alt_text_en || '',
        })));
      } else {
        setFacilities(defaultFacilities);
      }
    };
    fetchFacilities();

    const channel = supabase.channel('tour-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, fetchFacilities)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <>
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">
              جولة في المشروع
            </h2>
            <div className="section-divider w-24 mx-auto mb-6" />
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              اكتشف مرافق المشروع الفاخرة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((item, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className={`group relative overflow-hidden rounded-xl border border-border glow-gold cursor-pointer ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  style={{ minHeight: i === 0 ? "400px" : "240px" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="text-right w-full">
                    <p className="text-foreground font-bold text-lg">{item.title}</p>
                    <p className="text-primary text-sm">{item.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} className="absolute top-6 right-6 text-foreground/70 hover:text-foreground transition-colors"><X className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i !== null ? (i - 1 + facilities.length) % facilities.length : null)); }} className="absolute left-4 text-foreground/70 hover:text-foreground transition-colors"><ChevronLeft className="w-10 h-10" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i !== null ? (i + 1) % facilities.length : null)); }} className="absolute right-4 text-foreground/70 hover:text-foreground transition-colors"><ChevronRight className="w-10 h-10" /></button>
          <div className="text-center">
            <img src={facilities[lightbox].src} alt={facilities[lightbox].title} className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            <p className="text-foreground mt-4 font-bold">{facilities[lightbox].title}</p>
            <p className="text-primary text-sm">{facilities[lightbox].subtitle}</p>
          </div>
          <div className="absolute bottom-6 text-foreground/50 text-sm">{lightbox + 1} / {facilities.length}</div>
        </div>
      )}
    </>
  );
};

export default FacilitiesSection;
