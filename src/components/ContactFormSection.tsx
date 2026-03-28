import { useState } from "react";
import { Send, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";

const sendMethods = [
  { value: "whatsapp", label: "إرسال عبر واتساب", labelEn: "Send via WhatsApp", icon: "💬" },
  { value: "system", label: "إرسال للنظام", labelEn: "Send to Inbox", icon: "📥" },
];

const ContactFormSection = () => {
  const { toast } = useToast();
  const { get } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", sendMethod: "" });
  const [sending, setSending] = useState(false);

  const whatsapp = get('whatsapp_number') || '966555610198';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim() || !form.sendMethod) {
      toast({ title: "يرجى تعبئة جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setSending(true);

    if (form.sendMethod === "whatsapp") {
      const text = encodeURIComponent(
        `📩 استفسار جديد\n\nالاسم: ${form.name}\nالبريد: ${form.email}\nالموضوع: ${form.subject}\nالرسالة: ${form.message}`
      );
      window.open(`https://wa.me/${whatsapp}?text=${text}`, "_blank");
      // Also save to DB
      await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        send_method: "whatsapp",
      });
      toast({ title: "تم إرسال استفسارك بنجاح عبر واتساب ✓" });
    } else {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        send_method: "system",
      });
      if (error) {
        toast({ title: "حدث خطأ في إرسال الرسالة", variant: "destructive" });
        setSending(false);
        return;
      }
      toast({ title: "تم إرسال رسالتك بنجاح وسيتم الرد عليك قريباً ✓" });
    }

    setForm({ name: "", email: "", subject: "", message: "", sendMethod: "" });
    setSending(false);
  };

  return (
    <section id="contact" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
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

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gold-gradient mb-4">تواصل معنا</h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            أرسل استفسارك وسنرد عليك في أقرب وقت
            <br />
            <span className="text-sm">Send your inquiry and we'll respond soon</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-primary/30 rounded-2xl p-8 md:p-12 glow-gold space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="c-name" className="text-foreground">الاسم / Name *</Label>
              <Input id="c-name" placeholder="أدخل اسمك الكامل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="bg-secondary border-border focus:border-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email" className="text-foreground">البريد الإلكتروني / Email *</Label>
              <Input id="c-email" type="email" placeholder="example@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} className="bg-secondary border-border focus:border-primary" dir="ltr" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-subject" className="text-foreground">الموضوع / Subject *</Label>
            <Input id="c-subject" placeholder="موضوع الاستفسار" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} className="bg-secondary border-border focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-message" className="text-foreground">الرسالة / Message *</Label>
            <Textarea id="c-message" placeholder="اكتب رسالتك أو استفسارك هنا..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} className="bg-secondary border-border focus:border-primary min-h-[120px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">طريقة الإرسال / Send Method *</Label>
            <div className="flex flex-wrap gap-3">
              {sendMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setForm({ ...form, sendMethod: method.value })}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm transition-all ${
                    form.sendMethod === method.value
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "bg-secondary text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg">{method.icon}</span>
                  <div className="text-right">
                    <p className="font-medium">{method.label}</p>
                    <p className="text-xs opacity-75">{method.labelEn}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={sending} className="w-full bg-gold-gradient text-primary-foreground font-bold text-lg py-6 rounded-xl hover:opacity-90 transition-opacity">
            <Send className="w-5 h-5 ml-2" />
            {form.sendMethod === "whatsapp" ? "إرسال عبر واتساب" : form.sendMethod === "system" ? "إرسال للنظام" : "إرسال / Send"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactFormSection;
