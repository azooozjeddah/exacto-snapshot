import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2, ImageIcon, Plus } from 'lucide-react';

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

interface Props {
  photos: Photo[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (p: Photo) => void;
  onDelete: (id: number) => void;
  catLabel?: (v: string) => string;
  showCategory?: boolean;
}

export default function PhotoGrid({ photos, loading, onAdd, onEdit, onDelete, catLabel, showCategory = true }: Props) {
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>;

  if (photos.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
      <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
      <p className="text-gray-500 mb-4">لا توجد صور بعد</p>
      <Button onClick={onAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
        <Plus className="h-4 w-4 ml-2" /> إضافة صورة جديدة
      </Button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
          <div className="relative aspect-square">
            <img src={p.url} alt={p.alt_text_ar || ''} className="w-full h-full object-cover" />
            {showCategory && catLabel && <Badge className="absolute top-3 right-3 bg-black/60 text-white text-xs">{catLabel(p.category)}</Badge>}
            {!p.is_active && <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs">غير نشط</Badge>}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full" onClick={() => onEdit(p)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full" onClick={() => onDelete(p.id)}>
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
  );
}
