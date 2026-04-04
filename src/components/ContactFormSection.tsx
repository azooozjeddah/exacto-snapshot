import { useState } from "react";
import { Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";

const ContactFormSection = () => {
  const { toast } = useToast();
  const { get } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const whatsapp = get('whatsapp_number') || '966555610198';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast({ title: "يرجى تعبئة جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
     setSending(true);

    try {
      // Send email directly via Edge Function (primary method)
      const SUPABASE_URL = "https://epbqdwfbkwtsbnhvdtxv.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnFkd2Zia3d0c2JuaHZkdHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Mjg4MjcsImV4cCI6MjA5MDIwNDgyN30.KlWquEjTw6ozvA9rmVfV8bSWpIBxJ4JeJsvVQeyey2A";

      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Edge function error:", errText);
        throw new Error("Failed to send email");
      }

      // Also save to database (non-blocking, best effort)
      supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        send_method: "email",
      }).then(({ error }) => {
        if (error) console.warn("DB save failed (non-critical):", error.message);
      });

      toast({ title: "شكراً! تم استقبال رسالتك. سيتم الرد عليك قريباً ✓" });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      console.error("Submit error:", error);
      toast({ title: "حدث خطأ. يرجى المحاولة لاحقاً", variant: "destructive" });
    } finally {
      setSending(false);
    }
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
          <h2 className="text-3xl md:text-5xl font-bold text-[#C9A961] mb-4">تواصل معنا</h2>
          <div className="section-divider w-24 mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            أرسل استفسارك وسنرد عليك في أقرب وقت
            <br />
            <span className="text-sm">Send your inquiry and we'll respond soon</span>
          </p>
          <div className="mt-6 text-center">
            <p className="text-foreground text-lg font-semibold">رقم التواصل / Contact:</p>
            <p className="text-[#C9A961] text-2xl font-bold mt-2" dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>+966 555 610 198</p>
            <p className="text-muted-foreground text-sm mt-2" dir="ltr" style={{ direction: 'ltr' }}>Email: info@theviewavenue.net</p>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="c-phone" className="text-foreground">رقم الجوال / Phone</Label>
              <Input id="c-phone" type="tel" placeholder="+966 5XX XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} className="bg-secondary border-border focus:border-primary" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-subject" className="text-foreground">الموضوع / Subject *</Label>
              <Input id="c-subject" placeholder="موضوع الاستفسار" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} className="bg-secondary border-border focus:border-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-message" className="text-foreground">الرسالة / Message *</Label>
            <Textarea id="c-message" placeholder="اكتب رسالتك أو استفسارك هنا..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} className="bg-secondary border-border focus:border-primary min-h-[120px]" />
          </div>
          <Button type="submit" disabled={sending} className="w-full bg-[#C9A961] text-primary-foreground font-bold text-lg py-6 rounded-xl hover:opacity-90 transition-opacity">
            <Send className="w-5 h-5 ml-2" /> إرسال / Send
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactFormSection;
