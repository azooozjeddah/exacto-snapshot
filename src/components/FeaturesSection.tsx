import { MapPin, Waves, Building2, Coffee, ShieldCheck, Wifi } from "lucide-react";

const features = [
  { icon: Coffee, title: "فود كورت متكامل", description: "منطقة مطاعم فاخرة تضم أشهر العلامات التجارية العالمية والمحلية مع جلسات داخلية وخارجية" },
  { icon: Building2, title: "مكاتب إدارية", description: "مكاتب بتصاميم عصرية ومواصفات عالمية مجهزة بأحدث التقنيات لبيئة عمل مثالية" },
  { icon: MapPin, title: "محلات تجارية", description: "وحدات تجارية متنوعة المساحات بواجهات زجاجية أنيقة تناسب مختلف الأنشطة التجارية" },
  { icon: Waves, title: "نوافير ومسطحات مائية", description: "نوافير مائية وبحيرات صناعية تضفي أجواء من الهدوء والجمال على المساحات المفتوحة" },
  { icon: ShieldCheck, title: "أمن وحراسة", description: "نظام أمني متكامل على مدار الساعة مع كاميرات مراقبة وحراسة أمنية مدربة" },
  { icon: Wifi, title: "بنية تحتية ذكية", description: "بنية تحتية تقنية متطورة تشمل إنترنت عالي السرعة وأنظمة إدارة المباني الذكية" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4 bg-[#161618]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#DBB155] text-sm font-bold tracking-widest uppercase mb-4">المميزات</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F5EEE0] mb-6">تميّز بلا حدود</h2>
          <div className="w-24 h-1 bg-[#DBB155] mx-auto mb-8" />
          <p className="text-[#F5EEE0]/60 text-lg max-w-2xl mx-auto font-light">مميزات استثنائية تجعل من ذا فيو أفينيو الوجهة الأولى للاستثمار والتسوق في جدة</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-[#1c1c1e] border border-[#DBB155]/10 hover:border-[#DBB155]/40 transition-all duration-500 group text-center"
              dir="rtl"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-[#DBB155]/5 flex items-center justify-center group-hover:bg-[#DBB155]/10 transition-colors">
                <feature.icon className="w-8 h-8 text-[#DBB155]" />
              </div>
              <h3 className="text-xl font-bold text-[#F5EEE0] mb-4">{feature.title}</h3>
              <p className="text-[#F5EEE0]/60 text-sm leading-relaxed font-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
