-- BizTrack Lite Sprint 7 - Reports & Data Export Module
-- Migration for report_history metadata persistence and RLS security policies

CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  report_name TEXT NOT NULL,
  export_format TEXT NOT NULL,
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  parameters JSONB,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;

-- Security Policy: Owners can view, insert, and delete report history for their businesses
CREATE POLICY "Owners manage report history"
ON report_history
FOR ALL
USING (
  business_id IN (
    SELECT id
    FROM businesses
    WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id
    FROM businesses
    WHERE owner_id = auth.uid()
  )
);

-- Indices to optimize frontend dashboard aggregation and offline Dexie background syncing
CREATE INDEX IF NOT EXISTS idx_report_history_business_id ON report_history(business_id);
CREATE INDEX IF NOT EXISTS idx_report_history_generated_at ON report_history(generated_at DESC);
