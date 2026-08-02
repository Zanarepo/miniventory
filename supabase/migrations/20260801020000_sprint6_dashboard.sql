-- Sprint 6: Dashboard & Business Analytics Executive KPI Views

-- 1. Drop existing view if exists to ensure clean migration
DROP VIEW IF EXISTS dashboard_kpis CASCADE;

-- 2. Create Dashboard KPIs summary view with security invoker enabled for RLS compliance
CREATE VIEW dashboard_kpis WITH (security_invoker = true) AS
SELECT
    business_id,
    COALESCE(SUM(total_amount), 0) AS revenue,
    COALESCE(SUM(total_cost), 0) AS cogs,
    COALESCE(SUM(gross_profit), 0) AS gross_profit
FROM sales
GROUP BY business_id;
