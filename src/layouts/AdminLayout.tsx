import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { Menu } from 'lucide-react';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(true); // collapsed on mobile by default

  return (
    <div dir="rtl" className="min-h-screen flex bg-[#F8F9FA]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar with hamburger */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 shrink-0">
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-gray-700 ml-3">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">The View Avenue</span>
        </header>
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <AdminBreadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
