import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Menu, X, LogOut, ExternalLink, BookOpen, FileText, ShoppingCart, Truck, Handshake, Calculator, BarChart3, Paperclip, Shield, Users } from 'lucide-react';

const navItems = [
  { label: 'لوحة التحكم', labelEn: 'Dashboard', icon: Calculator, to: '/accounting', end: true },
  { label: 'دليل الحسابات', labelEn: 'Accounts', icon: BookOpen, to: '/accounting/accounts' },
  { label: 'الفواتير', labelEn: 'Invoices', icon: FileText, to: '/accounting/invoices' },
  { label: 'المشتريات', labelEn: 'Purchases', icon: ShoppingCart, to: '/accounting/purchases' },
  { label: 'الموردون', labelEn: 'Suppliers', icon: Truck, to: '/accounting/suppliers' },
  { label: 'الشركاء', labelEn: 'Partners', icon: Handshake, to: '/accounting/partners' },
  { label: 'التقارير المالية', labelEn: 'Reports', icon: BarChart3, to: '/accounting/reports' },
  { label: 'المستندات', labelEn: 'Attachments', icon: Paperclip, to: '/accounting/attachments' },
  { label: 'سجل التدقيق', labelEn: 'Audit Trail', icon: Shield, to: '/accounting/audit' },
];

export default function AccountingLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/accounting/login');
  };

  return (
    <div dir="rtl" className="min-h-screen flex" style={{ fontFamily: "'Tajawal', sans-serif", background: '#F0F2F5' }}>
      {!collapsed && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setCollapsed(true)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 right-0 z-40 h-screen lg:h-auto
        w-[260px] min-h-screen flex flex-col shrink-0
        transition-transform duration-300
        ${collapsed ? 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0' : 'translate-x-0'}
      `} style={{ background: 'linear-gradient(180deg, #111111 0%, #1a1a1a 100%)', borderLeft: '1px solid rgba(212,175,55,0.15)' }}>

        {/* Header */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="flex-1">
            <img
              src="/lifestyle-logo.png"
              alt="شركة أسلوب حياة"
              className="h-10 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'rgba(212,175,55,0.6)' }}>النظام المحاسبي</p>
          </div>
          <button onClick={() => setCollapsed(true)} className="lg:hidden" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => { if (window.innerWidth < 1024) setCollapsed(true); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-black'
                    : 'text-gray-400 hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #D4AF37 0%, #F0D060 100%)',
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
              } : {}}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {role === 'admin' && (
            <>
              <div className="my-2" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }} />
              <NavLink
                to="/accounting/users"
                onClick={() => { if (window.innerWidth < 1024) setCollapsed(true); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-black' : 'text-gray-400 hover:text-white'
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F0D060 100%)',
                  boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                } : {}}
              >
                <Users className="h-4 w-4 shrink-0" />
                <span>إدارة المستخدمين</span>
              </NavLink>
            </>
          )}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span>عرض الموقع</span>
          </a>
        </nav>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
          <p className="text-xs mb-3 truncate" style={{ color: 'rgba(255,255,255,0.3)' }} dir="ltr">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="h-14 bg-white flex items-center px-4 lg:px-6 shrink-0"
          style={{ borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-gray-700 ml-3 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#D4AF37' }} />
            <span className="text-sm font-medium text-gray-700">النظام المحاسبي — شركة أسلوب حياة</span>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
