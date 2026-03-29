/**
 * AuditTrailPage - سجل التدقيق
 * Audit Trail - tracks all system operations
 * 
 * Features:
 * - View all system actions with timestamps
 * - Filter by action type and entity type
 * - Search by user email or details
 * - Color-coded action badges
 * - Auto-refresh capability
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import TableToolbar from '@/components/admin/accounting/TableToolbar';

interface AuditLog {
  id: number; user_email: string | null; action: string; entity_type: string;
  entity_id: number | null; details: any; created_at: string;
}

const actionLabels: Record<string, string> = {
  create: 'إنشاء', update: 'تعديل', delete: 'حذف', generate_report: 'إنشاء تقرير',
  upload_attachment: 'رفع مرفق', delete_attachment: 'حذف مرفق', login: 'تسجيل دخول',
};

const entityLabels: Record<string, string> = {
  account: 'حساب', invoice: 'فاتورة', purchase: 'مشترى', supplier: 'مورد',
  partner: 'شريك', report: 'تقرير', attachment: 'مرفق', journal_entry: 'قيد',
};

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500);
      if (filterAction !== 'all') q = q.eq('action', filterAction);
      const { data, error } = await q;
      if (error) { toast.error('خطأ في تحميل السجلات'); console.error(error); }
      setLogs((data as AuditLog[]) || []);
    } catch {
      toast.error('حدث خطأ غير متوقع');
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [filterAction]);

  const filtered = logs.filter(log =>
    !search || (log.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (entityLabels[log.entity_type] || log.entity_type).includes(search) ||
    (actionLabels[log.action] || log.action).includes(search)
  );

  const actionColor = (action: string) => {
    if (action.includes('delete')) return 'bg-red-100 text-red-700';
    if (action.includes('create') || action.includes('upload')) return 'bg-emerald-100 text-emerald-700';
    if (action.includes('update')) return 'bg-blue-100 text-blue-700';
    if (action.includes('report')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-[#D4AF37]" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">سجل التدقيق</h2>
            <p className="text-gray-500 text-sm">Audit Trail</p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} /> تحديث
            </Button>
          </TooltipTrigger>
          <TooltipContent>تحديث السجلات / Refresh</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <Button variant={filterAction === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterAction('all')}
          className={filterAction === 'all' ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>الكل</Button>
        {uniqueActions.map(action => (
          <Button key={action} variant={filterAction === action ? 'default' : 'outline'} size="sm"
            onClick={() => setFilterAction(action)}
            className={filterAction === action ? 'bg-[#D4AF37] hover:bg-[#b8962e] text-white' : ''}>
            {actionLabels[action] || action}
          </Button>
        ))}
      </div>

      <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="بحث بالمستخدم أو العملية..."
        helpText="يعرض جميع العمليات التي تمت في النظام المحاسبي مع التفاصيل الكاملة."
        helpTextEn="Shows all operations performed in the accounting system with full details." />

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="text-right font-bold">التاريخ والوقت</TableHead>
              <TableHead className="text-right font-bold">المستخدم</TableHead>
              <TableHead className="text-right font-bold">العملية</TableHead>
              <TableHead className="text-right font-bold">النوع</TableHead>
              <TableHead className="text-right font-bold">التفاصيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">
                <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
              </TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">لا توجد سجلات</TableCell></TableRow>
            ) : filtered.map(log => (
              <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleDateString('ar-SA')}
                  <br />
                  <span className="text-gray-400">{new Date(log.created_at).toLocaleTimeString('ar-SA')}</span>
                </TableCell>
                <TableCell className="text-sm" dir="ltr">{log.user_email || '—'}</TableCell>
                <TableCell>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${actionColor(log.action)}`}>
                    {actionLabels[log.action] || log.action}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {entityLabels[log.entity_type] || log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-gray-500 max-w-[250px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate block cursor-help">
                        {log.details ? JSON.stringify(log.details).slice(0, 60) + '...' : '—'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-sm">
                      <pre className="text-xs whitespace-pre-wrap" dir="ltr">{log.details ? JSON.stringify(log.details, null, 2) : '—'}</pre>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">عدد السجلات: {filtered.length}</p>
    </div>
  );
}
