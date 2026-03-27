import { UtensilsCrossed, Coffee, Briefcase, Baby } from "lucide-react";

const categories = [
  { name: "المطاعم", icon: UtensilsCrossed },
  { name: "المقاهي", icon: Coffee },
  { name: "المكاتب الإدارية", icon: Briefcase },
  { name: "منطقة ألعاب الأطفال", icon: Baby },
];

const PartnersSection = () => {
  return (
    <section id="partners" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">
            المحلات والمطاعم
          </h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            اكتشف مجموعة مختارة من أرقى العلامات التجارية والمطاعم والمقاهي في ذا فيو أفينيو.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="group flex flex-col items-center justify-center gap-4 p-8 rounded-lg bg-card border border-border hover:border-primary transition-all duration-500 h-40"
            >
              <cat.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-lg md:text-xl font-bold text-muted-foreground group-hover:text-primary transition-colors text-center">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
