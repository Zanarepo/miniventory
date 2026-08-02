import { db } from '../lib/dexie';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  ReportFilter,
  ReportHistory,
  SalesReportData,
  ExpenseReportData,
  InventoryReportData,
  ProfitReportData,
  BusinessPerformanceReport,
  FinancialSummaryData,
  ExportFormat,
  ReportType,
} from '../types/reports';

export class ReportingService {
  /**
   * Filter date range helpers
   */
  private static isDateInRange(dateStr: string, startDate?: string, endDate?: string): boolean {
    if (!startDate || !endDate) return true;
    const date = new Date(dateStr).getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return date >= start && date <= end;
  }

  private static getPeriodLabel(filter: ReportFilter): string {
    if (filter.periodLabel) return filter.periodLabel;
    if (filter.startDate && filter.endDate) {
      return `${new Date(filter.startDate).toLocaleDateString()} - ${new Date(filter.endDate).toLocaleDateString()}`;
    }
    return 'Complete History';
  }

  /**
   * Generate Sales Report Data (Offline capable via Dexie)
   */
  public static async generateSalesReport(
    businessId: string,
    filter: ReportFilter,
  ): Promise<SalesReportData> {
    const business = await db.cachedBusinesses.get(businessId);
    const businessName = business?.business_name || 'My Shop';

    const allSales = await db.sales.where('business_id').equals(businessId).toArray();
    const filteredSales = allSales.filter((s) =>
      this.isDateInRange(
        s.created_at || new Date().toISOString(),
        filter.startDate,
        filter.endDate,
      ),
    );

    let totalRevenue = 0;
    const paymentMethodsBreakdown: { [method: string]: number } = {
      Cash: 0,
      'POS / Card': 0,
      Transfer: 0,
      Mobile: 0,
    };
    const productSalesMap: { [name: string]: { qty: number; revenue: number } } = {};
    const salesByDayMap: { [date: string]: { revenue: number; transactions: number } } = {};
    const transactions = [];

    for (const sale of filteredSales) {
      const amount = Number(sale.total_amount) || 0;
      totalRevenue += amount;
      const payMethod = sale.payment_method || 'Cash';
      paymentMethodsBreakdown[payMethod] = (paymentMethodsBreakdown[payMethod] || 0) + amount;

      const dateStr = (sale.created_at || new Date().toISOString()).split('T')[0];
      if (!salesByDayMap[dateStr]) {
        salesByDayMap[dateStr] = { revenue: 0, transactions: 0 };
      }
      salesByDayMap[dateStr].revenue += amount;
      salesByDayMap[dateStr].transactions += 1;

      // Items for this sale
      const items = await db.saleItems.where('sale_id').equals(sale.id).toArray();
      const summaryNames: string[] = [];
      for (const item of items) {
        const product = await db.products.get(item.product_id);
        const pName = product?.product_name || 'Item';
        const qty = Number(item.quantity) || 1;
        const lineTotal = Number(item.selling_price) * qty || 0;
        summaryNames.push(`${pName} (${qty})`);

        if (!productSalesMap[pName]) productSalesMap[pName] = { qty: 0, revenue: 0 };
        productSalesMap[pName].qty += qty;
        productSalesMap[pName].revenue += lineTotal;
      }

      transactions.push({
        receiptNo: sale.receipt_number || sale.id.slice(0, 8),
        date: sale.created_at || new Date().toISOString(),
        totalAmount: amount,
        paymentMethod: payMethod,
        itemsCount: items.length,
        productsSummary: summaryNames.join(', ') || 'Various shop goods',
      });
    }

    const topSellingProducts = Object.entries(productSalesMap)
      .map(([name, val]) => ({ name, qty: val.qty, revenue: val.revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const salesByDay = Object.entries(salesByDayMap)
      .map(([date, val]) => ({ date, revenue: val.revenue, transactions: val.transactions }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Estimated COGS (default 65% of revenue if not directly calculated)
    const estimatedCOGS = totalRevenue * 0.65;
    const estimatedGrossProfit = totalRevenue - estimatedCOGS;

    return {
      businessName,
      reportingPeriod: this.getPeriodLabel(filter),
      transactionCount: filteredSales.length,
      totalRevenue,
      estimatedGrossProfit,
      paymentMethodsBreakdown,
      topSellingProducts,
      salesByDay,
      transactions,
    };
  }

  /**
   * Generate Expense Report Data
   */
  public static async generateExpenseReport(
    businessId: string,
    filter: ReportFilter,
  ): Promise<ExpenseReportData> {
    const business = await db.cachedBusinesses.get(businessId);
    const businessName = business?.business_name || 'My Shop';

    const allExpenses = await db.expenses.where('business_id').equals(businessId).toArray();
    // Filter out soft-deleted expenses and apply date bounds
    const activeExpenses = allExpenses.filter(
      (e) => !e.deleted_at && this.isDateInRange(e.expense_date, filter.startDate, filter.endDate),
    );

    const categories = await db.expenseCategories.where('business_id').equals(businessId).toArray();
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    let totalExpenses = 0;
    let largestExpenseAmount = 0;
    let largestExpenseDescription = 'No expenses recorded';
    const catTotalMap: { [cat: string]: number } = {};

    const expensesList = [];

    for (const exp of activeExpenses) {
      const amount = Number(exp.amount) || 0;
      totalExpenses += amount;
      const catName = exp.category_id
        ? categoryMap.get(exp.category_id) || 'General Bills'
        : 'General Bills';
      catTotalMap[catName] = (catTotalMap[catName] || 0) + amount;

      if (amount > largestExpenseAmount) {
        largestExpenseAmount = amount;
        largestExpenseDescription = exp.description ? `${exp.description} (${catName})` : catName;
      }

      expensesList.push({
        id: exp.id,
        date: exp.expense_date,
        categoryName: catName,
        description: exp.description || 'Store operational expenditure',
        amount,
        paymentMethod:
          (exp as unknown as { payment_method?: string }).payment_method || 'Cash / Bank',
      });
    }

    // Sort descending by date
    expensesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const categoryBreakdown = Object.entries(catTotalMap)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      businessName,
      reportingPeriod: this.getPeriodLabel(filter),
      totalExpenses,
      largestExpenseAmount,
      largestExpenseDescription,
      categoryBreakdown,
      expenses: expensesList,
    };
  }

  /**
   * Generate Inventory Report Data
   */
  public static async generateInventoryReport(businessId: string): Promise<InventoryReportData> {
    const business = await db.cachedBusinesses.get(businessId);
    const businessName = business?.business_name || 'My Shop';

    const allProducts = await db.products.where('business_id').equals(businessId).toArray();
    const activeProducts = allProducts.filter((p) => p.is_active !== false);

    const categories = await db.productCategories.where('business_id').equals(businessId).toArray();
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    let totalUnits = 0;
    let inventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const items = [];

    // Calculate current stock from transactions to match InventoryProvider
    const txs = await db.inventoryTransactions.toArray();
    const stockMap = new Map<string, number>();
    txs.forEach((tx) => {
      const current = stockMap.get(tx.product_id) || 0;
      stockMap.set(tx.product_id, current + Number(tx.quantity));
    });

    for (const prod of activeProducts) {
      const stock = stockMap.get(prod.id) || 0;
      const cost = Number(prod.cost_price) || 0;
      const price = Number(prod.selling_price) || 0;
      const minAlert = Number(prod.minimum_stock) || 5;
      const val = stock * cost;

      totalUnits += stock;
      inventoryValue += val;

      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (stock === 0) {
        status = 'Out of Stock';
        outOfStockCount++;
      } else if (stock <= minAlert) {
        status = 'Low Stock';
        lowStockCount++;
      }

      items.push({
        id: prod.id,
        name: prod.product_name || 'Product',
        sku: prod.sku || 'N/A',
        category: prod.category_id
          ? catMap.get(prod.category_id) || 'Uncategorized'
          : 'Uncategorized',
        stock,
        costPrice: cost,
        sellingPrice: price,
        totalValue: val,
        status,
      });
    }

    items.sort((a, b) => b.totalValue - a.totalValue);

    return {
      businessName,
      totalStockItems: activeProducts.length,
      totalUnits,
      inventoryValue,
      lowStockCount,
      outOfStockCount,
      items,
    };
  }

  /**
   * Generate Take-Home Profit Report Data
   */
  public static async generateProfitReport(
    businessId: string,
    filter: ReportFilter,
  ): Promise<ProfitReportData> {
    const salesReport = await this.generateSalesReport(businessId, filter);
    const expenseReport = await this.generateExpenseReport(businessId, filter);

    const revenue = salesReport.totalRevenue;
    const cogs = salesReport.totalRevenue * 0.65; // Based on Financial Engine patterns
    const grossProfit = revenue - cogs;
    const expenses = expenseReport.totalExpenses;
    const netProfit = grossProfit - expenses;
    const profitMargin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

    let healthScore: number;
    if (profitMargin >= 25) healthScore = 95;
    else if (profitMargin >= 15) healthScore = 85;
    else if (profitMargin > 0) healthScore = 65;
    else if (revenue === 0 && expenses === 0) healthScore = 70;
    else healthScore = 35;

    let healthStatus: 'Healthy' | 'Moderate' | 'Low' | 'Critical';
    let summaryMessage: string;

    if (healthScore >= 80) {
      healthStatus = 'Healthy';
      summaryMessage = 'Excellent financial strength! Your profits after expenses are very strong.';
    } else if (healthScore >= 60) {
      healthStatus = 'Moderate';
      summaryMessage =
        'Good operations. Consider reducing everyday shop bills to boost take-home profit.';
    } else if (healthScore >= 40) {
      healthStatus = 'Low';
      summaryMessage =
        'Low profits this period. Check your pricing and control store expenditures.';
    } else {
      healthStatus = 'Critical';
      summaryMessage =
        'Expenses exceeded profits! Review your bills immediately to protect your cash.';
    }

    return {
      businessName: salesReport.businessName,
      reportingPeriod: salesReport.reportingPeriod,
      revenue,
      cogs,
      grossProfit,
      expenses,
      netProfit,
      profitMargin,
      healthScore,
      healthStatus,
      summaryMessage,
    };
  }

  /**
   * Generate Bank & Loan Performance Executive Report (Epic 5)
   */
  public static async generateBusinessPerformance(
    businessId: string,
    filter: ReportFilter,
  ): Promise<BusinessPerformanceReport> {
    const profit = await this.generateProfitReport(businessId, filter);
    const inventory = await this.generateInventoryReport(businessId);
    const sales = await this.generateSalesReport(businessId, filter);
    const expenses = await this.generateExpenseReport(businessId, filter);

    const topSellingProduct =
      sales.topSellingProducts.length > 0 ? sales.topSellingProducts[0].name : 'N/A';
    const topExpenseCategory =
      expenses.categoryBreakdown.length > 0 ? expenses.categoryBreakdown[0].category : 'None';
    const mostProfitableProduct =
      sales.topSellingProducts.length > 0
        ? `${sales.topSellingProducts[0].name} (Est. 35% Margin)`
        : 'N/A';

    let businessTrends = 'Steady growth across sales and consistent stock turnaround.';
    if (profit.profitMargin > 18) {
      businessTrends =
        'High profitability growth; ideal candidate for expansion loans or financing.';
    } else if (profit.profitMargin < 5) {
      businessTrends =
        'Focusing on cost reduction and customer acquisition to expand gross revenue.';
    }

    return {
      revenue: profit.revenue,
      expenses: profit.expenses,
      grossProfit: profit.grossProfit,
      netProfit: profit.netProfit,
      inventoryValue: inventory.inventoryValue,
      healthScore: profit.healthScore,
      topSellingProduct,
      topExpenseCategory,
      mostProfitableProduct,
      businessTrends,
      reportingPeriod: profit.reportingPeriod,
    };
  }

  /**
   * Generate Financial Summary (Epic 6)
   */
  public static async generateFinancialSummary(businessId: string): Promise<FinancialSummaryData> {
    const business = await db.cachedBusinesses.get(businessId);
    const businessName = business?.business_name || 'My Shop';

    const todayStr = new Date().toISOString().split('T')[0];
    const firstDayMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString();
    const nowStr = new Date().toISOString();

    // Today sales & expenses
    const todaySales = (await db.sales.where('business_id').equals(businessId).toArray())
      .filter((s) => (s.created_at || '').startsWith(todayStr))
      .reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
    const todayExpenses = (await db.expenses.where('business_id').equals(businessId).toArray())
      .filter((e) => !e.deleted_at && e.expense_date.startsWith(todayStr))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Month totals
    const monthlyRevenue = (await db.sales.where('business_id').equals(businessId).toArray())
      .filter((s) => (s.created_at || '') >= firstDayMonth)
      .reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
    const monthlyExpenses = (await db.expenses.where('business_id').equals(businessId).toArray())
      .filter((e) => !e.deleted_at && e.expense_date >= firstDayMonth)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const inv = await this.generateInventoryReport(businessId);

    const todayProfit = todaySales * 0.35 - todayExpenses;
    const monthlyProfit = monthlyRevenue * 0.35 - monthlyExpenses;

    return {
      businessName,
      todaySales,
      todayExpenses,
      todayProfit,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      inventoryValue: inv.inventoryValue,
      cashPosition: Math.max(0, monthlyRevenue - monthlyExpenses),
      healthRating: monthlyProfit >= 0 ? 'Healthy & Strong' : 'Needs Bill Reduction',
      generatedAt: nowStr,
    };
  }

  /**
   * Save report metadata to report_history table (Offline Dexie first, then syncs)
   */
  public static async saveReportHistory(
    businessId: string,
    reportType: ReportType | string,
    reportName: string,
    exportFormat: ExportFormat,
    generatedBy?: string,
    parameters?: unknown,
  ): Promise<void> {
    const newRecord: ReportHistory = {
      id: crypto.randomUUID(),
      businessId,
      reportType: String(reportType),
      reportName,
      exportFormat,
      generatedBy: generatedBy || 'Business Owner',
      generatedAt: new Date().toISOString(),
      parameters,
    };

    // Store in local Dexie IndexedDB
    await db.reportHistory.put(newRecord);

    // Queue for cloud background synchronization
    await db.syncQueue.add({
      action: 'CREATE',
      entity: 'report_history',
      payload: newRecord,
      createdAt: Date.now(),
      status: 'pending',
    });
  }

  public static async getReportHistory(businessId: string): Promise<ReportHistory[]> {
    // Try cloud if online, otherwise return offline Dexie storage
    if (typeof window !== 'undefined' && window.navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('report_history')
          .select('*')
          .eq('business_id', businessId)
          .order('generated_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map((d) => ({
            id: d.id,
            businessId: d.business_id,
            reportType: d.report_type,
            reportName: d.report_name,
            exportFormat: d.export_format as ExportFormat,
            generatedBy: d.generated_by || 'Owner',
            generatedAt: d.generated_at,
            parameters: d.parameters,
          }));
          // Refresh Dexie
          for (const item of formatted) {
            await db.reportHistory.put(item);
          }
          return formatted;
        }
      } catch (err) {
        console.warn('Could not reach cloud report history, loading from offline cache:', err);
      }
    }

    const cached = await db.reportHistory.where('businessId').equals(businessId).toArray();
    cached.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    return cached;
  }

  /**
   * Client-Side Excel (.xlsx) Exporter
   */
  public static async exportExcel(
    fileName: string,
    sheetTitle: string,
    headers: string[],
    rows: (string | number)[][],
  ): Promise<void> {
    const wb = XLSX.utils.book_new();
    const data = [
      [`BizTrack Lite Report - ${sheetTitle}`, ''],
      ['Generated:', new Date().toLocaleString()],
      [],
      headers,
      ...rows,
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto column resizing
    const cols: { wch: number }[] = headers.map(() => ({ wch: 22 }));
    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, 'Business Report');
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Client-Side CSV Exporter with UTF-8 BOM
   */
  public static async exportCSV(
    fileName: string,
    headers: string[],
    rows: (string | number)[][],
  ): Promise<void> {
    const csvData = Papa.unparse({ fields: headers, data: rows });
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Client-Side PDF Exporter (Professional branding, table support, footers)
   */
  public static async exportPDF(
    fileName: string,
    reportTitle: string,
    businessName: string,
    periodLabel: string,
    summaryStats: { label: string; value: string }[],
    tableHeaders: string[],
    tableRows: (string | number)[][],
    executiveSummary?: string,
  ): Promise<void> {
    const doc = new jsPDF({
      orientation: tableHeaders.length > 5 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Brand header
    doc.setFillColor(99, 102, 241); // Brand Primary #6366f1
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(businessName || 'BizTrack Lite Business Report', 14, 12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${reportTitle} • Period: ${periodLabel}`, 14, 20);

    // Summary Stats Section
    let startY = 36;
    if (summaryStats && summaryStats.length > 0) {
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Performance Summary', 14, startY);
      startY += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      summaryStats.forEach((stat, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const xPos = 14 + col * (pageWidth / 2 - 14);
        const yPos = startY + row * 7;
        doc.text(`${stat.label}: `, xPos, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value, xPos + 55, yPos);
        doc.setFont('helvetica', 'normal');
      });
      startY += Math.ceil(summaryStats.length / 2) * 7 + 8;
    }

    // Main Table
    let currentY = startY;
    if (tableHeaders.length > 0 && tableRows.length > 0) {
      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3.5 },
        margin: { left: 14, right: 14 },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (doc as any).lastAutoTable.finalY + 12;
    }

    if (executiveSummary) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary & Trends', 14, currentY);
      currentY += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const splitText = doc.splitTextToSize(executiveSummary, pageWidth - 28);
      doc.text(splitText, 14, currentY);
    }

    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Generated directly from BizTrack Lite • ${new Date().toLocaleString()} • Page ${i} of ${totalPages}`,
        14,
        pageHeight - 10,
      );
    }

    doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
