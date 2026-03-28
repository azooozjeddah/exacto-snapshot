import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import diningImg from "@/assets/dining.jpg";
import workspaceImg from "@/assets/workspace.jpg";
import relaxationImg from "@/assets/relaxation.jpg";

const defaultExperiences = [
  {
    image: diningImg,
    title: "تجربة مميزة لتذوق الطعام",
    description: "مطاعم ومقاهي عالمية المستوى توفر أجواء راقية وتجربة طعام استثنائية تجمع بين النكهات المحلية والعالمية",
  },
  {
    image: workspaceImg,
    title: "بيئة عمل فريدة",
    description: "مساحات مكتبية مرنة ومجهزة بأحدث التقنيات، مصممة لتعزيز الإنتاجية والإبداع في بيئة عمل ملهمة",
  },
  {
    image: relaxationImg,
    title: "ملاذ للاستجمام",
    description: "مناطق استرخاء ورفاهية مصممة لتوفير تجربة فريدة من الراحة والهدوء بعيداً عن صخب الحياة اليومية",
  },
];

const ExperienceSection = () => {
  const [experiences, setExperiences] = useState(defaultExperiences);

  useEffect(() => {
    supabase.from('gallery_photos').select('*').like('category', 'experience_%').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setExperiences(data.map((p, i) => ({
            image: p.url,
            title: p.alt_text_ar || defaultExperiences[i]?.title || `تجربة ${i + 1}`,
            description: p.alt_text_en || defaultExperiences[i]?.description || '',
          })));
        }
      });
  }, []);

  return (
    <section id="experience" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">
            التجربة
          </h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            أسلوب حياة فاخر يجمع بين العمل والترفيه والاستجمام
          </p>
        </div>

        <div className="space-y-20">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
            >
              <div className="w-full md:w-1/2 overflow-hidden rounded-lg glow-gold">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-72 md:h-96 object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  width={1280}
                  height={720}
                />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  {exp.title}
                </h3>
                <div className="w-16 h-0.5 bg-primary" />
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
