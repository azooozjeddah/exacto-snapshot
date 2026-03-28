import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { icons } from "lucide-react";
import { Building2, Car, Leaf, ShieldCheck, Zap, Wifi } from "lucide-react";

const defaultFeatures = [
  { icon: Building2, title: "تصميم معماري فريد", description: "واجهات زجاجية عصرية مع تشطيبات فاخرة تعكس الهوية المعمارية المتميزة" },
  { icon: Car, title: "مواقف سيارات ذكية", description: "مواقف سيارات متعددة الطوابق مع نظام ذكي لإدارة المواقف وشحن السيارات الكهربائية" },
  { icon: Zap, title: "بنية تحتية متطورة", description: "أنظمة طاقة وتكييف متقدمة مع حلول تقنية ذكية للمباني التجارية" },
  { icon: ShieldCheck, title: "أمن وسلامة", description: "أنظمة أمان ومراقبة على مدار الساعة مع أحدث تقنيات السلامة والحماية" },
  { icon: Leaf, title: "مساحات خضراء", description: "حدائق ومساحات خضراء مصممة بعناية لخلق بيئة عمل مريحة وصحية" },
  { icon: Wifi, title: "اتصال فائق السرعة", description: "بنية تحتية رقمية متكاملة مع شبكات إنترنت فائقة السرعة في جميع الوحدات" },
];

function DynIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons];
  return Icon ? <Icon className={className} /> : <Building2 className={className} />;
}

const FeaturesSection = () => {
  const [features, setFeatures] = useState(defaultFeatures);
  const [fromDb, setFromDb] = useState(false);

  const mapData = (data: any[]) => {
    setFeatures(data.map((f) => ({
      icon: Building2,
      iconName: f.icon || 'Building2',
      title: f.title_ar,
      description: f.description_ar || '',
    })) as any);
    setFromDb(true);
  };

  useEffect(() => {
    supabase.from('project_features').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) mapData(data);
    });

    const channel = supabase.channel('features-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_features' }, () => {
        supabase.from('project_features').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
          if (data && data.length > 0) mapData(data);
          else { setFeatures(defaultFeatures); setFromDb(false); }
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section id="features" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">مميزات المشروع</h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">معايير جديدة للتطوير التجاري الفاخر في قلب جدة</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature: any, index) => (
            <div key={index} className="group p-8 rounded-lg bg-card border border-border hover:border-gold transition-all duration-500 hover:glow-gold">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                {fromDb ? <DynIcon name={feature.iconName} className="w-7 h-7 text-primary" /> : <feature.icon className="w-7 h-7 text-primary" />}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
