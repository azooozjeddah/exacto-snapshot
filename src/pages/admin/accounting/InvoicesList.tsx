import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  total: number;
  status: string;
}

const statusMap: Record<string, { ar: string; color: string }> = {
  draft: { ar: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  sent: { ar: 'مرسلة', color: 'bg-blue-100 text-blue-700' },
  paid: { ar: 'مدفوعة', color: 'bg-emerald-100 text-emerald-700' },
  overdue: { ar: 'متأخرة', color: 'bg-red-100 text-red-700' },
  cancelled: { ar: 'ملغاة', color: 'bg-gray-100 text-gray-400' },
};

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', client_name: '', client_phone: '', total: '', status: 'draft' });

  const fetchInvoices = async () => {
    setLoading(true);
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    setInvoices((data as Invoice[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleSave = async () => {
    if (!form.invoice_number || !form.client_name) { toast.error('يرجى ملء الحقول المطلوبة'); return; }
    const total = parseFloat(form.total) || 0;
    const { error } = await supabase.from('invoices').insert({
      invoice_number: form.invoice_number,
      client_name: form.client_name,
      client_phone: form.client_phone || null,
      total,
      subtotal: total,
      tax_amount: 0,
      status: form.status as any,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('تم إنشاء الفاتورة');
    setDialogOpen(false);
    setForm({ invoice_number: '', client_name: '', client_phone: '', total: '', status: 'draft' });
    fetchInvoices();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('invoices').delete().eq('id', id);
    toast.success('تم حذف الفاتورة');
    fetchInvoices();
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الفواتير</h2>
          <p className="text-gray-500 text-sm">Invoices</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"><Plus className="h-4 w-4 ml-2" /> فاتورة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>إنشاء فاتورة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>رقم الفاتورة *</Label><Input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-001" /></div>
              <div><Label>اسم العميل *</Label><Input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} /></div>
              <div><Label>رقم الهاتف</Label><Input value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} dir="ltr" /></div>
              <div><Label>المبلغ الإجمالي</Label><Input type="number" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} placeholder="0.00" dir="ltr" /></div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.ar}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">إنشاء</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم الفاتورة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">لا توجد فواتير</TableCell></TableRow>
            ) : invoices.map(inv => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                <TableCell>{inv.invoice_date}</TableCell>
                <TableCell className="font-medium">{inv.client_name}</TableCell>
                <TableCell className="font-medium">{Number(inv.total).toLocaleString()} ر.س</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[inv.status]?.color || ''}`}>
                    {statusMap[inv.status]?.ar || inv.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
