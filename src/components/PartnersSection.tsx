const partners = [
  { name: "SWORD", color: "hsl(var(--gold))" },
  { name: "EXA", color: "hsl(var(--gold))" },
  { name: "الرابحي", color: "hsl(var(--gold))" },
  { name: "MAISON VILLA", color: "hsl(var(--gold))" },
];

const PartnersSection = () => {
  return (
    <section id="partners" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">
            شركاء الجودة
          </h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            نفخر بشراكتنا مع أفضل الشركات لتقديم أعلى معايير الجودة
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group flex items-center justify-center p-8 rounded-lg bg-card border border-border hover:border-gold transition-all duration-500 h-32"
            >
              <span className="text-xl md:text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
