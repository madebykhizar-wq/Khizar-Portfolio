-- ============================================================
-- MBK AI STUDIO OS — MILESTONE 3: BRAND KNOWLEDGE & ASSETS
-- Migration 003: Multi-tenant Brand Guidelines, Knowledge Base & Asset Vault
-- ============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Table: brand_knowledge
-- Stores structured brand guidelines, packaging rules, typography,
-- color palettes, and regulatory mandates for retrieval-augmented AI.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brand_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  knowledge_type TEXT NOT NULL DEFAULT 'guidelines', -- 'guidelines', 'color_palette', 'typography', 'regulatory_mandate', 'packaging_rules'
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------
-- 2. Table: brand_assets
-- Stores vector files, logo marks, dieline templates, and palette swatches
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'logo', -- 'logo', 'vector_icon', 'dieline_template', 'palette_swatch'
  file_url TEXT NOT NULL,
  mime_type TEXT,
  file_size_bytes BIGINT,
  is_confidential BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------------
-- 3. Indexes for Query Performance & Tenant Lookup
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_brand_knowledge_client_id ON public.brand_knowledge(client_id);
CREATE INDEX IF NOT EXISTS idx_brand_knowledge_brand_id ON public.brand_knowledge(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_knowledge_type ON public.brand_knowledge(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_brand_knowledge_active ON public.brand_knowledge(is_active);

CREATE INDEX IF NOT EXISTS idx_brand_assets_client_id ON public.brand_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_brand_id ON public.brand_assets(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON public.brand_assets(asset_type);

-- -------------------------------------------------------------
-- 4. Enable Row Level Security (RLS)
-- -------------------------------------------------------------
ALTER TABLE public.brand_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 5. Revoke Insecure Direct Browser Writes
-- -------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.brand_knowledge FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.brand_assets FROM anon, authenticated, public;

GRANT SELECT ON public.brand_knowledge TO authenticated;
GRANT SELECT ON public.brand_assets TO authenticated;

-- -------------------------------------------------------------
-- 6. RLS Policies: brand_knowledge
-- -------------------------------------------------------------
DROP POLICY IF EXISTS "Studio admin full access on brand_knowledge" ON public.brand_knowledge;
CREATE POLICY "Studio admin full access on brand_knowledge"
  ON public.brand_knowledge
  FOR ALL
  TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

DROP POLICY IF EXISTS "Client members can view brand_knowledge" ON public.brand_knowledge;
CREATE POLICY "Client members can view brand_knowledge"
  ON public.brand_knowledge
  FOR SELECT
  TO authenticated
  USING (public.is_client_member(client_id));

-- -------------------------------------------------------------
-- 7. RLS Policies: brand_assets
-- -------------------------------------------------------------
DROP POLICY IF EXISTS "Studio admin full access on brand_assets" ON public.brand_assets;
CREATE POLICY "Studio admin full access on brand_assets"
  ON public.brand_assets
  FOR ALL
  TO authenticated
  USING (public.is_studio_admin())
  WITH CHECK (public.is_studio_admin());

DROP POLICY IF EXISTS "Client members can view brand_assets" ON public.brand_assets;
CREATE POLICY "Client members can view brand_assets"
  ON public.brand_assets
  FOR SELECT
  TO authenticated
  USING (public.is_client_member(client_id));

COMMIT;
