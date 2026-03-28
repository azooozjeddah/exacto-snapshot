
-- Attachments table
CREATE TABLE public.attachments (
  id serial PRIMARY KEY,
  file_name varchar(500) NOT NULL,
  file_url text NOT NULL,
  file_key text,
  file_type varchar(100),
  file_size integer,
  related_type varchar(50) NOT NULL,
  related_id integer NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read attachments" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert attachments" ON public.attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete attachments" ON public.attachments FOR DELETE TO authenticated USING (true);

-- Audit Log table
CREATE TABLE public.audit_logs (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  user_email varchar(255),
  action varchar(50) NOT NULL,
  entity_type varchar(100) NOT NULL,
  entity_id integer,
  details jsonb,
  ip_address varchar(50),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Create attachments storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true) ON CONFLICT DO NOTHING;

-- Storage policies for attachments bucket
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "Anyone can read attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Authenticated users can delete attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'attachments');
