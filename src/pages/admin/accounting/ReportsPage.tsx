import { useState } from 'react';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Download, Printer, BarChart3, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

type ReportType = 'balance_sheet' | 'income_statement' | 'cash_flow' | 'invoices_report' | 'purchases_report' | 'partners_report';

const reportTypes: { value: ReportType; labelAr: string; labelEn: string; icon: any }[] = [
  { value: 'balance_sheet', labelAr: 'الميزانية العمومية', labelEn: 'Balance Sheet', icon: BarChart3 },
  { value: 'income_statement', labelAr: 'قائمة الدخل', labelEn: 'Income Statement', icon: TrendingUp },
  { value: 'cash_flow', labelAr: 'التدفقات النقدية', labelEn: 'Cash Flow', icon: DollarSign },
  { value: 'invoices_report', labelAr: 'تقرير الفواتير والمبيعات', labelEn: 'Invoices & Sales', icon: FileText },
  { value: 'purchases_report', labelAr: 'تقرير المشتريات والمصروفات', labelEn: 'Purchases & Expenses', icon: ShoppingCart },
  { value: 'partners_report', labelAr: 'تقرير توزيع الأرباح', labelEn: 'Profit Distribution', icon: Users },
];

interface ReportData {
  title: string;
  titleEn: string;
  headers: string[];
  rows: (string | number)[][];
  totals?: (string | number)[];
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportType>('balance_sheet');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      let data: ReportData | null = null;

      if (selectedReport === 'balance_sheet') {
        const { data: accounts } = await supabase.from('accounts').select('*').in('type', ['asset', 'liability', 'equity']).order('type').order('code');
        const grouped = { asset: [] as any[], liability: [] as any[], equity: [] as any[] };
        (accounts || []).forEach(a => { if (grouped[a.type as keyof typeof grouped]) grouped[a.type as keyof typeof grouped].push(a); });
        const rows: (string | number)[][] = [];
        const typeLabels: Record<string, string> = { asset: '📦 الأصول', liability: '📋 الخصوم', equity: '💰 حقوق الملكية' };
        let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
        for (const [type, items] of Object.entries(grouped)) {
          rows.push([typeLabels[type] || type, '', '']);
          items.forEach((a: any) => {
            rows.push(['  ' + a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
            if (type === 'asset') totalAssets += Number(a.balance);
            if (type === 'liability') totalLiabilities += Number(a.balance);
            if (type === 'equity') totalEquity += Number(a.balance);
          });
        }
        data = {
          title: 'الميزانية العمومية', titleEn: 'Balance Sheet',
          headers: ['الحساب', 'Account', 'الرصيد (ر.س)'],
          rows,
          totals: ['الإجمالي', 'Total', `أصول: ${totalAssets.toLocaleString()} | خصوم+ملكية: ${(totalLiabilities + totalEquity).toLocaleString()}`],
        };
      } else if (selectedReport === 'income_statement') {
        const { data: accounts } = await supabase.from('accounts').select('*').in('type', ['revenue', 'expense']).order('type').order('code');
        const rows: (string | number)[][] = [];
        let totalRevenue = 0, totalExpense = 0;
        rows.push(['📈 الإيرادات', '', '']);
        (accounts || []).filter(a => a.type === 'revenue').forEach(a => {
          rows.push(['  ' + a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
          totalRevenue += Number(a.balance);
        });
        rows.push(['📉 المصروفات', '', '']);
        (accounts || []).filter(a => a.type === 'expense').forEach(a => {
          rows.push(['  ' + a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
          totalExpense += Number(a.balance);
        });
        const netIncome = totalRevenue - totalExpense;
        data = {
          title: 'قائمة الدخل', titleEn: 'Income Statement',
          headers: ['البند', 'Item', 'المبلغ (ر.س)'],
          rows,
          totals: ['صافي الدخل / Net Income', '', netIncome.toLocaleString()],
        };
      } else if (selectedReport === 'cash_flow') {
        const { data: accounts } = await supabase.from('accounts').select('*').eq('type', 'asset').order('code');
        const rows = (accounts || []).map(a => [a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
        const total = (accounts || []).reduce((s, a) => s + Number(a.balance), 0);
        data = {
          title: 'التدفقات النقدية', titleEn: 'Cash Flow Statement',
          headers: ['الحساب', 'Account', 'الرصيد (ر.س)'],
          rows,
          totals: ['الإجمالي', 'Total', total.toLocaleString()],
        };
      } else if (selectedReport === 'invoices_report') {
        const { data: invoices } = await supabase.from('invoices').select('*').order('invoice_date', { ascending: false });
        const statusAr: Record<string, string> = { draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة', overdue: 'متأخرة', cancelled: 'ملغاة' };
        const rows = (invoices || []).map(i => [i.invoice_number, i.invoice_date, i.client_name, Number(i.total).toLocaleString(), statusAr[i.status] || i.status]);
        const total = (invoices || []).reduce((s, i) => s + Number(i.total), 0);
        data = {
          title: 'تقرير الفواتير والمبيعات', titleEn: 'Invoices & Sales Report',
          headers: ['رقم الفاتورة', 'التاريخ', 'العميل', 'المبلغ (ر.س)', 'الحالة'],
          rows,
          totals: ['', '', 'الإجمالي', total.toLocaleString(), ''],
        };
      } else if (selectedReport === 'purchases_report') {
        const { data: purchases } = await supabase.from('purchases').select('*, suppliers(name_ar)').order('purchase_date', { ascending: false });
        const statusAr: Record<string, string> = { pending: 'قيد الانتظار', received: 'مستلمة', cancelled: 'ملغاة' };
        const rows = (purchases || []).map(p => [p.purchase_number, p.purchase_date, (p.suppliers as any)?.name_ar || '—', Number(p.total).toLocaleString(), statusAr[p.status] || p.status]);
        const total = (purchases || []).reduce((s, p) => s + Number(p.total), 0);
        data = {
          title: 'تقرير المشتريات والمصروفات', titleEn: 'Purchases & Expenses Report',
          headers: ['رقم المشترى', 'التاريخ', 'المورد', 'المبلغ (ر.س)', 'الحالة'],
          rows,
          totals: ['', '', 'الإجمالي', total.toLocaleString(), ''],
        };
      } else if (selectedReport === 'partners_report') {
        const { data: partners } = await supabase.from('partners').select('*').order('name_ar');
        const rows = (partners || []).map(p => [p.name_ar, p.name_en || '', `${Number(p.profit_percentage)}%`, p.phone || '—', p.email || '—']);
        data = {
          title: 'تقرير توزيع الأرباح للشركاء', titleEn: 'Partners Profit Distribution Report',
          headers: ['الشريك', 'Partner', 'النسبة', 'الهاتف', 'البريد'],
          rows,
          totals: ['', '', `${(partners || []).reduce((s, p) => s + Number(p.profit_percentage), 0)}%`, '', ''],
        };
      }

      setReportData(data);
      // Log to audit
      await supabase.from('audit_logs').insert({
        user_id: user?.id, user_email: user?.email || '', action: 'generate_report',
        entity_type: 'report', details: { report_type: selectedReport },
      });
    } catch (err) {
      toast.error('حدث خطأ في إنشاء التقرير');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-content');
    if (!printContent) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${reportData?.title}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;direction:rtl}table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;font-weight:bold}
      .header{text-align:center;margin-bottom:30px}.stamp{margin-top:40px;padding:20px;border:2px solid #D4AF37;border-radius:10px;text-align:center}
      @media print{.no-print{display:none}}</style></head><body>
      <div class="header"><h1 style="color:#D4AF37">The View Avenue</h1><h2>${reportData?.title}</h2><h3>${reportData?.titleEn}</h3>
      <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')} | ${new Date().toLocaleTimeString('ar-SA')}</p>
      <p>أعده: ${user?.email || ''}</p></div>${printContent.innerHTML}
      <div class="stamp"><p style="color:#D4AF37;font-weight:bold;font-size:18px">✦ The View Avenue ✦</p>
      <p>نظام محاسبي معتمد</p><p>Certified Accounting System</p>
      <p style="font-size:12px;color:#888">تم إنشاء هذا التقرير آلياً بتاريخ ${new Date().toISOString()}</p></div>
      </body></html>`);
    w.document.close();
    w.print();
  };

  const handleDownloadCSV = () => {
    if (!reportData) return;
    const BOM = '\uFEFF';
    let csv = BOM + reportData.headers.join(',') + '\n';
    reportData.rows.forEach(r => { csv += r.map(c => `"${c}"`).join(',') + '\n'; });
    if (reportData.totals) csv += reportData.totals.map(c => `"${c}"`).join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${reportData.titleEn.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('تم تحميل التقرير بنجاح');
  };

  const currentReport = reportTypes.find(r => r.value === selectedReport);

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التقارير المالية</h2>
          <p className="text-gray-500 text-sm">Financial Reports</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {reportTypes.map(rt => (
          <button key={rt.value} onClick={() => { setSelectedReport(rt.value); setReportData(null); }}
            className={`p-4 rounded-xl border text-center transition-all ${selectedReport === rt.value ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <rt.icon className={`h-6 w-6 mx-auto mb-2 ${selectedReport === rt.value ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
            <p className="text-xs font-medium text-gray-700">{rt.labelAr}</p>
            <p className="text-[10px] text-gray-400">{rt.labelEn}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Button onClick={generateReport} disabled={loading} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
          {loading ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
        </Button>
        {reportData && (
          <>
            <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 ml-2" /> طباعة</Button>
            <Button variant="outline" onClick={handleDownloadCSV}><Download className="h-4 w-4 ml-2" /> تحميل Excel/CSV</Button>
          </>
        )}
      </div>

      {reportData && (
        <div id="report-content" className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 text-center">
            <h3 className="text-xl font-bold text-[#D4AF37]">The View Avenue</h3>
            <h4 className="text-lg font-bold text-gray-900 mt-1">{reportData.title}</h4>
            <p className="text-sm text-gray-500">{reportData.titleEn}</p>
            <p className="text-xs text-gray-400 mt-2">
              التاريخ: {new Date().toLocaleDateString('ar-SA')} | الوقت: {new Date().toLocaleTimeString('ar-SA')} | أعده: {user?.email}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {reportData.headers.map((h, i) => <TableHead key={i} className="text-right">{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.rows.map((row, i) => (
                <TableRow key={i} className={String(row[0]).startsWith('�') ? 'bg-gray-50 font-bold' : ''}>
                  {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                </TableRow>
              ))}
              {reportData.totals && (
                <TableRow className="bg-[#D4AF37]/5 font-bold border-t-2 border-[#D4AF37]">
                  {reportData.totals.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">✦ تم إنشاء هذا التقرير آلياً من النظام المحاسبي - The View Avenue ✦</p>
          </div>
        </div>
      )}
    </div>
  );
}
