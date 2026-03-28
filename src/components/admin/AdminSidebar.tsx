import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import {
  LayoutDashboard, Settings, ImageIcon, Store, Star, Search, LogOut, ExternalLink,
  User, Users, X, Calculator, BookOpen, FileText, ShoppingCart, Truck, Handshake,
} from 'lucide-react';

const navItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, to: '/admin', end: true, page: 'dashboard' },
  { label: 'الإعدادات العامة', icon: Settings, to: '/admin/settings', page: 'settings' },
  { label: 'معرض الصور', icon: ImageIcon, to: '/admin/photos', page: 'photos' },
  { label: 'المستأجرون', icon: Store, to: '/admin/tenants', page: 'tenants' },
  { label: 'ميزات المشروع', icon: Star, to: '/admin/features', page: 'features' },
  { label: 'تحسين SEO', icon: Search, to: '/admin/seo', page: 'seo' },
  { label: 'إدارة المستخدمين', icon: Users, to: '/admin/users', page: 'users' },
  { label: 'الملف الشخصي', icon: User, to: '/admin/profile', page: 'profile' },
];

const accountingItems = [
  { label: 'النظام المحاسبي', icon: Calculator, to: '/admin/accounting', end: true, page: 'accounting' },
  { label: 'دليل الحسابات', icon: BookOpen, to: '/admin/accounting/accounts', page: 'accounts' },
  { label: 'الفواتير', icon: FileText, to: '/admin/accounting/invoices', page: 'invoices' },
  { label: 'المشتريات', icon: ShoppingCart, to: '/admin/accounting/purchases', page: 'purchases' },
  { label: 'الموردون', icon: Truck, to: '/admin/accounting/suppliers', page: 'suppliers' },
  { label: 'الشركاء', icon: Handshake, to: '/admin/accounting/partners', page: 'partners' },
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
  const visibleAccounting = accountingItems.filter((item) => canAccess(item.page));

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
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>The View Avenue</h1>
            <p className="text-xs text-gray-400 mt-0.5">لوحة التحكم</p>
          </div>
          <button onClick={onToggle} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map(renderNavItem)}

          {visibleAccounting.length > 0 && (
            <>
              <div className="pt-4 pb-2 px-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">المحاسبة</p>
              </div>
              {visibleAccounting.map(renderNavItem)}
            </>
          )}

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
