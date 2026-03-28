import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Layers, Maximize, MapPin } from "lucide-react";

const defaultStats = [
  { icon: Building2, value: "+22", label: "وحدات تجارية", sublabel: "Commercial Units" },
  { icon: Layers, value: "3", label: "طوابق", sublabel: "Floors" },
  { icon: Maximize, value: "4,000", label: "م² مساحة المشروع", sublabel: "Project Area" },
];

const StatsSection = () => {
  const [stats, setStats] = useState(defaultStats);

  const mapData = (data: any[]) => {
    const mapped = data.slice(0, 3).map((f) => ({
      icon: Building2,
      value: f.value || '',
      label: f.title_ar,
      sublabel: f.title_en || '',
    }));
    setStats(mapped);
  };

  useEffect(() => {
    supabase.from('project_features').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) mapData(data);
    });

    const channel = supabase.channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_features' }, () => {
        supabase.from('project_features').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
          if (data && data.length > 0) mapData(data);
          else setStats(defaultStats);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section className="py-16 px-4 relative -mt-20 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 text-center glow-gold hover:border-primary/50 transition-all duration-300">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-gold-gradient mb-1">{stat.value}</p>
              <p className="text-foreground font-semibold text-sm">{stat.label}</p>
              <p className="text-muted-foreground text-xs mt-1">{stat.sublabel}</p>
            </div>
          ))}
          <a href="https://maps.app.goo.gl/ndhpYT4uhi4D1Bh47" target="_blank" rel="noopener noreferrer" className="bg-card border border-border rounded-xl p-6 text-center glow-gold hover:border-primary/50 transition-all duration-300 group cursor-pointer">
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
