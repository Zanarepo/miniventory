-- Migration: Enriched Activity Logs View & Parametric Activity Stats RPC
-- Description: Provides a simple view joining audit logs with business names and profile emails, and supports filtering DAU/MAU by business_id.

-- 1. Create View for Enriched Activity Logs
CREATE OR REPLACE VIEW public.admin_activity_logs_view WITH (security_invoker = true) AS
SELECT
  a.id,
  a.business_id,
  b.business_name,
  a.user_id,
  p.email AS user_email,
  p.full_name AS user_name,
  a.action,
  a.entity,
  a.entity_id,
  a.metadata,
  a.ip_address,
  a.user_agent,
  a.created_at
FROM
  public.audit_logs a
  LEFT JOIN public.businesses b ON a.business_id = b.id
  LEFT JOIN public.profiles p ON a.user_id = p.id;

GRANT SELECT ON public.admin_activity_logs_view TO authenticated;
GRANT SELECT ON public.admin_activity_logs_view TO service_role;

-- 2. Create / Replace get_platform_activity_stats to accept p_business_id parameter
CREATE OR REPLACE FUNCTION public.get_platform_activity_stats(p_business_id uuid DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    result JSON;
BEGIN
    WITH daily_active AS (
        SELECT COUNT(DISTINCT user_id) AS dau
        FROM public.audit_logs
        WHERE created_at >= (NOW() - INTERVAL '1 day')
          AND (p_business_id IS NULL OR business_id = p_business_id)
    ),
    weekly_active AS (
        SELECT COUNT(DISTINCT user_id) AS wau
        FROM public.audit_logs
        WHERE created_at >= (NOW() - INTERVAL '7 days')
          AND (p_business_id IS NULL OR business_id = p_business_id)
    ),
    monthly_active AS (
        SELECT COUNT(DISTINCT user_id) AS mau
        FROM public.audit_logs
        WHERE created_at >= (NOW() - INTERVAL '30 days')
          AND (p_business_id IS NULL OR business_id = p_business_id)
    ),
    session_times AS (
        SELECT 
            user_id,
            DATE(created_at) AS active_date,
            EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 60 AS session_minutes
        FROM public.audit_logs
        WHERE (p_business_id IS NULL OR business_id = p_business_id)
        GROUP BY user_id, DATE(created_at)
        HAVING MAX(created_at) > MIN(created_at)
    ),
    avg_session AS (
        SELECT COALESCE(AVG(session_minutes), 0) AS avg_session_minutes
        FROM session_times
    ),
    trend_data AS (
        SELECT 
            d.date::DATE AS active_date,
            COUNT(DISTINCT a.user_id) AS active_users
        FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') d(date)
        LEFT JOIN public.audit_logs a 
          ON DATE(a.created_at) = d.date::DATE 
          AND (p_business_id IS NULL OR a.business_id = p_business_id)
        GROUP BY d.date::DATE
        ORDER BY d.date::DATE
    )
    SELECT json_build_object(
        'dau', (SELECT dau FROM daily_active),
        'wau', (SELECT wau FROM weekly_active),
        'mau', (SELECT mau FROM monthly_active),
        'avg_session_minutes', ROUND((SELECT avg_session_minutes FROM avg_session)::numeric, 1),
        'trend', (SELECT json_agg(json_build_object('date', active_date, 'users', active_users)) FROM trend_data)
    ) INTO result;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_platform_activity_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_activity_stats(uuid) TO service_role;
