
-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'data_entry';

-- Chart of Accounts
CREATE TABLE public.accounts (
  id serial PRIMARY KEY,
  code varchar(20) NOT NULL UNIQUE,
  name_ar varchar(255) NOT NULL,
  name_en varchar(255),
  type varchar(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_id integer REFERENCES public.accounts(id) ON DELETE SET NULL,
  balance numeric(15,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read accounts" ON public.accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update accounts" ON public.accounts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete accounts" ON public.accounts FOR DELETE TO authenticated USING (true);

-- Journal Entries
CREATE TABLE public.journal_entries (
  id serial PRIMARY KEY,
  entry_number varchar(50) NOT NULL UNIQUE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  description_ar text,
  description_en text,
  reference_type varchar(50),
  reference_id integer,
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
  total_debit numeric(15,2) NOT NULL DEFAULT 0,
  total_credit numeric(15,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read journal_entries" ON public.journal_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert journal_entries" ON public.journal_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update journal_entries" ON public.journal_entries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete journal_entries" ON public.journal_entries FOR DELETE TO authenticated USING (true);

-- Journal Entry Lines
CREATE TABLE public.journal_entry_lines (
  id serial PRIMARY KEY,
  journal_entry_id integer NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id integer NOT NULL REFERENCES public.accounts(id),
  debit numeric(15,2) NOT NULL DEFAULT 0,
  credit numeric(15,2) NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read journal_entry_lines" ON public.journal_entry_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert journal_entry_lines" ON public.journal_entry_lines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update journal_entry_lines" ON public.journal_entry_lines FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete journal_entry_lines" ON public.journal_entry_lines FOR DELETE TO authenticated USING (true);

-- Invoices
CREATE TABLE public.invoices (
  id serial PRIMARY KEY,
  invoice_number varchar(50) NOT NULL UNIQUE,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  client_name varchar(255) NOT NULL,
  client_phone varchar(50),
  client_email varchar(255),
  client_address text,
  subtotal numeric(15,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 15,
  tax_amount numeric(15,2) NOT NULL DEFAULT 0,
  discount numeric(15,2) NOT NULL DEFAULT 0,
  total numeric(15,2) NOT NULL DEFAULT 0,
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete invoices" ON public.invoices FOR DELETE TO authenticated USING (true);

-- Invoice Items
CREATE TABLE public.invoice_items (
  id serial PRIMARY KEY,
  invoice_id integer NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description_ar varchar(255) NOT NULL,
  description_en varchar(255),
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(15,2) NOT NULL DEFAULT 0,
  total numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read invoice_items" ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert invoice_items" ON public.invoice_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update invoice_items" ON public.invoice_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete invoice_items" ON public.invoice_items FOR DELETE TO authenticated USING (true);

-- Suppliers
CREATE TABLE public.suppliers (
  id serial PRIMARY KEY,
  name_ar varchar(255) NOT NULL,
  name_en varchar(255),
  phone varchar(50),
  email varchar(255),
  address text,
  tax_number varchar(50),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (true);

-- Purchases
CREATE TABLE public.purchases (
  id serial PRIMARY KEY,
  purchase_number varchar(50) NOT NULL UNIQUE,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_id integer REFERENCES public.suppliers(id),
  subtotal numeric(15,2) NOT NULL DEFAULT 0,
  tax_amount numeric(15,2) NOT NULL DEFAULT 0,
  total numeric(15,2) NOT NULL DEFAULT 0,
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read purchases" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert purchases" ON public.purchases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update purchases" ON public.purchases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete purchases" ON public.purchases FOR DELETE TO authenticated USING (true);

-- Purchase Items
CREATE TABLE public.purchase_items (
  id serial PRIMARY KEY,
  purchase_id integer NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  description_ar varchar(255) NOT NULL,
  description_en varchar(255),
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(15,2) NOT NULL DEFAULT 0,
  total numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read purchase_items" ON public.purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert purchase_items" ON public.purchase_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update purchase_items" ON public.purchase_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete purchase_items" ON public.purchase_items FOR DELETE TO authenticated USING (true);

-- Partners
CREATE TABLE public.partners (
  id serial PRIMARY KEY,
  name_ar varchar(255) NOT NULL,
  name_en varchar(255),
  phone varchar(50),
  email varchar(255),
  profit_percentage numeric(5,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read partners" ON public.partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert partners" ON public.partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update partners" ON public.partners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete partners" ON public.partners FOR DELETE TO authenticated USING (true);

-- Profit Distributions
CREATE TABLE public.profit_distributions (
  id serial PRIMARY KEY,
  distribution_date date NOT NULL DEFAULT CURRENT_DATE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_profit numeric(15,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profit_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read profit_distributions" ON public.profit_distributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert profit_distributions" ON public.profit_distributions FOR INSERT TO authenticated WITH CHECK (true);

-- Profit Distribution Lines
CREATE TABLE public.profit_distribution_lines (
  id serial PRIMARY KEY,
  distribution_id integer NOT NULL REFERENCES public.profit_distributions(id) ON DELETE CASCADE,
  partner_id integer NOT NULL REFERENCES public.partners(id),
  percentage numeric(5,2) NOT NULL,
  amount numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profit_distribution_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read profit_distribution_lines" ON public.profit_distribution_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert profit_distribution_lines" ON public.profit_distribution_lines FOR INSERT TO authenticated WITH CHECK (true);

-- Update triggers
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
