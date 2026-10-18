-- ============================================================
-- MBK AI STUDIO OS — MILESTONE 4: PREFLIGHT & COMPLIANCE
-- Migration 004: Automated Packaging Preflight Audits & Production Checks
-- ============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Table: preflight_checks
-- Stores immutable preflight audit results, compliance scores,
-- and categorized findings (critical, warning, passed) per SKU revision.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.preflight_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
  revision_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pass', -- 'pass', 'warning', 'fail'
  score INT NOT NULL DEFAULT 100,      -- 0 to 100 preflight score
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  checked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------
-- 2. Indexes for Preflight Performance & Querying
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_preflight_checks_client_id ON public.preflight_checks(client_id);
CREATE INDEX IF NOT EXISTS idx_preflight_checks_sku_id ON public.preflight_checks(sku_id);
CREATE INDEX IF NOT EXISTS idx_preflight_checks_status ON public.preflight_checks(status);
CREATE INDEX IF NOT EXISTS idx_preflight_checks_created_at ON public.preflight_checks(created_at DESC);

-- -------------------------------------------------------------
-- 3. Enable Row Level Security (RLS)
-- -------------------------------------------------------------
ALTER TABLE public.preflight_checks ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 4. Revoke Insecure Direct Browser Writes
-- -------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.preflight_checks FROM anon, authenticated, public;
GRANT SELECT ON public.preflight_checks TO authenticated;

-- -------------------------------------------------------------
-- 5. RLS Policies: preflight_checks
-- -------------------------------------------------------------
DROP POLICY IF EXISTS "Studio admin full access on preflight_checks" ON public.preflight_checks;
CREATE POLICY "Studio admin full access on preflight_checks"
  ON public.preflight_checks
  FOR ALL
  TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

DROP POLICY IF EXISTS "Client members can view preflight_checks" ON public.preflight_checks;
CREATE POLICY "Client members can view preflight_checks"
  ON public.preflight_checks
  FOR SELECT
  TO authenticated
  USING (public.is_client_member(client_id));

COMMIT;
