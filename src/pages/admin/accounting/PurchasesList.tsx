import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Purchase {
  id: number;
  purchase_number: string;
  purchase_date: string;
  total: number;
  status: string;
  suppliers?: { name_ar: string } | null;
}

const statusMap: Record<string, { ar: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  received: { ar: 'مستلمة', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { ar: 'ملغاة', color: 'bg-gray-100 text-gray-400' },
};

interface Supplier { id: number; name_ar: string; }

export default function PurchasesList() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ purchase_number: '', supplier_id: '', total: '', status: 'pending' });

  const fetch = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([
      supabase.from('purchases').select('*, suppliers(name_ar)').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('id, name_ar').eq('is_active', true).order('name_ar'),
    ]);
    setPurchases((p.data as Purchase[]) || []);
    setSuppliers((s.data as Supplier[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.purchase_number) { toast.error('يرجى ملء رقم المشترى'); return; }
    const total = parseFloat(form.total) || 0;
    const { error } = await supabase.from('purchases').insert({
      purchase_number: form.purchase_number,
      supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
      total, subtotal: total, tax_amount: 0,
      status: form.status as any,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('تم تسجيل المشترى');
    setDialogOpen(false);
    setForm({ purchase_number: '', supplier_id: '', total: '', status: 'pending' });
    fetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد؟')) return;
    await supabase.from('purchases').delete().eq('id', id);
    toast.success('تم الحذف');
    fetch();
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المشتريات</h2>
          <p className="text-gray-500 text-sm">Purchases</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"><Plus className="h-4 w-4 ml-2" /> مشترى جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>تسجيل مشترى جديد</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>رقم المشترى *</Label><Input value={form.purchase_number} onChange={e => setForm({ ...form, purchase_number: e.target.value })} placeholder="PO-001" /></div>
              <div>
                <Label>المورد</Label>
                <Select value={form.supplier_id} onValueChange={v => setForm({ ...form, supplier_id: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name_ar}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>المبلغ</Label><Input type="number" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} dir="ltr" /></div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.ar}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">تسجيل</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الرقم</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">المورد</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell></TableRow>
            ) : purchases.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">لا توجد مشتريات</TableCell></TableRow>
            ) : purchases.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.purchase_number}</TableCell>
                <TableCell>{p.purchase_date}</TableCell>
                <TableCell>{(p.suppliers as any)?.name_ar || '—'}</TableCell>
                <TableCell className="font-medium">{Number(p.total).toLocaleString()} ر.س</TableCell>
                <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[p.status]?.color || ''}`}>{statusMap[p.status]?.ar || p.status}</span></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
