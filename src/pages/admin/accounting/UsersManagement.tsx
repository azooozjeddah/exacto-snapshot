/**
 * UsersManagement - إدارة المستخدمين
 * Admin-only page to create, update roles, and delete users
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, Trash2, Edit2, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UserEntry {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

// أدوار النظام المحاسبي فقط
const ACCOUNTING_ROLES = ['admin', 'accountant', 'data_entry'];

const roleLabels: Record<string, string> = {
  admin: 'مدير النظام',
  accountant: 'محاسب',
  data_entry: 'إدخال بيانات',
  none: 'بدون صلاحية',
};

const roleColors: Record<string, string> = {
  admin: 'bg-yellow-100 text-yellow-800',
  accountant: 'bg-blue-100 text-blue-700',
  data_entry: 'bg-green-100 text-green-700',
  none: 'bg-gray-100 text-gray-500',
};

const PROJECT_REF = 'uamixzilqeqkqezvhydf';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbWl4emlscWVxa3FlenZoeWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDQyNTgsImV4cCI6MjA5MDIyMDI1OH0.TxtSZ3F6rbVteKwvkhgEwvJcY2fsAIDeq-pQoNlOT88';

async function callManageUsers(body: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/manage-users`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'خطأ في الاتصال');
  return data;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserEntry | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', role: 'accountant' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await callManageUsers({ action: 'list' });
      // عرض مستخدمي النظام المحاسبي فقط (admin, accountant, data_entry)
      const allUsers = Array.isArray(data) ? data : [];
      const accountingUsers = allUsers.filter((u: UserEntry) => ACCOUNTING_ROLES.includes(u.role));
      setUsers(accountingUsers);
    } catch (err: any) {
      toast.error(err.message || 'خطأ في تحميل المستخدمين');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ email: '', password: '', role: 'accountant' });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (u: UserEntry) => {
    setEditUser(u);
    setForm({ email: u.email, password: '', role: u.role === 'none' ? 'accountant' : u.role });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editUser) {
        await callManageUsers({ action: 'update_role', user_id: editUser.id, role: form.role });
        toast.success('تم تحديث الصلاحية بنجاح');
      } else {
        if (!form.email || !form.password) { toast.error('يرجى إدخال الإيميل وكلمة المرور'); setSaving(false); return; }
        await callManageUsers({ action: 'create', email: form.email, password: form.password, role: form.role });
        toast.success('تم إنشاء المستخدم بنجاح');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    }
    setSaving(false);
  };

  const handleDelete = async (u: UserEntry) => {
    if (!confirm(`هل أنت متأكد من حذف ${u.email}؟`)) return;
    setDeletingId(u.id);
    try {
      await callManageUsers({ action: 'delete', user_id: u.id });
      toast.success('تم حذف المستخدم');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'خطأ في الحذف');
    }
    setDeletingId(null);
  };

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-[#D4AF37]" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
            <p className="text-sm text-gray-500">إنشاء وتعديل وحذف مستخدمي النظام</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-1 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button size="sm" onClick={openCreate} style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', color: '#000' }}>
            <Plus className="h-4 w-4 ml-1" />
            مستخدم جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(roleLabels).map(([key, label]) => (
          <div key={key} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === key).length}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا يوجد مستخدمون</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F8F9FA', borderBottom: '1px solid #E5E7EB' }}>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">الإيميل</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">الصلاحية</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">تاريخ الإنشاء</th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-3.5 font-medium text-gray-800" dir="ltr">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || roleColors.none}`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title="تعديل الصلاحية"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="حذف المستخدم"
                        >
                          {deletingId === u.id
                            ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editUser ? 'تعديل صلاحية المستخدم' : 'إنشاء مستخدم جديد'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={!!editUser}
                  placeholder="user@example.com"
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              {/* Password - only for create */}
              {!editUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      dir="ltr"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الصلاحية</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                >
                  <option value="admin">مدير النظام — Admin</option>
                  <option value="accountant">محاسب — Accountant</option>
                  <option value="data_entry">إدخال بيانات — Data Entry</option>
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  {form.role === 'admin' && 'صلاحيات كاملة: إدارة المستخدمين وكل الوحدات'}
                  {form.role === 'accountant' && 'صلاحيات المحاسب: الفواتير، المشتريات، الموردين، التقارير'}
                  {form.role === 'data_entry' && 'صلاحيات محدودة: إدخال الفواتير والحسابات فقط'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', color: '#000' }}
              >
                {saving
                  ? <div className="w-4 h-4 border-2 border-black/30 border-t-transparent rounded-full animate-spin mx-auto" />
                  : editUser ? 'حفظ التعديل' : 'إنشاء المستخدم'
                }
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
