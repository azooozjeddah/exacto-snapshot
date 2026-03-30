import { MapPin, Plane, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const LocationSection = () => {
  const { get } = useSiteSettings();

  const lat = '21.781122';
  const lng = '39.114735';
  const addressAr = get('map_address', 'ar') || 'Prince Naif Rd, Al Firdous, Jeddah 23818, Saudi Arabia';
  const mapsLink = 'https://www.google.com/maps/search/?api=1&query=The+View+Avenue&query_place_id=ChIJzybB-7ljwRURYPy2tBJXqSI';

  const mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3627.945678901234!2d39.114735!3d21.781122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sChIJzybB-7ljwRURYPy2tBJXqSI!2zVGhlIFZpZXcgQXZlbnVl!5e0!3m2!1sar!2ssa!4v1711800000000`;

  return (
    <section id="location" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#C9A961] mb-4">الموقع</h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">موقع استراتيجي في قلب مدينة جدة</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="rounded-lg overflow-hidden border border-border glow-gold">
              <iframe src={mapSrc} width="100%" height="400" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="موقع المشروع" />
            </div>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#C9A961] hover:bg-[#B8985C] text-black font-bold py-4 px-6 rounded-lg text-center transition-colors duration-300 flex items-center justify-center gap-2">
              <span>افتح في خرائط جوجل</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-primary" /></div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">وجهة تتطلع إليها الأنظار</h3>
                <p className="text-muted-foreground leading-relaxed">{addressAr}</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Plane className="w-6 h-6 text-primary" /></div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">قربه من المطار</h3>
                <p className="text-muted-foreground leading-relaxed">على بعد دقائق من مطار الملك عبدالعزيز الدولي</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Clock className="w-6 h-6 text-primary" /></div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">سهولة الوصول</h3>
                <p className="text-muted-foreground leading-relaxed">محاط بشبكة طرق رئيسية تسهل الوصول من جميع أنحاء المدينة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
