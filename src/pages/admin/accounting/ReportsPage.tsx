/**
 * ReportsPage - التقارير المالية
 * Financial Reports - Balance Sheet, Income Statement, Cash Flow, etc.
 * Features: Date filters, 6 report types, print with stamp, CSV export
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Download, Printer, BarChart3, TrendingUp, DollarSign, Users, ShoppingCart, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

type ReportType = 'balance_sheet' | 'income_statement' | 'cash_flow' | 'invoices_report' | 'purchases_report' | 'partners_report';

const reportTypes: { value: ReportType; labelAr: string; labelEn: string; icon: any; hasDateFilter: boolean }[] = [
  { value: 'balance_sheet', labelAr: 'الميزانية العمومية', labelEn: 'Balance Sheet', icon: BarChart3, hasDateFilter: false },
  { value: 'income_statement', labelAr: 'قائمة الدخل', labelEn: 'Income Statement', icon: TrendingUp, hasDateFilter: false },
  { value: 'cash_flow', labelAr: 'التدفقات النقدية', labelEn: 'Cash Flow', icon: DollarSign, hasDateFilter: false },
  { value: 'invoices_report', labelAr: 'تقرير الفواتير', labelEn: 'Invoices & Sales', icon: FileText, hasDateFilter: true },
  { value: 'purchases_report', labelAr: 'تقرير المشتريات', labelEn: 'Purchases & Expenses', icon: ShoppingCart, hasDateFilter: true },
  { value: 'partners_report', labelAr: 'توزيع الأرباح', labelEn: 'Profit Distribution', icon: Users, hasDateFilter: false },
];

// Quick date range presets
const datePresets = [
  { label: 'هذا الشهر', getRange: () => { const now = new Date(); return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) }; } },
  { label: 'الشهر الماضي', getRange: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth() - 1, 1); const last = new Date(now.getFullYear(), now.getMonth(), 0); return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) }; } },
  { label: 'هذا الربع', getRange: () => { const now = new Date(); const q = Math.floor(now.getMonth() / 3); const first = new Date(now.getFullYear(), q * 3, 1); return { from: first.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) }; } },
  { label: 'هذه السنة', getRange: () => { const now = new Date(); return { from: `${now.getFullYear()}-01-01`, to: now.toISOString().slice(0, 10) }; } },
  { label: 'السنة الماضية', getRange: () => { const y = new Date().getFullYear() - 1; return { from: `${y}-01-01`, to: `${y}-12-31` }; } },
];

interface ReportData {
  title: string; titleEn: string;
  headers: string[]; rows: (string | number)[][];
  totals?: (string | number)[];
  sectionRows?: Set<number>;
  dateRange?: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportType>('balance_sheet');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const currentReportType = reportTypes.find(r => r.value === selectedReport);

  const applyPreset = (preset: typeof datePresets[0]) => {
    const range = preset.getRange();
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let data: ReportData | null = null;
      const dateRangeLabel = dateFrom && dateTo ? `من ${dateFrom} إلى ${dateTo}` : 'جميع الفترات';

      if (selectedReport === 'balance_sheet') {
        const { data: accounts, error } = await supabase.from('accounts').select('*').in('type', ['asset', 'liability', 'equity']).order('type').order('code');
        if (error) throw error;
        const grouped = { asset: [] as any[], liability: [] as any[], equity: [] as any[] };
        (accounts || []).forEach(a => { if (grouped[a.type as keyof typeof grouped]) grouped[a.type as keyof typeof grouped].push(a); });
        const rows: (string | number)[][] = [];
        const sectionRows = new Set<number>();
        const typeLabels: Record<string, string> = { asset: 'الأصول — Assets', liability: 'الخصوم — Liabilities', equity: 'حقوق الملكية — Equity' };
        let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
        for (const [type, items] of Object.entries(grouped)) {
          sectionRows.add(rows.length);
          rows.push([typeLabels[type] || type, '', '']);
          items.forEach((a: any) => {
            rows.push(['  ' + a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
            if (type === 'asset') totalAssets += Number(a.balance);
            if (type === 'liability') totalLiabilities += Number(a.balance);
            if (type === 'equity') totalEquity += Number(a.balance);
          });
        }
        data = { title: 'الميزانية العمومية', titleEn: 'Balance Sheet', headers: ['الحساب', 'Account', 'الرصيد (ر.س)'], rows, sectionRows, dateRange: dateRangeLabel, totals: ['الإجمالي / Total', '', `أصول: ${totalAssets.toLocaleString()} | خصوم+ملكية: ${(totalLiabilities + totalEquity).toLocaleString()}`] };

      } else if (selectedReport === 'income_statement') {
        const { data: accounts, error } = await supabase.from('accounts').select('*').in('type', ['revenue', 'expense']).order('type').order('code');
        if (error) throw error;
        const rows: (string | number)[][] = [];
        const sectionRows = new Set<number>();
        let totalRevenue = 0, totalExpense = 0;
        sectionRows.add(0);
        rows.push(['الإيرادات — Revenue', '', '']);
        (accounts || []).filter(a => a.type === 'revenue').forEach(a => { rows.push(['  ' + a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]); totalRevenue += Number(a.balance); });
        sectionRows.add(rows.length);
        rows.push(['المصروفات — Expenses', '', '']);
        (accounts || []).filter(a => a.type === 'expense').forEach(a => { rows.push(['  ' + a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]); totalExpense += Number(a.balance); });
        data = { title: 'قائمة الدخل', titleEn: 'Income Statement', headers: ['البند', 'Item', 'المبلغ (ر.س)'], rows, sectionRows, dateRange: dateRangeLabel, totals: ['صافي الدخل / Net Income', '', (totalRevenue - totalExpense).toLocaleString()] };

      } else if (selectedReport === 'cash_flow') {
        const { data: accounts, error } = await supabase.from('accounts').select('*').eq('type', 'asset').order('code');
        if (error) throw error;
        const rows = (accounts || []).map(a => [a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
        const total = (accounts || []).reduce((s, a) => s + Number(a.balance), 0);
        data = { title: 'التدفقات النقدية', titleEn: 'Cash Flow Statement', headers: ['الحساب', 'Account', 'الرصيد (ر.س)'], rows, dateRange: dateRangeLabel, totals: ['الإجمالي / Total', '', total.toLocaleString()] };

      } else if (selectedReport === 'invoices_report') {
        let q = supabase.from('invoices').select('*').order('invoice_date', { ascending: false });
        if (dateFrom) q = q.gte('invoice_date', dateFrom);
        if (dateTo) q = q.lte('invoice_date', dateTo);
        const { data: invoices, error } = await q;
        if (error) throw error;
        const statusAr: Record<string, string> = { draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة', overdue: 'متأخرة', cancelled: 'ملغاة' };
        const rows = (invoices || []).map(i => [i.invoice_number, i.invoice_date, i.client_name, Number(i.subtotal || i.total).toLocaleString(), Number(i.tax_amount || 0).toLocaleString(), Number(i.total).toLocaleString(), statusAr[i.status] || i.status]);
        const totalNet = (invoices || []).reduce((s, i) => s + Number(i.subtotal || i.total), 0);
        const totalTax = (invoices || []).reduce((s, i) => s + Number(i.tax_amount || 0), 0);
        const totalAll = (invoices || []).reduce((s, i) => s + Number(i.total), 0);
        data = { title: 'تقرير الفواتير والمبيعات', titleEn: 'Invoices & Sales Report', headers: ['رقم الفاتورة', 'التاريخ', 'العميل', 'قبل الضريبة', 'الضريبة', 'الإجمالي', 'الحالة'], rows, dateRange: dateRangeLabel, totals: ['', '', 'الإجمالي / Total', totalNet.toLocaleString(), totalTax.toLocaleString(), totalAll.toLocaleString(), ''] };

      } else if (selectedReport === 'purchases_report') {
        let q = supabase.from('purchases').select('*, suppliers(name_ar)').order('purchase_date', { ascending: false });
        if (dateFrom) q = q.gte('purchase_date', dateFrom);
        if (dateTo) q = q.lte('purchase_date', dateTo);
        const { data: purchases, error } = await q;
        if (error) throw error;
        const statusAr: Record<string, string> = { pending: 'قيد الانتظار', received: 'مستلمة', cancelled: 'ملغاة' };
        const rows = (purchases || []).map(p => [p.purchase_number, p.purchase_date, (p.suppliers as any)?.name_ar || '—', Number(p.subtotal || p.total).toLocaleString(), Number(p.tax_amount || 0).toLocaleString(), Number(p.total).toLocaleString(), statusAr[p.status] || p.status]);
        const totalNet = (purchases || []).reduce((s, p) => s + Number(p.subtotal || p.total), 0);
        const totalTax = (purchases || []).reduce((s, p) => s + Number(p.tax_amount || 0), 0);
        const totalAll = (purchases || []).reduce((s, p) => s + Number(p.total), 0);
        data = { title: 'تقرير المشتريات والمصروفات', titleEn: 'Purchases & Expenses Report', headers: ['رقم المشترى', 'التاريخ', 'المورد', 'قبل الضريبة', 'الضريبة', 'الإجمالي', 'الحالة'], rows, dateRange: dateRangeLabel, totals: ['', '', 'الإجمالي / Total', totalNet.toLocaleString(), totalTax.toLocaleString(), totalAll.toLocaleString(), ''] };

      } else if (selectedReport === 'partners_report') {
        const { data: partners, error } = await supabase.from('partners').select('*').order('name_ar');
        if (error) throw error;
        const rows = (partners || []).map(p => [p.name_ar, p.name_en || '', `${Number(p.profit_percentage)}%`, p.phone || '—', p.email || '—']);
        const totalPct = (partners || []).reduce((s, p) => s + Number(p.profit_percentage), 0);
        data = { title: 'تقرير توزيع الأرباح للشركاء', titleEn: 'Partners Profit Distribution Report', headers: ['الشريك', 'Partner', 'النسبة', 'الهاتف', 'البريد'], rows, dateRange: dateRangeLabel, totals: ['', '', `${totalPct}% ${totalPct !== 100 ? '⚠️ لا تساوي 100%' : '✅'}`, '', ''] };
      }

      setReportData(data);
      await supabase.from('audit_logs').insert({ user_id: user?.id, user_email: user?.email || '', action: 'generate_report', entity_type: 'report', details: { report_type: selectedReport, date_from: dateFrom, date_to: dateTo } });
      toast.success('تم إنشاء التقرير بنجاح');
    } catch (err: any) {
      toast.error('حدث خطأ في إنشاء التقرير: ' + (err?.message || ''));
    }
    setLoading(false);
  };

  const handlePrint = () => {
    if (!reportData) return;
    const printContent = document.getElementById('report-content');
    if (!printContent) return;
    const w = window.open('', '_blank');
    if (!w) { toast.error('يرجى السماح بالنوافذ المنبثقة للطباعة'); return; }
    w.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${reportData.title}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;direction:rtl}table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #ddd;padding:10px;text-align:right}th{background:#f5f5f5;font-weight:bold}
      .header{text-align:center;margin-bottom:30px}.stamp{margin-top:40px;padding:20px;border:2px solid #D4AF37;border-radius:10px;text-align:center}
      .section-row{background:#f9fafb;font-weight:bold}
      @media print{.no-print{display:none}}</style></head><body>
      <div class="header"><h1 style="color:#D4AF37;font-size:28px">The View Avenue</h1><h2>${reportData.title}</h2><h3 style="color:#666">${reportData.titleEn}</h3>
      <p>الفترة: ${reportData.dateRange || 'جميع الفترات'}</p>
      <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')} | أعده: ${user?.email || ''}</p></div>${printContent.innerHTML}
      <div class="stamp"><p style="color:#D4AF37;font-weight:bold;font-size:18px">✦ The View Avenue ✦</p>
      <p>نظام محاسبي معتمد — Certified Accounting System</p>
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

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التقارير المالية</h2>
          <p className="text-gray-500 text-sm">Financial Reports</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {reportTypes.map(rt => (
          <button key={rt.value} onClick={() => { setSelectedReport(rt.value); setReportData(null); }}
            className={`p-4 rounded-xl border text-center transition-all duration-200 ${selectedReport === rt.value
              ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm ring-1 ring-[#D4AF37]/20'
              : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}>
            <rt.icon className={`h-6 w-6 mx-auto mb-2 ${selectedReport === rt.value ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
            <p className="text-xs font-medium text-gray-700">{rt.labelAr}</p>
            <p className="text-[10px] text-gray-400">{rt.labelEn}</p>
          </button>
        ))}
      </div>

      {/* Date Filter (only for reports that support it) */}
      {currentReportType?.hasDateFilter && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-sm font-bold text-gray-700">فلتر الفترة الزمنية</span>
            <span className="text-xs text-gray-400">(اختياري)</span>
          </div>
          {/* Quick Presets */}
          <div className="flex gap-2 flex-wrap mb-3">
            {datePresets.map(preset => (
              <Button key={preset.label} variant="outline" size="sm" onClick={() => applyPreset(preset)}
                className="text-xs h-7 border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]">
                {preset.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-xs h-7 text-gray-400 hover:text-gray-600">
              مسح الفلتر
            </Button>
          </div>
          {/* Manual Date Input */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1">من تاريخ</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} dir="ltr" className="text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1">إلى تاريخ</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} dir="ltr" className="text-sm" />
            </div>
          </div>
          {dateFrom && dateTo && (
            <p className="text-xs text-[#D4AF37] mt-2 font-medium">
              📅 الفترة المحددة: من {dateFrom} إلى {dateTo}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button onClick={generateReport} disabled={loading} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الإنشاء...
            </span>
          ) : 'إنشاء التقرير'}
        </Button>
        {reportData && (
          <>
            <Tooltip><TooltipTrigger asChild>
              <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 ml-2" /> طباعة</Button>
            </TooltipTrigger><TooltipContent>طباعة مع ختم البرنامج / Print with stamp</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button variant="outline" onClick={handleDownloadCSV}><Download className="h-4 w-4 ml-2" /> تحميل Excel/CSV</Button>
            </TooltipTrigger><TooltipContent>تحميل كملف CSV / Download CSV</TooltipContent></Tooltip>
          </>
        )}
      </div>

      {/* Report Content */}
      {reportData && (
        <div id="report-content" className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 text-center bg-gradient-to-b from-gray-50 to-white">
            <h3 className="text-xl font-bold text-[#D4AF37]">The View Avenue</h3>
            <h4 className="text-lg font-bold text-gray-900 mt-1">{reportData.title}</h4>
            <p className="text-sm text-gray-500">{reportData.titleEn}</p>
            {reportData.dateRange && (
              <p className="text-xs text-[#D4AF37] font-medium mt-1">📅 الفترة: {reportData.dateRange}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              التاريخ: {new Date().toLocaleDateString('ar-SA')} | الوقت: {new Date().toLocaleTimeString('ar-SA')} | أعده: {user?.email}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                {reportData.headers.map((h, i) => <TableHead key={i} className="text-right font-bold">{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.rows.map((row, i) => (
                <TableRow key={i} className={reportData.sectionRows?.has(i) ? 'bg-gray-50 font-bold' : 'hover:bg-gray-50/50 transition-colors'}>
                  {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                </TableRow>
              ))}
              {reportData.totals && (
                <TableRow className="bg-[#D4AF37]/5 font-bold border-t-2 border-[#D4AF37]">
                  {reportData.totals.map((cell, j) => <TableCell key={j} className="text-[#D4AF37]">{cell}</TableCell>)}
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="p-4 text-center border-t border-gray-100 bg-gradient-to-t from-gray-50 to-white">
            <p className="text-[#D4AF37] font-bold text-sm">✦ The View Avenue ✦</p>
            <p className="text-xs text-gray-400 mt-1">تم إنشاء هذا التقرير آلياً من النظام المحاسبي — Certified Accounting System</p>
          </div>
        </div>
      )}
    </div>
  );
}
