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
    <section className="py-16 px-4 relative -mt-24 z-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#1c1c1e] border border-[#DBB155]/20 p-8 text-center shadow-2xl shadow-black/50 hover:border-[#DBB155]/50 transition-all duration-500">
              <stat.icon className="w-10 h-10 text-[#DBB155] mx-auto mb-4" />
              <p className="text-4xl md:text-5xl font-bold text-[#F5EEE0] mb-2">{stat.value}</p>
              <p className="text-[#DBB155] font-bold text-sm tracking-widest uppercase">{stat.label}</p>
              <p className="text-[#F5EEE0]/40 text-xs mt-2 font-light">{stat.sublabel}</p>
            </div>
          ))}
          <a href="https://maps.app.goo.gl/7mpnw297hrf2jHQt5" target="_blank" rel="noopener noreferrer" className="bg-[#1c1c1e] border border-[#DBB155]/20 p-8 text-center shadow-2xl shadow-black/50 hover:border-[#DBB155]/50 transition-all duration-500 group">
            <MapPin className="w-10 h-10 text-[#DBB155] mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-2xl md:text-3xl font-bold text-[#F5EEE0] mb-2">موقع مميز</p>
            <p className="text-[#DBB155] font-bold text-sm tracking-widest uppercase">أبحر الشمالية</p>
            <p className="text-[#F5EEE0]/40 text-xs mt-2 font-light">Prime Location</p>
          </a>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
