/**
 * AttachmentsSection - مكون مشترك لرفع المرفقات وعرضها
 * Reusable component for uploading and viewing attachments
 * Used in: Invoices, Purchases, Suppliers
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, Trash2, Download, Eye, FileText, Image, File, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface Attachment {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  related_type: string;
  related_id: number;
  created_at: string;
}

interface AttachmentsSectionProps {
  relatedType: 'invoice' | 'purchase' | 'supplier';
  relatedId: number | null;
  label?: string;
}

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

export default function AttachmentsSection({ relatedType, relatedId, label }: AttachmentsSectionProps) {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = async () => {
    if (!relatedId) return;
    setLoading(true);
    const { data } = await supabase
      .from('attachments')
      .select('*')
      .eq('related_type', relatedType)
      .eq('related_id', relatedId)
      .order('created_at', { ascending: false });
    setAttachments((data as Attachment[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttachments();
  }, [relatedId, relatedType]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف يتجاوز 10 ميجابايت');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${relatedType}/${relatedId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage.from('attachments').upload(filePath, file);
      if (uploadErr) {
        toast.error('فشل رفع الملف: ' + uploadErr.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(filePath);

      const { error: insertErr } = await supabase.from('attachments').insert({
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_key: filePath,
        file_type: file.type,
        file_size: file.size,
        related_type: relatedType,
        related_id: relatedId,
        uploaded_by: user?.id,
      });

      if (insertErr) {
        toast.error(insertErr.message);
        setUploading(false);
        return;
      }

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_email: user?.email || '',
        action: 'upload_attachment',
        entity_type: 'attachment',
        details: { file_name: file.name, related_type: relatedType, related_id: relatedId },
      });

      toast.success('تم رفع الملف بنجاح');
      fetchAttachments();
      // Reset input
      e.target.value = '';
    } catch {
      toast.error('حدث خطأ أثناء رفع الملف');
    }
    setUploading(false);
  };

  const handleDelete = async (att: Attachment) => {
    try {
      // Extract file key from URL or use stored key
      const segments = att.file_url.split('/');
      const bucket = 'attachments';
      const keyIndex = segments.findIndex(s => s === bucket);
      if (keyIndex !== -1) {
        const key = segments.slice(keyIndex + 1).join('/');
        await supabase.storage.from(bucket).remove([key]);
      }
      await supabase.from('attachments').delete().eq('id', att.id);
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_email: user?.email || '',
        action: 'delete_attachment',
        entity_type: 'attachment',
        entity_id: att.id,
        details: { file_name: att.file_name },
      });
      toast.success('تم حذف المرفق');
      fetchAttachments();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-[#D4AF37]" />
          <span className="text-sm font-bold text-gray-700">{label || 'المرفقات'}</span>
          {attachments.length > 0 && (
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-2 py-0.5 rounded-full">
              {attachments.length}
            </span>
          )}
        </div>
        {/* Upload Button */}
        <label className={`cursor-pointer flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all
          ${uploading
            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-[#D4AF37] border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]'
          }`}>
          {uploading ? (
            <>
              <span className="w-3 h-3 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              رفع ملف
            </>
          )}
          <input
            type="file"
            className="hidden"
            disabled={uploading || !relatedId}
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
          />
        </label>
      </div>

      {/* Attachments List */}
        {!relatedId ? (
        <div className="text-center py-4 text-gray-400 text-xs bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
          احفظ السجل أولاً ثم يمكنك رفع المرفقات
        </div>
      ) : loading ? (
        <div className="flex justify-center py-3">
          <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-xs bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
          لا توجد مرفقات — اضغط "رفع ملف" لإضافة مستند
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map(att => {
            const Icon = getFileIcon(att.file_type);
            return (
              <div key={att.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#D4AF37]/20 transition-colors">
                <Icon className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{att.file_name}</p>
                  <p className="text-xs text-gray-400">
                    {formatSize(att.file_size)} · {new Date(att.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={att.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>عرض</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={att.file_url} download={att.file_name}>
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>تحميل</TooltipContent>
                  </Tooltip>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد حذف المرفق</AlertDialogTitle>
                        <AlertDialogDescription>هل أنت متأكد من حذف "{att.file_name}"؟</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-row-reverse gap-2">
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(att)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">الصيغ المدعومة: PDF, Word, Excel, صور · الحد الأقصى: 10 MB</p>
    </div>
  );
}
