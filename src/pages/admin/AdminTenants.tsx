import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Store, Upload, Search } from 'lucide-react';

interface Tenant {
  id: number;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  type: string;
  logo_url: string | null;
  logo_file_key: string | null;
  phone_number: string | null;
  website_url: string | null;
  menu_url: string | null;
  working_hours: string | null;
  floor_number: string | null;
  unit_number: string | null;
  sort_order: number;
  is_active: boolean;
}

const types = [
  { value: 'shop', label: 'محل تجاري' },
  { value: 'restaurant', label: 'مطعم' },
  { value: 'cafe', label: 'مقهى' },
  { value: 'office', label: 'مكتب' },
  { value: 'service', label: 'خدمات' },
];

const typeLabel = (v: string) => types.find((t) => t.value === v)?.label ?? v;

const emptyForm = {
  name_ar: '', name_en: '', type: 'shop', floor_number: '', unit_number: '',
  logo_url: '', logo_file_key: '', description_ar: '', description_en: '',
  phone_number: '', website_url: '', menu_url: '', working_hours: '',
  sort_order: 0, is_active: true,
};

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('tenants').select('*').order('sort_order');
    if (filter !== 'all') q = q.eq('type', filter);
    const { data, error } = await q;
    if (error) toast({ title: 'خطأ', description: 'فشل تحميل المستأجرين', variant: 'destructive' });
    else setTenants(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setLogoPreview(''); setDialogOpen(true); };

  const openEdit = (t: Tenant) => {
    setEditId(t.id);
    setForm({
      name_ar: t.name_ar, name_en: t.name_en || '', type: t.type,
      floor_number: t.floor_number || '', unit_number: t.unit_number || '',
      logo_url: t.logo_url || '', logo_file_key: t.logo_file_key || '',
      description_ar: t.description_ar || '', description_en: t.description_en || '',
      phone_number: t.phone_number || '', website_url: t.website_url || '',
      menu_url: t.menu_url || '', working_hours: t.working_hours || '',
      sort_order: t.sort_order, is_active: t.is_active,
    });
    setLogoPreview(t.logo_url || '');
    setDialogOpen(true);
  };

  const handleLogo = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `logos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) { toast({ title: 'خطأ', description: 'فشل رفع الشعار', variant: 'destructive' }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: urlData.publicUrl, logo_file_key: path }));
    setLogoPreview(urlData.publicUrl);
    setUploading(false);
  };

  const save = async () => {
    if (!form.name_ar.trim()) { toast({ title: 'تنبيه', description: 'الاسم بالعربية مطلوب', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = {
      name_ar: form.name_ar, name_en: form.name_en || null, type: form.type,
      floor_number: form.floor_number || null, unit_number: form.unit_number || null,
      logo_url: form.logo_url || null, logo_file_key: form.logo_file_key || null,
      description_ar: form.description_ar || null, description_en: form.description_en || null,
      phone_number: form.phone_number || null, website_url: form.website_url || null,
      menu_url: form.menu_url || null, working_hours: form.working_hours || null,
      sort_order: form.sort_order, is_active: form.is_active,
    };
    const { error } = editId
      ? await supabase.from('tenants').update(payload).eq('id', editId)
      : await supabase.from('tenants').insert(payload);
    if (error) toast({ title: 'خطأ', description: 'فشل الحفظ', variant: 'destructive' });
    else { toast({ title: 'تم', description: editId ? 'تم تعديل المستأجر ✓' : 'تمت إضافة المستأجر ✓' }); setDialogOpen(false); fetch(); }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const t = tenants.find((x) => x.id === deleteId);
    if (t?.logo_file_key) await supabase.storage.from('media').remove([t.logo_file_key]);
    const { error } = await supabase.from('tenants').delete().eq('id', deleteId);
    if (error) toast({ title: 'خطأ', description: 'فشل الحذف', variant: 'destructive' });
    else { toast({ title: 'تم', description: 'تم حذف المستأجر ✓' }); fetch(); }
    setDeleteId(null);
  };

  const f = (key: keyof typeof form, value: string | number | boolean) => setForm((prev) => ({ ...prev, [key]: value }));

  const filteredTenants = tenants.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.name_ar.toLowerCase().includes(q) || (t.name_en?.toLowerCase().includes(q));
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المستأجرون</h1>
          <p className="text-sm text-gray-500">{tenants.length} مستأجر</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث بالاسم..." className="w-[180px] bg-white border-gray-200 text-gray-700 pr-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200 text-gray-700"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {types.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
            <Plus className="h-4 w-4 ml-2" /> إضافة مستأجر
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <Store className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">لا يوجد مستأجرون بعد</p>
          <Button onClick={openAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white"><Plus className="h-4 w-4 ml-2" /> إضافة مستأجر جديد</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-right">الشعار</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الطابق</TableHead>
                <TableHead className="text-right">الوحدة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.logo_url ? (
                      <img src={t.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Store className="h-5 w-5 text-gray-400" /></div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{t.name_ar}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{typeLabel(t.type)}</Badge></TableCell>
                  <TableCell className="text-gray-600">{t.floor_number || '-'}</TableCell>
                  <TableCell className="text-gray-600">{t.unit_number || '-'}</TableCell>
                  <TableCell>
                    <Badge className={t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                      {t.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="h-4 w-4 text-gray-500" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeleteId(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? 'تعديل المستأجر' : 'إضافة مستأجر جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">الاسم بالعربية *</Label>
                  <Input value={form.name_ar} onChange={(e) => f('name_ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">الاسم بالإنجليزية</Label>
                  <Input value={form.name_en} onChange={(e) => f('name_en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">نوع النشاط</Label>
                  <Select value={form.type} onValueChange={(v) => f('type', v)}>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent>{types.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm">الطابق</Label>
                    <Input value={form.floor_number} onChange={(e) => f('floor_number', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 text-sm">الوحدة</Label>
                    <Input value={form.unit_number} onChange={(e) => f('unit_number', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">الشعار</h3>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#D4AF37] transition-colors"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                {uploading ? <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37] mx-auto" />
                  : logoPreview ? <img src={logoPreview} alt="" className="w-20 h-20 object-contain mx-auto rounded-lg" />
                  : <><Upload className="h-8 w-8 text-gray-400 mx-auto mb-1" /><p className="text-xs text-gray-500">انقر لرفع الشعار</p></>}
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])} />
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">الوصف</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">الوصف بالعربية</Label>
                  <Textarea value={form.description_ar} onChange={(e) => f('description_ar', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900 min-h-[80px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">الوصف بالإنجليزية</Label>
                  <Textarea value={form.description_en} onChange={(e) => f('description_en', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900 min-h-[80px]" />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">معلومات التواصل</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">رقم الهاتف</Label>
                  <Input value={form.phone_number} onChange={(e) => f('phone_number', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">رابط الموقع</Label>
                  <Input value={form.website_url} onChange={(e) => f('website_url', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">رابط قائمة الطعام</Label>
                  <Input value={form.menu_url} onChange={(e) => f('menu_url', e.target.value)} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">ساعات العمل</Label>
                  <Input value={form.working_hours} onChange={(e) => f('working_hours', e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
                </div>
              </div>
            </div>

            {/* Sort & Active */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <Label className="text-gray-700 text-sm">ترتيب العرض</Label>
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

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المستأجر</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا المستأجر؟ لا يمكن التراجع.</AlertDialogDescription>
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
