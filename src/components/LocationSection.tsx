import { MapPin, Plane, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const LocationSection = () => {
  const { get } = useSiteSettings();

  const addressAr = get('map_address', 'ar') || 'أبحر الشمالية، حي القادسية، شارع الأمير نايف، جدة';
  const mapsLink = 'https://www.google.com/maps/search/?api=1&query=The+View+Avenue&query_place_id=ChIJzybB-7ljwRURYPy2tBJXqSI';

  const mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3627.945678901234!2d39.114735!3d21.781122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sChIJzybB-7ljwRURYPy2tBJXqSI!2zVGhlIFZpZXcgQXZlbnVl!5e0!3m2!1sar!2ssa!4v1711800000000`;

  return (
    <section id="location" className="py-24 px-4 bg-[#161618]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#DBB155] text-sm font-bold tracking-widest uppercase mb-4">الموقع</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F5EEE0] mb-6">موقع استراتيجي</h2>
          <div className="w-24 h-1 bg-[#DBB155] mx-auto mb-8" />
          <p className="text-[#F5EEE0]/60 text-lg max-w-2xl mx-auto font-light">يتميز المشروع بموقعه الحيوي في أبحر الشمالية بجدة مع سهولة الوصول من جميع الاتجاهات</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-[#DBB155]/10 flex items-center justify-center flex-shrink-0"><MapPin className="w-7 h-7 text-[#DBB155]" /></div>
              <div>
                <h3 className="text-2xl font-bold text-[#F5EEE0] mb-3">العنوان</h3>
                <p className="text-[#F5EEE0]/70 text-lg leading-relaxed">{addressAr}</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-[#DBB155]/10 flex items-center justify-center flex-shrink-0"><Plane className="w-7 h-7 text-[#DBB155]" /></div>
              <div>
                <h3 className="text-2xl font-bold text-[#F5EEE0] mb-3">قربه من المطار</h3>
                <p className="text-[#F5EEE0]/70 text-lg leading-relaxed">على بعد دقائق من مطار الملك عبدالعزيز الدولي</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-[#DBB155]/10 flex items-center justify-center flex-shrink-0"><Clock className="w-7 h-7 text-[#DBB155]" /></div>
              <div>
                <h3 className="text-2xl font-bold text-[#F5EEE0] mb-3">ساعات العمل</h3>
                <p className="text-[#F5EEE0]/70 text-lg leading-relaxed">يومياً من 8 صباحاً حتى 12 منتصف الليل</p>
              </div>
            </div>
            <div className="pt-4">
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn-luxury inline-flex items-center gap-3 text-lg py-4 px-10">
                <span>افتح في خرائط جوجل</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="rounded-none overflow-hidden border border-[#DBB155]/20 shadow-2xl shadow-black/50">
              <iframe src={mapSrc} width="100%" height="500" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="موقع المشروع" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
