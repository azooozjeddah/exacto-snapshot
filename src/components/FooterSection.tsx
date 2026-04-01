import logo from "@/assets/logo-luxury.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FooterSection = () => {
  const { get } = useSiteSettings();

  const copyright = get('copyright_text', 'ar') || `© ${new Date().getFullYear()} ذا فيو أفينيو — جميع الحقوق محفوظة`;

  return (
    <footer id="contact" className="py-20 px-4 bg-[#161618] border-t border-[#DBB155]/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <img src={logo} alt="The View Avenue" className="h-16 mb-6" />
            <p className="text-[#F5EEE0]/60 leading-relaxed text-lg max-w-md">
              ذا فيو أفينيو — للفخامة تعلو<br />
              وجهة تجارية فريدة تجمع بين الأناقة والعصرية في أبحر الشمالية بجدة، حيث تلتقي الفخامة بالابتكار.
            </p>
          </div>
          <div>
            <h4 className="text-[#DBB155] font-bold text-xl mb-6">روابط سريعة</h4>
            <ul className="space-y-4 text-[#F5EEE0]/70 text-base">
              <li><a href="#features" className="hover:text-[#DBB155] transition-colors">عن المشروع</a></li>
              <li><a href="#gallery" className="hover:text-[#DBB155] transition-colors">المميزات</a></li>
              <li><a href="#partners" className="hover:text-[#DBB155] transition-colors">المرافق</a></li>
              <li><a href="#location" className="hover:text-[#DBB155] transition-colors">الموقع</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#DBB155] font-bold text-xl mb-6">تواصل معنا</h4>
            <ul className="space-y-4 text-[#F5EEE0]/70 text-base">
              <li>أبحر الشمالية، حي القادسية، جدة</li>
              <li dir="ltr" className="text-right">+966 555 610 198</li>
              <li dir="ltr" className="text-right">theviewavenue.sa@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="w-full h-px bg-[#DBB155]/10 mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[#F5EEE0]/40 text-sm">
          <p>{copyright}</p>
          <div className="flex gap-6">
            <a href="/admin" className="hover:text-[#DBB155] transition-colors">لوحة التحكم</a>
            <a href="/accounting/login" className="hover:text-[#DBB155] transition-colors">النظام المحاسبي</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
