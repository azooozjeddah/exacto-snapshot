import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'photo_manager' | 'tenant_manager' | 'features_manager' | 'settings_manager' | 'accountant' | 'data_entry';

const rolePageMap: Record<AppRole, string[]> = {
  admin: ['dashboard', 'photos', 'tenants', 'features', 'settings', 'seo', 'users', 'profile',
    'accounting', 'accounts', 'invoices', 'purchases', 'suppliers', 'partners'],
  photo_manager: ['dashboard', 'photos', 'profile'],
  tenant_manager: ['dashboard', 'tenants', 'profile'],
  features_manager: ['dashboard', 'features', 'profile'],
  settings_manager: ['dashboard', 'settings', 'seo', 'profile'],
  accountant: ['dashboard', 'profile', 'accounting', 'accounts', 'invoices', 'purchases', 'suppliers', 'partners'],
  data_entry: ['dashboard', 'profile', 'accounting', 'accounts', 'invoices', 'purchases'],
};

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRole(null); setLoading(false); return; }

    const fetchRole = async () => {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
      setRole((data?.role as AppRole) || null);
      setLoading(false);
    };
    fetchRole();
  }, [user]);

  const canAccess = (page: string): boolean => {
    if (!role) return false;
    return rolePageMap[role]?.includes(page) ?? false;
  };

  const allowedPages = role ? rolePageMap[role] || [] : [];

  return { role, loading, canAccess, allowedPages };
}
