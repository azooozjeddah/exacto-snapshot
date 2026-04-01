import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import g1 from "@/assets/gallery-new-1.jpg";
import g2 from "@/assets/gallery-new-2.jpg";
import g3 from "@/assets/gallery-new-3.jpg";
import g4 from "@/assets/gallery-new-4.jpg";
import g5 from "@/assets/gallery-new-5.jpg";
import g6 from "@/assets/gallery-new-6.jpg";
import g7 from "@/assets/gallery-new-7.jpg";
import g8 from "@/assets/gallery-new-8.jpg";
import g9 from "@/assets/gallery-new-9.jpg";
import g10 from "@/assets/gallery-new-10.jpg";
import g11 from "@/assets/gallery-new-11.jpg";
import g12 from "@/assets/gallery-new-13.jpg";

const defaultImages = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12].map((src, i) => ({
  url: src,
  alt: `The View Avenue - صورة ${i + 1}`,
}));

const GallerySection = () => {
  const [images, setImages] = useState(defaultImages);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('category', 'general')
        .eq('is_active', true)
        .order('sort_order');

      if (data && data.length > 0) {
        setImages(data.map((p) => ({ url: p.url, alt: p.alt_text_ar || 'The View Avenue' })));
      } else {
        setImages(defaultImages);
      }
    };
    fetchPhotos();

    const channel = supabase.channel('gallery-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_photos' }, fetchPhotos)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <>
      <section id="gallery" className="py-24 px-4 bg-[#161618]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#DBB155] text-sm font-bold tracking-widest uppercase mb-4">معرض الصور</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#F5EEE0] mb-6">جولة في المشروع</h2>
            <div className="w-24 h-1 bg-[#DBB155] mx-auto mb-8" />
            <p className="text-[#F5EEE0]/60 text-lg max-w-2xl mx-auto font-light">صور حقيقية وتخيلية تعكس جمال وتفاصيل ذا فيو أفينيو</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <button key={i} onClick={() => setLightbox(i)} className={`overflow-hidden border border-[#DBB155]/10 hover:border-[#DBB155]/40 cursor-pointer group transition-all duration-500 ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" style={{ minHeight: i === 0 ? "400px" : "200px" }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center backdrop-blur-sm" onClick={closeLightbox}>
          <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-8 right-8 text-[#DBB155] hover:text-[#F5EEE0] transition-colors"><X className="w-10 h-10" /></button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-6 text-[#DBB155] hover:text-[#F5EEE0] transition-colors"><ChevronLeft className="w-12 h-12" /></button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-6 text-[#DBB155] hover:text-[#F5EEE0] transition-colors"><ChevronRight className="w-12 h-12" /></button>
          <div className="relative p-4 max-w-5xl w-full">
            <img src={images[lightbox].url} alt={images[lightbox].alt} className="max-h-[80vh] w-full object-contain border border-[#DBB155]/20" onClick={(e) => e.stopPropagation()} />
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[#DBB155] font-bold tracking-widest">{lightbox + 1} / {images.length}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;
