import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
    setLogs((data as AuditLog[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionColor = (action: string) => {
    if (action.includes('delete')) return 'bg-red-100 text-red-700';
    if (action.includes('create') || action.includes('upload')) return 'bg-emerald-100 text-emerald-700';
    if (action.includes('update')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

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
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} /> تحديث
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">التاريخ والوقت</TableHead>
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">العملية</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">التفاصيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">لا توجد سجلات</TableCell></TableRow>
            ) : logs.map(log => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleDateString('ar-SA')}
                  <br />
                  <span className="text-gray-400">{new Date(log.created_at).toLocaleTimeString('ar-SA')}</span>
                </TableCell>
                <TableCell className="text-sm" dir="ltr">{log.user_email || '—'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColor(log.action)}`}>
                    {actionLabels[log.action] || log.action}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{entityLabels[log.entity_type] || log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}</TableCell>
                <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">
                  {log.details ? JSON.stringify(log.details) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
