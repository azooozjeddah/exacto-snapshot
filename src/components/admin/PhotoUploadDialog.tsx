import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Upload } from 'lucide-react';

export interface PhotoForm {
  url: string;
  file_key: string;
  alt_text_ar: string;
  alt_text_en: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editId: number | null;
  form: PhotoForm;
  setForm: React.Dispatch<React.SetStateAction<PhotoForm>>;
  onSaved: () => void;
  categories: { value: string; label: string }[];
  showCategorySelect?: boolean;
  storagePath?: string;
}

export default function PhotoUploadDialog({ open, onOpenChange, editId, form, setForm, onSaved, categories, showCategorySelect = true, storagePath = 'gallery' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(form.url || '');

  const handleFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${storagePath}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('gallery').upload(path, file);
    if (error) { toast({ title: 'خطأ', description: 'فشل رفع الصورة', variant: 'destructive' }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
    setForm((f) => ({ ...f, url: urlData.publicUrl, file_key: path }));
    setPreviewUrl(urlData.publicUrl);
    setUploading(false);
  };

  const save = async () => {
    if (!form.url) { toast({ title: 'تنبيه', description: 'يرجى رفع صورة أولاً', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { url: form.url, file_key: form.file_key || null, alt_text_ar: form.alt_text_ar || null, alt_text_en: form.alt_text_en || null, category: form.category, sort_order: form.sort_order, is_active: form.is_active };
    const { error } = editId
      ? await supabase.from('gallery_photos').update(payload).eq('id', editId)
      : await supabase.from('gallery_photos').insert(payload);
    if (error) toast({ title: 'خطأ', description: 'فشل حفظ الصورة', variant: 'destructive' });
    else { toast({ title: 'تم', description: editId ? 'تم تعديل الصورة ✓' : 'تمت إضافة الصورة ✓' }); onOpenChange(false); onSaved(); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) setPreviewUrl(form.url || ''); }}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editId ? 'تعديل الصورة' : 'إضافة صورة جديدة'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37] transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
            onClick={() => document.getElementById('photo-upload-dialog')?.click()}
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
            <input id="photo-upload-dialog" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
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
            {showCategorySelect && (
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm">الفئة الفرعية</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-700"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
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
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
