import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Shield } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && role && !roleLoading) {
      if (role === 'admin') navigate('/admin', { replace: true });
      else navigate('/admin/login', { replace: true }); // Non-admin can't use admin login
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
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة — Invalid credentials');
      setLoading(false);
    }
    // Redirect handled by useEffect above after role loads
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-[#F8F9FA]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            The View Avenue
          </h1>
          <p className="text-sm text-gray-500 mt-1">تسجيل الدخول الآمن — Secure Login</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                البريد الإلكتروني — Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="user@theviewavenue.com"
                required
                maxLength={255}
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 h-12"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                كلمة المرور — Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                required
                maxLength={128}
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 h-12"
                dir="ltr"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-bold rounded-xl bg-[#D4AF37] hover:bg-[#C4A030] text-white shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="ml-2 h-5 w-5" />
                  تسجيل الدخول — Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 The View Avenue. جميع الحقوق محفوظة — All Rights Reserved
        </p>
      </div>
    </div>
  );
}
