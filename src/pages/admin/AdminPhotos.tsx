import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2, ImageIcon, Upload } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
  file_key: string | null;
  alt_text_ar: string | null;
  alt_text_en: string | null;
  category: string;
  sort_order: number;
  is_active: boolean;
}

const categories = [
  { value: 'general', label: 'عام' },
  { value: 'interior', label: 'داخلي' },
  { value: 'exterior', label: 'خارجي' },
  { value: 'night', label: 'ليلي' },
  { value: 'aerial', label: 'جوي' },
];

const catLabel = (v: string) => categories.find((c) => c.value === v)?.label ?? v;

const emptyForm = { url: '', file_key: '', alt_text_ar: '', alt_text_en: '', category: 'general', sort_order: 0, is_active: true };

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('gallery_photos').select('*').order('sort_order');
    if (filter !== 'all') q = q.eq('category', filter);
    const { data, error } = await q;
    if (error) toast({ title: 'خطأ', description: 'فشل تحميل الصور', variant: 'destructive' });
    else setPhotos(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setPreviewUrl(''); setDialogOpen(true); };

  const openEdit = (p: Photo) => {
    setEditId(p.id);
    setForm({ url: p.url, file_key: p.file_key || '', alt_text_ar: p.alt_text_ar || '', alt_text_en: p.alt_text_en || '', category: p.category, sort_order: p.sort_order, is_active: p.is_active });
    setPreviewUrl(p.url);
    setDialogOpen(true);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `gallery/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) { toast({ title: 'خطأ', description: 'فشل رفع الصورة', variant: 'destructive' }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    setForm((f) => ({ ...f, url: urlData.publicUrl, file_key: path }));
    setPreviewUrl(urlData.publicUrl);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFile(file); };

  const save = async () => {
    if (!form.url) { toast({ title: 'تنبيه', description: 'يرجى رفع صورة أولاً', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { url: form.url, file_key: form.file_key || null, alt_text_ar: form.alt_text_ar || null, alt_text_en: form.alt_text_en || null, category: form.category, sort_order: form.sort_order, is_active: form.is_active };

    const { error } = editId
      ? await supabase.from('gallery_photos').update(payload).eq('id', editId)
      : await supabase.from('gallery_photos').insert(payload);

    if (error) toast({ title: 'خطأ', description: 'فشل حفظ الصورة', variant: 'destructive' });
    else { toast({ title: 'تم', description: editId ? 'تم تعديل الصورة ✓' : 'تمت إضافة الصورة ✓' }); setDialogOpen(false); fetchPhotos(); }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const photo = photos.find((p) => p.id === deleteId);
    if (photo?.file_key) await supabase.storage.from('media').remove([photo.file_key]);
    const { error } = await supabase.from('gallery_photos').delete().eq('id', deleteId);
    if (error) toast({ title: 'خطأ', description: 'فشل حذف الصورة', variant: 'destructive' });
    else { toast({ title: 'تم', description: 'تم حذف الصورة ✓' }); fetchPhotos(); }
    setDeleteId(null);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">معرض الصور</h1>
          <p className="text-sm text-gray-500">{photos.length} صورة</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200 text-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
            <Plus className="h-4 w-4 ml-2" /> إضافة صورة
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">لا توجد صور بعد</p>
          <Button onClick={openAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
            <Plus className="h-4 w-4 ml-2" /> إضافة صورة جديدة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="relative aspect-square">
                <img src={p.url} alt={p.alt_text_ar || ''} className="w-full h-full object-cover" />
                <Badge className="absolute top-3 right-3 bg-black/60 text-white text-xs">{catLabel(p.category)}</Badge>
                {!p.is_active && <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs">غير نشط</Badge>}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full" onClick={() => setDeleteId(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-600 truncate">{p.alt_text_ar || 'بدون وصف'}</p>
                <p className="text-xs text-gray-400">ترتيب: {p.sort_order}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? 'تعديل الصورة' : 'إضافة صورة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Upload area */}
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37] transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37] mx-auto" />
              ) : previewUrl ? (
                <img src={previewUrl} alt="" className="w-full h-40 object-cover rounded-lg" />
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">اسحب الصورة هنا أو انقر للاختيار</p>
                </>
              )}
              <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">النص البديل بالعربية</Label>
              <Input value={form.alt_text_ar} onChange={(e) => setForm((f) => ({ ...f, alt_text_ar: e.target.value }))} className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">النص البديل بالإنجليزية</Label>
              <Input value={form.alt_text_en} onChange={(e) => setForm((f) => ({ ...f, alt_text_en: e.target.value }))} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm">الفئة</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-700"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm">ترتيب العرض</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="bg-gray-50 border-gray-200 text-gray-900" dir="ltr" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <Label className="text-gray-700 text-sm">نشط</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null} حفظ
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الصورة</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
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
