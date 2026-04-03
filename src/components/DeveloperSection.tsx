const DeveloperSection = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-primary text-lg md:text-2xl tracking-widest uppercase mb-6 font-bold">الشركة المنفذة</p>
        <div className="mb-6 flex justify-center">
          <img src="/lifestyle-logo.png" alt="أسلوب حياة" className="h-20 md:h-24 filter brightness-0 invert" />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
          أسلوب حياة
        </h2>
        <p className="text-xl text-primary font-display mb-8" dir="ltr">LIFESTYLE</p>
        <div className="section-divider w-24 mx-auto mb-8" />
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
          هي شركة عائلية تأسست عام ٢٠٢٢ في مدينة جدة، تهتم ببناء عقارات تجارية ذات جودة عالية من الرفاهية، لتصبح أيقونة تتطلع إليها الأنظار، ترتقي بالتطوير التجاري إلى آفاق أوسع، وللتفرد والفخامة تصنع
        </p>
      </div>
    </section>
  );
};

export default DeveloperSection;
