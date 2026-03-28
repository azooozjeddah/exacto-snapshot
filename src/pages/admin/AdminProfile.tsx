import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Lock, Mail } from 'lucide-react';

export default function AdminProfile() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'تنبيه', description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'تنبيه', description: 'كلمتا المرور غير متطابقتين', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    else { toast({ title: 'تم', description: 'تم تحديث كلمة المرور بنجاح ✓' }); setNewPassword(''); setConfirmPassword(''); }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">الملف الشخصي</h1>

      <div className="max-w-lg space-y-6">
        {/* Email (read-only) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-[#D4AF37]" />
            <h3 className="font-bold text-gray-900">البريد الإلكتروني</h3>
          </div>
          <Input value={user?.email || ''} disabled dir="ltr" className="bg-gray-50 border-gray-200 text-gray-600" />
          <p className="text-xs text-gray-400 mt-2">لا يمكن تغيير البريد الإلكتروني</p>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-[#D4AF37]" />
            <h3 className="font-bold text-gray-900">تغيير كلمة المرور</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">كلمة المرور الجديدة</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 text-sm">تأكيد كلمة المرور</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" dir="ltr" className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <Button onClick={updatePassword} disabled={saving} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
              حفظ كلمة المرور
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
