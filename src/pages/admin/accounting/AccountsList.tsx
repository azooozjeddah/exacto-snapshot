import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const accountTypes = [
  { value: 'asset', labelAr: 'أصول', labelEn: 'Assets' },
  { value: 'liability', labelAr: 'خصوم', labelEn: 'Liabilities' },
  { value: 'equity', labelAr: 'حقوق ملكية', labelEn: 'Equity' },
  { value: 'revenue', labelAr: 'إيرادات', labelEn: 'Revenue' },
  { value: 'expense', labelAr: 'مصروفات', labelEn: 'Expenses' },
];

interface Account {
  id: number;
  code: string;
  name_ar: string;
  name_en: string | null;
  type: string;
  balance: number;
  is_active: boolean;
  notes: string | null;
}

const emptyForm = { code: '', name_ar: '', name_en: '', type: 'asset', notes: '' };

export default function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState('all');

  const fetchAccounts = async () => {
    setLoading(true);
    let q = supabase.from('accounts').select('*').order('code');
    if (filterType !== 'all') q = q.eq('type', filterType);
    const { data } = await q;
    setAccounts((data as Account[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, [filterType]);

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
      toast.success('تم تحديث الحساب');
    } else {
      const { error } = await supabase.from('accounts').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('تم إضافة الحساب');
    }
    setDialogOpen(false);
    fetchAccounts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('accounts').delete().eq('id', id);
    toast.success('تم حذف الحساب');
    fetchAccounts();
  };

  const typeLabel = (t: string) => accountTypes.find(at => at.value === t)?.labelAr || t;
  const typeBadgeColor = (t: string) => {
    const colors: Record<string, string> = {
      asset: 'bg-blue-100 text-blue-700', liability: 'bg-red-100 text-red-700',
      equity: 'bg-purple-100 text-purple-700', revenue: 'bg-emerald-100 text-emerald-700',
      expense: 'bg-orange-100 text-orange-700',
    };
    return colors[t] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">دليل الحسابات</h2>
          <p className="text-gray-500 text-sm">Chart of Accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
              <Plus className="h-4 w-4 ml-2" /> إضافة حساب
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editing ? 'تعديل الحساب' : 'إضافة حساب جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>رمز الحساب *</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="1001" />
              </div>
              <div>
                <Label>اسم الحساب (عربي) *</Label>
                <Input value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} placeholder="النقدية" />
              </div>
              <div>
                <Label>اسم الحساب (إنجليزي)</Label>
                <Input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} placeholder="Cash" dir="ltr" />
              </div>
              <div>
                <Label>نوع الحساب *</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {accountTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.labelAr} - {t.labelEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button onClick={handleSave} className="w-full bg-[#D4AF37] hover:bg-[#b8962e] text-white">
                {editing ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}
          className={filterType === 'all' ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>
          الكل
        </Button>
        {accountTypes.map(t => (
          <Button key={t.value} variant={filterType === t.value ? 'default' : 'outline'} size="sm"
            onClick={() => setFilterType(t.value)}
            className={filterType === t.value ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>
            {t.labelAr}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الرمز</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">الرصيد</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell></TableRow>
            ) : accounts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">لا توجد حسابات</TableCell></TableRow>
            ) : accounts.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-sm">{a.code}</TableCell>
                <TableCell>
                  <div className="font-medium">{a.name_ar}</div>
                  {a.name_en && <div className="text-xs text-gray-400" dir="ltr">{a.name_en}</div>}
                </TableCell>
                <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadgeColor(a.type)}`}>{typeLabel(a.type)}</span></TableCell>
                <TableCell className="font-medium">{Number(a.balance).toLocaleString()} ر.س</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
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
