-- ====================================================================
-- MBK AI STUDIO OS — MILESTONE 5: CLIENT PORTAL & PROOF APPROVALS
-- Table, indices, RLS policies, and trigger for digital proof sign-offs
-- ====================================================================

-- 1. Create proof_approvals table
CREATE TABLE IF NOT EXISTS public.proof_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.client_brands(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'changes_requested', 'rejected')) DEFAULT 'pending',
  decision_by TEXT NOT NULL,
  decision_role TEXT DEFAULT 'Client Brand Stakeholder',
  decision_notes TEXT,
  signature_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance & Tenant Isolation Indices
CREATE INDEX IF NOT EXISTS idx_proof_approvals_sku_id ON public.proof_approvals(sku_id);
CREATE INDEX IF NOT EXISTS idx_proof_approvals_client_id ON public.proof_approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_proof_approvals_status ON public.proof_approvals(status);
CREATE INDEX IF NOT EXISTS idx_proof_approvals_created_at ON public.proof_approvals(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.proof_approvals ENABLE ROW LEVEL SECURITY;

-- Revoke all direct privileges from public and anon roles
REVOKE ALL ON public.proof_approvals FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proof_approvals TO authenticated, service_role;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Service role full access proof_approvals" ON public.proof_approvals;
CREATE POLICY "Service role full access proof_approvals"
  ON public.proof_approvals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users tenant proof_approvals read" ON public.proof_approvals;
CREATE POLICY "Authenticated users tenant proof_approvals read"
  ON public.proof_approvals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_users cu
      WHERE cu.client_id = proof_approvals.client_id
        AND cu.user_id = auth.uid()
    )
    OR auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
  );

DROP POLICY IF EXISTS "Authenticated users tenant proof_approvals insert" ON public.proof_approvals;
CREATE POLICY "Authenticated users tenant proof_approvals insert"
  ON public.proof_approvals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_users cu
      WHERE cu.client_id = proof_approvals.client_id
        AND cu.user_id = auth.uid()
    )
    OR auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
  );

-- 5. Updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_proof_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proof_approvals_updated_at ON public.proof_approvals;
CREATE TRIGGER trg_proof_approvals_updated_at
  BEFORE UPDATE ON public.proof_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_proof_approvals_updated_at();

COMMENT ON TABLE public.proof_approvals IS 'Immutable cryptographic digital sign-offs and change requests for packaging SKUs.';
