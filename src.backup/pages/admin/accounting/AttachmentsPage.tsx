/**
 * AttachmentsPage - إدارة المستندات والمرفقات
 * Documents & Attachments Management
 * 
 * Features:
 * - Upload files (PDF, Word, Excel, images)
 * - Link attachments to invoices, purchases, partners, suppliers
 * - View, download, and delete attachments with proper confirmation
 * - Filter by related type
 * - Audit trail logging for all operations
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, Trash2, Download, Eye, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import TableToolbar from '@/components/admin/accounting/TableToolbar';

interface Attachment {
  id: number; file_name: string; file_url: string; file_type: string | null;
  file_size: number | null; related_type: string; related_id: number; created_at: string;
}

const relatedTypes = [
  { value: 'journal_entry', labelAr: 'قيد محاسبي', labelEn: 'Journal Entry' },
  { value: 'partner', labelAr: 'شريك', labelEn: 'Partner' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
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
  const [search, setSearch] = useState('');

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      let q = supabase.from('attachments').select('*').order('created_at', { ascending: false });
      if (filterType !== 'all') q = q.eq('related_type', filterType);
      const { data, error } = await q;
      if (error) { toast.error('خطأ في تحميل المرفقات'); console.error(error); }
      setAttachments((data as Attachment[]) || []);
    } catch {
      toast.error('حدث خطأ غير متوقع');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAttachments(); }, [filterType]);

  const filtered = attachments.filter(a =>
    !search || a.file_name.toLowerCase().includes(search.toLowerCase()) ||
    (relatedTypes.find(t => t.value === a.related_type)?.labelAr || '').includes(search)
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف يتجاوز 10 ميجابايت');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage.from('attachments').upload(filePath, file);
      if (uploadErr) { toast.error('فشل رفع الملف: ' + uploadErr.message); setUploading(false); return; }

      const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(filePath);

      const { error: insertErr } = await supabase.from('attachments').insert({
        file_name: file.name, file_url: urlData.publicUrl, file_key: filePath,
        file_type: file.type, file_size: file.size,
        related_type: relatedType, related_id: parseInt(relatedId) || 0, uploaded_by: user?.id,
      });

      if (insertErr) { toast.error(insertErr.message); setUploading(false); return; }

      await supabase.from('audit_logs').insert({
        user_id: user?.id, user_email: user?.email || '', action: 'upload_attachment',
        entity_type: 'attachment', details: { file_name: file.name, related_type: relatedType },
      });

      toast.success('تم رفع الملف بنجاح');
      setDialogOpen(false);
      fetchAttachments();
    } catch {
      toast.error('حدث خطأ أثناء رفع الملف');
    }
    setUploading(false);
  };

  const handleDelete = async (att: Attachment) => {
    try {
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
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
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
                    {relatedTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.labelAr} - {t.labelEn}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>رقم العملية</Label>
                <Input type="number" value={relatedId} onChange={e => setRelatedId(e.target.value)} placeholder="0" dir="ltr" />
              </div>
              <div>
                <Label>اختر الملف (حد أقصى 10 ميجابايت)</Label>
                <Input type="file" onChange={handleUpload} disabled={uploading}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp" />
                {uploading && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[#D4AF37]">جاري الرفع...</p>
                  </div>
                )}
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

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث بالاسم أو النوع..."
        helpText="ارفع وأدر المستندات والمرفقات. يمكنك ربطها بالفواتير والمشتريات والشركاء."
        helpTextEn="Upload and manage documents. Link them to invoices, purchases, and partners." />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="text-right font-bold">الملف</TableHead>
              <TableHead className="text-right font-bold">النوع</TableHead>
              <TableHead className="text-right font-bold">الحجم</TableHead>
              <TableHead className="text-right font-bold">مرتبط بـ</TableHead>
              <TableHead className="text-right font-bold">التاريخ</TableHead>
              <TableHead className="text-right font-bold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">
                <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
              </TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">لا توجد مرفقات</TableCell></TableRow>
            ) : filtered.map(att => {
              const Icon = getFileIcon(att.file_type);
              const typeLabel = relatedTypes.find(t => t.value === att.related_type)?.labelAr || att.related_type;
              return (
                <TableRow key={att.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-gray-400 shrink-0" />
                      <span className="font-medium text-sm truncate max-w-[200px]">{att.file_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{att.file_type || '—'}</TableCell>
                  <TableCell className="text-xs">{formatSize(att.file_size)}</TableCell>
                  <TableCell><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{typeLabel} #{att.related_id}</span></TableCell>
                  <TableCell className="text-xs text-gray-500">{new Date(att.created_at).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild><a href={att.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a></Button>
                      </TooltipTrigger><TooltipContent>عرض / View</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild><a href={att.file_url} download={att.file_name}><Download className="h-4 w-4" /></a></Button>
                      </TooltipTrigger><TooltipContent>تحميل / Download</TooltipContent></Tooltip>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد حذف المرفق</AlertDialogTitle>
                            <AlertDialogDescription>هل أنت متأكد من حذف الملف "{att.file_name}"؟ هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse gap-2">
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(att)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">عدد المرفقات: {filtered.length}</p>
    </div>
  );
}
