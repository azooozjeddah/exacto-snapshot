import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, FileText, ShoppingCart, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface Stats {
  totalAccounts: number;
  totalInvoices: number;
  totalPurchases: number;
  totalPartners: number;
  totalRevenue: number;
  totalExpenses: number;
}

export default function AccountingDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAccounts: 0, totalInvoices: 0, totalPurchases: 0,
    totalPartners: 0, totalRevenue: 0, totalExpenses: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [accounts, invoices, purchases, partners] = await Promise.all([
        supabase.from('accounts').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('total, status'),
        supabase.from('purchases').select('total, status'),
        supabase.from('partners').select('id', { count: 'exact', head: true }),
      ]);

      const paidInvoices = (invoices.data || []).filter(i => i.status === 'paid');
      const receivedPurchases = (purchases.data || []).filter(p => p.status === 'received');

      setStats({
        totalAccounts: accounts.count || 0,
        totalInvoices: (invoices.data || []).length,
        totalPurchases: (purchases.data || []).length,
        totalPartners: partners.count || 0,
        totalRevenue: paidInvoices.reduce((s, i) => s + Number(i.total), 0),
        totalExpenses: receivedPurchases.reduce((s, p) => s + Number(p.total), 0),
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'إجمالي الإيرادات', labelEn: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} ر.س`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'إجمالي المصروفات', labelEn: 'Total Expenses', value: `${stats.totalExpenses.toLocaleString()} ر.س`, icon: TrendingDown, color: 'text-red-500 bg-red-50' },
    { label: 'الحسابات', labelEn: 'Accounts', value: stats.totalAccounts, icon: DollarSign, color: 'text-blue-600 bg-blue-50' },
    { label: 'الفواتير', labelEn: 'Invoices', value: stats.totalInvoices, icon: FileText, color: 'text-purple-600 bg-purple-50' },
    { label: 'المشتريات', labelEn: 'Purchases', value: stats.totalPurchases, icon: ShoppingCart, color: 'text-orange-600 bg-orange-50' },
    { label: 'الشركاء', labelEn: 'Partners', value: stats.totalPartners, icon: Users, color: 'text-[#D4AF37] bg-amber-50' },
  ];

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">النظام المحاسبي</h2>
      <p className="text-gray-500 text-sm mb-6">Accounting System</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.labelEn} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
