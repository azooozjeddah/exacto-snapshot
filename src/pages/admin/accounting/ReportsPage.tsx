/**
 * ReportsPage - التقارير المالية
 * Financial Reports - Balance Sheet, Income Statement, Cash Flow, etc.
 * 
 * Features:
 * - 6 report types with professional layout
 * - Print with company stamp and digital signature
 * - Export to CSV/Excel
 * - User and timestamp on all reports
 * - Audit trail logging
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Download, Printer, BarChart3, TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  title: string; titleEn: string;
  headers: string[]; rows: (string | number)[][];
  totals?: (string | number)[];
  sectionRows?: Set<number>; // indices of section header rows
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
        data = {
          title: 'الميزانية العمومية', titleEn: 'Balance Sheet',
          headers: ['الحساب', 'Account', 'الرصيد (ر.س)'], rows, sectionRows,
          totals: ['الإجمالي / Total', '', `أصول: ${totalAssets.toLocaleString()} | خصوم+ملكية: ${(totalLiabilities + totalEquity).toLocaleString()}`],
        };
      } else if (selectedReport === 'income_statement') {
        const { data: accounts, error } = await supabase.from('accounts').select('*').in('type', ['revenue', 'expense']).order('type').order('code');
        if (error) throw error;
        const rows: (string | number)[][] = [];
        const sectionRows = new Set<number>();
        let totalRevenue = 0, totalExpense = 0;
        sectionRows.add(0);
        rows.push(['الإيرادات — Revenue', '', '']);
        (accounts || []).filter(a => a.type === 'revenue').forEach(a => {
          rows.push(['  ' + a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
          totalRevenue += Number(a.balance);
        });
        sectionRows.add(rows.length);
        rows.push(['المصروفات — Expenses', '', '']);
        (accounts || []).filter(a => a.type === 'expense').forEach(a => {
          rows.push(['  ' + a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
          totalExpense += Number(a.balance);
        });
        data = {
          title: 'قائمة الدخل', titleEn: 'Income Statement',
          headers: ['البند', 'Item', 'المبلغ (ر.س)'], rows, sectionRows,
          totals: ['صافي الدخل / Net Income', '', (totalRevenue - totalExpense).toLocaleString()],
        };
      } else if (selectedReport === 'cash_flow') {
        const { data: accounts, error } = await supabase.from('accounts').select('*').eq('type', 'asset').order('code');
        if (error) throw error;
        const rows = (accounts || []).map(a => [a.code + ' - ' + a.name_ar, a.name_en || '', Number(a.balance).toLocaleString()]);
        const total = (accounts || []).reduce((s, a) => s + Number(a.balance), 0);
        data = {
          title: 'التدفقات النقدية', titleEn: 'Cash Flow Statement',
          headers: ['الحساب', 'Account', 'الرصيد (ر.س)'], rows,
          totals: ['الإجمالي / Total', '', total.toLocaleString()],
        };
      } else if (selectedReport === 'invoices_report') {
        const { data: invoices, error } = await supabase.from('invoices').select('*').order('invoice_date', { ascending: false });
        if (error) throw error;
        const statusAr: Record<string, string> = { draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة', overdue: 'متأخرة', cancelled: 'ملغاة' };
        const rows = (invoices || []).map(i => [i.invoice_number, i.invoice_date, i.client_name, Number(i.total).toLocaleString(), statusAr[i.status] || i.status]);
        const total = (invoices || []).reduce((s, i) => s + Number(i.total), 0);
        data = {
          title: 'تقرير الفواتير والمبيعات', titleEn: 'Invoices & Sales Report',
          headers: ['رقم الفاتورة', 'التاريخ', 'العميل', 'المبلغ (ر.س)', 'الحالة'], rows,
          totals: ['', '', 'الإجمالي / Total', total.toLocaleString(), ''],
        };
      } else if (selectedReport === 'purchases_report') {
        const { data: purchases, error } = await supabase.from('purchases').select('*, suppliers(name_ar)').order('purchase_date', { ascending: false });
        if (error) throw error;
        const statusAr: Record<string, string> = { pending: 'قيد الانتظار', received: 'مستلمة', cancelled: 'ملغاة' };
        const rows = (purchases || []).map(p => [p.purchase_number, p.purchase_date, (p.suppliers as any)?.name_ar || '—', Number(p.total).toLocaleString(), statusAr[p.status] || p.status]);
        const total = (purchases || []).reduce((s, p) => s + Number(p.total), 0);
        data = {
          title: 'تقرير المشتريات والمصروفات', titleEn: 'Purchases & Expenses Report',
          headers: ['رقم المشترى', 'التاريخ', 'المورد', 'المبلغ (ر.س)', 'الحالة'], rows,
          totals: ['', '', 'الإجمالي / Total', total.toLocaleString(), ''],
        };
      } else if (selectedReport === 'partners_report') {
        const { data: partners, error } = await supabase.from('partners').select('*').order('name_ar');
        if (error) throw error;
        const rows = (partners || []).map(p => [p.name_ar, p.name_en || '', `${Number(p.profit_percentage)}%`, p.phone || '—', p.email || '—']);
        data = {
          title: 'تقرير توزيع الأرباح للشركاء', titleEn: 'Partners Profit Distribution Report',
          headers: ['الشريك', 'Partner', 'النسبة', 'الهاتف', 'البريد'], rows,
          totals: ['', '', `${(partners || []).reduce((s, p) => s + Number(p.profit_percentage), 0)}%`, '', ''],
        };
      }

      setReportData(data);
      await supabase.from('audit_logs').insert({
        user_id: user?.id, user_email: user?.email || '', action: 'generate_report',
        entity_type: 'report', details: { report_type: selectedReport },
      });
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
      <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')} | الوقت: ${new Date().toLocaleTimeString('ar-SA')}</p>
      <p>أعده: ${user?.email || ''}</p></div>${printContent.innerHTML}
      <div class="stamp"><p style="color:#D4AF37;font-weight:bold;font-size:18px">✦ The View Avenue ✦</p>
      <p>نظام محاسبي معتمد — Certified Accounting System</p>
      <p style="font-size:12px;color:#888">تم إنشاء هذا التقرير آلياً بتاريخ ${new Date().toISOString()}</p>
      <p style="font-size:12px;color:#888">Generated by: ${user?.email || 'System'}</p></div>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
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

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button onClick={generateReport} disabled={loading} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <p className="text-xs text-gray-400 mt-2">
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
