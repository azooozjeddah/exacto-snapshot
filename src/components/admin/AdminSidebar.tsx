import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Settings, ImageIcon, Store, Star, Search, LogOut } from 'lucide-react';

const navItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, to: '/admin', end: true },
  { label: 'الإعدادات العامة', icon: Settings, to: '/admin/settings' },
  { label: 'معرض الصور', icon: ImageIcon, to: '/admin/photos' },
  { label: 'المستأجرون', icon: Store, to: '/admin/tenants' },
  { label: 'ميزات المشروع', icon: Star, to: '/admin/features' },
  { label: 'تحسين SEO', icon: Search, to: '/admin/seo' },
];

export default function AdminSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <aside className="w-[260px] min-h-screen bg-white border-l border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          The View Avenue
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">لوحة التحكم</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2 truncate" dir="ltr">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
