
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. site_settings
CREATE TABLE public.site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  value_ar TEXT,
  value_en TEXT,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'text',
  setting_group VARCHAR(100) NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert site_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update site_settings" ON public.site_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete site_settings" ON public.site_settings FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. gallery_photos
CREATE TABLE public.gallery_photos (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  file_key TEXT,
  alt_text_ar TEXT,
  alt_text_en TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read gallery_photos" ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert gallery_photos" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update gallery_photos" ON public.gallery_photos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete gallery_photos" ON public.gallery_photos FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_gallery_photos_updated_at BEFORE UPDATE ON public.gallery_photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. tenants
CREATE TABLE public.tenants (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description_ar TEXT,
  description_en TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'shop',
  logo_url TEXT,
  logo_file_key TEXT,
  phone_number VARCHAR(20),
  website_url TEXT,
  menu_url TEXT,
  working_hours TEXT,
  floor_number VARCHAR(50),
  unit_number VARCHAR(50),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tenants" ON public.tenants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tenants" ON public.tenants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tenants" ON public.tenants FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. project_features
CREATE TABLE public.project_features (
  id SERIAL PRIMARY KEY,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  description_ar TEXT,
  description_en TEXT,
  icon VARCHAR(100),
  value VARCHAR(100),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read project_features" ON public.project_features FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert project_features" ON public.project_features FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update project_features" ON public.project_features FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete project_features" ON public.project_features FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_project_features_updated_at BEFORE UPDATE ON public.project_features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Authenticated users can update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
