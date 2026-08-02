-- Sprint 5: Profit Engine & Financial Calculation Module Views

-- 1. Drop existing views if they exist to avoid conflict
DROP VIEW IF EXISTS profit_summary CASCADE;
DROP VIEW IF EXISTS expense_summary CASCADE;
DROP VIEW IF EXISTS cogs_summary CASCADE;
DROP VIEW IF EXISTS revenue_summary CASCADE;

-- 2. Create Revenue Summary View
CREATE VIEW revenue_summary WITH (security_invoker = true) AS
SELECT
    business_id,
    DATE(created_at) AS business_date,
    SUM(total_amount) AS revenue
FROM sales
GROUP BY business_id, DATE(created_at);

-- 3. Create COGS Summary View
CREATE VIEW cogs_summary WITH (security_invoker = true) AS
SELECT
    s.business_id,
    DATE(s.created_at) AS business_date,
    SUM(si.unit_cost * si.quantity) AS cogs
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
GROUP BY s.business_id, DATE(s.created_at);

-- 4. Create Expense Summary View
CREATE VIEW expense_summary WITH (security_invoker = true) AS
SELECT
    business_id,
    expense_date,
    SUM(amount) AS total_expenses
FROM expenses
WHERE deleted_at IS NULL
GROUP BY business_id, expense_date;

-- 5. Create Profit Summary View
CREATE VIEW profit_summary WITH (security_invoker = true) AS
SELECT
    r.business_id,
    r.business_date,
    r.revenue,
    COALESCE(c.cogs, 0) AS cogs,
    (r.revenue - COALESCE(c.cogs, 0)) AS gross_profit,
    COALESCE(e.total_expenses, 0) AS expenses,
    ((r.revenue - COALESCE(c.cogs, 0)) - COALESCE(e.total_expenses, 0)) AS net_profit
FROM revenue_summary r
LEFT JOIN cogs_summary c
    ON r.business_id = c.business_id
    AND r.business_date = c.business_date
LEFT JOIN expense_summary e
    ON r.business_id = e.business_id
    AND r.business_date = e.expense_date;
