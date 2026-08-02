-- Migration: Create get_platform_activity_stats RPC
-- Description: Aggregates DAU, WAU, MAU, and session lengths from audit logs

CREATE OR REPLACE FUNCTION public.get_platform_activity_stats()
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
    ),
    weekly_active AS (
        SELECT COUNT(DISTINCT user_id) AS wau
        FROM public.audit_logs
        WHERE created_at >= (NOW() - INTERVAL '7 days')
    ),
    monthly_active AS (
        SELECT COUNT(DISTINCT user_id) AS mau
        FROM public.audit_logs
        WHERE created_at >= (NOW() - INTERVAL '30 days')
    ),
    session_times AS (
        SELECT 
            user_id,
            DATE(created_at) AS active_date,
            EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 60 AS session_minutes
        FROM public.audit_logs
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
        LEFT JOIN public.audit_logs a ON DATE(a.created_at) = d.date::DATE
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

GRANT EXECUTE ON FUNCTION public.get_platform_activity_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_activity_stats() TO service_role;
