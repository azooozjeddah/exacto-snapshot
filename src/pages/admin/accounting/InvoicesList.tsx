import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, Pencil, Printer, X } from 'lucide-react';
import AttachmentsSection from '@/components/admin/accounting/AttachmentsSection';
import InvoicePrintModal from '@/components/admin/accounting/InvoicePrintModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import TableToolbar, { exportToCSV } from '@/components/admin/accounting/TableToolbar';

const VAT_RATE = 0.15;

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  client_phone: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: string;
  notes: string | null;
  items?: InvoiceItem[];
}

const statusMap: Record<string, { ar: string; color: string }> = {
  draft: { ar: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  sent: { ar: 'مرسلة', color: 'bg-blue-100 text-blue-700' },
  paid: { ar: 'مدفوعة', color: 'bg-emerald-100 text-emerald-700' },
  overdue: { ar: 'متأخرة', color: 'bg-red-100 text-red-700' },
  cancelled: { ar: 'ملغاة', color: 'bg-gray-100 text-gray-400' },
};

const emptyItem = (): InvoiceItem => ({ description: '', quantity: 1, unit_price: 0, total: 0 });

export default function InvoicesList() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [printInvoice, setPrintInvoice] = useState<(Invoice & { items: InvoiceItem[] }) | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [form, setForm] = useState({
    invoice_number: '', client_name: '', client_phone: '',
    status: 'draft', notes: '', invoice_date: new Date().toISOString().split('T')[0],
  });
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = subtotal + taxAmount;

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

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated.total = Math.round(Number(updated.quantity) * Number(updated.unit_price) * 100) / 100;
      }
      return updated;
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ invoice_number: '', client_name: '', client_phone: '', status: 'draft', notes: '', invoice_date: new Date().toISOString().split('T')[0] });
    setItems([emptyItem()]);
    setDialogOpen(true);
  };

  const openEdit = async (inv: Invoice) => {
    setEditingId(inv.id);
    setForm({
      invoice_number: inv.invoice_number, client_name: inv.client_name,
      client_phone: inv.client_phone || '', status: inv.status,
      notes: inv.notes || '', invoice_date: inv.invoice_date || new Date().toISOString().split('T')[0],
    });
    // Try to load items from invoice_items table if it exists
    const { data: itemsData } = await supabase.from('invoice_items' as any).select('*').eq('invoice_id', inv.id);
    if (itemsData && itemsData.length > 0) {
      setItems(itemsData as InvoiceItem[]);
    } else {
      // Fallback: create one item from total
      setItems([{ description: 'خدمات', quantity: 1, unit_price: Number(inv.subtotal) || Number(inv.total), total: Number(inv.subtotal) || Number(inv.total) }]);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.invoice_number || !form.client_name) { toast.error('يرجى ملء الحقول المطلوبة'); return; }
    if (items.some(i => !i.description)) { toast.error('يرجى ملء وصف جميع البنود'); return; }

    const payload = {
      invoice_number: form.invoice_number, client_name: form.client_name,
      client_phone: form.client_phone || null, status: form.status as any,
      notes: form.notes || null, invoice_date: form.invoice_date,
      subtotal, tax_amount: taxAmount, total,
    };

    if (editingId) {
      const { error } = await supabase.from('invoices').update(payload).eq('id', editingId);
      if (error) { toast.error(error.message); return; }
      // Update items
      await supabase.from('invoice_items' as any).delete().eq('invoice_id', editingId);
      await supabase.from('invoice_items' as any).insert(items.map(it => ({ ...it, invoice_id: editingId, id: undefined })));
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'update', entity_type: 'invoice', entity_id: editingId, details: { invoice_number: form.invoice_number } });
      toast.success('تم تحديث الفاتورة بنجاح');
    } else {
      const { data, error } = await supabase.from('invoices').insert(payload).select().single();
      if (error) { toast.error(error.message); return; }
      if (data) {
        await supabase.from('invoice_items' as any).insert(items.map(it => ({ ...it, invoice_id: (data as any).id, id: undefined })));
      }
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'create', entity_type: 'invoice', details: { invoice_number: form.invoice_number } });
      toast.success('تم إنشاء الفاتورة بنجاح');
    }

    setDialogOpen(false);
    fetchInvoices();
  };

  const handleDelete = async (inv: Invoice) => {
    await supabase.from('invoice_items' as any).delete().eq('invoice_id', inv.id);
    await supabase.from('invoices').delete().eq('id', inv.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'delete', entity_type: 'invoice', entity_id: inv.id, details: { invoice_number: inv.invoice_number } });
    toast.success('تم حذف الفاتورة');
    fetchInvoices();
  };

  const handleExport = () => {
    exportToCSV(
      ['رقم الفاتورة', 'التاريخ', 'العميل', 'المبلغ قبل الضريبة', 'الضريبة', 'الإجمالي', 'الحالة'],
      filtered.map(i => [i.invoice_number, i.invoice_date, i.client_name, Number(i.subtotal), Number(i.tax_amount), Number(i.total), statusMap[i.status]?.ar || i.status]),
      'invoices'
    );
  };

  const handlePrint = async (inv: Invoice) => {
    const { data: itemsData } = await supabase.from('invoice_items' as any).select('*').eq('invoice_id', inv.id);
    setPrintInvoice({ ...inv, items: (itemsData as InvoiceItem[]) || [] });
  };

  return (
    <div dir="rtl">
      <InvoicePrintModal invoice={printInvoice} onClose={() => setPrintInvoice(null)} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الفواتير</h2>
          <p className="text-gray-500 text-sm">Invoices</p>
        </div>
        <Button onClick={openCreate} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
          <Plus className="h-4 w-4 ml-2" /> فاتورة جديدة
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {[{ v: 'all', l: 'الكل' }, ...Object.entries(statusMap).map(([k, v]) => ({ v: k, l: v.ar }))].map(s => (
          <Button key={s.v} variant={filterStatus === s.v ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(s.v)}
            className={filterStatus === s.v ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>{s.l}</Button>
        ))}
      </div>

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث برقم الفاتورة أو اسم العميل..."
        onExportCSV={handleExport} helpText="أنشئ وأدر فواتيرك. يدعم النظام بنود التفاصيل وحساب ضريبة القيمة المضافة (15%) تلقائياً." helpTextEn="Create and manage invoices with line items and automatic VAT (15%) calculation." />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="text-right font-bold">رقم الفاتورة</TableHead>
              <TableHead className="text-right font-bold">التاريخ</TableHead>
              <TableHead className="text-right font-bold">العميل</TableHead>
              <TableHead className="text-right font-bold">قبل الضريبة</TableHead>
              <TableHead className="text-right font-bold">الضريبة 15%</TableHead>
              <TableHead className="text-right font-bold">الإجمالي</TableHead>
              <TableHead className="text-right font-bold">الحالة</TableHead>
              <TableHead className="text-right font-bold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-400">لا توجد فواتير</TableCell></TableRow>
            ) : filtered.map(inv => (
              <TableRow key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{inv.invoice_number}</TableCell>
                <TableCell>{inv.invoice_date}</TableCell>
                <TableCell className="font-medium">{inv.client_name}</TableCell>
                <TableCell>{Number(inv.subtotal || inv.total).toLocaleString()} ر.س</TableCell>
                <TableCell className="text-orange-600">{Number(inv.tax_amount || 0).toLocaleString()} ر.س</TableCell>
                <TableCell className="font-bold">{Number(inv.total).toLocaleString()} ر.س</TableCell>
                <TableCell><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[inv.status]?.color || ''}`}>{statusMap[inv.status]?.ar || inv.status}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => openEdit(inv)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-gray-500" onClick={() => handlePrint(inv)}><Printer className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف الفاتورة "{inv.invoice_number}"؟</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(inv)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        عدد الفواتير: {filtered.length} | الإجمالي: {filtered.reduce((s, i) => s + Number(i.total), 0).toLocaleString()} ر.س
      </p>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>رقم الفاتورة *</Label><Input value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-001" /></div>
              <div><Label>تاريخ الفاتورة</Label><Input type="date" value={form.invoice_date} onChange={e => setForm({ ...form, invoice_date: e.target.value })} dir="ltr" /></div>
              <div><Label>اسم العميل *</Label><Input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} /></div>
              <div><Label>رقم الهاتف</Label><Input value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} dir="ltr" /></div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-bold">بنود الفاتورة</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setItems(p => [...p, emptyItem()])}>
                  <Plus className="h-3 w-3 ml-1" /> إضافة بند
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    <th className="p-2 text-right font-medium">الوصف</th>
                    <th className="p-2 text-center font-medium w-20">الكمية</th>
                    <th className="p-2 text-center font-medium w-28">سعر الوحدة</th>
                    <th className="p-2 text-center font-medium w-28">الإجمالي</th>
                    <th className="p-2 w-8"></th>
                  </tr></thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-1"><Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="وصف الخدمة أو المنتج" className="border-0 shadow-none" /></td>
                        <td className="p-1"><Input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 1)} className="border-0 shadow-none text-center" dir="ltr" /></td>
                        <td className="p-1"><Input type="number" min="0" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} className="border-0 shadow-none text-center" dir="ltr" /></td>
                        <td className="p-1 text-center font-medium">{item.total.toLocaleString()} ر.س</td>
                        <td className="p-1">
                          {items.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="text-red-400 h-7 w-7" onClick={() => setItems(p => p.filter((_, i) => i !== idx))}>
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-amber-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">المبلغ قبل الضريبة:</span><span className="font-medium">{subtotal.toLocaleString()} ر.س</span></div>
              <div className="flex justify-between"><span className="text-gray-600">ضريبة القيمة المضافة (15%):</span><span className="font-medium text-orange-600">{taxAmount.toLocaleString()} ر.س</span></div>
              <div className="flex justify-between border-t pt-1"><span className="font-bold">الإجمالي شامل الضريبة:</span><span className="font-bold text-[#D4AF37] text-base">{total.toLocaleString()} ر.س</span></div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.ar}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات اختيارية" /></div>
            </div>

            <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">
              {editingId ? 'حفظ التعديلات' : 'إنشاء الفاتورة'}
            </Button>

            {/* قسم المرفقات - يظهر دائماً */}
            <AttachmentsSection
              relatedType="invoice"
              relatedId={editingId}
              label="مرفقات الفاتورة"
            />
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}
