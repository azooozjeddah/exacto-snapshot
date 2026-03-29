import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import AttachmentsSection from '@/components/admin/accounting/AttachmentsSection';
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

interface PurchaseItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Purchase {
  id: number;
  purchase_number: string;
  purchase_date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: string;
  notes: string | null;
  supplier_id: number | null;
  suppliers?: { name_ar: string } | null;
}

const statusMap: Record<string, { ar: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  received: { ar: 'مستلمة', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { ar: 'ملغاة', color: 'bg-gray-100 text-gray-400' },
};

interface Supplier { id: number; name_ar: string; }

const emptyItem = (): PurchaseItem => ({ description: '', quantity: 1, unit_price: 0, total: 0 });

export default function PurchasesList() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    purchase_number: '', supplier_id: '', status: 'pending',
    notes: '', purchase_date: new Date().toISOString().split('T')[0],
  });
  const [items, setItems] = useState<PurchaseItem[]>([emptyItem()]);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = subtotal + taxAmount;

  const fetchData = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([
      supabase.from('purchases').select('*, suppliers(name_ar)').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('id, name_ar').eq('is_active', true).order('name_ar'),
    ]);
    setPurchases((p.data as Purchase[]) || []);
    setSuppliers((s.data as Supplier[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = purchases.filter(p =>
    !search || p.purchase_number.includes(search) || ((p.suppliers as any)?.name_ar || '').includes(search)
  );

  const updateItem = (idx: number, field: keyof PurchaseItem, value: string | number) => {
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
    setForm({ purchase_number: '', supplier_id: '', status: 'pending', notes: '', purchase_date: new Date().toISOString().split('T')[0] });
    setItems([emptyItem()]);
    setDialogOpen(true);
  };

  const openEdit = async (p: Purchase) => {
    setEditingId(p.id);
    setForm({
      purchase_number: p.purchase_number, supplier_id: p.supplier_id ? String(p.supplier_id) : '',
      status: p.status, notes: p.notes || '', purchase_date: p.purchase_date || new Date().toISOString().split('T')[0],
    });
    const { data: itemsData } = await supabase.from('purchase_items' as any).select('*').eq('purchase_id', p.id);
    if (itemsData && itemsData.length > 0) {
      setItems(itemsData as PurchaseItem[]);
    } else {
      setItems([{ description: 'مشتريات', quantity: 1, unit_price: Number(p.subtotal) || Number(p.total), total: Number(p.subtotal) || Number(p.total) }]);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.purchase_number) { toast.error('يرجى ملء رقم المشترى'); return; }
    if (items.some(i => !i.description)) { toast.error('يرجى ملء وصف جميع البنود'); return; }

    const payload = {
      purchase_number: form.purchase_number,
      supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
      status: form.status as any, notes: form.notes || null,
      purchase_date: form.purchase_date,
      subtotal, tax_amount: taxAmount, total,
    };

    if (editingId) {
      const { error } = await supabase.from('purchases').update(payload).eq('id', editingId);
      if (error) { toast.error(error.message); return; }
      await supabase.from('purchase_items' as any).delete().eq('purchase_id', editingId);
      await supabase.from('purchase_items' as any).insert(items.map(it => ({ ...it, purchase_id: editingId, id: undefined })));
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'update', entity_type: 'purchase', entity_id: editingId, details: { purchase_number: form.purchase_number } });
      toast.success('تم تحديث المشترى بنجاح');
    } else {
      const { data, error } = await supabase.from('purchases').insert(payload).select().single();
      if (error) { toast.error(error.message); return; }
      if (data) {
        await supabase.from('purchase_items' as any).insert(items.map(it => ({ ...it, purchase_id: (data as any).id, id: undefined })));
      }
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'create', entity_type: 'purchase', details: { purchase_number: form.purchase_number } });
      toast.success('تم تسجيل المشترى بنجاح');
    }

    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (p: Purchase) => {
    await supabase.from('purchase_items' as any).delete().eq('purchase_id', p.id);
    await supabase.from('purchases').delete().eq('id', p.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'delete', entity_type: 'purchase', entity_id: p.id });
    toast.success('تم الحذف');
    fetchData();
  };

  const handleExport = () => {
    exportToCSV(
      ['الرقم', 'التاريخ', 'المورد', 'قبل الضريبة', 'الضريبة', 'الإجمالي', 'الحالة'],
      filtered.map(p => [p.purchase_number, p.purchase_date, (p.suppliers as any)?.name_ar || '', Number(p.subtotal), Number(p.tax_amount), Number(p.total), statusMap[p.status]?.ar || p.status]),
      'purchases'
    );
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div><h2 className="text-2xl font-bold text-gray-900">المشتريات</h2><p className="text-gray-500 text-sm">Purchases</p></div>
        <Button onClick={openCreate} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
          <Plus className="h-4 w-4 ml-2" /> مشترى جديد
        </Button>
      </div>

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث برقم المشترى أو المورد..."
        onExportCSV={handleExport} helpText="سجّل وأدر مشترياتك مع بنود التفاصيل وحساب ضريبة القيمة المضافة (15%) تلقائياً." helpTextEn="Record and manage purchases with line items and automatic VAT (15%)." />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="text-right font-bold">الرقم</TableHead>
              <TableHead className="text-right font-bold">التاريخ</TableHead>
              <TableHead className="text-right font-bold">المورد</TableHead>
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
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-400">لا توجد مشتريات</TableCell></TableRow>
            ) : filtered.map(p => (
              <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{p.purchase_number}</TableCell>
                <TableCell>{p.purchase_date}</TableCell>
                <TableCell>{(p.suppliers as any)?.name_ar || '—'}</TableCell>
                <TableCell>{Number(p.subtotal || p.total).toLocaleString()} ر.س</TableCell>
                <TableCell className="text-orange-600">{Number(p.tax_amount || 0).toLocaleString()} ر.س</TableCell>
                <TableCell className="font-bold">{Number(p.total).toLocaleString()} ر.س</TableCell>
                <TableCell><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[p.status]?.color || ''}`}>{statusMap[p.status]?.ar || p.status}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف المشترى "{p.purchase_number}"؟</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(p)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction></AlertDialogFooter>
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
        عدد المشتريات: {filtered.length} | الإجمالي: {filtered.reduce((s, p) => s + Number(p.total), 0).toLocaleString()} ر.س
      </p>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل المشترى' : 'تسجيل مشترى جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>رقم المشترى *</Label><Input value={form.purchase_number} onChange={e => setForm({ ...form, purchase_number: e.target.value })} placeholder="PO-001" /></div>
              <div><Label>تاريخ الشراء</Label><Input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} dir="ltr" /></div>
              <div>
                <Label>المورد</Label>
                <Select value={form.supplier_id} onValueChange={v => setForm({ ...form, supplier_id: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name_ar}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.ar}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-bold">بنود المشترى</Label>
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
                        <td className="p-1"><Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="وصف المنتج أو الخدمة" className="border-0 shadow-none" /></td>
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

            <div><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات اختيارية" /></div>

            <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">
              {editingId ? 'حفظ التعديلات' : 'تسجيل المشترى'}
            </Button>

            {/* قسم المرفقات - يظهر دائماً */}
            <AttachmentsSection
              relatedType="purchase"
              relatedId={editingId}
              label="مرفقات المشترى (فاتورة المورد)"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
