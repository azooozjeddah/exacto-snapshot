import { MapPin, Navigation, Building2 } from "lucide-react";

const LocationSection = () => {
  return (
    <section id="location" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">
            الموقع
          </h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            حي الفردوس، أبحر الشمالية، جدة — شارع الأمير نايف بن عبدالعزيز
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Map */}
          <div className="rounded-lg overflow-hidden border border-border glow-gold">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3000!2d39.1235!3d21.7423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sar!2ssa!4v1"
              width="100%"
              height="400"
              style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg) saturate(0.3) brightness(0.8)" }}
              allowFullScreen
              loading="lazy"
              title="موقع ذا فيو أفينيو - حي الفردوس، أبحر الشمالية"
            />
          </div>

          {/* Location details */}
          <div className="space-y-8" dir="rtl">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">The View Avenue</h3>
                <p className="text-muted-foreground leading-relaxed">
                  حي الفردوس، أبحر الشمالية، جدة
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">الشارع الرئيسي</h3>
                <p className="text-muted-foreground leading-relaxed">
                  شارع الأمير نايف بن عبدالعزيز
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">سهولة الوصول</h3>
                <p className="text-muted-foreground leading-relaxed">
                  محاط بشبكة طرق رئيسية تسهل الوصول من جميع أنحاء المدينة
                </p>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/ndhpYT4uhi4D1Bh47"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3 rounded-sm bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-bold tracking-wide"
            >
              <MapPin className="w-5 h-5" />
              احصل على الاتجاهات
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
