import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Redirects authenticated users to /admin/accounting.
 * Unauthenticated users go to /admin/login.
 */
export default function AccountingRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">جاري التحميل...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Navigate to="/admin/accounting" replace />;
}
