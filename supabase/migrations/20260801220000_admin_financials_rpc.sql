-- Migration: Admin Company-Wide Financials & Business Comparison RPC (Corrected Schema & Security Definer)
-- Description: Aggregates sales revenue, COGS, expenses, net profit, inventory counts, and monetary valuation across all businesses or filtered by date/business.

CREATE OR REPLACE FUNCTION public.get_admin_platform_financials(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_business_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    WITH biz_list AS (
        SELECT id, business_name, owner_id
        FROM public.businesses
        WHERE (p_business_id IS NULL OR id = p_business_id)
    ),
    rev_cogs AS (
        SELECT 
            s.business_id,
            COALESCE(SUM(s.total_amount), 0) AS revenue,
            COALESCE(SUM(si.unit_cost * si.quantity), 0) AS cogs,
            COUNT(DISTINCT s.id) AS sales_count
        FROM public.sales s
        LEFT JOIN public.sale_items si ON s.id = si.sale_id
        WHERE (p_business_id IS NULL OR s.business_id = p_business_id)
          AND (p_start_date IS NULL OR DATE(s.created_at) >= p_start_date)
          AND (p_end_date IS NULL OR DATE(s.created_at) <= p_end_date)
        GROUP BY s.business_id
    ),
    exp AS (
        SELECT 
            e.business_id,
            COALESCE(SUM(e.amount), 0) AS expenses,
            COUNT(e.id) AS expenses_count
        FROM public.expenses e
        WHERE e.deleted_at IS NULL
          AND (p_business_id IS NULL OR e.business_id = p_business_id)
          AND (p_start_date IS NULL OR e.expense_date >= p_start_date)
          AND (p_end_date IS NULL OR e.expense_date <= p_end_date)
        GROUP BY e.business_id
    ),
    inv AS (
        SELECT 
            p.business_id,
            COALESCE(SUM(i.current_stock), 0) AS stock_count,
            COALESCE(SUM(i.current_stock * COALESCE(p.cost_price, 0)), 0) AS stock_value_cost,
            COALESCE(SUM(i.current_stock * COALESCE(p.selling_price, 0)), 0) AS stock_value_retail
        FROM public.products p
        LEFT JOIN (
            SELECT product_id, SUM(quantity) AS current_stock
            FROM public.inventory_transactions
            GROUP BY product_id
        ) i ON p.id = i.product_id
        WHERE p.is_active = true
          AND (p_business_id IS NULL OR p.business_id = p_business_id)
        GROUP BY p.business_id
    ),
    biz_summary AS (
        SELECT
            b.id AS business_id,
            b.business_name,
            COALESCE(rc.revenue, 0) AS revenue,
            COALESCE(rc.cogs, 0) AS cogs,
            (COALESCE(rc.revenue, 0) - COALESCE(rc.cogs, 0)) AS gross_profit,
            COALESCE(ex.expenses, 0) AS expenses,
            ((COALESCE(rc.revenue, 0) - COALESCE(rc.cogs, 0)) - COALESCE(ex.expenses, 0)) AS net_profit,
            COALESCE(rc.sales_count, 0) AS sales_count,
            COALESCE(ex.expenses_count, 0) AS expenses_count,
            COALESCE(iv.stock_count, 0) AS stock_count,
            COALESCE(iv.stock_value_cost, 0) AS stock_value_cost,
            COALESCE(iv.stock_value_retail, 0) AS stock_value_retail,
            CASE 
              WHEN COALESCE(rc.revenue, 0) > 0 THEN 
                ROUND(((((COALESCE(rc.revenue, 0) - COALESCE(rc.cogs, 0)) - COALESCE(ex.expenses, 0)) / COALESCE(rc.revenue, 0)) * 100)::numeric, 1)
              ELSE 0 
            END AS profit_margin
        FROM biz_list b
        LEFT JOIN rev_cogs rc ON b.id = rc.business_id
        LEFT JOIN exp ex ON b.id = ex.business_id
        LEFT JOIN inv iv ON b.id = iv.business_id
    )
    SELECT json_build_object(
        'kpis', (
            SELECT json_build_object(
                'total_revenue', COALESCE(SUM(revenue), 0),
                'total_cogs', COALESCE(SUM(cogs), 0),
                'total_gross_profit', COALESCE(SUM(gross_profit), 0),
                'total_expenses', COALESCE(SUM(expenses), 0),
                'total_net_profit', COALESCE(SUM(net_profit), 0),
                'total_sales_count', COALESCE(SUM(sales_count), 0),
                'total_expenses_count', COALESCE(SUM(expenses_count), 0),
                'total_inventory_count', COALESCE(SUM(stock_count), 0),
                'total_inventory_value_cost', COALESCE(SUM(stock_value_cost), 0),
                'total_inventory_value_retail', COALESCE(SUM(stock_value_retail), 0),
                'overall_profit_margin', CASE 
                    WHEN SUM(revenue) > 0 THEN ROUND(((SUM(net_profit) / SUM(revenue)) * 100)::numeric, 1)
                    ELSE 0 
                END
            )
            FROM biz_summary
        ),
        'leaderboard', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'business_id', business_id,
                    'business_name', business_name,
                    'revenue', revenue,
                    'cogs', cogs,
                    'gross_profit', gross_profit,
                    'expenses', expenses,
                    'net_profit', net_profit,
                    'sales_count', sales_count,
                    'expenses_count', expenses_count,
                    'stock_count', stock_count,
                    'stock_value_cost', stock_value_cost,
                    'stock_value_retail', stock_value_retail,
                    'profit_margin', profit_margin
                ) ORDER BY net_profit DESC, revenue DESC
            ), '[]'::json)
            FROM biz_summary
        )
    ) INTO result;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_platform_financials(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_platform_financials(DATE, DATE, UUID) TO service_role;
