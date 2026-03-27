import { Building2, Layers, Maximize, MapPin } from "lucide-react";

const stats = [
  { icon: Building2, value: "+22", label: "وحدات تجارية", sublabel: "Commercial Units" },
  { icon: Layers, value: "3", label: "طوابق", sublabel: "Floors" },
  { icon: Maximize, value: "4,000", label: "م² مساحة المشروع", sublabel: "Project Area" },
];

const StatsSection = () => {
  return (
    <section className="py-16 px-4 relative -mt-20 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 text-center glow-gold hover:border-primary/50 transition-all duration-300"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-gold-gradient mb-1">{stat.value}</p>
              <p className="text-foreground font-semibold text-sm">{stat.label}</p>
              <p className="text-muted-foreground text-xs mt-1">{stat.sublabel}</p>
            </div>
          ))}

          {/* Clickable location card */}
          <a
            href="https://maps.app.goo.gl/ndhpYT4uhi4D1Bh47"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card border border-border rounded-xl p-6 text-center glow-gold hover:border-primary/50 transition-all duration-300 group cursor-pointer"
          >
            <MapPin className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-lg md:text-xl font-bold text-gold-gradient mb-1">موقع مميز</p>
            <p className="text-foreground font-semibold text-sm">حي الفردوس، أبحر الشمالية</p>
            <p className="text-muted-foreground text-xs mt-1">Prime Location</p>
          </a>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
