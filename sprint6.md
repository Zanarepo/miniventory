Excellent. Sprint 6 is where BizTrack Lite becomes a decision-support system rather than just a bookkeeping application. Everything built in Sprints 2 to 5 now comes together in a simple, visual dashboard designed specifically for nano, small, and medium business owners, including users with little or no accounting knowledge.
As Product Manager, I recommend following one guiding principle:
A business owner should understand the health of their business within 10 seconds of opening the dashboard.
The dashboard should answer six critical questions immediately:
How much have I sold today?
How much have I spent today?
Am I making a profit?
Do I have enough stock?
Which products are selling the most?
Is my business improving?
The dashboard must not contain business logic. It consumes the APIs and financial services developed in previous sprints.

BizTrack Lite
Sprint 6 Product Requirements Document (PRD)
Dashboard & Business Analytics
Sprint Number: 6
Sprint Duration: 2 Weeks
Priority: High
Dependencies
Sprint 1: Business Registration
Sprint 2: Inventory
Sprint 3: Sales
Sprint 4: Expenses
Sprint 5: Financial Engine

Sprint Goal
Provide every business owner with a modern dashboard that visualizes business performance using intuitive KPIs, charts, alerts, and insights.
The dashboard should work equally well for:
Market traders
Food vendors
Retail stores
Pharmacies
Fashion businesses
Small supermarkets
Service businesses

Sprint Objectives
Users should be able to:
View business performance at a glance
Monitor today's activities
Compare business performance over time
Identify low stock
View top-selling products
Monitor revenue and profit trends
Receive important business alerts

Sprint Scope
Included
KPI Cards
Charts
Business Insights
Low Stock Alerts
Top Products
Revenue Trends
Expense Trends
Inventory Summary
Quick Actions
Dashboard Customization (Basic)
Excluded
AI Recommendations
Forecasting
Budget Analysis
Customer Analytics
Supplier Analytics

Dashboard Layout
---------------------------------------------------------

Business Name

Today's Date

Profile

---------------------------------------------------------

Revenue Card

Expense Card

Profit Card

Cash Card

---------------------------------------------------------

Revenue Trend Chart

Expense Trend Chart

---------------------------------------------------------

Inventory Summary

Low Stock

---------------------------------------------------------

Top Products

Recent Sales

---------------------------------------------------------

Quick Actions

---------------------------------------------------------


Epic 1
KPI Cards

Objective
Display the most important business metrics immediately after login.

User Story
As a business owner
I want to see today's business performance
So I know whether my business is doing well.

KPI Cards
Today's Sales
Displays
Total Sales Today
Change from Yesterday

Today's Expenses
Displays
Today's Expenses
Percentage Change

Today's Profit
Displays
Net Profit
Growth Indicator

Cash Position
Displays
Cash Available
Cash In
Cash Out

Inventory Value
Displays
Total Inventory Value

Products in Stock
Displays
Number of Active Products

KPI Interface
export interface DashboardKPIs {
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
  cashPosition: number;
  inventoryValue: number;
  activeProducts: number;
  comparisonPeriod: string;
}


Epic 2
Revenue Trend Chart

User Story
As a business owner
I want to see revenue trends
So I know whether sales are improving.

Display
Daily Revenue
Last 30 Days

Chart Type
Line Chart

API
GET /analytics/revenue

Returns
interface RevenueTrend {

date:string;

revenue:number;

}


Epic 3
Expense Trend Chart

Display
Daily Expenses
Monthly Expenses
Weekly Expenses

Chart
Bar Chart

Epic 4
Profit Trend

Display
Daily Profit
Weekly Profit
Monthly Profit

Chart
Area Chart

Epic 5
Inventory Summary

Display
Total Products
Available Products
Out of Stock
Low Stock
Inventory Value

Inventory Widget
interface InventorySummary {

products:number;

lowStock:number;

outOfStock:number;

inventoryValue:number;

}


Epic 6
Low Stock Alerts

Purpose
Warn users before products run out.

Display
Product Name
Remaining Quantity
Minimum Quantity
Status

Severity
Green
Yellow
Red

Clicking an item opens the Product Details page.

Epic 7
Top Selling Products

Display
Top 10 Products
Rank
Product
Units Sold
Revenue
Profit

Query
Based on:
Last 30 Days

Epic 8
Recent Transactions

Display
Recent Sales
Recent Expenses
Recent Inventory Adjustments

Maximum
10 Records

Each row displays
Date
Description
Amount
Status

Epic 9
Quick Actions

Buttons
New Sale
Add Product
Record Expense
Adjust Stock
View Reports
These buttons reduce the number of clicks required for common tasks.

Epic 10
Dashboard Filters

Users can filter by:
Today
Yesterday
This Week
This Month
Last Month
This Year
Custom Date
Changing the filter refreshes all dashboard widgets simultaneously.

Epic 11
Business Health Widget
Uses the Financial Engine from Sprint 5.
Display
Health Score
Rating
Improvement Trend

Example
Business Health

86%

Healthy

↑ 5% from last month


React Pages
DashboardPage

AnalyticsPage


React Components
DashboardLayout

KPICard

RevenueChart

ExpenseChart

ProfitChart

InventoryWidget

LowStockWidget

TopProductsTable

RecentTransactions

QuickActions

BusinessHealthCard

DashboardFilter


API Services
DashboardService

getKPIs()

getRevenueTrend()

getExpenseTrend()

getProfitTrend()

getInventorySummary()

getTopProducts()

getRecentTransactions()

getBusinessHealth()


Business Rules
Dashboard displays only authenticated user's business data.
Default filter is "Today."
KPI calculations come exclusively from the Financial Engine.
Low stock uses the minimum stock threshold defined in Sprint 2.
Dashboard refreshes automatically after new sales or expenses are synchronized.
Charts aggregate data based on the selected reporting period.
Widgets should gracefully display empty states for new businesses with no transactions.

Functional Requirements
Users can:
View KPI cards
View charts
Filter dashboard
Open detailed pages
View alerts
Access quick actions
Refresh dashboard
Navigate to reports

Offline Requirements
When offline:
Dashboard displays the last synchronized data.
KPI cards update using locally recorded offline transactions.
Charts render from IndexedDB data.
A synchronization status indicator is shown.
Users are informed when displayed information is based on cached data.

Non-Functional Requirements
Performance
Dashboard initial load < 2 seconds
Widget refresh < 500 ms
Chart rendering < 1 second
Scalability
Dashboard supports businesses with up to 1 million transactions using aggregated queries and pagination.
Accessibility
WCAG 2.2 AA
Keyboard navigation
Screen reader support
Color-independent status indicators
Security
All dashboard queries respect Row Level Security.
No cached data from another business can be displayed.

Dashboard Aggregation Strategy
Instead of issuing many independent database queries, create a dedicated aggregation service.
DashboardAggregator

↓

FinancialService

InventoryService

SalesService

ExpenseService

↓

DashboardResponse

This reduces API requests and improves performance.

Database Views
dashboard_kpis
CREATE VIEW dashboard_kpis AS

SELECT

business_id,

SUM(total_amount) revenue,

SUM(total_cost) cogs,

SUM(gross_profit) gross_profit

FROM sales

GROUP BY business_id;


low_stock_products
CREATE VIEW low_stock_products AS

SELECT

id,

business_id,

product_name,

minimum_stock,

current_stock

FROM inventory_summary

WHERE current_stock <= minimum_stock;

Implementation Note: Because PostgreSQL views cannot directly compare a derived current_stock to a column in another table without joining, this view should join inventory_summary with products:
CREATE VIEW low_stock_products AS
SELECT
    p.id,
    p.business_id,
    p.product_name,
    p.minimum_stock,
    s.current_stock
FROM products p
JOIN inventory_summary s
    ON p.id = s.product_id
WHERE s.current_stock <= p.minimum_stock;


TypeScript Models
export interface DashboardResponse {
  kpis: DashboardKPIs;
  revenueTrend: RevenueTrend[];
  expenseTrend: ExpenseTrend[];
  profitTrend: ProfitTrend[];
  inventory: InventorySummary;
  topProducts: TopProduct[];
  recentTransactions: RecentTransaction[];
  businessHealth: BusinessHealth;
}

export interface TopProduct {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  profit: number;
}

export interface RecentTransaction {
  id: string;
  type: "sale" | "expense" | "inventory";
  description: string;
  amount?: number;
  occurredAt: string;
}


Implementation Task Breakdown
Backend
Create dashboard aggregation service
Create KPI database views
Build revenue trend queries
Build expense trend queries
Build top product queries
Build recent transaction queries
Optimize indexes
Cache aggregated responses where appropriate

Frontend
Dashboard layout
KPI cards
Line, bar, and area charts
Dashboard filters
Low stock widget
Recent transactions widget
Business Health widget
Responsive design
Empty and loading states

QA
KPI validation
Chart accuracy
Filter testing
Widget refresh
Offline dashboard testing
Performance benchmarking
Accessibility testing

Sprint Deliverables
✅ Executive Dashboard
✅ KPI Cards
✅ Revenue Trend Chart
✅ Expense Trend Chart
✅ Profit Trend Chart
✅ Inventory Summary
✅ Low Stock Alerts
✅ Top Selling Products
✅ Recent Transactions
✅ Business Health Widget
✅ Dashboard Filters
✅ Offline Dashboard Support

Definition of Done
Dashboard loads within target performance limits.
KPI values match the Financial Engine calculations.
Charts update correctly for every reporting period.
Low stock alerts display accurately.
Offline dashboard reflects synchronized and local transactions.
Responsive layouts function correctly across supported screen sizes.
Accessibility requirements are met.
Product Owner approves usability with representative SME users.

Open Questions
Should users be able to rearrange dashboard widgets in future releases?
Should the dashboard support multiple branches with consolidated and branch-specific views?
Should business alerts be dismissible or remain visible until resolved?
Should charts support exporting as PNG or PDF?
Should dashboard refresh automatically in real time using Supabase Realtime, or refresh on a fixed interval?
Should the Business Health widget eventually include AI-generated recommendations based on the Financial Engine?

Product Management Recommendation
After Sprint 6, BizTrack Lite provides both operational recording and executive visibility. The remaining core MVP capability is reporting.
Sprint 7: Reports & Data Export should focus on transforming the transactional and analytical data into professional reports that users can print, export to PDF or Excel, and share with accountants, banks, investors, and loan providers. This sprint will complete the MVP by giving business owners formal business records that extend beyond the application itself.

