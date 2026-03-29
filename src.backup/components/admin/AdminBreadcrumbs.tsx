import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const labels: Record<string, string> = {
  admin: 'لوحة التحكم',
  settings: 'الإعدادات العامة',
  photos: 'معرض الصور',
  tenants: 'المستأجرون',
  features: 'ميزات المشروع',
  seo: 'تحسين SEO',
  profile: 'الملف الشخصي',
};

export default function AdminBreadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length <= 1) return null; // /admin only — no breadcrumbs

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <Link to="/admin" className="hover:text-[#D4AF37] transition-colors">لوحة التحكم</Link>
      {parts.slice(1).map((part, i) => (
        <span key={part} className="flex items-center gap-2">
          <ChevronLeft className="h-3.5 w-3.5" />
          {i === parts.length - 2 ? (
            <span className="text-gray-900 font-medium">{labels[part] || part}</span>
          ) : (
            <Link to={`/${parts.slice(0, i + 2).join('/')}`} className="hover:text-[#D4AF37] transition-colors">{labels[part] || part}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
