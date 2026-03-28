import { MapPin, Plane, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const LocationSection = () => {
  const { get } = useSiteSettings();

  const lat = get('map_lat') || '21.54';
  const lng = get('map_lng') || '39.15';
  const addressAr = get('map_address', 'ar') || 'يقع المشروع في موقع حيوي بقلب مدينة جدة، على مقربة من أهم المحاور والطرق الرئيسية';

  const mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59536.21!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3d01fb1137e59%3A0xe059579737b118db!2sJeddah%20Saudi%20Arabia!5e0!3m2!1sar!2ssa!4v1`;

  return (
    <section id="location" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">الموقع</h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">موقع استراتيجي في قلب مدينة جدة</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden border border-border glow-gold">
            <iframe src={mapSrc} width="100%" height="400" style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg) saturate(0.3) brightness(0.8)" }} allowFullScreen loading="lazy" title="موقع المشروع" />
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
