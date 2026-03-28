import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, ImageIcon, Loader2, Upload, Pencil } from 'lucide-react';
import PhotoGrid from '@/components/admin/PhotoGrid';
import PhotoUploadDialog, { type PhotoForm } from '@/components/admin/PhotoUploadDialog';

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

const tabs = [
  { value: 'gallery', label: 'معرض الصور', prefix: 'gallery' },
  { value: 'tour', label: 'جولة في المشروع', prefix: 'tour' },
  { value: 'hero', label: 'الصورة الرئيسية', prefix: 'hero' },
  { value: 'experience', label: 'صور التجربة', prefix: 'experience' },
];

const subCategories: Record<string, { value: string; label: string }[]> = {
  gallery: [
    { value: 'gallery_general', label: 'عام' },
    { value: 'gallery_interior', label: 'داخلي' },
    { value: 'gallery_exterior', label: 'خارجي' },
    { value: 'gallery_night', label: 'ليلي' },
    { value: 'gallery_aerial', label: 'جوي' },
  ],
  tour: [{ value: 'tour_general', label: 'عام' }],
  hero: [{ value: 'hero_main', label: 'رئيسية' }],
  experience: [{ value: 'experience_general', label: 'عام' }],
};

const catLabel = (v: string) => {
  for (const cats of Object.values(subCategories)) {
    const found = cats.find((c) => c.value === v);
    if (found) return found.label;
  }
  // Legacy categories
  const legacy: Record<string, string> = { general: 'عام', interior: 'داخلي', exterior: 'خارجي', night: 'ليلي', aerial: 'جوي' };
  return legacy[v] || v;
};

const emptyForm = (tab: string): PhotoForm => ({
  url: '', file_key: '', alt_text_ar: '', alt_text_en: '',
  category: subCategories[tab]?.[0]?.value || `${tab}_general`,
  sort_order: 0, is_active: true,
});

export default function AdminPhotos() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PhotoForm>(emptyForm('gallery'));
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('gallery_photos').select('*').order('sort_order');
    if (error) toast({ title: 'خطأ', description: 'فشل تحميل الصور', variant: 'destructive' });
    else setAllPhotos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  // Filter photos for current tab - gallery tab also shows legacy categories
  const tabPhotos = allPhotos.filter((p) => {
    if (activeTab === 'gallery') {
      return p.category.startsWith('gallery_') || !p.category.includes('_');
    }
    return p.category.startsWith(`${activeTab}_`);
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm(activeTab));
    setDialogOpen(true);
  };

  const openEdit = (p: Photo) => {
    setEditId(p.id);
    setForm({ url: p.url, file_key: p.file_key || '', alt_text_ar: p.alt_text_ar || '', alt_text_en: p.alt_text_en || '', category: p.category, sort_order: p.sort_order, is_active: p.is_active });
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const photo = allPhotos.find((p) => p.id === deleteId);
    if (photo?.file_key) await supabase.storage.from('media').remove([photo.file_key]);
    const { error } = await supabase.from('gallery_photos').delete().eq('id', deleteId);
    if (error) toast({ title: 'خطأ', description: 'فشل حذف الصورة', variant: 'destructive' });
    else { toast({ title: 'تم', description: 'تم حذف الصورة ✓' }); fetchPhotos(); }
    setDeleteId(null);
  };

  // Hero tab: single image UI
  const heroPhoto = allPhotos.find((p) => p.category === 'hero_main');

  const handleHeroUpload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `hero/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) { toast({ title: 'خطأ', description: 'فشل رفع الصورة', variant: 'destructive' }); return; }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
    const payload = { url: urlData.publicUrl, file_key: path, alt_text_ar: 'الصورة الرئيسية', category: 'hero_main', sort_order: 0, is_active: true };

    if (heroPhoto) {
      if (heroPhoto.file_key) await supabase.storage.from('media').remove([heroPhoto.file_key]);
      await supabase.from('gallery_photos').update(payload).eq('id', heroPhoto.id);
    } else {
      await supabase.from('gallery_photos').insert(payload);
    }
    toast({ title: 'تم', description: 'تم تحديث الصورة الرئيسية ✓' });
    fetchPhotos();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مركز إدارة الصور</h1>
          <p className="text-sm text-gray-500">{allPhotos.length} صورة إجمالاً</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid grid-cols-4 mb-6 bg-gray-100">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white text-xs sm:text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Gallery, Tour, Experience tabs */}
        {['gallery', 'tour', 'experience'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{tabPhotos.length} صورة</p>
              <Button onClick={openAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                <Plus className="h-4 w-4 ml-2" /> إضافة صورة
              </Button>
            </div>
            <PhotoGrid
              photos={tabPhotos}
              loading={loading}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={setDeleteId}
              catLabel={catLabel}
              showCategory={tab === 'gallery'}
            />
          </TabsContent>
        ))}

        {/* Hero tab - single image */}
        <TabsContent value="hero">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {heroPhoto ? (
                <div className="relative">
                  <img src={heroPhoto.url} alt={heroPhoto.alt_text_ar || 'الصورة الرئيسية'} className="w-full h-80 object-cover" />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{heroPhoto.alt_text_ar || 'الصورة الرئيسية'}</p>
                      <p className="text-xs text-gray-400">انقر لتغيير الصورة</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => openEdit(heroPhoto)}
                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      >
                        <Pencil className="h-4 w-4 ml-1" /> تعديل البيانات
                      </Button>
                      <Button
                        size="sm" className="bg-[#D4AF37] hover:bg-[#C4A030] text-white"
                        onClick={() => document.getElementById('hero-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 ml-1" /> تغيير الصورة
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-20 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById('hero-upload')?.click()}
                >
                  <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">لا توجد صورة رئيسية</p>
                  <p className="text-sm text-gray-400">انقر لرفع الصورة الرئيسية</p>
                </div>
              )}
              <input id="hero-upload" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleHeroUpload(e.target.files[0])} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Photo Dialog */}
      <PhotoUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editId={editId}
        form={form}
        setForm={setForm}
        onSaved={fetchPhotos}
        categories={subCategories[activeTab] || []}
        showCategorySelect={activeTab === 'gallery'}
        storagePath={activeTab}
      />

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
