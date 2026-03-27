import { useState } from "react";
import { Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const businessTypes = ["مطعم / مقهى", "مكتب", "محل تجاري", "أخرى"];

const ContactFormSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", business: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "يرجى تعبئة الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSending(true);

    const text = encodeURIComponent(
      `🏢 طلب حجز وحدة\n\nالاسم: ${form.name}\nالجوال: ${form.phone}\nنوع النشاط: ${form.business || "غير محدد"}\nالرسالة: ${form.message || "لا يوجد"}`
    );
    window.open(`https://wa.me/966555610198?text=${text}`, "_blank");

    toast({ title: "تم إرسال طلبك بنجاح ✓" });
    setForm({ name: "", phone: "", business: "", message: "" });
    setSending(false);
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Operating Hours */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-8 py-4 glow-gold">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <p className="text-foreground font-bold text-lg">ساعات العمل</p>
              <p className="text-muted-foreground text-sm">يومياً من 8 صباحاً حتى 12 منتصف الليل</p>
              <p className="text-muted-foreground text-xs">Daily from 8 AM to 12 AM</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">
            احجز وحدتك الآن
          </h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            تواصل معنا لحجز وحدتك التجارية في The View Avenue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-primary/30 rounded-2xl p-8 md:p-12 glow-gold space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">الاسم *</Label>
              <Input
                id="name"
                placeholder="أدخل اسمك الكامل"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={100}
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">رقم الجوال *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="05XXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength={15}
                className="bg-secondary border-border focus:border-primary"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">نوع النشاط</Label>
            <div className="flex flex-wrap gap-3">
              {businessTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, business: type })}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    form.business === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">رسالتك</Label>
            <Textarea
              id="message"
              placeholder="اكتب رسالتك أو استفسارك هنا..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={1000}
              className="bg-secondary border-border focus:border-primary min-h-[120px]"
            />
          </div>

          <Button
            type="submit"
            disabled={sending}
            className="w-full bg-gold-gradient text-primary-foreground font-bold text-lg py-6 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Send className="w-5 h-5 ml-2" />
            إرسال عبر واتساب
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactFormSection;
