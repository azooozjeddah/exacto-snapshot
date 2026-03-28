import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Partner {
  id: number; name_ar: string; name_en: string | null; phone: string | null;
  email: string | null; profit_percentage: number; is_active: boolean; notes: string | null;
}

const emptyForm = { name_ar: '', name_en: '', phone: '', email: '', profit_percentage: '', notes: '' };

export default function PartnersList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('partners').select('*').order('name_ar');
    setPartners((data as Partner[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Partner) => {
    setEditing(p);
    setForm({ name_ar: p.name_ar, name_en: p.name_en || '', phone: p.phone || '', email: p.email || '', profit_percentage: String(p.profit_percentage), notes: p.notes || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name_ar) { toast.error('يرجى إدخال اسم الشريك'); return; }
    const payload = {
      name_ar: form.name_ar, name_en: form.name_en || null, phone: form.phone || null,
      email: form.email || null, profit_percentage: parseFloat(form.profit_percentage) || 0, notes: form.notes || null,
    };
    if (editing) {
      await supabase.from('partners').update(payload).eq('id', editing.id);
      toast.success('تم التحديث');
    } else {
      await supabase.from('partners').insert(payload);
      toast.success('تم الإضافة');
    }
    setDialogOpen(false); fetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد؟')) return;
    await supabase.from('partners').delete().eq('id', id);
    toast.success('تم الحذف'); fetch();
  };

  const totalPercentage = partners.reduce((s, p) => s + Number(p.profit_percentage), 0);

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الشركاء</h2>
          <p className="text-gray-500 text-sm">Partners</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"><Plus className="h-4 w-4 ml-2" /> إضافة شريك</Button>
          </DialogTrigger>
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
        <div className={`mb-4 p-3 rounded-lg text-sm ${totalPercentage === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          إجمالي النسب: {totalPercentage}% {totalPercentage !== 100 && '(يجب أن تكون 100%)'}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">نسبة الأرباح</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell></TableRow>
            ) : partners.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">لا يوجد شركاء</TableCell></TableRow>
            ) : partners.map(p => (
              <TableRow key={p.id}>
                <TableCell><div className="font-medium">{p.name_ar}</div>{p.name_en && <div className="text-xs text-gray-400" dir="ltr">{p.name_en}</div>}</TableCell>
                <TableCell dir="ltr">{p.phone || '—'}</TableCell>
                <TableCell dir="ltr">{p.email || '—'}</TableCell>
                <TableCell><span className="font-bold text-[#D4AF37]">{Number(p.profit_percentage)}%</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
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
