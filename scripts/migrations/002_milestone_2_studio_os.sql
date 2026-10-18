-- ============================================================
-- MILESTONE 2: PRIVATE STUDIO OS — SCHEMA & MULTI-TENANT RLS
-- ============================================================
-- Models clients, client members, brands, SKUs, revisions, and audit logs.
-- Enforces tenant isolation: Client A cannot access Client B data.
-- Zero anonymous (anon) access.
-- ============================================================

BEGIN;

-- 1. Helper Function: Check if current user is Studio Admin
CREATE OR REPLACE FUNCTION public.is_studio_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    auth.jwt() ->> 'email' = 'madebykhizar@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
$$;

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Client Members Table (Maps Supabase Auth users to clients)
CREATE TABLE IF NOT EXISTS public.client_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client_viewer' CHECK (role IN ('client_admin', 'client_editor', 'client_viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, user_id)
);

-- 4. Helper Function: Check if current user is member of a client
CREATE OR REPLACE FUNCTION public.is_client_member(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_members
    WHERE client_id = target_client_id
    AND user_id = auth.uid()
  );
$$;

-- 5. Brands Table (Brand guidelines and identity specifications)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  font_primary TEXT,
  guidelines_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SKUs Table (Structured Product & Packaging specifications)
CREATE TABLE IF NOT EXISTS public.skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  category TEXT,
  pack_format TEXT,
  dimensions JSONB DEFAULT '{"width_mm":0,"height_mm":0,"depth_mm":0}'::jsonb,
  materials TEXT,
  claims TEXT[] DEFAULT '{}'::text[],
  target_market TEXT,
  barcode_upc TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_design', 'preflight', 'approved', 'archived')),
  current_revision INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, sku_code)
);

-- 7. SKU Revisions Table (Immutable design & dieline revision history)
CREATE TABLE IF NOT EXISTS public.sku_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  change_summary TEXT,
  dieline_file_url TEXT,
  artwork_file_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sku_id, revision_number)
);

-- 8. Audit Logs Table (Attributable studio & client actions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) & PRIVILEGE HARDENING
-- ============================================================

-- Explicitly revoke write & read access from anonymous / public roles
REVOKE ALL ON public.clients FROM anon, public;
REVOKE ALL ON public.client_members FROM anon, public;
REVOKE ALL ON public.brands FROM anon, public;
REVOKE ALL ON public.skus FROM anon, public;
REVOKE ALL ON public.sku_revisions FROM anon, public;
REVOKE ALL ON public.audit_logs FROM anon, public;

-- Grant authenticated users SELECT/INSERT/UPDATE per policy
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skus TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sku_revisions TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;

-- Enable RLS on all private tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sku_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting existing policies
DROP POLICY IF EXISTS "Admin full access clients" ON public.clients;
DROP POLICY IF EXISTS "Client member read clients" ON public.clients;
DROP POLICY IF EXISTS "Admin full access members" ON public.client_members;
DROP POLICY IF EXISTS "Client member read members" ON public.client_members;
DROP POLICY IF EXISTS "Admin full access brands" ON public.brands;
DROP POLICY IF EXISTS "Client member read brands" ON public.brands;
DROP POLICY IF EXISTS "Admin full access skus" ON public.skus;
DROP POLICY IF EXISTS "Client member read skus" ON public.skus;
DROP POLICY IF EXISTS "Admin full access revisions" ON public.sku_revisions;
DROP POLICY IF EXISTS "Client member read revisions" ON public.sku_revisions;
DROP POLICY IF EXISTS "Admin full access audit" ON public.audit_logs;
DROP POLICY IF EXISTS "Client member read audit" ON public.audit_logs;

-- Policies: clients
CREATE POLICY "Admin full access clients" ON public.clients
  FOR ALL TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

CREATE POLICY "Client member read clients" ON public.clients
  FOR SELECT TO authenticated
  USING (public.is_client_member(id));

-- Policies: client_members
CREATE POLICY "Admin full access members" ON public.client_members
  FOR ALL TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

CREATE POLICY "Client member read members" ON public.client_members
  FOR SELECT TO authenticated
  USING (public.is_client_member(client_id));

-- Policies: brands
CREATE POLICY "Admin full access brands" ON public.brands
  FOR ALL TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

CREATE POLICY "Client member read brands" ON public.brands
  FOR SELECT TO authenticated
  USING (public.is_client_member(client_id));

-- Policies: skus
CREATE POLICY "Admin full access skus" ON public.skus
  FOR ALL TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

CREATE POLICY "Client member read skus" ON public.skus
  FOR SELECT TO authenticated
  USING (public.is_client_member(client_id));

-- Policies: sku_revisions
CREATE POLICY "Admin full access revisions" ON public.sku_revisions
  FOR ALL TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

CREATE POLICY "Client member read revisions" ON public.sku_revisions
  FOR SELECT TO authenticated
  USING (public.is_client_member(client_id));

-- Policies: audit_logs
CREATE POLICY "Admin full access audit" ON public.audit_logs
  FOR ALL TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

CREATE POLICY "Client member read audit" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (client_id IS NOT NULL AND public.is_client_member(client_id));

COMMIT;
