import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Globe, Home, Lightbulb } from 'lucide-react';

interface SeoMap { [key: string]: { value_ar: string; value_en: string } }

const seoTabs = [
  { id: 'home', label: 'الصفحة الرئيسية', icon: Home },
  { id: 'global', label: 'عام', icon: Globe },
];

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  return <span className={`text-xs ${over ? 'text-red-500 font-semibold' : len > max * 0.8 ? 'text-yellow-600' : 'text-green-600'}`}>{len}/{max}</span>;
}

function GooglePreview({ title, url, description }: { title: string; url: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1" dir="ltr">
      <p className="text-xs text-gray-400 mb-2 font-medium" dir="rtl">معاينة نتائج Google</p>
      <p className="text-lg text-[#1a0dab] font-normal leading-tight truncate">{title || 'عنوان الصفحة'}</p>
      <p className="text-sm text-[#006621] truncate">{url || 'https://example.com'}</p>
      <p className="text-sm text-[#545454] line-clamp-2">{description || 'وصف الصفحة سيظهر هنا...'}</p>
    </div>
  );
}

export default function AdminSeo() {
  const [data, setData] = useState<SeoMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: rows, error } = await supabase.from('site_settings').select('*').eq('setting_group', 'seo');
      if (error) { toast({ title: 'خطأ', description: 'فشل تحميل بيانات SEO', variant: 'destructive' }); setLoading(false); return; }
      const map: SeoMap = {};
      rows?.forEach((r) => { map[r.setting_key] = { value_ar: r.value_ar || '', value_en: r.value_en || '' }; });
      setData(map);
      setLoading(false);
    })();
  }, []);

  const get = (key: string, lang: 'ar' | 'en') => (lang === 'ar' ? data[key]?.value_ar : data[key]?.value_en) || '';
  const set = (key: string, lang: 'ar' | 'en', val: string) => {
    setData((p) => {
      const existing = p[key] || { value_ar: '', value_en: '' };
      return { ...p, [key]: { ...existing, [lang === 'ar' ? 'value_ar' : 'value_en']: val } };
    });
  };

  const saveAll = async () => {
    setSaving(true);
    const keys = Object.keys(data);
    const upserts = keys.map((key) => ({ setting_key: key, value_ar: data[key].value_ar, value_en: data[key].value_en, setting_group: 'seo', setting_type: 'text' }));
    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'setting_key' });
    if (error) toast({ title: 'خطأ', description: 'فشل الحفظ', variant: 'destructive' });
    else toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات SEO بنجاح ✓' });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>;

  const renderFields = (prefix: string) => (
    <div className="space-y-6">
      {/* Arabic SEO */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">SEO بالعربية</h3>
        <div className="space-y-2">
          <div className="flex justify-between"><Label className="text-gray-700 text-sm">عنوان الصفحة</Label><CharCount value={get(`${prefix}_title`, 'ar')} max={60} /></div>
          <Input value={get(`${prefix}_title`, 'ar')} onChange={(e) => set(`${prefix}_title`, 'ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between"><Label className="text-gray-700 text-sm">وصف الصفحة</Label><CharCount value={get(`${prefix}_desc`, 'ar')} max={160} /></div>
          <Textarea value={get(`${prefix}_desc`, 'ar')} onChange={(e) => set(`${prefix}_desc`, 'ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900 min-h-[80px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-700 text-sm">الكلمات المفتاحية (مفصولة بفواصل)</Label>
          <Input value={get(`${prefix}_keywords`, 'ar')} onChange={(e) => set(`${prefix}_keywords`, 'ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
        </div>
      </div>

      {/* English SEO */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">SEO بالإنجليزية</h3>
        <div className="space-y-2">
          <div className="flex justify-between"><Label className="text-gray-700 text-sm">Page Title</Label><CharCount value={get(`${prefix}_title`, 'en')} max={60} /></div>
          <Input value={get(`${prefix}_title`, 'en')} onChange={(e) => set(`${prefix}_title`, 'en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between"><Label className="text-gray-700 text-sm">Meta Description</Label><CharCount value={get(`${prefix}_desc`, 'en')} max={160} /></div>
          <Textarea value={get(`${prefix}_desc`, 'en')} onChange={(e) => set(`${prefix}_desc`, 'en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900 min-h-[80px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-700 text-sm">Keywords (comma separated)</Label>
          <Input value={get(`${prefix}_keywords`, 'en')} onChange={(e) => set(`${prefix}_keywords`, 'en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
        </div>
      </div>

      {/* Open Graph */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">Open Graph</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm">عنوان OG بالعربية</Label>
            <Input value={get(`${prefix}_og_title`, 'ar')} onChange={(e) => set(`${prefix}_og_title`, 'ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm">OG Title (English)</Label>
            <Input value={get(`${prefix}_og_title`, 'en')} onChange={(e) => set(`${prefix}_og_title`, 'en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm">وصف OG بالعربية</Label>
            <Textarea value={get(`${prefix}_og_desc`, 'ar')} onChange={(e) => set(`${prefix}_og_desc`, 'ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900 min-h-[60px]" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm">OG Description (English)</Label>
            <Textarea value={get(`${prefix}_og_desc`, 'en')} onChange={(e) => set(`${prefix}_og_desc`, 'en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900 min-h-[60px]" />
          </div>
        </div>
      </div>

      {/* Google Preview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-3">معاينة Google</h3>
        <div className="space-y-3">
          <GooglePreview title={get(`${prefix}_title`, 'ar')} url="theviewavenue.com" description={get(`${prefix}_desc`, 'ar')} />
          <GooglePreview title={get(`${prefix}_title`, 'en')} url="theviewavenue.com" description={get(`${prefix}_desc`, 'en')} />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">تحسين SEO</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="home" dir="rtl">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6 gap-1">
              {seoTabs.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white rounded-lg gap-2 text-gray-600">
                  <t.icon className="h-4 w-4" />{t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {seoTabs.map((t) => (
              <TabsContent key={t.id} value={t.id}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  {renderFields(`seo_${t.id}`)}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6">
            <Button onClick={saveAll} disabled={saving} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white px-8">
              {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
              حفظ جميع التغييرات
            </Button>
          </div>
        </div>

        {/* Tips sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-[#D4AF37]" />
              <h3 className="font-bold text-gray-900">نصائح SEO</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span>العنوان المثالي بين 50-60 حرف</li>
              <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span>الوصف المثالي بين 120-160 حرف</li>
              <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span>استخدم كلمات مفتاحية ذات صلة</li>
              <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span>لا تكرر نفس العنوان في صفحات مختلفة</li>
              <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span>OG مهم لمشاركة الروابط على السوشيال ميديا</li>
              <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span>Title tag is the #1 on-page SEO factor</li>
              <li className="flex gap-2"><span className="text-[#D4AF37] font-bold">•</span>Include your brand name at the end of the title</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
