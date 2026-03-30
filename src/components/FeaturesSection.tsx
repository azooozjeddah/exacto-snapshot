import { MapPin, Waves, Building2, Zap, TreePine, Sparkles } from "lucide-react";

const features = [
  { icon: MapPin, title: "موقع حيوي", description: "يقع في شارع الأمير نايف بأبحر الشمالية" },
  { icon: Waves, title: "قرب واجهة جدة", description: "يبعد 800 متر فقط عن واجهة جدة الساحلية" },
  { icon: Building2, title: "قرب برج جدة", description: "على بُعد 6 كيلومتر من برج جدة الشهير" },
  { icon: Zap, title: "شحن السيارات الكهربائية", description: "مواقف مخصصة وحديثة للسيارات الكهربائية" },
  { icon: TreePine, title: "حدائق وزراعة", description: "مساحات خضراء وأشجار طبيعية جميلة" },
  { icon: Sparkles, title: "مساحات خارجية أنيقة", description: "تصميم عصري وفاخر مع مناظر خلابة" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#C9A961] mb-4">مميزات المشروع</h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">معايير جديدة للتطوير التجاري الفاخر في قلب جدة</p>
        </div>
        <div className="flex flex-col gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-5 p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 group"
              dir="rtl"
            >
              <div className="w-14 h-14 min-w-[3.5rem] rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
