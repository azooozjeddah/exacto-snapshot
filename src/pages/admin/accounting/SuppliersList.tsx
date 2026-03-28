import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Supplier {
  id: number; name_ar: string; name_en: string | null; phone: string | null;
  email: string | null; address: string | null; tax_number: string | null; is_active: boolean;
}

const emptyForm = { name_ar: '', name_en: '', phone: '', email: '', address: '', tax_number: '' };

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('suppliers').select('*').order('name_ar');
    setSuppliers((data as Supplier[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

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
      toast.success('تم التحديث');
    } else {
      await supabase.from('suppliers').insert(payload);
      toast.success('تم الإضافة');
    }
    setDialogOpen(false); fetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد؟')) return;
    await supabase.from('suppliers').delete().eq('id', id);
    toast.success('تم الحذف'); fetch();
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الموردون</h2>
          <p className="text-gray-500 text-sm">Suppliers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"><Plus className="h-4 w-4 ml-2" /> إضافة مورد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>{editing ? 'تعديل المورد' : 'إضافة مورد جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>الاسم (عربي) *</Label><Input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} /></div>
              <div><Label>الاسم (إنجليزي)</Label><Input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} dir="ltr" /></div>
              <div><Label>الهاتف</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
              <div><Label>البريد</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} dir="ltr" /></div>
              <div><Label>الرقم الضريبي</Label><Input value={form.tax_number} onChange={e => setForm({ ...form, tax_number: e.target.value })} dir="ltr" /></div>
              <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">{editing ? 'تحديث' : 'إضافة'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">الرقم الضريبي</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell></TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">لا يوجد موردون</TableCell></TableRow>
            ) : suppliers.map(s => (
              <TableRow key={s.id}>
                <TableCell><div className="font-medium">{s.name_ar}</div>{s.name_en && <div className="text-xs text-gray-400" dir="ltr">{s.name_en}</div>}</TableCell>
                <TableCell dir="ltr">{s.phone || '—'}</TableCell>
                <TableCell dir="ltr">{s.email || '—'}</TableCell>
                <TableCell dir="ltr">{s.tax_number || '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
