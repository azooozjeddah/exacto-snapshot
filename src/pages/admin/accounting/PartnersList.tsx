import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import TableToolbar, { exportToCSV } from '@/components/admin/accounting/TableToolbar';

interface Partner {
  id: number; name_ar: string; name_en: string | null; phone: string | null;
  email: string | null; profit_percentage: number; is_active: boolean; notes: string | null;
}

const emptyForm = { name_ar: '', name_en: '', phone: '', email: '', profit_percentage: '', notes: '' };

export default function PartnersList() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('partners').select('*').order('name_ar');
    setPartners((data as Partner[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const filtered = partners.filter(p =>
    !search || p.name_ar.includes(search) || (p.name_en || '').toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Partner) => {
    setEditing(p);
    setForm({ name_ar: p.name_ar, name_en: p.name_en || '', phone: p.phone || '', email: p.email || '', profit_percentage: String(p.profit_percentage), notes: p.notes || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name_ar) { toast.error('يرجى إدخال اسم الشريك'); return; }
    const newPct = parseFloat(form.profit_percentage) || 0;
    if (newPct < 0 || newPct > 100) { toast.error('نسبة الأرباح يجب أن تكون بين 0 و 100'); return; }
    // Check total won't exceed 100%
    const otherTotal = partners
      .filter(p => p.id !== editing?.id)
      .reduce((s, p) => s + Number(p.profit_percentage), 0);
    const newTotal = otherTotal + newPct;
    if (newTotal > 100) {
      toast.error(`مجموع النسب سيصبح ${newTotal}% وهو أكبر من 100%. المتبقي المتاح: ${(100 - otherTotal).toFixed(2)}%`);
      return;
    }
    const payload = {
      name_ar: form.name_ar, name_en: form.name_en || null, phone: form.phone || null,
      email: form.email || null, profit_percentage: newPct, notes: form.notes || null,
    };
    if (editing) {
      await supabase.from('partners').update(payload).eq('id', editing.id);
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'update', entity_type: 'partner', entity_id: editing.id, details: payload });
      toast.success('تم التحديث');
    } else {
      await supabase.from('partners').insert(payload);
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'create', entity_type: 'partner', details: payload });
      toast.success('تم الإضافة');
    }
    if (newTotal === 100) toast.success('✅ مجموع النسب = 100% - ممتاز!');
    else toast.info(`ℹ️ المجموع الحالي: ${newTotal}% | المتبقي: ${(100 - newTotal).toFixed(2)}%`);
    setDialogOpen(false); fetch();
  };

  const handleDelete = async (p: Partner) => {
    await supabase.from('partners').delete().eq('id', p.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'delete', entity_type: 'partner', entity_id: p.id, details: { name_ar: p.name_ar } });
    toast.success('تم الحذف'); fetch();
  };

  const handleExport = () => {
    exportToCSV(['الاسم (عربي)', 'الاسم (إنجليزي)', 'الهاتف', 'البريد', 'نسبة الأرباح'],
      filtered.map(p => [p.name_ar, p.name_en || '', p.phone || '', p.email || '', `${Number(p.profit_percentage)}%`]), 'partners');
  };

  const totalPercentage = partners.reduce((s, p) => s + Number(p.profit_percentage), 0);

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div><h2 className="text-2xl font-bold text-gray-900">الشركاء</h2><p className="text-gray-500 text-sm">Partners</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button onClick={openNew} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"><Plus className="h-4 w-4 ml-2" /> إضافة شريك</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>{editing ? 'تعديل الشريك' : 'إضافة شريك جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>الاسم (عربي) *</Label><Input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} /></div>
              <div><Label>الاسم (إنجليزي)</Label><Input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} dir="ltr" /></div>
              <div><Label>الهاتف</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
              <div><Label>البريد</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
              <div><Label>نسبة الأرباح (%)</Label><Input type="number" value={form.profit_percentage} onChange={e => setForm({ ...form, profit_percentage: e.target.value })} dir="ltr" /></div>
              <div><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">{editing ? 'تحديث' : 'إضافة'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {totalPercentage > 0 && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${totalPercentage === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          إجمالي النسب: {totalPercentage}% {totalPercentage !== 100 && '⚠️ (يجب أن تكون 100%)'}
        </div>
      )}

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث بالاسم..."
        onExportCSV={handleExport} helpText="أضف وأدر الشركاء ونسب أرباحهم. يجب أن يكون مجموع النسب 100%." helpTextEn="Manage partners and profit percentages. Total must equal 100%." />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader><TableRow className="bg-gray-50/80">
            <TableHead className="text-right font-bold">الاسم</TableHead><TableHead className="text-right font-bold">الهاتف</TableHead>
            <TableHead className="text-right font-bold">البريد</TableHead><TableHead className="text-right font-bold">نسبة الأرباح</TableHead>
            <TableHead className="text-right font-bold">إجراءات</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">لا يوجد شركاء</TableCell></TableRow>
            ) : filtered.map(p => (
              <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell><div className="font-medium">{p.name_ar}</div>{p.name_en && <div className="text-xs text-gray-400" dir="ltr">{p.name_en}</div>}</TableCell>
                <TableCell dir="ltr">{p.phone || '—'}</TableCell>
                <TableCell dir="ltr">{p.email || '—'}</TableCell>
                <TableCell><span className="font-bold text-[#D4AF37] text-lg">{Number(p.profit_percentage)}%</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>تعديل</TooltipContent></Tooltip>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف الشريك "{p.name_ar}"؟</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(p)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">عدد الشركاء: {filtered.length}</p>
    </div>
  );
}
