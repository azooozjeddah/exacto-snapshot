import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import tenantUrban from "@/assets/tenant-urban.png";
import tenantChan from "@/assets/tenant-chan.jpg";

const defaultTenants = [
  { nameAr: "أوربان كافيه ومحمصة", name: "Urban Roastery & Coffee Bar", description: "تجربة استثنائية لعشاق القهوة المختصة، حيث يلتقي الشغف بالجودة في أجواء عصرية فاخرة.", image: tenantUrban, isLogo: true },
  { nameAr: "مطعم شان", name: "Chan Restaurant", description: "رحلة في أعماق المطبخ الآسيوي العريق، نقدم لك نكهات الصين واليابان وكوريا بلمسة فنية فريدة.", image: tenantChan, isLogo: false },
];

const typeLabels: Record<string, string> = { shop: 'محل تجاري', restaurant: 'مطعم', cafe: 'مقهى', office: 'مكتب', service: 'خدمات' };

const PartnersSection = () => {
  const [tenants, setTenants] = useState(defaultTenants);
  const [fromDb, setFromDb] = useState(false);

  useEffect(() => {
    supabase.from('tenants').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data && data.length > 0) {
        setTenants(data.map((t) => ({
          nameAr: t.name_ar,
          name: t.name_en || '',
          description: t.description_ar || '',
          image: t.logo_url || '',
          isLogo: !!t.logo_url,
          type: t.type,
        })) as any);
        setFromDb(true);
      }
    });
  }, []);

  return (
    <section id="partners" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">المحلات والمطاعم</h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">اكتشف مجموعة مختارة من أرقى العلامات التجارية والمطاعم والمقاهي في ذا فيو أفينيو.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tenants.map((tenant: any, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/60 transition-all duration-500">
              <div className="relative h-56 overflow-hidden">
                {tenant.image ? (
                  <img src={tenant.image} alt={tenant.nameAr} className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${tenant.isLogo ? "object-contain p-8 bg-black/80" : "object-cover"}`} />
                ) : (
                  <div className="w-full h-full bg-card flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary/30">{tenant.nameAr?.[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
              <div className="p-6 text-right" dir="rtl">
                <h3 className="text-xl font-bold text-primary mb-1">{tenant.nameAr}</h3>
                {tenant.name && <p className="text-sm text-primary/60 font-medium mb-3 tracking-wide" dir="ltr">{tenant.name}</p>}
                {fromDb && tenant.type && <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full mb-2 inline-block">{typeLabels[tenant.type] || tenant.type}</span>}
                <p className="text-muted-foreground leading-relaxed text-sm">{tenant.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
