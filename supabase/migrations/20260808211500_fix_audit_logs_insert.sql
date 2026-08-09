-- Fix audit_logs RLS policy to allow all business members to insert logs
DROP POLICY IF EXISTS "Users can insert audit logs for their business" ON public.audit_logs;

CREATE POLICY "Users can insert audit logs for their business"
    ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (
            SELECT public.get_auth_user_businesses()
        )
    );
