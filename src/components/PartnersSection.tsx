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
    const fetchTenants = () => {
      supabase.from('tenants').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
        if (data && data.length > 0) {
          setTenants(data.map((t) => ({
            nameAr: t.name_ar, name: t.name_en || '', description: t.description_ar || '',
            image: t.logo_url || '', isLogo: !!t.logo_url, type: t.type,
          })) as any);
          setFromDb(true);
        } else { setTenants(defaultTenants); setFromDb(false); }
      });
    };
    fetchTenants();

    const channel = supabase.channel('tenants-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' }, fetchTenants)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section id="partners" className="py-24 px-4 bg-[#161618]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[#DBB155] text-sm font-bold tracking-widest uppercase mb-4">المرافق</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F5EEE0] mb-6">عالم من الخيارات</h2>
          <div className="w-24 h-1 bg-[#DBB155] mx-auto mb-8" />
          <p className="text-[#F5EEE0]/60 text-lg max-w-2xl mx-auto font-light">مجموعة مختارة من أرقى العلامات التجارية والمطاعم والمقاهي التي تلبي تطلعاتكم</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {tenants.map((tenant: any, index) => (
            <div key={index} className="group bg-[#1c1c1e] border border-[#DBB155]/10 overflow-hidden shadow-2xl shadow-black/50 hover:border-[#DBB155]/40 transition-all duration-500">
              <div className="relative h-72 overflow-hidden">
                {tenant.image ? (
                  <img src={tenant.image} alt={tenant.nameAr} className={`w-full h-full transition-transform duration-1000 group-hover:scale-110 ${tenant.isLogo ? "object-contain p-12 bg-black/40" : "object-cover"}`} />
                ) : (
                  <div className="w-full h-full bg-[#1c1c1e] flex items-center justify-center">
                    <span className="text-6xl font-bold text-[#DBB155]/20">{tenant.nameAr?.[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent opacity-60" />
              </div>
              <div className="p-10 text-right" dir="rtl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-[#DBB155]">{tenant.nameAr}</h3>
                  {fromDb && tenant.type && <span className="text-[10px] font-bold text-[#DBB155] border border-[#DBB155]/30 px-3 py-1 uppercase tracking-widest">{typeLabels[tenant.type] || tenant.type}</span>}
                </div>
                {tenant.name && <p className="text-sm text-[#F5EEE0]/40 font-bold mb-6 tracking-widest uppercase" dir="ltr">{tenant.name}</p>}
                <p className="text-[#F5EEE0]/60 leading-relaxed text-lg font-light">{tenant.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
