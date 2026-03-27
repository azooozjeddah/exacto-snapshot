import logo from "@/assets/logo-gold.png";
import { MessageCircle } from "lucide-react";

const FooterSection = () => {
  return (
    <footer id="contact" className="py-16 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <img src={logo} alt="The View Avenue" className="h-16 mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
            <p className="text-muted-foreground leading-relaxed text-sm">
              THE VIEW AVENUE — للفخامة تعلو
              <br />
              وجهة تجارية فاخرة في قلب جدة
            </p>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><a href="#features" className="hover:text-primary transition-colors">مميزات المشروع</a></li>
              <li><a href="#partners" className="hover:text-primary transition-colors">المحلات والمطاعم</a></li>
              <li><a href="#gallery" className="hover:text-primary transition-colors">معرض الصور</a></li>
              <li><a href="#experience" className="hover:text-primary transition-colors">التجربة</a></li>
              <li><a href="#location" className="hover:text-primary transition-colors">الموقع</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li>جدة، المملكة العربية السعودية</li>
              <li dir="ltr" className="text-left">info@theviewavenue.sa</li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <a
                  href="https://wa.me/966555610198"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                  dir="ltr"
                >
                  0555610198
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="section-divider w-full mb-8" />
        <div className="text-center text-muted-foreground text-xs">
          <p>© {new Date().getFullYear()} The View Avenue — جميع الحقوق محفوظة | تطوير شركة أسلوب حياة</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
