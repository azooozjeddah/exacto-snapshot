import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import g1 from "@/assets/gallery-1.webp";
import g2 from "@/assets/gallery-2.webp";
import g3 from "@/assets/gallery-3.webp";
import g4 from "@/assets/gallery-4.webp";
import g5 from "@/assets/gallery-5.webp";
import g6 from "@/assets/gallery-6.webp";
import g7 from "@/assets/gallery-7.webp";
import g8 from "@/assets/gallery-8.webp";
import g9 from "@/assets/gallery-9.webp";
import g10 from "@/assets/gallery-10.webp";
import g11 from "@/assets/gallery-11.webp";
import g12 from "@/assets/gallery-12.webp";
import g13 from "@/assets/gallery-13.webp";

const images = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13];

const GallerySection = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <>
      <section id="gallery" className="py-24 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">
              معرض المشروع
            </h2>
            <div className="section-divider w-24 mx-auto mb-6" />
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              صور حقيقية من موقع المشروع
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className={`overflow-hidden rounded-lg glow-gold cursor-pointer group ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <img
                  src={src}
                  alt={`The View Avenue - صورة ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  style={{ minHeight: i === 0 ? "320px" : "180px" }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-6 right-6 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 text-foreground/70 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 text-foreground/70 hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <img
            src={images[lightbox]}
            alt={`The View Avenue - صورة ${lightbox + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 text-foreground/50 text-sm">
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;
