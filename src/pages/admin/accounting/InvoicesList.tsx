import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import TableToolbar, { exportToCSV } from '@/components/admin/accounting/TableToolbar';

interface Invoice {
  id: number; invoice_number: string; invoice_date: string; client_name: string; total: number; status: string;
}

const statusMap: Record<string, { ar: string; color: string }> = {
  draft: { ar: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  sent: { ar: 'مرسلة', color: 'bg-blue-100 text-blue-700' },
  paid: { ar: 'مدفوعة', color: 'bg-emerald-100 text-emerald-700' },
  overdue: { ar: 'متأخرة', color: 'bg-red-100 text-red-700' },
  cancelled: { ar: 'ملغاة', color: 'bg-gray-100 text-gray-400' },
};

export default function InvoicesList() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', client_name: '', client_phone: '', total: '', status: 'draft' });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchInvoices = async () => {
    setLoading(true);
    let q = supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (filterStatus !== 'all') q = q.eq('status', filterStatus);
    const { data } = await q;
    setInvoices((data as Invoice[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, [filterStatus]);

  const filtered = invoices.filter(i =>
    !search || i.invoice_number.includes(search) || i.client_name.includes(search)
  );

  const handleSave = async () => {
    if (!form.invoice_number || !form.client_name) { toast.error('يرجى ملء الحقول المطلوبة'); return; }
    const total = parseFloat(form.total) || 0;
    const { error } = await supabase.from('invoices').insert({
      invoice_number: form.invoice_number, client_name: form.client_name,
      client_phone: form.client_phone || null, total, subtotal: total, tax_amount: 0, status: form.status as any,
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'create', entity_type: 'invoice', details: { invoice_number: form.invoice_number } });
    toast.success('تم إنشاء الفاتورة بنجاح');
    setDialogOpen(false);
    setForm({ invoice_number: '', client_name: '', client_phone: '', total: '', status: 'draft' });
    fetchInvoices();
  };

  const handleDelete = async (inv: Invoice) => {
    await supabase.from('invoices').delete().eq('id', inv.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'delete', entity_type: 'invoice', entity_id: inv.id, details: { invoice_number: inv.invoice_number } });
    toast.success('تم حذف الفاتورة');
    fetchInvoices();
  };

  const handleExport = () => {
    exportToCSV(
      ['رقم الفاتورة', 'التاريخ', 'العميل', 'المبلغ', 'الحالة'],
      filtered.map(i => [i.invoice_number, i.invoice_date, i.client_name, Number(i.total), statusMap[i.status]?.ar || i.status]),
      'invoices'
    );
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
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
                  <SelectContent>{Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.ar}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">إنشاء</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {[{ v: 'all', l: 'الكل' }, ...Object.entries(statusMap).map(([k, v]) => ({ v: k, l: v.ar }))].map(s => (
          <Button key={s.v} variant={filterStatus === s.v ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(s.v)}
            className={filterStatus === s.v ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>{s.l}</Button>
        ))}
      </div>

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث برقم الفاتورة أو اسم العميل..."
        onExportCSV={handleExport} helpText="أنشئ وأدر فواتيرك هنا. يمكنك التصفية حسب الحالة والبحث." helpTextEn="Create and manage invoices. Filter by status and search." />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="text-right font-bold">رقم الفاتورة</TableHead>
              <TableHead className="text-right font-bold">التاريخ</TableHead>
              <TableHead className="text-right font-bold">العميل</TableHead>
              <TableHead className="text-right font-bold">المبلغ</TableHead>
              <TableHead className="text-right font-bold">الحالة</TableHead>
              <TableHead className="text-right font-bold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">لا توجد فواتير</TableCell></TableRow>
            ) : filtered.map(inv => (
              <TableRow key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{inv.invoice_number}</TableCell>
                <TableCell>{inv.invoice_date}</TableCell>
                <TableCell className="font-medium">{inv.client_name}</TableCell>
                <TableCell className="font-bold">{Number(inv.total).toLocaleString()} ر.س</TableCell>
                <TableCell><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[inv.status]?.color || ''}`}>{statusMap[inv.status]?.ar || inv.status}</span></TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف الفاتورة "{inv.invoice_number}"؟</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(inv)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">عدد الفواتير: {filtered.length} | الإجمالي: {filtered.reduce((s, i) => s + Number(i.total), 0).toLocaleString()} ر.س</p>
    </div>
  );
}
