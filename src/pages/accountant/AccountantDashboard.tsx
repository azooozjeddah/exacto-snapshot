import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3, Shield, Paperclip, TrendingUp, TrendingDown, DollarSign,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

export default function AccountantDashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalExpenses: 0, totalAttachments: 0, totalAuditLogs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [invoices, purchases, attachments, audit] = await Promise.all([
        supabase.from('invoices').select('total, status'),
        supabase.from('purchases').select('total, status'),
        supabase.from('attachments').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
      ]);
      const invs = invoices.data || [];
      const purs = purchases.data || [];
      setStats({
        totalRevenue: invs.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0),
        totalExpenses: purs.filter(p => p.status === 'received').reduce((s, p) => s + Number(p.total), 0),
        totalAttachments: attachments.count || 0,
        totalAuditLogs: audit.count || 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'إجمالي الإيرادات', labelEn: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} ر.س`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-200' },
    { label: 'إجمالي المصروفات', labelEn: 'Total Expenses', value: `${stats.totalExpenses.toLocaleString()} ر.س`, icon: TrendingDown, color: 'text-red-500 bg-red-50', border: 'border-red-200' },
    { label: 'صافي الربح', labelEn: 'Net Profit', value: `${(stats.totalRevenue - stats.totalExpenses).toLocaleString()} ر.س`, icon: DollarSign, color: 'text-[#D4AF37] bg-amber-50', border: 'border-amber-200' },
    { label: 'المستندات', labelEn: 'Attachments', value: stats.totalAttachments, icon: Paperclip, color: 'text-pink-600 bg-pink-50', border: 'border-pink-200' },
    { label: 'سجل التدقيق', labelEn: 'Audit Logs', value: stats.totalAuditLogs, icon: Shield, color: 'text-gray-600 bg-gray-50', border: 'border-gray-200' },
    { label: 'التقارير', labelEn: 'Reports', value: '—', icon: BarChart3, color: 'text-blue-600 bg-blue-50', border: 'border-blue-200' },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">لوحة المحاسب</h2>
        <p className="text-gray-500 text-sm">Accountant Dashboard</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.labelEn} className={`bg-white rounded-xl border ${card.border} p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-300`}>
            <div className={`p-3 rounded-xl ${card.color}`}><card.icon className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xs text-gray-400">{card.labelEn}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">الإيرادات مقابل المصروفات</h3>
        <p className="text-xs text-gray-400 mb-4">Revenue vs Expenses</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { name: 'الإيرادات', value: stats.totalRevenue },
            { name: 'المصروفات', value: stats.totalExpenses },
            { name: 'صافي الربح', value: stats.totalRevenue - stats.totalExpenses },
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <ReTooltip formatter={(value: number) => `${value.toLocaleString()} ر.س`} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              <Cell fill="#10B981" />
              <Cell fill="#EF4444" />
              <Cell fill="#D4AF37" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
