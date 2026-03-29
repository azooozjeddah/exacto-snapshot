import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import TableToolbar, { exportToCSV } from '@/components/admin/accounting/TableToolbar';

const accountTypes = [
  { value: 'asset', labelAr: 'أصول', labelEn: 'Assets' },
  { value: 'liability', labelAr: 'خصوم', labelEn: 'Liabilities' },
  { value: 'equity', labelAr: 'حقوق ملكية', labelEn: 'Equity' },
  { value: 'revenue', labelAr: 'إيرادات', labelEn: 'Revenue' },
  { value: 'expense', labelAr: 'مصروفات', labelEn: 'Expenses' },
];

interface Account {
  id: number; code: string; name_ar: string; name_en: string | null;
  type: string; balance: number; is_active: boolean; notes: string | null;
}

const emptyForm = { code: '', name_ar: '', name_en: '', type: 'asset', notes: '' };

export default function AccountsList() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    let q = supabase.from('accounts').select('*').order('code');
    if (filterType !== 'all') q = q.eq('type', filterType);
    const { data } = await q;
    setAccounts((data as Account[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, [filterType]);

  const filtered = accounts.filter(a =>
    !search || a.code.includes(search) || a.name_ar.includes(search) || (a.name_en || '').toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (a: Account) => {
    setEditing(a);
    setForm({ code: a.code, name_ar: a.name_ar, name_en: a.name_en || '', type: a.type, notes: a.notes || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.name_ar) { toast.error('يرجى ملء الحقول المطلوبة'); return; }
    const payload = { code: form.code, name_ar: form.name_ar, name_en: form.name_en || null, type: form.type, notes: form.notes || null };
    if (editing) {
      const { error } = await supabase.from('accounts').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'update', entity_type: 'account', entity_id: editing.id, details: payload });
      toast.success('تم تحديث الحساب بنجاح');
    } else {
      const { error } = await supabase.from('accounts').insert(payload);
      if (error) { toast.error(error.message); return; }
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'create', entity_type: 'account', details: payload });
      toast.success('تم إضافة الحساب بنجاح');
    }
    setDialogOpen(false);
    fetchAccounts();
  };

  const handleDelete = async (a: Account) => {
    await supabase.from('accounts').delete().eq('id', a.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'delete', entity_type: 'account', entity_id: a.id, details: { code: a.code, name_ar: a.name_ar } });
    toast.success('تم حذف الحساب');
    fetchAccounts();
  };

  const handleExport = () => {
    exportToCSV(
      ['الرمز', 'الاسم (عربي)', 'الاسم (إنجليزي)', 'النوع', 'الرصيد'],
      filtered.map(a => [a.code, a.name_ar, a.name_en || '', accountTypes.find(t => t.value === a.type)?.labelAr || a.type, Number(a.balance)]),
      'accounts'
    );
  };

  const typeLabel = (t: string) => accountTypes.find(at => at.value === t)?.labelAr || t;
  const typeBadgeColor = (t: string) => {
    const colors: Record<string, string> = { asset: 'bg-blue-100 text-blue-700', liability: 'bg-red-100 text-red-700', equity: 'bg-purple-100 text-purple-700', revenue: 'bg-emerald-100 text-emerald-700', expense: 'bg-orange-100 text-orange-700' };
    return colors[t] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">دليل الحسابات</h2>
          <p className="text-gray-500 text-sm">Chart of Accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white"><Plus className="h-4 w-4 ml-2" /> إضافة حساب</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>{editing ? 'تعديل الحساب' : 'إضافة حساب جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>رمز الحساب *</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="1001" /></div>
              <div><Label>اسم الحساب (عربي) *</Label><Input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} placeholder="النقدية" /></div>
              <div><Label>اسم الحساب (إنجليزي)</Label><Input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} placeholder="Cash" dir="ltr" /></div>
              <div>
                <Label>نوع الحساب *</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{accountTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.labelAr} - {t.labelEn}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">{editing ? 'تحديث' : 'إضافة'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {[{ value: 'all', label: 'الكل' }, ...accountTypes.map(t => ({ value: t.value, label: t.labelAr }))].map(t => (
          <Button key={t.value} variant={filterType === t.value ? 'default' : 'outline'} size="sm"
            onClick={() => setFilterType(t.value)}
            className={filterType === t.value ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>{t.label}</Button>
        ))}
      </div>

      <TableToolbar
        searchValue={search} onSearchChange={setSearch}
        searchPlaceholder="بحث بالرمز أو الاسم..."
        onExportCSV={handleExport}
        helpText="أضف وأدر حساباتك المحاسبية هنا. يمكنك التصفية حسب نوع الحساب والبحث بالرمز أو الاسم."
        helpTextEn="Add and manage your chart of accounts. Filter by type and search by code or name."
      />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table id="accounts-table">
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="text-right font-bold">الرمز</TableHead>
              <TableHead className="text-right font-bold">الاسم</TableHead>
              <TableHead className="text-right font-bold">النوع</TableHead>
              <TableHead className="text-right font-bold">الرصيد</TableHead>
              <TableHead className="text-right font-bold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">لا توجد حسابات</TableCell></TableRow>
            ) : filtered.map(a => (
              <TableRow key={a.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{a.code}</TableCell>
                <TableCell>
                  <div className="font-medium">{a.name_ar}</div>
                  {a.name_en && <div className="text-xs text-gray-400" dir="ltr">{a.name_en}</div>}
                </TableCell>
                <TableCell><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeBadgeColor(a.type)}`}>{typeLabel(a.type)}</span></TableCell>
                <TableCell className="font-bold">{Number(a.balance).toLocaleString()} ر.س</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>تعديل</TooltipContent></Tooltip>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف الحساب "{a.name_ar}"؟ هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(a)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">عدد الحسابات: {filtered.length}</p>
    </div>
  );
}
