import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Users, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserItem {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

// أدوار لوحة التحكم فقط (مستقلة عن النظام المحاسبي)
const ADMIN_ROLES = ['admin', 'photo_manager', 'tenant_manager', 'features_manager', 'settings_manager'];

const roles = [
  { value: 'admin', label: 'Admin', labelAr: 'مدير عام' },
  { value: 'photo_manager', label: 'Photo Manager', labelAr: 'مدير الصور' },
  { value: 'tenant_manager', label: 'Tenant Manager', labelAr: 'مدير المستأجرين' },
  { value: 'features_manager', label: 'Features Manager', labelAr: 'مدير الميزات' },
  { value: 'settings_manager', label: 'Settings Manager', labelAr: 'مدير الإعدادات' },
];

const roleLabel = (v: string) => roles.find((r) => r.value === v);

const roleBadgeColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  photo_manager: 'bg-blue-100 text-blue-700',
  tenant_manager: 'bg-green-100 text-green-700',
  features_manager: 'bg-orange-100 text-orange-700',
  settings_manager: 'bg-pink-100 text-pink-700',
};

export default function AdminUsers() {
  const { session, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState({ email: '', password: '', role: 'photo_manager' });
  const [saving, setSaving] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);

  const callApi = useCallback(async (body: any) => {
    const { data, error } = await supabase.functions.invoke('manage-users', { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callApi({ action: 'list' });
      // عرض مستخدمي لوحة التحكم فقط (باستثناء accountant و data_entry)
      const allUsers = Array.isArray(data) ? data : [];
      const adminUsers = allUsers.filter((u: UserItem) => ADMIN_ROLES.includes(u.role));
      setUsers(adminUsers);
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    }
    setLoading(false);
  }, [callApi]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => {
    setEditUser(null);
    setForm({ email: '', password: '', role: 'photo_manager' });
    setDialogOpen(true);
  };

  const openEditRole = (u: UserItem) => {
    setEditUser(u);
    setForm({ email: u.email, password: '', role: u.role || 'photo_manager' });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editUser) {
        await callApi({ action: 'update_role', user_id: editUser.id, role: form.role });
        toast({ title: 'تم', description: 'تم تحديث الصلاحيات ✓' });
      } else {
        if (!form.email || !form.password) {
          toast({ title: 'تنبيه', description: 'البريد وكلمة المرور مطلوبان', variant: 'destructive' });
          setSaving(false);
          return;
        }
        await callApi({ action: 'create', email: form.email, password: form.password, role: form.role });
        toast({ title: 'تم', description: 'تم إضافة المستخدم ✓' });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    try {
      await callApi({ action: 'delete', user_id: deleteUser.id });
      toast({ title: 'تم', description: 'تم حذف المستخدم ✓' });
      fetchUsers();
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    }
    setDeleteUser(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-sm text-gray-500">{users.length} مستخدم</p>
        </div>
        <Button onClick={openAdd} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
          <Plus className="h-4 w-4 ml-2" /> إضافة مستخدم
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" /></div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <Users className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">لا يوجد مستخدمون</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const rl = roleLabel(u.role);
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        {u.email}
                        {isSelf && <Badge variant="outline" className="text-xs">أنت</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${roleBadgeColor[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {rl ? rl.labelAr : u.role || 'بدون دور'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(u.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditRole(u)} disabled={isSelf}>
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeleteUser(u)} disabled={isSelf}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editUser ? 'تعديل صلاحيات المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editUser && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">البريد الإلكتروني *</Label>
                  <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" type="email" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">كلمة المرور *</Label>
                  <Input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" type="password" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">الدور / الصلاحيات</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex items-center gap-2">
                        <span>{r.labelAr}</span>
                        <span className="text-xs text-gray-400">({r.label})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                <p className="text-xs font-semibold text-gray-600 mb-1">صلاحيات الدور:</p>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {form.role === 'admin' && <li>✓ جميع الصلاحيات</li>}
                  {form.role === 'photo_manager' && <li>✓ معرض الصور فقط</li>}
                  {form.role === 'tenant_manager' && <li>✓ المستأجرون فقط</li>}
                  {form.role === 'features_manager' && <li>✓ ميزات المشروع فقط</li>}
                  {form.role === 'settings_manager' && <li>✓ الإعدادات و SEO</li>}
                </ul>
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button onClick={save} disabled={saving} className="flex-1 bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null} حفظ
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المستخدم <strong>{deleteUser?.email}</strong>؟ سيتم حذفه نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">حذف</AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
