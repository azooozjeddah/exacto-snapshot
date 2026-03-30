import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AccountingResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // التحقق من وجود token في URL
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      setValidToken(true);
    } else {
      setError('رابط الاستعادة غير صحيح أو منتهي الصلاحية');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim() || !confirmPassword.trim()) {
      setError('يرجى إدخال كلمة المرور وتأكيدها');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        setError('حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة لاحقاً.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/accounting/login');
        }, 3000);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken && !error) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          fontFamily: "'Tajawal', sans-serif",
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
        }}
      >
        <div className="w-full max-w-md px-6 relative z-10">
          <div className="rounded-2xl p-8 text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,175,55,0.2)',
              backdropFilter: 'blur(10px)',
            }}>
            <div className="w-12 h-12 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">جاري التحقق من الرابط...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        fontFamily: "'Tajawal', sans-serif",
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      }}
    >
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(212,175,55,0.03) 60px, rgba(212,175,55,0.03) 61px)',
        }} />
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        {/* الشعار والعنوان */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-3xl mb-6"
            style={{ background: 'rgba(212,175,55,0.12)', border: '2px solid rgba(212,175,55,0.3)' }}>
            <img
              src="/lifestyle-logo.png"
              alt="شركة أسلوب حياة"
              className="h-24 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            تعيين كلمة مرور جديدة
          </h1>
          <p className="text-sm" style={{ color: '#D4AF37' }}>
            النظام المحاسبي
          </p>
        </div>

        {/* بطاقة تعيين كلمة المرور */}
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(212,175,55,0.2)',
            backdropFilter: 'blur(10px)',
          }}>
          {success ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">تم تحديث كلمة المرور بنجاح!</h2>
              <p className="text-sm text-gray-400 mb-6">
                سيتم إعادة توجيهك إلى صفحة تسجيل الدخول خلال قليل
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-6 text-center">تعيين كلمة مرور جديدة</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                    كلمة المرور الجديدة
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    required
                    maxLength={128}
                    dir="ltr"
                    className="h-12 text-white placeholder:text-gray-600 border-0 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.25)',
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">
                    تأكيد كلمة المرور
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    required
                    maxLength={128}
                    dir="ltr"
                    className="h-12 text-white placeholder:text-gray-600 border-0 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.25)',
                    }}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-bold rounded-xl border-0 text-black shadow-lg mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F0D060 50%, #D4AF37 100%)',
                  }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Lock className="ml-2 h-5 w-5" />تحديث كلمة المرور</>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(212,175,55,0.4)' }}>
          © 2025 شركة أسلوب حياة للتطوير العقاري. جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
