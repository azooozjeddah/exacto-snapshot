import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Phone, MapPin, Layout, Info, FileText } from 'lucide-react';

interface SettingsMap {
  [key: string]: { value_ar: string; value_en: string };
}

const tabs = [
  {
    id: 'contact',
    label: 'معلومات الاتصال',
    icon: Phone,
    fields: [
      { key: 'whatsapp_number', label: 'رقم الواتساب', type: 'text', dir: 'ltr' },
      { key: 'email', label: 'البريد الإلكتروني', type: 'text', dir: 'ltr' },
      { key: 'phone_number', label: 'رقم الهاتف', type: 'text', dir: 'ltr' },
    ],
  },
  {
    id: 'map',
    label: 'الموقع الجغرافي',
    icon: MapPin,
    fields: [
      { key: 'map_lat', label: 'خط العرض (Latitude)', type: 'text', dir: 'ltr' },
      { key: 'map_lng', label: 'خط الطول (Longitude)', type: 'text', dir: 'ltr' },
      { key: 'map_address', label: 'عنوان الموقع بالعربية', type: 'text', lang: 'ar' },
      { key: 'map_address', label: 'عنوان الموقع بالإنجليزية', type: 'text', lang: 'en' },
    ],
  },
  {
    id: 'hero',
    label: 'الصفحة الرئيسية',
    icon: Layout,
    fields: [
      { key: 'hero_title', label: 'عنوان البطل بالعربية', type: 'text', lang: 'ar' },
      { key: 'hero_title', label: 'عنوان البطل بالإنجليزية', type: 'text', lang: 'en' },
      { key: 'hero_subtitle', label: 'النص الفرعي بالعربية', type: 'textarea', lang: 'ar' },
      { key: 'hero_subtitle', label: 'النص الفرعي بالإنجليزية', type: 'textarea', lang: 'en' },
    ],
  },
  {
    id: 'about',
    label: 'عن المشروع',
    icon: Info,
    fields: [
      { key: 'about_description', label: 'وصف المشروع بالعربية', type: 'textarea-lg', lang: 'ar' },
      { key: 'about_description', label: 'وصف المشروع بالإنجليزية', type: 'textarea-lg', lang: 'en' },
    ],
  },
  {
    id: 'footer',
    label: 'التذييل',
    icon: FileText,
    fields: [
      { key: 'copyright_text', label: 'نص حقوق النشر بالعربية', type: 'text', lang: 'ar' },
      { key: 'copyright_text', label: 'نص حقوق النشر بالإنجليزية', type: 'text', lang: 'en' },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) {
      toast({ title: 'خطأ', description: 'فشل في تحميل الإعدادات', variant: 'destructive' });
      setLoading(false);
      return;
    }
    const map: SettingsMap = {};
    data?.forEach((row) => {
      map[row.setting_key] = { value_ar: row.value_ar || '', value_en: row.value_en || '' };
    });
    setSettings(map);
    setLoading(false);
  };

  const getValue = (key: string, lang?: string, dir?: string) => {
    if (dir === 'ltr' || (!lang && !dir)) return settings[key]?.value_en || settings[key]?.value_ar || '';
    return lang === 'en' ? (settings[key]?.value_en || '') : (settings[key]?.value_ar || '');
  };

  const setValue = (key: string, value: string, lang?: string, dir?: string) => {
    setSettings((prev) => {
      const existing = prev[key] || { value_ar: '', value_en: '' };
      if (dir === 'ltr' || (!lang && !dir)) {
        return { ...prev, [key]: { ...existing, value_en: value, value_ar: value } };
      }
      if (lang === 'en') return { ...prev, [key]: { ...existing, value_en: value } };
      return { ...prev, [key]: { ...existing, value_ar: value } };
    });
  };

  const saveTab = async (tabId: string) => {
    setSaving(true);
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const uniqueKeys = [...new Set(tab.fields.map((f) => f.key))];
    const upserts = uniqueKeys.map((key) => ({
      setting_key: key,
      value_ar: settings[key]?.value_ar || '',
      value_en: settings[key]?.value_en || '',
      setting_group: tabId,
      setting_type: 'text' as const,
    }));

    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'setting_key' });

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في حفظ الإعدادات', variant: 'destructive' });
    } else {
      toast({ title: 'تم الحفظ', description: 'تم حفظ الإعدادات بنجاح ✓' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">الإعدادات العامة</h1>

      <Tabs defaultValue="contact" dir="rtl">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6 flex-wrap h-auto gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white rounded-lg gap-2 text-gray-600"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              {tab.fields.map((field, idx) => (
                <div key={`${field.key}-${idx}`} className="space-y-2">
                  <Label className="text-gray-700 text-sm font-medium">{field.label}</Label>
                  {field.type === 'textarea' || field.type === 'textarea-lg' ? (
                    <Textarea
                      value={getValue(field.key, field.lang, field.dir)}
                      onChange={(e) => setValue(field.key, e.target.value, field.lang, field.dir)}
                      className={`bg-gray-50 border-gray-200 text-gray-900 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 ${field.type === 'textarea-lg' ? 'min-h-[160px]' : 'min-h-[100px]'}`}
                      dir={field.lang === 'en' || field.dir === 'ltr' ? 'ltr' : 'rtl'}
                    />
                  ) : (
                    <Input
                      value={getValue(field.key, field.lang, field.dir)}
                      onChange={(e) => setValue(field.key, e.target.value, field.lang, field.dir)}
                      className="bg-gray-50 border-gray-200 text-gray-900 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 h-11"
                      dir={field.lang === 'en' || field.dir === 'ltr' ? 'ltr' : 'rtl'}
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-100">
                <Button
                  onClick={() => saveTab(tab.id)}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#C4A030] text-white"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
