import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';

export default function AccountingLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && role && !roleLoading) {
      if (['accountant', 'data_entry'].includes(role)) {
        navigate('/accounting', { replace: true });
      } else if (role === 'admin') {
        navigate('/accounting', { replace: true });
      }
    }
  }, [user, role, roleLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    if (signInError) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setLoading(false);
    }
  };

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
        {/* خطوط ذهبية خفيفة */}
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
            النظام المحاسبي
          </h1>
          <p className="text-sm" style={{ color: '#D4AF37' }}>
            شركة أسلوب حياة للتطوير العقاري
          </p>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(212,175,55,0.2)',
            backdropFilter: 'blur(10px)',
          }}>
          <h2 className="text-lg font-bold text-white mb-6 text-center">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="accountant@example.com"
                required
                maxLength={255}
                dir="ltr"
                className="h-12 text-white placeholder:text-gray-600 border-0 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  outline: 'none',
                  boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.25)',
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                كلمة المرور
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
                  outline: 'none',
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
                <><LogIn className="ml-2 h-5 w-5" />تسجيل الدخول</>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(212,175,55,0.4)' }}>
          © 2025 شركة أسلوب حياة للتطوير العقاري. جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
