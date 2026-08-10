DROP POLICY IF EXISTS "Managers and Owners can insert pending restocks" ON pending_restocks;
CREATE POLICY "Users can insert pending restocks" ON pending_restocks
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid()
    )
  );
