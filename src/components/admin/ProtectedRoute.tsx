import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

const routePageMap: Record<string, string> = {
  '/admin': 'dashboard',
  '/admin/settings': 'settings',
  '/admin/photos': 'photos',
  '/admin/tenants': 'tenants',
  '/admin/features': 'features',
  '/admin/seo': 'seo',
  '/admin/users': 'users',
  '/admin/profile': 'profile',
  '/admin/accounting': 'accounting',
  '/admin/accounting/accounts': 'accounts',
  '/admin/accounting/invoices': 'invoices',
  '/admin/accounting/purchases': 'purchases',
  '/admin/accounting/suppliers': 'suppliers',
  '/admin/accounting/partners': 'partners',
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, canAccess } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check role-based access for the current route
  const page = routePageMap[location.pathname];
  if (page && !canAccess(page)) {
    // Redirect to the first accessible page
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
