CREATE TABLE IF NOT EXISTS pending_restocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC NOT NULL,
  serials JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE pending_restocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pending restocks of their businesses" ON pending_restocks
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers and Owners can insert pending restocks" ON pending_restocks
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Managers and Owners can update pending restocks" ON pending_restocks
  FOR UPDATE USING (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Publish pending_restocks to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pending_restocks;
