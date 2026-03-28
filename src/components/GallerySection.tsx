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
    supabase.from('gallery_photos').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setImages(data.map((p) => ({ url: p.url, alt: p.alt_text_ar || 'The View Avenue' })));
      }
    });
  }, []);

  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <>
      <section id="gallery" className="py-24 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">معرض المشروع</h2>
            <div className="section-divider w-24 mx-auto mb-6" />
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">صور حقيقية من موقع المشروع</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <button key={i} onClick={() => setLightbox(i)} className={`overflow-hidden rounded-lg glow-gold cursor-pointer group ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" style={{ minHeight: i === 0 ? "320px" : "180px" }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-6 right-6 text-foreground/70 hover:text-foreground transition-colors"><X className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-foreground/70 hover:text-foreground transition-colors"><ChevronLeft className="w-10 h-10" /></button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-foreground/70 hover:text-foreground transition-colors"><ChevronRight className="w-10 h-10" /></button>
          <img src={images[lightbox].url} alt={images[lightbox].alt} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 text-foreground/50 text-sm">{lightbox + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
};

export default GallerySection;
