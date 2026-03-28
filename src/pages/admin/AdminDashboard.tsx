import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ImageIcon, Store, Star, Settings } from 'lucide-react';

interface StatCard {
  label: string;
  icon: React.ElementType;
  count: number;
  color: string;
  bg: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ photos: 0, tenants: 0, features: 0, settings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [photos, tenants, features, settings] = await Promise.all([
        supabase.from('gallery_photos').select('id', { count: 'exact', head: true }),
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
        supabase.from('project_features').select('id', { count: 'exact', head: true }),
        supabase.from('site_settings').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        photos: photos.count ?? 0,
        tenants: tenants.count ?? 0,
        features: features.count ?? 0,
        settings: settings.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards: StatCard[] = [
    { label: 'الصور', icon: ImageIcon, count: stats.photos, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'المستأجرون', icon: Store, count: stats.tenants, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'الميزات', icon: Star, count: stats.features, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'الإعدادات', icon: Settings, count: stats.settings, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">مرحباً، {user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{card.count}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Guide */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">دليل سريع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Settings className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">الإعدادات العامة</p>
                <p className="text-gray-500">تعديل رقم الواتساب، البريد، العناوين</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ImageIcon className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">معرض الصور</p>
                <p className="text-gray-500">إدارة صور المشروع والتصنيفات</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Store className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">المستأجرون</p>
                <p className="text-gray-500">إضافة المحلات والمطاعم والمكاتب</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Star className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">ميزات المشروع</p>
                <p className="text-gray-500">تعديل المميزات والإحصائيات</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-700">Quick Guide</p>
                <p className="text-gray-500">Settings: WhatsApp, email, titles. Photos: Manage gallery. Tenants: Add shops, restaurants. Features: Edit stats.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
