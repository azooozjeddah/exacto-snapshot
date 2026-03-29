import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import AttachmentsSection from '@/components/admin/accounting/AttachmentsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import TableToolbar, { exportToCSV } from '@/components/admin/accounting/TableToolbar';

interface Supplier {
  id: number; name_ar: string; name_en: string | null; phone: string | null;
  email: string | null; address: string | null; tax_number: string | null; is_active: boolean;
}

const emptyForm = { name_ar: '', name_en: '', phone: '', email: '', address: '', tax_number: '' };

export default function SuppliersList() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('suppliers').select('*').order('name_ar');
    setSuppliers((data as Supplier[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const filtered = suppliers.filter(s =>
    !search || s.name_ar.includes(search) || (s.name_en || '').toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search)
  );

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name_ar: s.name_ar, name_en: s.name_en || '', phone: s.phone || '', email: s.email || '', address: s.address || '', tax_number: s.tax_number || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name_ar) { toast.error('يرجى إدخال اسم المورد'); return; }
    const payload = { name_ar: form.name_ar, name_en: form.name_en || null, phone: form.phone || null, email: form.email || null, address: form.address || null, tax_number: form.tax_number || null };
    if (editing) {
      await supabase.from('suppliers').update(payload).eq('id', editing.id);
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'update', entity_type: 'supplier', entity_id: editing.id, details: payload });
      toast.success('تم التحديث');
    } else {
      await supabase.from('suppliers').insert(payload);
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'create', entity_type: 'supplier', details: payload });
      toast.success('تم الإضافة');
    }
    setDialogOpen(false); fetch();
  };

  const handleToggleActive = async (s: Supplier) => {
    await supabase.from('suppliers').update({ is_active: !s.is_active }).eq('id', s.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: s.is_active ? 'deactivate' : 'activate', entity_type: 'supplier', entity_id: s.id, details: { name_ar: s.name_ar } });
    toast.success(s.is_active ? 'تم إيقاف المورد' : 'تم تفعيل المورد');
    fetch();
  };

  const handleDelete = async (s: Supplier) => {
    await supabase.from('suppliers').delete().eq('id', s.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'delete', entity_type: 'supplier', entity_id: s.id, details: { name_ar: s.name_ar } });
    toast.success('تم الحذف'); fetch();
  };

  const handleExport = () => {
    exportToCSV(['الاسم (عربي)', 'الاسم (إنجليزي)', 'الهاتف', 'البريد', 'الرقم الضريبي'],
      filtered.map(s => [s.name_ar, s.name_en || '', s.phone || '', s.email || '', s.tax_number || '']), 'suppliers');
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div><h2 className="text-2xl font-bold text-gray-900">الموردون</h2><p className="text-gray-500 text-sm">Suppliers</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button onClick={openNew} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"><Plus className="h-4 w-4 ml-2" /> إضافة مورد</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>{editing ? 'تعديل المورد' : 'إضافة مورد جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>الاسم (عربي) *</Label><Input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} /></div>
              <div><Label>الاسم (إنجليزي)</Label><Input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} dir="ltr" /></div>
              <div><Label>الهاتف</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
              <div><Label>البريد</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
              <div><Label>الرقم الضريبي</Label><Input value={form.tax_number} onChange={e => setForm({ ...form, tax_number: e.target.value })} dir="ltr" /></div>
              <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">{editing ? 'تحديث' : 'إضافة'}</Button>

              {/* قسم المرفقات - يظهر دائماً */}
              <AttachmentsSection
                relatedType="supplier"
                relatedId={editing ? editing.id : null}
                label="مستندات المورد (عقود ، تراخيص ، غيرها)"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث بالاسم أو الهاتف..."
        onExportCSV={handleExport} helpText="أضف وأدر الموردين هنا. تقدر تفعّل أو توقف أي مورد بضغطة زر." helpTextEn="Add and manage suppliers. Toggle active/inactive status." />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader><TableRow className="bg-gray-50/80">
            <TableHead className="text-right font-bold">الاسم</TableHead><TableHead className="text-right font-bold">الهاتف</TableHead>
            <TableHead className="text-right font-bold">البريد</TableHead><TableHead className="text-right font-bold">الرقم الضريبي</TableHead>
            <TableHead className="text-right font-bold">الحالة</TableHead>
            <TableHead className="text-right font-bold">إجراءات</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">لا يوجد موردون</TableCell></TableRow>
            ) : filtered.map(s => (
              <TableRow key={s.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell><div className="font-medium">{s.name_ar}</div>{s.name_en && <div className="text-xs text-gray-400" dir="ltr">{s.name_en}</div>}</TableCell>
                <TableCell dir="ltr">{s.phone || '—'}</TableCell>
                <TableCell dir="ltr">{s.email || '—'}</TableCell>
                <TableCell dir="ltr">{s.tax_number || '—'}</TableCell>
                <TableCell>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_active ? 'نشط' : 'موقوف'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>تعديل</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(s)} className={s.is_active ? 'text-orange-500' : 'text-emerald-500'}>
                        {s.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger><TooltipContent>{s.is_active ? 'إيقاف المورد' : 'تفعيل المورد'}</TooltipContent></Tooltip>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف المورد "{s.name_ar}"؟</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(s)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">عدد الموردين: {filtered.length} | نشط: {filtered.filter(s => s.is_active).length} | موقوف: {filtered.filter(s => !s.is_active).length}</p>
    </div>
  );
}
