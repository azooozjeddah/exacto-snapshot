import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, Trash2, Download, Eye, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Attachment {
  id: number; file_name: string; file_url: string; file_type: string | null;
  file_size: number | null; related_type: string; related_id: number; created_at: string;
}

const relatedTypes = [
  { value: 'invoice', labelAr: 'فاتورة' },
  { value: 'purchase', labelAr: 'مشترى' },
  { value: 'journal_entry', labelAr: 'قيد محاسبي' },
  { value: 'partner', labelAr: 'شريك' },
  { value: 'supplier', labelAr: 'مورد' },
  { value: 'other', labelAr: 'أخرى' },
];

export default function AttachmentsPage() {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [relatedType, setRelatedType] = useState('other');
  const [relatedId, setRelatedId] = useState('0');
  const [filterType, setFilterType] = useState('all');

  const fetchAttachments = async () => {
    setLoading(true);
    let q = supabase.from('attachments').select('*').order('created_at', { ascending: false });
    if (filterType !== 'all') q = q.eq('related_type', filterType);
    const { data } = await q;
    setAttachments((data as Attachment[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAttachments(); }, [filterType]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage.from('attachments').upload(filePath, file);
    if (uploadErr) { toast.error('فشل رفع الملف: ' + uploadErr.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(filePath);

    const { error: insertErr } = await supabase.from('attachments').insert({
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_key: filePath,
      file_type: file.type,
      file_size: file.size,
      related_type: relatedType,
      related_id: parseInt(relatedId) || 0,
      uploaded_by: user?.id,
    });

    if (insertErr) { toast.error(insertErr.message); setUploading(false); return; }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user?.id, user_email: user?.email || '', action: 'upload_attachment',
      entity_type: 'attachment', details: { file_name: file.name, related_type: relatedType },
    });

    toast.success('تم رفع الملف بنجاح');
    setUploading(false);
    setDialogOpen(false);
    fetchAttachments();
  };

  const handleDelete = async (att: Attachment) => {
    if (!confirm('هل أنت متأكد من حذف هذا المرفق؟')) return;
    if (att.file_url.includes('attachments')) {
      const key = att.file_url.split('/').pop();
      if (key) await supabase.storage.from('attachments').remove([key]);
    }
    await supabase.from('attachments').delete().eq('id', att.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id, user_email: user?.email || '', action: 'delete_attachment',
      entity_type: 'attachment', entity_id: att.id, details: { file_name: att.file_name },
    });
    toast.success('تم حذف المرفق');
    fetchAttachments();
  };

  const getFileIcon = (type: string | null) => {
    if (!type) return File;
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المستندات والمرفقات</h2>
          <p className="text-gray-500 text-sm">Documents & Attachments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"><Upload className="h-4 w-4 ml-2" /> رفع مرفق</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>رفع مرفق جديد</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>نوع العملية المرتبطة</Label>
                <Select value={relatedType} onValueChange={setRelatedType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {relatedTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.labelAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>رقم العملية</Label>
                <Input type="number" value={relatedId} onChange={e => setRelatedId(e.target.value)} placeholder="0" dir="ltr" />
              </div>
              <div>
                <Label>اختر الملف</Label>
                <Input type="file" onChange={handleUpload} disabled={uploading}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp" />
                {uploading && <p className="text-sm text-[#D4AF37] mt-1">جاري الرفع...</p>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}
          className={filterType === 'all' ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>الكل</Button>
        {relatedTypes.map(t => (
          <Button key={t.value} variant={filterType === t.value ? 'default' : 'outline'} size="sm"
            onClick={() => setFilterType(t.value)}
            className={filterType === t.value ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>{t.labelAr}</Button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الملف</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">الحجم</TableHead>
              <TableHead className="text-right">مرتبط بـ</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell></TableRow>
            ) : attachments.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">لا توجد مرفقات</TableCell></TableRow>
            ) : attachments.map(att => {
              const Icon = getFileIcon(att.file_type);
              const typeLabel = relatedTypes.find(t => t.value === att.related_type)?.labelAr || att.related_type;
              return (
                <TableRow key={att.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-sm truncate max-w-[200px]">{att.file_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{att.file_type || '—'}</TableCell>
                  <TableCell className="text-xs">{formatSize(att.file_size)}</TableCell>
                  <TableCell><span className="text-xs">{typeLabel} #{att.related_id}</span></TableCell>
                  <TableCell className="text-xs text-gray-500">{new Date(att.created_at).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild><a href={att.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a></Button>
                      <Button variant="ghost" size="icon" asChild><a href={att.file_url} download={att.file_name}><Download className="h-4 w-4" /></a></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(att)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
