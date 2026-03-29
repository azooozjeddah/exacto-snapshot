import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import {
  LayoutDashboard, Settings, ImageIcon, Store, Star, Search, LogOut, ExternalLink,
  User, Users, X, MessageSquare,
} from 'lucide-react';

const navItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, to: '/admin', end: true, page: 'dashboard' },
  { label: 'الإعدادات العامة', icon: Settings, to: '/admin/settings', page: 'settings' },
  { label: 'معرض الصور', icon: ImageIcon, to: '/admin/photos', page: 'photos' },
  { label: 'المستأجرون', icon: Store, to: '/admin/tenants', page: 'tenants' },
  { label: 'ميزات المشروع', icon: Star, to: '/admin/features', page: 'features' },
  { label: 'تحسين SEO', icon: Search, to: '/admin/seo', page: 'seo' },
  { label: 'إدارة المستخدمين', icon: Users, to: '/admin/users', page: 'users' },
  { label: 'الرسائل والاستفسارات', icon: MessageSquare, to: '/admin/messages', page: 'messages' },
  { label: 'الملف الشخصي', icon: User, to: '/admin/profile', page: 'profile' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: Props) {
  const { user, signOut } = useAuth();
  const { canAccess } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const visibleItems = navItems.filter((item) => canAccess(item.page));

  const renderNavItem = (item: typeof navItems[0]) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
          isActive ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <item.icon className="h-5 w-5" />
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onToggle} />
      )}

      <aside className={`
        fixed lg:static top-0 right-0 z-40 h-screen lg:h-auto
        w-[260px] min-h-screen bg-white border-l border-gray-200 flex flex-col shrink-0
        transition-transform duration-300
        ${collapsed ? 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0' : 'translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex-1">
            <img
              src="/lifestyle-logo.png"
              alt="شركة أسلوب حياة"
              className="h-12 object-contain"
            />
            <p className="text-xs text-gray-400 mt-1">النظام المحاسبي</p>
          </div>
          <button onClick={onToggle} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map(renderNavItem)}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            <span>عرض الموقع</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2 truncate" dir="ltr">{user?.email}</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
