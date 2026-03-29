import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  DollarSign, FileText, ShoppingCart, Users, TrendingUp, TrendingDown,
  BookOpen, BarChart3, Paperclip, Shield, ArrowUpLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface Stats {
  totalAccounts: number;
  totalInvoices: number;
  totalPurchases: number;
  totalPartners: number;
  totalRevenue: number;
  totalExpenses: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  accountsByType: { name: string; value: number }[];
  invoiceStatusData: { name: string; value: number }[];
}

const COLORS = ['#D4AF37', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AccountingDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAccounts: 0, totalInvoices: 0, totalPurchases: 0, totalPartners: 0,
    totalRevenue: 0, totalExpenses: 0, paidInvoices: 0, pendingInvoices: 0,
    overdueInvoices: 0, accountsByType: [], invoiceStatusData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [accounts, invoices, purchases, partners] = await Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('invoices').select('total, status'),
        supabase.from('purchases').select('total, status'),
        supabase.from('partners').select('id', { count: 'exact', head: true }),
      ]);

      const accs = accounts.data || [];
      const invs = invoices.data || [];
      const purs = purchases.data || [];

      const typeLabels: Record<string, string> = { asset: 'أصول', liability: 'خصوم', equity: 'ملكية', revenue: 'إيرادات', expense: 'مصروفات' };
      const typeCounts: Record<string, number> = {};
      accs.forEach(a => { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1; });

      const statusLabels: Record<string, string> = { draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة', overdue: 'متأخرة', cancelled: 'ملغاة' };
      const statusCounts: Record<string, number> = {};
      invs.forEach(i => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; });

      setStats({
        totalAccounts: accs.length,
        totalInvoices: invs.length,
        totalPurchases: purs.length,
        totalPartners: partners.count || 0,
        totalRevenue: invs.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0),
        totalExpenses: purs.filter(p => p.status === 'received').reduce((s, p) => s + Number(p.total), 0),
        paidInvoices: invs.filter(i => i.status === 'paid').length,
        pendingInvoices: invs.filter(i => i.status === 'draft' || i.status === 'sent').length,
        overdueInvoices: invs.filter(i => i.status === 'overdue').length,
        accountsByType: Object.entries(typeCounts).map(([k, v]) => ({ name: typeLabels[k] || k, value: v })),
        invoiceStatusData: Object.entries(statusCounts).map(([k, v]) => ({ name: statusLabels[k] || k, value: v })),
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'إجمالي الإيرادات', labelEn: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} ر.س`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-200' },
    { label: 'إجمالي المصروفات', labelEn: 'Total Expenses', value: `${stats.totalExpenses.toLocaleString()} ر.س`, icon: TrendingDown, color: 'text-red-500 bg-red-50', border: 'border-red-200' },
    { label: 'صافي الربح', labelEn: 'Net Profit', value: `${(stats.totalRevenue - stats.totalExpenses).toLocaleString()} ر.س`, icon: DollarSign, color: 'text-[#D4AF37] bg-amber-50', border: 'border-amber-200' },
    { label: 'الفواتير', labelEn: 'Invoices', value: stats.totalInvoices, icon: FileText, color: 'text-purple-600 bg-purple-50', border: 'border-purple-200' },
    { label: 'المشتريات', labelEn: 'Purchases', value: stats.totalPurchases, icon: ShoppingCart, color: 'text-orange-600 bg-orange-50', border: 'border-orange-200' },
    { label: 'الشركاء', labelEn: 'Partners', value: stats.totalPartners, icon: Users, color: 'text-blue-600 bg-blue-50', border: 'border-blue-200' },
  ];

  const quickLinks = [
    { label: 'دليل الحسابات', icon: BookOpen, to: '/accounting/accounts', color: 'bg-blue-500' },
    { label: 'الفواتير', icon: FileText, to: '/accounting/invoices', color: 'bg-purple-500' },
    { label: 'المشتريات', icon: ShoppingCart, to: '/accounting/purchases', color: 'bg-orange-500' },
    { label: 'التقارير', icon: BarChart3, to: '/accounting/reports', color: 'bg-emerald-500' },
    { label: 'المستندات', icon: Paperclip, to: '/accounting/attachments', color: 'bg-pink-500' },
    { label: 'سجل التدقيق', icon: Shield, to: '/accounting/audit', color: 'bg-gray-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">النظام المحاسبي</h2>
        <p className="text-gray-500 text-sm">Accounting System Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.labelEn} className={`bg-white rounded-xl border ${card.border} p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-300`}>
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xs text-gray-400">{card.labelEn}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts by Type */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">توزيع الحسابات</h3>
          <p className="text-xs text-gray-400 mb-4">Accounts by Type</p>
          {stats.accountsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.accountsByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {stats.accountsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات</div>
          )}
        </div>

        {/* Invoice Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">حالة الفواتير</h3>
          <p className="text-xs text-gray-400 mb-4">Invoice Status</p>
          {stats.invoiceStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.invoiceStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <ReTooltip />
                <Bar dataKey="value" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات</div>
          )}
        </div>
      </div>

      {/* Revenue vs Expenses Bar */}
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

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">وصول سريع</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map(link => (
            <Link key={link.to} to={link.to}
              className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className={`${link.color} text-white p-3 rounded-xl inline-flex mb-2 group-hover:scale-110 transition-transform`}>
                <link.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-700">{link.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-gradient-to-l from-[#D4AF37]/5 to-amber-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-5 w-5 text-[#D4AF37]" />
          <h3 className="text-lg font-bold text-gray-900">ملخص سريع</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">فواتير مدفوعة: <strong>{stats.paidInvoices}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600">فواتير معلقة: <strong>{stats.pendingInvoices}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">فواتير متأخرة: <strong>{stats.overdueInvoices}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
