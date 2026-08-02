-- Migration: Create admin_business_metrics_view
-- Description: View for the Admin Dashboard to see business metrics efficiently

CREATE OR REPLACE VIEW public.admin_business_metrics_view WITH (security_invoker = true) AS
SELECT
  b.id AS id,
  b.business_name,
  b.business_category,
  b.currency,
  b.created_at,
  b.owner_id,
  p.email AS owner_email,
  p.full_name AS owner_name,
  COALESCE(i.total_inventory_items, 0) AS total_inventory_items,
  COALESCE(s.total_sales_amount, 0) AS total_sales_amount,
  COALESCE(s.total_gross_profit, 0) AS total_gross_profit,
  COALESCE(e.total_expenses, 0) AS total_expenses
FROM
  public.businesses b
  LEFT JOIN public.profiles p ON b.owner_id = p.id
  LEFT JOIN (
    SELECT business_id, SUM(quantity) AS total_inventory_items
    FROM public.inventory_transactions
    GROUP BY business_id
  ) i ON i.business_id = b.id
  LEFT JOIN (
    SELECT business_id, SUM(total_amount) AS total_sales_amount, SUM(gross_profit) AS total_gross_profit
    FROM public.sales
    GROUP BY business_id
  ) s ON s.business_id = b.id
  LEFT JOIN (
    SELECT business_id, SUM(amount) AS total_expenses
    FROM public.expenses
    WHERE deleted_at IS NULL
    GROUP BY business_id
  ) e ON e.business_id = b.id;

-- Grant permissions to authenticated users (RLS will still apply because of security_invoker)
GRANT SELECT ON public.admin_business_metrics_view TO authenticated;
GRANT SELECT ON public.admin_business_metrics_view TO service_role;
