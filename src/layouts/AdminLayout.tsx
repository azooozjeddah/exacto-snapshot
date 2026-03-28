import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div dir="rtl" className="min-h-screen flex bg-[#F8F9FA]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
