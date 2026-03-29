import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2, Star as StarIcon, Search } from 'lucide-react';
import { icons, type LucideIcon } from 'lucide-react';

const iconList = [
  'Building2','Layers','Users','Car','Wifi','Shield','Star','Zap','MapPin','Clock',
  'Phone','Mail','Globe','Camera','Heart','Award','Target','TrendingUp','BarChart','Ruler',
  'Square','Home','Key','Lock','Sparkles','Crown','Gem','Diamond',
];

function DynIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons];
  return Icon ? <Icon className={className} /> : <StarIcon className={className} />;
}

interface Feature {
  id: number; title_ar: string; title_en: string | null; description_ar: string | null;
  description_en: string | null; icon: string | null; value: string | null;
  sort_order: number; is_active: boolean;
}

const emptyForm = { title_ar: '', title_en: '', description_ar: '', description_en: '', icon: 'Star', value: '', sort_order: 0, is_active: true };

export default function AdminFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [iconSearch, setIconSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('project_features').select('*').order('sort_order');
    if (error) toast({ title: 'خطأ', description: 'فشل تحميل الميزات', variant: 'destructive' });
    else setFeatures(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setIconSearch(''); setDialogOpen(true); };
  const openEdit = (f: Feature) => {
    setEditId(f.id);
    setForm({ title_ar: f.title_ar, title_en: f.title_en || '', description_ar: f.description_ar || '', description_en: f.description_en || '', icon: f.icon || 'Star', value: f.value || '', sort_order: f.sort_order, is_active: f.is_active });
    setIconSearch('');
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title_ar.trim()) { toast({ title: 'تنبيه', description: 'العنوان بالعربية مطلوب', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { title_ar: form.title_ar, title_en: form.title_en || null, description_ar: form.description_ar || null, description_en: form.description_en || null, icon: form.icon || null, value: form.value || null, sort_order: form.sort_order, is_active: form.is_active };
    const { error } = editId
      ? await supabase.from('project_features').update(payload).eq('id', editId)
      : await supabase.from('project_features').insert(payload);
    if (error) toast({ title: 'خطأ', description: 'فشل الحفظ', variant: 'destructive' });
    else { toast({ title: 'تم', description: editId ? 'تم تعديل الميزة ✓' : 'تمت إضافة الميزة ✓' }); setDialogOpen(false); fetchData(); }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('project_features').delete().eq('id', deleteId);
    if (error) toast({ title: 'خطأ', description: 'فشل الحذف', variant: 'destructive' });
    else { toast({ title: 'تم', description: 'تم حذف الميزة ✓' }); fetchData(); }
    setDeleteId(null);
  };

  const filteredIcons = iconSearch ? iconList.filter((i) => i.toLowerCase().includes(iconSearch.toLowerCase())) : iconList;
  const f = (key: keyof typeof form, val: string | number | boolean) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ميزات المشروع</h1>
          <p className="text-sm text-gray-500">{features.length} ميزة</p>
        </div>
        <Button onClick={openAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white"><Plus className="h-4 w-4 ml-2" /> إضافة ميزة</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
      ) : features.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <StarIcon className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">لا توجد ميزات بعد</p>
          <Button onClick={openAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white"><Plus className="h-4 w-4 ml-2" /> إضافة ميزة جديدة</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => (
            <div key={feat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                  <DynIcon name={feat.icon || 'Star'} className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <Badge className={feat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                  {feat.is_active ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{feat.title_ar}</h3>
              {feat.value && <p className="text-lg font-bold text-[#D4AF37] mb-2">{feat.value}</p>}
              {feat.description_ar && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{feat.description_ar}</p>}
              <div className="flex gap-1 mt-auto pt-3 border-t border-gray-50">
                <Button size="sm" variant="ghost" onClick={() => openEdit(feat)}><Pencil className="h-4 w-4 text-gray-500 ml-1" /> تعديل</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(feat.id)}><Trash2 className="h-4 w-4 text-red-500 ml-1" /> حذف</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? 'تعديل الميزة' : 'إضافة ميزة جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm">العنوان بالعربية *</Label>
                <Input value={form.title_ar} onChange={(e) => f('title_ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm">العنوان بالإنجليزية</Label>
                <Input value={form.title_en} onChange={(e) => f('title_en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">القيمة (مثل "4000 م²")</Label>
              <Input value={form.value} onChange={(e) => f('value', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">الوصف بالعربية</Label>
              <Textarea value={form.description_ar} onChange={(e) => f('description_ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900 min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">الوصف بالإنجليزية</Label>
              <Textarea value={form.description_en} onChange={(e) => f('description_en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900 min-h-[80px]" />
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">الأيقونة</Label>
              <div className="relative mb-2">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} placeholder="بحث..." className="bg-gray-50 border-gray-200 text-gray-900 pr-9" dir="ltr" />
              </div>
              <div className="grid grid-cols-7 gap-2 max-h-[160px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                {filteredIcons.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => f('icon', name)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${form.icon === name ? 'bg-[#D4AF37] text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                    title={name}
                  >
                    <DynIcon name={name} className="h-5 w-5" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">المحدد: {form.icon}</p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 text-sm">ترتيب</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => f('sort_order', parseInt(e.target.value) || 0)} className="w-20 bg-gray-50 border-gray-200 text-gray-900" dir="ltr" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-gray-700 text-sm">نشط</Label>
                <Switch checked={form.is_active} onCheckedChange={(v) => f('is_active', v)} />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button onClick={save} disabled={saving} className="flex-1 bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null} حفظ
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الميزة</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذه الميزة؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">حذف</AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
