export type LanguageCode = 'en' | 'pid' | 'ha' | 'ig' | 'yo';

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', flag: '🇳🇬' },
  { code: 'pid', label: 'Pidgin', flag: '🗣️' },
  { code: 'ha', label: 'Hausa', flag: '🏛️' },
  { code: 'ig', label: 'Igbo', flag: '🌴' },
  { code: 'yo', label: 'Yorùbá', flag: '👑' },
];

export type TranslationKey =
  | 'appTitle'
  | 'appTagline'
  | 'heroBadge'
  | 'heroDesc'
  | 'getStartedFree'
  | 'existingAccount'
  | 'footerDesc'
  | 'signInTitle'
  | 'signInSubtitle'
  | 'registerTitle'
  | 'registerSubtitle'
  | 'phoneLabel'
  | 'phonePlaceholder'
  | 'phoneHelper'
  | 'pinLabel'
  | 'pinPlaceholder'
  | 'ownerNameLabel'
  | 'ownerNamePlaceholder'
  | 'forgotPin'
  | 'useMagicLink'
  | 'signInButton'
  | 'registerButton'
  | 'noAccountYet'
  | 'registerNowLink'
  | 'alreadyRegistered'
  | 'signInHereLink'
  | 'securityQuestionLabel'
  | 'secretAnswerLabel'
  | 'secretAnswerPlaceholder'
  | 'secretAnswerHelper'
  | 'offlineNotice'
  | 'dashboard'
  | 'transactions'
  | 'logout'
  | 'noRecords'
  | 'welcomeBack'
  | 'invTitle'
  | 'invSubtitle'
  | 'invAddBtn'
  | 'invHistoryBtn'
  | 'invSearchPlaceholder'
  | 'invLowStockToggle'
  | 'colItemName'
  | 'colCategory'
  | 'colSellingPrice'
  | 'colCostPrice'
  | 'colRemainingStock'
  | 'colActions'
  | 'btnAdjust'
  | 'btnEdit'
  | 'btnDelete'
  | 'invEmptyState'
  | 'statTotalItems'
  | 'unitItems'
  | 'statTotalValue'
  | 'statValueSub'
  | 'statLowStock'
  | 'unitAlerts'
  | 'statOutOfStock'
  | 'modalTitleAdd'
  | 'modalTitleEdit'
  | 'fieldItemName'
  | 'helperItemName'
  | 'fieldCategory'
  | 'optNewCategory'
  | 'fieldSku'
  | 'fieldSellingPrice'
  | 'helperSellingPrice'
  | 'fieldCostPrice'
  | 'helperCostPrice'
  | 'fieldUnit'
  | 'fieldOpeningStock'
  | 'helperOpeningStock'
  | 'fieldLowStock'
  | 'helperLowStock'
  | 'fieldRemarks'
  | 'placeholderRemarks'
  | 'btnCancel'
  | 'btnSaveItem'
  | 'btnSaveChanges'
  | 'modalTitleCategory'
  | 'fieldCatName'
  | 'placeholderCatName'
  | 'fieldCatColor'
  | 'helperCatColor'
  | 'btnSaveCategory'
  | 'modalTitleAdjust'
  | 'currentStockText'
  | 'fieldReason'
  | 'reasonStockIn'
  | 'reasonStockOut'
  | 'reasonDamaged'
  | 'reasonLost'
  | 'reasonReturn'
  | 'fieldAdjustQty'
  | 'fieldAdjustCost'
  | 'fieldAdjustRemarks'
  | 'placeholderAdjustRemarks'
  | 'btnSaveAdjustment'
  | 'historyTitle'
  | 'historySubtitle'
  | 'historySearchPlaceholder'
  | 'filterAllMovements'
  | 'colDate'
  | 'colType'
  | 'colQtyChange'
  | 'colNewBalance'
  | 'colRemarks'
  | 'tabSales'
  | 'cartTitle'
  | 'cartEmpty'
  | 'cartTotal'
  | 'btnCheckout'
  | 'payMethodCash'
  | 'payMethodPOS'
  | 'payMethodTransfer'
  | 'payMethodMobile'
  | 'checkoutSuccess'
  | 'saleFailed'
  | 'receiptTitle'
  | 'printReceipt'
  | 'salesHistoryTitle'
  | 'salesHistorySubtitle'
  | 'colReceiptNo'
  | 'colTotalAmount'
  | 'tabExpenses'
  | 'expensesTitle'
  | 'expensesSubtitle'
  | 'btnRecordExpense'
  | 'todayExpenses'
  | 'weeklyExpenses'
  | 'monthlyExpenses'
  | 'largestCategory'
  | 'modalTitleAddExpense'
  | 'modalTitleEditExpense'
  | 'fieldExpenseAmount'
  | 'fieldExpenseDate'
  | 'fieldExpenseDesc'
  | 'fieldExpensePayMethod'
  | 'fieldReceiptUpload'
  | 'btnSaveExpense'
  | 'confirmDeleteExpense'
  | 'deleteExpenseSuccess'
  | 'deleteExpenseFailed'
  | 'expenseDateFutureError'
  | 'tabFinancials'
  | 'financialsTitle'
  | 'financialsSubtitle'
  | 'revenueLabel'
  | 'cogsLabel'
  | 'grossProfitLabel'
  | 'netProfitLabel'
  | 'cashPositionLabel'
  | 'inventoryValueLabel'
  | 'healthScoreLabel'
  | 'healthRatingLabel'
  | 'periodSelectorLabel'
  | 'startDateLabel'
  | 'endDateLabel'
  | 'dashTabOverview'
  | 'dashTabCharts'
  | 'dashTabStock'
  | 'dashTabHealth'
  | 'dashQuickActionsTitle'
  | 'dashRecordSale'
  | 'dashRecordSaleSub'
  | 'dashLogExpense'
  | 'dashLogExpenseSub'
  | 'dashAddProduct'
  | 'dashAddProductSub'
  | 'dashCheckStock'
  | 'dashCheckStockSub'
  | 'dashTodaySales'
  | 'dashTodayExpenses'
  | 'dashActualProfit'
  | 'dashAvailableCash'
  | 'dashStockValue'
  | 'dashItemsInShop'
  | 'dashBestsellersTitle'
  | 'dashLowStockTitle'
  | 'dashActivitiesTitle'
  | 'dashHealthTitle'
  | 'tabReports'
  | 'reportsTitle'
  | 'reportsSubtitle'
  | 'repTabSales'
  | 'repTabExpenses'
  | 'repTabStock'
  | 'repTabProfit'
  | 'repTabBank'
  | 'repTabHistory'
  | 'btnExportPDF'
  | 'btnExportExcel'
  | 'btnExportCSV'
  | 'btnPrintReport'
  | 'mockupSalesHeader'
  | 'mockupSalesItemLabel'
  | 'mockupSalesItemValue'
  | 'mockupSalesAmountLabel'
  | 'mockupSalesAmountValue'
  | 'mockupSalesSaveBtn'
  | 'mockupInvHeader'
  | 'mockupInvItem1'
  | 'mockupInvRestock'
  | 'mockupInvInStock'
  | 'mockupInvItem2'
  | 'mockupInvLowStock'
  | 'mockupInvRemaining'
  | 'mockupProfitHeader'
  | 'mockupProfitNetTitle'
  | 'mockupProfitNetValue'
  | 'mockupProfitNetTrend'
  | 'mockupProfitSales'
  | 'mockupProfitSalesValue'
  | 'mockupProfitExpenses'
  | 'mockupProfitExpensesValue'
  | 'showcaseSalesTitle'
  | 'showcaseSalesDesc'
  | 'showcaseOfflineTitle'
  | 'showcaseOfflineDesc'
  | 'showcaseSmartTitle'
  | 'showcaseSmartDesc';

type TranslationDictionary = Record<LanguageCode, Record<TranslationKey, string>>;

export const TRANSLATIONS: TranslationDictionary = {
  en: {
    appTitle: 'BizTrack',
    appTagline: 'Simple Business Record Keeping for Every Entrepreneur',
    heroBadge: '✨ Offline-First Financial Tracking',
    heroDesc:
      'Designed specifically for market traders, food vendors, fashion designers, and growing enterprises. Record inventory, calculate profits automatically, and access your records anytime—even without internet!',
    getStartedFree: 'Get Started Free',
    existingAccount: 'Existing Account',
    footerDesc: 'Empowering everyday African entrepreneurs with intuitive digital bookkeeping.',
    signInTitle: 'Sign In to Your Business',
    signInSubtitle:
      'Enter your registered Mobile Phone Number (or Email) and your 6-Digit PIN / Password.',
    registerTitle: 'Register Your Business',
    registerSubtitle:
      'No email or accounting skills required! Create an account using your mobile phone number and a simple 6-Digit PIN.',
    phoneLabel: 'Mobile Phone Number (or Email Address)',
    phonePlaceholder: 'e.g., 08012345678',
    phoneHelper: 'Local traders can use their phone number. Supermarkets can use email.',
    pinLabel: '6-Digit PIN or Password',
    pinPlaceholder: 'e.g., 123456 (just like your POS PIN)',
    ownerNameLabel: 'Owner Full Name',
    ownerNamePlaceholder: 'e.g., Mama Ngozi',
    forgotPin: 'Forgot PIN / Password?',
    useMagicLink: 'Use Email Magic Link',
    signInButton: 'Sign In 🚀',
    registerButton: 'Create Business Account 🚀',
    noAccountYet: "Don't have a business account yet?",
    registerNowLink: 'Register Now',
    alreadyRegistered: 'Already registered your business?',
    signInHereLink: 'Sign In Here',
    securityQuestionLabel: 'Security Recovery Question (If you ever forget your PIN)',
    secretAnswerLabel: 'Your Secret Answer',
    secretAnswerPlaceholder: 'e.g., Onitsha or Emeka',
    secretAnswerHelper: 'Remember this answer so you can reset your PIN without needing an email!',
    offlineNotice: 'No internet connection. Changes will be saved locally offline!',
    dashboard: 'Dashboard',
    transactions: 'Recent Transactions',
    logout: 'Sign Out',
    noRecords: 'No business records recorded yet.',
    welcomeBack: 'Welcome back to your business dashboard!',
    invTitle: 'My Shop Items & Stock',
    invSubtitle:
      'See all your market goods, selling prices, and how much stock you have remaining.',
    invAddBtn: 'Add New Item',
    invHistoryBtn: 'Stock History',
    invSearchPlaceholder: 'Search for shop items by name or category...',
    invLowStockToggle: 'Show Low Stock Only',
    colItemName: 'ITEM NAME',
    colCategory: 'CATEGORY',
    colSellingPrice: 'SELLING PRICE',
    colCostPrice: 'COST PRICE',
    colRemainingStock: 'REMAINING STOCK',
    colActions: 'ACTIONS',
    btnAdjust: 'Update Stock',
    btnEdit: 'Edit Item',
    btnDelete: 'Delete Item',
    invEmptyState: 'You have not added any items matching your search yet.',
    statTotalItems: 'TOTAL ITEMS',
    unitItems: 'items',
    statTotalValue: 'TOTAL STOCK VALUE',
    statValueSub: 'Calculated from your cost prices',
    statLowStock: 'LOW STOCK ITEMS',
    unitAlerts: 'low',
    statOutOfStock: 'OUT OF STOCK',
    modalTitleAdd: 'Add New Item to Your Shop',
    modalTitleEdit: 'Edit Item Details',
    fieldItemName: 'Item Name',
    helperItemName: 'The name customers call this item (e.g., Garri, Rice, Ankara)',
    fieldCategory: 'Category / Group',
    optNewCategory: '+ Create New Category...',
    fieldSku: 'Item Code or Barcode (Optional)',
    fieldSellingPrice: 'Selling Price (How much you sell 1)',
    helperSellingPrice: 'Price customer pays for one piece, bag, or yard',
    fieldCostPrice: 'Cost Price (How much you bought 1)',
    helperCostPrice: 'We use this to calculate your profit automatically!',
    fieldUnit: 'Unit of Measure (How is it measured?)',
    fieldOpeningStock: 'Current Stock (How many do you have right now?)',
    helperOpeningStock: 'We will record this as your starting inventory balance',
    fieldLowStock: 'Low Stock Warning Level (When should we remind you?)',
    helperLowStock: 'We will alert you when stock drops to this number so you can buy more',
    fieldRemarks: 'Additional Notes (Optional)',
    placeholderRemarks: 'e.g., Bought from Alaba market, shop shelf position, supplier phone',
    btnCancel: 'Cancel',
    btnSaveItem: 'Save Item to Shop',
    btnSaveChanges: 'Save Changes',
    modalTitleCategory: 'Create New Item Category',
    fieldCatName: 'Category Name',
    placeholderCatName: 'e.g., Provisions, Drinks, Clothes, Foodstuffs',
    fieldCatColor: 'Choose Color for this Category',
    helperCatColor: 'Helps you recognize this group easily on your screen',
    btnSaveCategory: 'Save Category',
    modalTitleAdjust: 'Update Stock Quantity',
    currentStockText: 'Current stock remaining right now: {n}',
    fieldReason: 'Why are you updating stock?',
    reasonStockIn: 'Added Stock (New market purchases or supply)',
    reasonStockOut: 'Removed Stock (Used by shop or giveaway)',
    reasonDamaged: 'Damaged / Spoilt item',
    reasonLost: 'Lost / Missing item',
    reasonReturn: 'Customer Returned Item',
    fieldAdjustQty: 'How many items?',
    fieldAdjustCost: 'Cost per unit (Optional)',
    fieldAdjustRemarks: 'Reason / Notes (Required for your records)',
    placeholderAdjustRemarks: 'e.g., Bought 20 new bags from Alhaji, or broken container',
    btnSaveAdjustment: 'Save Stock Update',
    historyTitle: 'Stock History & Records',
    historySubtitle: 'See every time stock was added, removed, sold, or updated in your shop.',
    historySearchPlaceholder: 'Search records by item name or reason...',
    filterAllMovements: 'All Types of Movements',
    colDate: 'DATE & TIME',
    colType: 'WHAT HAPPENED',
    colQtyChange: 'QUANTITY CHANGED',
    colNewBalance: 'NEW REMAINING STOCK',
    colRemarks: 'REASON / NOTES',
    tabSales: 'Record Sales',
    cartTitle: 'Current Sale (Cart)',
    cartEmpty: 'Cart is empty. Search items to add.',
    cartTotal: 'Total Amount to Pay',
    btnCheckout: 'Complete Sale',
    payMethodCash: 'Cash',
    payMethodPOS: 'POS / Card',
    payMethodTransfer: 'Bank Transfer',
    payMethodMobile: 'Mobile Money',
    checkoutSuccess: 'Sale completed successfully!',
    saleFailed: 'Failed to process sale. Try again.',
    receiptTitle: 'Sales Receipt',
    printReceipt: 'Print Receipt',
    salesHistoryTitle: 'Sales Ledger & Receipts',
    salesHistorySubtitle: 'View past sales, daily revenue, and print receipts.',
    colReceiptNo: 'RECEIPT NO.',
    colTotalAmount: 'TOTAL AMOUNT',
    tabExpenses: 'Shop Expenses',
    expensesTitle: 'Business Expenses',
    expensesSubtitle: 'Record and track where your money goes to prevent leakage.',
    btnRecordExpense: 'Record Expense',
    todayExpenses: "Today's Expenses",
    weeklyExpenses: 'Weekly Expenses',
    monthlyExpenses: 'Monthly Expenses',
    largestCategory: 'Top Expense Category',
    modalTitleAddExpense: 'Record New Expense',
    modalTitleEditExpense: 'Edit Expense Record',
    fieldExpenseAmount: 'Expense Amount',
    fieldExpenseDate: 'Expense Date',
    fieldExpenseDesc: 'Expense Description',
    fieldExpensePayMethod: 'Payment Method',
    fieldReceiptUpload: 'Attach Receipt (Optional)',
    btnSaveExpense: 'Save Expense',
    confirmDeleteExpense: 'Are you sure you want to delete this expense?',
    deleteExpenseSuccess: 'Expense deleted successfully',
    deleteExpenseFailed: 'Failed to delete expense',
    expenseDateFutureError: 'Future dates are not allowed for expenses.',
    tabFinancials: 'Money & Profits',
    financialsTitle: 'Financial Insights',
    financialsSubtitle: 'Automatically track revenue, COGS, profits, and overall business health.',
    revenueLabel: 'Revenue',
    cogsLabel: 'Cost of Goods Sold (COGS)',
    grossProfitLabel: 'Gross Profit',
    netProfitLabel: 'Net Profit',
    cashPositionLabel: 'Cash Position',
    inventoryValueLabel: 'Inventory Value',
    healthScoreLabel: 'Business Health Score',
    healthRatingLabel: 'Health Rating',
    periodSelectorLabel: 'Reporting Period',
    startDateLabel: 'From',
    endDateLabel: 'To',
    dashTabOverview: 'Overview',
    dashTabCharts: 'Charts',
    dashTabStock: 'Stock',
    dashTabHealth: 'Health Check',
    dashQuickActionsTitle: 'Quick Action Shortcuts',
    dashRecordSale: 'Record Customer Payment',
    dashRecordSaleSub: 'Log cash or transfers immediately',
    dashLogExpense: 'Log Business Expense',
    dashLogExpenseSub: 'Track shop bills and purchases',
    dashAddProduct: 'Add New Shop Item',
    dashAddProductSub: 'Register a new item for sale',
    dashCheckStock: 'Check All Stock Items',
    dashCheckStockSub: 'View quantities and adjust stock',
    dashTodaySales: "Today's Sales",
    dashTodayExpenses: "Today's Expenses",
    dashActualProfit: 'Actual Profit',
    dashAvailableCash: 'Available Cash',
    dashStockValue: 'Shop Stock Value',
    dashItemsInShop: 'Items In Shop',
    dashBestsellersTitle: 'Top Selling Shop Items',
    dashLowStockTitle: 'Low Stock Warnings',
    dashActivitiesTitle: 'Recent Shop Operations & Transactions',
    dashHealthTitle: 'Business Health Scorecard',
    tabReports: 'Business Reports',
    reportsTitle: 'Reports & Data Exports',
    reportsSubtitle:
      'Generate clean summaries of your shop performance, print, or save files offline.',
    repTabSales: 'Sales & Money In',
    repTabExpenses: 'Shop Expenses',
    repTabStock: 'Shop Stock & Value',
    repTabProfit: 'Take-Home Profit',
    repTabBank: 'Bank & Loan Summary',
    repTabHistory: 'Saved Reports',
    btnExportPDF: 'Save as PDF',
    btnExportExcel: 'Save as Excel',
    btnExportCSV: 'Save as CSV',
    btnPrintReport: 'Print Report',

    mockupSalesHeader: 'Record New Sale (Pidgin)',
    mockupSalesItemLabel: 'Wetin you sell? (Item Name)',
    mockupSalesItemValue: '2 Bags of Rice',
    mockupSalesAmountLabel: 'How much you collect? (₦)',
    mockupSalesAmountValue: '₦ 84,000',
    mockupSalesSaveBtn: 'Save Record',
    mockupInvHeader: 'Smart Inventory',
    mockupInvItem1: 'Indomie Carton',
    mockupInvRestock: 'Last restocked: Today',
    mockupInvInStock: 'In Stock',
    mockupInvItem2: 'Peak Milk (Tin)',
    mockupInvLowStock: 'Low Stock Warning',
    mockupInvRemaining: 'Remaining',
    mockupProfitHeader: 'Profit & Loss Engine',
    mockupProfitNetTitle: 'Net Profit (This Week)',
    mockupProfitNetValue: '₦ 142,500',
    mockupProfitNetTrend: '+15.2% vs Last Week',
    mockupProfitSales: 'Total Sales',
    mockupProfitSalesValue: '₦ 380,000',
    mockupProfitExpenses: 'Total Expenses',
    mockupProfitExpensesValue: '₦ 237,500',
    showcaseSalesTitle: 'Record Sales in Seconds',
    showcaseSalesDesc:
      'No complicated accounting jargon. Our Pidgin English interface makes it incredibly easy for any shop owner or attendant to log daily sales instantly, saving you hours of manual bookkeeping.',
    showcaseOfflineTitle: '100% Offline Capable',
    showcaseOfflineDesc:
      'Bad network? No problem. Track your inventory and receive low stock alerts entirely offline. BizTrack uses advanced local databases to save your data instantly, syncing securely to the cloud only when your connection returns.',
    showcaseSmartTitle: 'Make Smart Decisions',
    showcaseSmartDesc:
      'Stop guessing if you are making money. Our automated Profit & Loss engine calculates your true net profit in real-time, helping you identify trends and grow your business with bank-grade security.',
  },
  pid: {
    appTitle: 'BizTrack',
    appTagline: 'Easy book-keeping for every hustle & business person',
    heroBadge: '✨ No Internet Required! Record Better',
    heroDesc:
      'We make am special for market traders, food sellers, tailors, and business hustle. Measure your market stock, count your daily profit automatically, and check your records anytime—even if internet no dey!',
    getStartedFree: 'Open Account Free',
    existingAccount: 'Enter Your Account',
    footerDesc: 'Supporting African business hustlers with easy simple record keeping.',
    signInTitle: 'Enter Your Business Records',
    signInSubtitle: 'Put your Phone Number (or Email) with your 6-Digit Secret PIN / Password.',
    registerTitle: 'Open Your Business Account Here',
    registerSubtitle:
      'No need for email or book-keeping school! Open your account with just your phone number and 6-Digit PIN.',
    phoneLabel: 'Your Phone Number (or Email)',
    phonePlaceholder: 'e.g., 08012345678',
    phoneHelper: 'Traders fit put their phone number. Supermarkets fit use email.',
    pinLabel: 'Your Secret 6-Digit PIN',
    pinPlaceholder: 'e.g., 123456 (same like your POS PIN)',
    ownerNameLabel: 'Your Full Name',
    ownerNamePlaceholder: 'e.g., Mama Ngozi',
    forgotPin: 'You don forget PIN / Password?',
    useMagicLink: 'Use Email Magic Link',
    signInButton: 'Enter Inside 🚀',
    registerButton: 'Start Account Now 🚀',
    noAccountYet: 'You never register your business before?',
    registerNowLink: 'Open Account Now',
    alreadyRegistered: 'You don register your business already?',
    signInHereLink: 'Enter Inside Here',
    securityQuestionLabel: 'Secret Question (In case you forget your PIN)',
    secretAnswerLabel: 'Your Secret Answer',
    secretAnswerPlaceholder: 'e.g., Onitsha or Emeka',
    secretAnswerHelper: 'Remember this answer well well so you fit change PIN without email!',
    offlineNotice: 'Internet no dey right now. We done save everything offline for your phone!',
    dashboard: 'Business Corner',
    transactions: 'Recent Sales & Expenses',
    logout: 'Comot (Sign Out)',
    noRecords: 'You never record any market transaction today.',
    welcomeBack: 'Welcome back to your business corner!',
    invTitle: 'My Market Items & Stock',
    invSubtitle:
      'See all your market goods, selling price, and how many stock remain inside store.',
    invAddBtn: 'Add New Market Item',
    invHistoryBtn: 'Check Stock History',
    invSearchPlaceholder: 'Search your market item by name or group...',
    invLowStockToggle: 'Show Only Items Wey Want Finish',
    colItemName: 'ITEM NAME',
    colCategory: 'ITEM GROUP',
    colSellingPrice: 'SELLING PRICE',
    colCostPrice: 'COST PRICE (BUYING AMOUNT)',
    colRemainingStock: 'STOCK WEY REMAIN',
    colActions: 'ACTIONS',
    btnAdjust: 'Change Stock',
    btnEdit: 'Edit Item',
    btnDelete: 'Delete Item',
    invEmptyState: 'You never put any market item wey match your search yet.',
    statTotalItems: 'MARKET ITEMS',
    unitItems: 'items',
    statTotalValue: 'TOTAL STOCK WORTH',
    statValueSub: 'We calculate am from your buying cost price',
    statLowStock: 'LOW STOCK ITEMS',
    unitAlerts: 'low',
    statOutOfStock: 'OUT OF STOCK ITEMS',
    modalTitleAdd: 'Add New Item Inside Your Store',
    modalTitleEdit: 'Edit Item Details',
    fieldItemName: 'Name of Item',
    helperItemName: 'The common name wey customers dey call am (e.g., Garri, Rice, Ankara)',
    fieldCategory: 'Category / Group (Where e belong?)',
    optNewCategory: '+ Make New Group...',
    fieldSku: 'Item Code or Barcode (If e get am)',
    fieldSellingPrice: 'Selling Price (How much you dey sell 1?)',
    helperSellingPrice: 'Amount wey customer go pay for one piece, bag, or yard',
    fieldCostPrice: 'Cost Price (How much you buy 1 from market?)',
    helperCostPrice: 'We go use this one calculate your daily profit automatically!',
    fieldUnit: 'How you dey measure am?',
    fieldOpeningStock: 'How many you get inside shop right now?',
    helperOpeningStock: 'We go record am as your starting market stock',
    fieldLowStock: 'When we make warn you say e want finish?',
    helperLowStock: 'When stock reach this number, we go alert you make you buy more',
    fieldRemarks: 'Extra Notes (Optional)',
    placeholderRemarks: 'e.g., I buy am from Alaba market, shelf corner, supplier number',
    btnCancel: 'Cancel',
    btnSaveItem: 'Save Item Inside Store',
    btnSaveChanges: 'Save Your Changes',
    modalTitleCategory: 'Make New Item Group',
    fieldCatName: 'Name of Group / Category',
    placeholderCatName: 'e.g., Provisions, Drinks, Clothes, Foodstuffs',
    fieldCatColor: 'Choose Color for this Group',
    helperCatColor: 'E go help you quickly spot this group for your screen',
    btnSaveCategory: 'Save Group',
    modalTitleAdjust: 'Update How Many Stock Remain',
    currentStockText: 'Stock wey remain inside store right now: {n}',
    fieldReason: 'Why you dey change the stock number?',
    reasonStockIn: 'I add more stock (New purchases from market)',
    reasonStockOut: 'I take stock out (Used by shop or giveaway)',
    reasonDamaged: 'Stock damage or spoil',
    reasonLost: 'Stock lost or someone steal am',
    reasonReturn: 'Customer return item back to store',
    fieldAdjustQty: 'How many pieces or bags?',
    fieldAdjustCost: 'Cost per unit (Optional)',
    fieldAdjustRemarks: 'Why you change am? (Put reason for record)',
    placeholderAdjustRemarks: 'e.g., I buy 20 bags from Alhaji, or rat chop container',
    btnSaveAdjustment: 'Save Stock Record',
    historyTitle: 'Stock History & Audit Records',
    historySubtitle: 'See every single time stock enter or comot from your market store.',
    historySearchPlaceholder: 'Search history by item name or reason...',
    filterAllMovements: 'All Types of Stock Records',
    colDate: 'DATE & TIME',
    colType: 'WETIN HAPPEN',
    colQtyChange: 'HOW MANY CHANGE',
    colNewBalance: 'NEW REMAINING STOCK',
    colRemarks: 'REASON / NOTES',
    tabSales: 'Sell Market',
    cartTitle: 'Customer Cart',
    cartEmpty: 'Cart dey empty. Find item add put.',
    cartTotal: 'Total Money to Pay',
    btnCheckout: 'Collect Money',
    payMethodCash: 'Cash',
    payMethodPOS: 'POS',
    payMethodTransfer: 'Transfer',
    payMethodMobile: 'Momo/Opay',
    checkoutSuccess: 'Market done sell wella!',
    saleFailed: 'Sale no gree go. Try am again.',
    receiptTitle: 'Customer Receipt',
    printReceipt: 'Print Receipt',
    salesHistoryTitle: 'Sales Record & Receipts',
    salesHistorySubtitle: 'See all the market you don sell and the money you make.',
    colReceiptNo: 'RECEIPT NO.',
    colTotalAmount: 'TOTAL MONEY',
    tabExpenses: 'Shop Expenses',
    expensesTitle: 'Hustle Expenses',
    expensesSubtitle: 'Record where your money dey go make you for no lose profit.',
    btnRecordExpense: 'Add New Expense',
    todayExpenses: 'Money Spent Today',
    weeklyExpenses: 'Money Spent This Week',
    monthlyExpenses: 'Money Spent This Month',
    largestCategory: 'Highest Expense Category',
    modalTitleAddExpense: 'Record New Expense',
    modalTitleEditExpense: 'Edit Expense details',
    fieldExpenseAmount: 'How much you spent',
    fieldExpenseDate: 'Date you spent am',
    fieldExpenseDesc: 'Wetin you buy / use am for',
    fieldExpensePayMethod: 'How you pay',
    fieldReceiptUpload: 'Attach Receipt (If e dey) (Optional)',
    btnSaveExpense: 'Save Expense',
    confirmDeleteExpense: 'You sure say you want delete this expense?',
    deleteExpenseSuccess: 'Expense don delete well!',
    deleteExpenseFailed: 'Error: Expense no delete, try again.',
    expenseDateFutureError: 'You no fit put date where never reach for future.',
    tabFinancials: 'Money & Profits',
    financialsTitle: 'How Money Dey Flow',
    financialsSubtitle: 'See your complete revenue, market costs, profit, and health rating.',
    revenueLabel: 'Total Money In',
    cogsLabel: 'Market Purchase Costs',
    grossProfitLabel: 'Gross Profit',
    netProfitLabel: 'Pure Clean Profit',
    cashPositionLabel: 'Cash in Hand',
    inventoryValueLabel: 'Stock Value',
    healthScoreLabel: 'Business Health Score',
    healthRatingLabel: 'Business Health Status',
    periodSelectorLabel: 'Time Frame',
    startDateLabel: 'From',
    endDateLabel: 'Reach',
    dashTabOverview: 'How Business De Go',
    dashTabCharts: 'Money Charts',
    dashTabStock: 'Shop Stock',
    dashTabHealth: 'Business Strength',
    dashQuickActionsTitle: 'Fast Action Shortcuts',
    dashRecordSale: 'Record Money Wey Customer Pay',
    dashRecordSaleSub: 'Enter cash or bank transfer money right now',
    dashLogExpense: 'Log Money Wey Go Out',
    dashLogExpenseSub: 'Enter generator fuel, transport & shop bills',
    dashAddProduct: 'Add New Item For Shop',
    dashAddProductSub: 'Put new market item make customers buy am',
    dashCheckStock: 'Check All Items For Shop',
    dashCheckStockSub: 'Check wetin remain for shelf & count market',
    dashTodaySales: 'Today Market Money',
    dashTodayExpenses: 'Money Wey We Spend Today',
    dashActualProfit: 'Real Gain Wey We Make',
    dashAvailableCash: 'Cash Wey De Hand Now',
    dashStockValue: 'Total Money For Our Stock',
    dashItemsInShop: 'Total Items For Shop',
    dashBestsellersTitle: 'Items Wey People Buy Pass',
    dashLowStockTitle: 'Items Wey Want Finish',
    dashActivitiesTitle: 'Recent Things Wey Happen For Shop',
    dashHealthTitle: 'How Business Strong Reach',
    tabReports: 'Business Reports',
    reportsTitle: 'All Your Market Reports',
    reportsSubtitle:
      'See how market dey yield, print customer statement, or download files offline.',
    repTabSales: 'Money Wey Enter',
    repTabExpenses: 'Money We Spend',
    repTabStock: 'Shop Goods & Stock',
    repTabProfit: 'Pure Clean Gain',
    repTabBank: 'Bank & Loan Document',
    repTabHistory: 'Saved Reports History',
    btnExportPDF: 'Download PDF File',
    btnExportExcel: 'Download Excel Sheet',
    btnExportCSV: 'Download CSV File',
    btnPrintReport: 'Print This Report',

    mockupSalesHeader: 'Record New Sale (Pidgin)',
    mockupSalesItemLabel: 'Wetin you sell? (Item Name)',
    mockupSalesItemValue: '2 Bags of Rice',
    mockupSalesAmountLabel: 'How much you collect? (₦)',
    mockupSalesAmountValue: '₦ 84,000',
    mockupSalesSaveBtn: 'Save Record',
    mockupInvHeader: 'Smart Inventory',
    mockupInvItem1: 'Indomie Carton',
    mockupInvRestock: 'Last restocked: Today',
    mockupInvInStock: 'In Stock',
    mockupInvItem2: 'Peak Milk (Tin)',
    mockupInvLowStock: 'Low Stock Warning',
    mockupInvRemaining: 'Remaining',
    mockupProfitHeader: 'Profit & Loss Engine',
    mockupProfitNetTitle: 'Net Profit (This Week)',
    mockupProfitNetValue: '₦ 142,500',
    mockupProfitNetTrend: '+15.2% vs Last Week',
    mockupProfitSales: 'Total Sales',
    mockupProfitSalesValue: '₦ 380,000',
    mockupProfitExpenses: 'Total Expenses',
    mockupProfitExpensesValue: '₦ 237,500',
    showcaseSalesTitle: 'Record Sales Sharp Sharp',
    showcaseSalesDesc:
      'No long grammar or big accounting words. Our Pidgin English design make am very easy for any shop owner or boy to write daily sales sharp sharp. E save you time wey you for use dey write inside big book.',
    showcaseOfflineTitle: 'E Dey Work Offline 100%',
    showcaseOfflineDesc:
      'Network bad? No wahala. You fit track your goods and see low stock warning even if network no dey. BizTrack use local database to save your data sharp sharp, and e go backup go cloud securely when your network come back.',
    showcaseSmartTitle: 'Make Better Business Decision',
    showcaseSmartDesc:
      'Make you stop to dey guess if your business dey make gain. Our Profit & Loss engine go calculate your actual net profit in real-time, help you see where money dey go and grow your business with bank-level security.',
  },
  ha: {
    appTitle: 'BizTrack',
    appTagline: 'Sauƙi wajen kiyaye lissafin kowane ɗan kasuwa',
    heroBadge: '✨ Lissafi Ko Ba Tare Da Intanet Ba',
    heroDesc:
      "An tsara ta ne musamman don 'yan kasuwa, masu sayar da abinci, masu dinka sanya, da sauran kasuwanci. Lika hajoji, gane ribarka cikin hanzari, kuma duba lissafinka kowane lokaci ko ba tare da intanet ba!",
    getStartedFree: 'Bude Asusu Kyauta',
    existingAccount: 'Bude Shafin Ka',
    footerDesc: "Taimakawa 'yan kasuwan Afirka na yau da kullum ta hanyar lissafi mai sauqi.",
    signInTitle: 'Shiga Cikin Kasuwancinka',
    signInSubtitle: 'Sa lambar wayarka na kasuwanci (ko imel) da lambar sirri na 6-Digit PIN.',
    registerTitle: 'Bude Asusu na Kasuwancinka',
    registerSubtitle:
      'Ba sai kana da imel ko karatun ilimi ba! Bude asusu da lambar waya da lambar 6-Digit PIN ta sauki.',
    phoneLabel: 'Lambar Waya (ko Imel)',
    phonePlaceholder: 'e.g., 08012345678',
    phoneHelper: "'Yan kasuwa za su iya amfani da lambar waya. Kantuna na iya amfani da imel.",
    pinLabel: 'Lambar Sirri (PIN 6-Digit ko Password)',
    pinPlaceholder: 'e.g., 123456 (kamata kuke yi na POS)',
    ownerNameLabel: 'Cikakken Sunanka na Kasuwa',
    ownerNamePlaceholder: 'e.g., Mama Ngozi ko Alhaji Musa',
    forgotPin: 'Ka manta PIN / Bakin Zaren Sirri?',
    useMagicLink: 'Amfani da Hanyar Imel',
    signInButton: 'Shiga Ciki 🚀',
    registerButton: 'Yi Rajista Yanzu 🚀',
    noAccountYet: 'Baka da asusu na kasuwanci tukuna?',
    registerNowLink: 'Yi Rajista Nan',
    alreadyRegistered: 'Ka riga ka bude asusu na kasuwanci?',
    signInHereLink: 'Shiga Daga Nan',
    securityQuestionLabel: 'Tambayar Tsaron Sirri (Idan ka manta PIN dinka)',
    secretAnswerLabel: 'Amsar Tsaron Sirrinka',
    secretAnswerPlaceholder: 'e.g., Kano ko Zaria',
    secretAnswerHelper: 'Ka tuna wannan amsar sosai don canza PIN dinka ba tare da imel ba!',
    offlineNotice: 'Babu intanet a yanzu. Mun ajije duk lissafin a kan wayarka!',
    dashboard: 'Shafin Kasuwanci',
    transactions: 'Saye da Siyarwa na Yanzu',
    logout: 'Fita (Sign Out)',
    noRecords: 'Babu wajen ciniki ko wani lissafi da aka sa tukuna.',
    welcomeBack: 'Barka da dawowa shafin lissafinka!',
    invTitle: 'Kayayyakin Kantina & Lissafi',
    invSubtitle:
      'Duba duk kayayyakin kasuwarka, farashi, da adadin abin da ya yi saura a shagonka.',
    invAddBtn: 'Ƙara Wani Kaya Yanzu',
    invHistoryBtn: 'Tarihin Saye da Salo',
    invSearchPlaceholder: 'Nemi kaya da sunan shi ko sashin shi...',
    invLowStockToggle: 'Nuna Kawai Kayayyakin da ke Shirin Ƙarewa',
    colItemName: 'SUNAN KAYA',
    colCategory: 'SASHI / KASHIN KAYA',
    colSellingPrice: 'FARASHIN SIYARWA',
    colCostPrice: 'FARASHIN SARI (SIYYAR SHI)',
    colRemainingStock: 'SAURAN KAYA A SHAGO',
    colActions: 'AYYUKA',
    btnAdjust: 'Gyara Adadi',
    btnEdit: 'Gyara Kayan',
    btnDelete: 'Goge Kaya',
    invEmptyState: 'Babu wani kaya da yayi daidai da bincikenka tukuna.',
    statTotalItems: 'ADADIN KAYA',
    unitItems: 'kaya',
    statTotalValue: 'KIMAR KUDIN KAYA',
    statValueSub: 'An lissafta bisa farashin sarinka na kowane kaya',
    statLowStock: 'KAYA DA ZA SU KARE',
    unitAlerts: 'saura',
    statOutOfStock: 'KAYAYYAKI DA SUKA KARE',
    modalTitleAdd: 'Ƙara Wani Sabon Kaya A Shagoka',
    modalTitleEdit: 'Gyara Bayanin Kayan',
    fieldItemName: 'Sunan Kayan',
    helperItemName: 'Sunan da kwastomomi suke kiran shi da shi (msl., Shinkafa, Gari, Atamfa)',
    fieldCategory: 'Sashi / Kayan Aiki',
    optNewCategory: '+ Ƙara Wani Sabon Sashi...',
    fieldSku: 'Lambar Kaya ko Barcode (Zabii ne)',
    fieldSellingPrice: 'Farashin Siyarwa (Nawa zaka siyar ɗaya?)',
    helperSellingPrice: 'Kudin da kwastom zai biya don kwaya ɗaya ko buhu ɗaya',
    fieldCostPrice: 'Farashin Sari (Nawa ka sayo shi a kasuwa?)',
    helperCostPrice: 'Za mu yi amfani da wannan wajen lissafta ribarka ta kowane lokaci!',
    fieldUnit: 'Yaya ake gwada shi? (msl., Kwaya, Buhu, Mita)',
    fieldOpeningStock: 'Adadin da kake da shi a shago yanzu',
    helperOpeningStock: 'Wannan zai zama kafari na bayanin kayan shagonka',
    fieldLowStock: 'Yaushe kake so mu tunatar da kai cewa ya kusa karewa?',
    helperLowStock: 'Idan kayan suka koma wannan adadi, za mu sanar daji don ka sayo wani',
    fieldRemarks: 'Karin Bayani (Idan akwai)',
    placeholderRemarks: 'msl., An sayo daga Kasuwar Kantin Kwari, ko lambar wayar dilari',
    btnCancel: 'Fasawa',
    btnSaveItem: 'Ajiye Kayan A Shago',
    btnSaveChanges: 'Ajiye Sauyawar',
    modalTitleCategory: 'Ƙara Wani Sabon Sashi Ko Ajin Kayan',
    fieldCatName: 'Sunan Sashin / Ajin Kayan',
    placeholderCatName: 'msl., Abinci, Abin shan ruwa, Kaya, Mai da gishiri',
    fieldCatColor: 'Zaɓi Launi don Wannan Sashin',
    helperCatColor: 'Wannan launi zai taimaka maka gane sashin cikin sauki akan wayar ka',
    btnSaveCategory: 'Ajiye Sashin',
    modalTitleAdjust: 'Sabunta Adadin Kayayyaki',
    currentStockText: 'Sauran kayayyaki yanzu a lissafi: {n}',
    fieldReason: 'Me yasa kake canza adadin kayan yanzu?',
    reasonStockIn: 'An ƙara sabon kaya (Saye daga kasuwa ko sari)',
    reasonStockOut: 'An rage kaya (Amfanin shago ko kyauta don tallatawa)',
    reasonDamaged: 'Kaya ya baci ko ya rushe',
    reasonLost: 'Kaya ya bace ko wani ya sato shi',
    reasonReturn: 'Kwastom ya dawo da kayan baya',
    fieldAdjustQty: 'Adadi nawa za a sabunta?',
    fieldAdjustCost: 'Farashin kowane daya (Zabi ne)',
    fieldAdjustRemarks: 'Dalilin sabuntawa (Tsarin tilas ne ga tarihin kasuwancika)',
    placeholderAdjustRemarks: 'msl., Na sayo katan 20 daga wajen Alhaji a kasuwa',
    btnSaveAdjustment: 'Ajiye Sabuntawa',
    historyTitle: 'Tarihin da Lissafin Abin Da Akai Don Kayayya',
    historySubtitle: 'Duba duk wata alamar sauyawa ga kayayyakin shagonka cikin sauki.',
    historySearchPlaceholder: 'Nemi ta sunan kaya ko dalilin sauya kaya...',
    filterAllMovements: 'Duk Ana Tsarin Sauyi Ayyuka',
    colDate: 'RANA DA LOKACI',
    colType: 'ABIN DA YA FARU',
    colQtyChange: 'YAWAN ADADI WAN DA YA SAUYA',
    colNewBalance: 'SABON SAURAN KAYA',
    colRemarks: 'DALILI / BAYANIN SAUYI',
    tabSales: 'Siyarwa',
    cartTitle: 'Kayan Da Aka Zaba',
    cartEmpty: 'Babu kaya. Nemo kaya ka saka.',
    cartTotal: 'Jimillar Kudi',
    btnCheckout: 'Kammala Siyarwa',
    payMethodCash: 'Tsabar Kudi (Cash)',
    payMethodPOS: 'POS / Katin ATM',
    payMethodTransfer: 'Tura Kudi (Transfer)',
    payMethodMobile: 'Kudin Waya (Mobile)',
    checkoutSuccess: 'An siyar da kaya cikin nasara!',
    saleFailed: 'An samu matsala wajen siyarwa. Sake gwadawa.',
    receiptTitle: 'Rasidin Siyarwa',
    printReceipt: 'Buga Rasidi',
    salesHistoryTitle: 'Tarihin Siyarwa & Rasidi',
    salesHistorySubtitle: 'Duba tallace-tallace da kudaden shiga na yau da kullun.',
    colReceiptNo: 'LAMBAR RASIDI',
    colTotalAmount: 'JIMILLAR KUDI',
    tabExpenses: 'Kula da Kashe-kuɗe',
    expensesTitle: 'Kashe-kuɗen Kasuwanci',
    expensesSubtitle: 'Rubuta duk kuɗin da ke fita don kiyaye riba.',
    btnRecordExpense: 'Rubuta Sabon Kashewa',
    todayExpenses: 'Kuɗin da aka Kashe Yau',
    weeklyExpenses: 'Kuɗin da aka Kashe Wannan Makon',
    monthlyExpenses: 'Kuɗin da aka Kashe Wannan Watan',
    largestCategory: 'Mafi Girma Category',
    modalTitleAddExpense: 'Rubuta Sabon Kashewa',
    modalTitleEditExpense: 'Gyara Bayanin Kashewa',
    fieldExpenseAmount: 'Adadin Kuɗi',
    fieldExpenseDate: 'Kwanan Wata',
    fieldExpenseDesc: 'Bayanin Kashewa',
    fieldExpensePayMethod: 'Hanyar Biya',
    fieldReceiptUpload: 'Haɗa Hoton Rasiti (Na Zabi)',
    btnSaveExpense: 'Ajiye Kashewa',
    confirmDeleteExpense: 'Kun tabbata kuna son goge wannan kashewa?',
    deleteExpenseSuccess: 'An goge bayanin kashewa cikin nasara!',
    deleteExpenseFailed: 'Gaza goge kashewa, sake gwadawa.',
    expenseDateFutureError: 'Ba a yarda da kwanan watan gaba ba don kashewa.',
    tabFinancials: 'Kididdigar Kudi',
    financialsTitle: 'Fahimtar Kudi',
    financialsSubtitle: 'Lissafin kudin shiga, ribar kasuwanci, da yanayin lafiyar kasuwancinku.',
    revenueLabel: 'Kudin Shiga (Revenue)',
    cogsLabel: 'Kudin Kayan Da Aka Siyar (COGS)',
    grossProfitLabel: 'Ribar Fari (Gross Profit)',
    netProfitLabel: 'Riba Ta Gaskiya (Net Profit)',
    cashPositionLabel: 'Kudi A Hannu (Cash)',
    inventoryValueLabel: 'Darajar Kayan Kasuwanci',
    healthScoreLabel: 'Makin Lafiyar Kasuwanci',
    healthRatingLabel: 'Yanayin Lafiyar Kasuwanci',
    periodSelectorLabel: 'Lokacin Rahoto',
    startDateLabel: 'Daga',
    endDateLabel: 'Zuwa',
    dashTabOverview: 'Yanayin Kasuwa',
    dashTabCharts: 'Jaddawalan Kuɗi',
    dashTabStock: 'Kayan Shago',
    dashTabHealth: 'Lafiyar Kasuwa',
    dashQuickActionsTitle: 'Aiyera Sautin Shirina',
    dashRecordSale: 'Rika Kudaden Ciniki',
    dashRecordSaleSub: 'Asali na kudaden ko musayar su a saukake',
    dashLogExpense: 'Rubuce Abun Asarari Ko Sawo',
    dashLogExpenseSub: 'Lissafin kudin mai da sauran bukatun shago',
    dashAddProduct: 'Saka Sabon Kaya A Shago',
    dashAddProductSub: 'Shirya sabbin kayakin siyarwa luf-luf',
    dashCheckStock: 'Duba Yawan Kayaki Gaba Duka',
    dashCheckStockSub: 'Duba adadin kayakin da ke rumbunku',
    dashTodaySales: 'Cinikin Yau',
    dashTodayExpenses: 'Kudaden Aikin Shago Yau',
    dashActualProfit: 'Riban Gaskiya Da Soke',
    dashAvailableCash: 'Kudin Gaske Nayi Daga Hannu',
    dashStockValue: 'Darajar Kayan Shagunmu',
    dashItemsInShop: 'Yawan Kayan Muna Shagon',
    dashBestsellersTitle: 'Kayakin Da Aka Fiye Siyarwa',
    dashLowStockTitle: 'Ajocece Kaya Na Karewa',
    dashActivitiesTitle: 'Aiyuka & Sauya Kasuwanci Kwanan Nan',
    dashHealthTitle: 'Lafiyar Kasuwancinku Gaba Duka',
    tabReports: 'Rahotan Kasuwanci',
    reportsTitle: 'Bayanin Kudi da Kasuwanci',
    reportsSubtitle:
      'Duba yanayin kasuwanci, bugawar takarda da sauke bayanan shagona ba tare da intanet ba.',
    repTabSales: 'Kudin Shigowa & Saye',
    repTabExpenses: 'Kashe-Kashen Kudi',
    repTabStock: 'Kaya & Ribar Jari',
    repTabProfit: 'Asalilin Ribar Shago',
    repTabBank: 'Takardar Ranci da Banki',
    repTabHistory: 'Rahotannin Baya',
    btnExportPDF: 'Sauke Takardar PDF',
    btnExportExcel: 'Sauke Jadawarin Excel',
    btnExportCSV: 'Sauke Fayil CSV',
    btnPrintReport: 'Bugawa / Print',

    mockupSalesHeader: 'Record New Sale (Pidgin)',
    mockupSalesItemLabel: 'Wetin you sell? (Item Name)',
    mockupSalesItemValue: '2 Bags of Rice',
    mockupSalesAmountLabel: 'How much you collect? (₦)',
    mockupSalesAmountValue: '₦ 84,000',
    mockupSalesSaveBtn: 'Save Record',
    mockupInvHeader: 'Smart Inventory',
    mockupInvItem1: 'Indomie Carton',
    mockupInvRestock: 'Last restocked: Today',
    mockupInvInStock: 'In Stock',
    mockupInvItem2: 'Peak Milk (Tin)',
    mockupInvLowStock: 'Low Stock Warning',
    mockupInvRemaining: 'Remaining',
    mockupProfitHeader: 'Profit & Loss Engine',
    mockupProfitNetTitle: 'Net Profit (This Week)',
    mockupProfitNetValue: '₦ 142,500',
    mockupProfitNetTrend: '+15.2% vs Last Week',
    mockupProfitSales: 'Total Sales',
    mockupProfitSalesValue: '₦ 380,000',
    mockupProfitExpenses: 'Total Expenses',
    mockupProfitExpensesValue: '₦ 237,500',
    showcaseSalesTitle: 'Record Sales in Seconds',
    showcaseSalesDesc:
      'No complicated accounting jargon. Our Pidgin English interface makes it incredibly easy for any shop owner or attendant to log daily sales instantly, saving you hours of manual bookkeeping.',
    showcaseOfflineTitle: '100% Offline Capable',
    showcaseOfflineDesc:
      'Bad network? No problem. Track your inventory and receive low stock alerts entirely offline. BizTrack uses advanced local databases to save your data instantly, syncing securely to the cloud only when your connection returns.',
    showcaseSmartTitle: 'Make Smart Decisions',
    showcaseSmartDesc:
      'Stop guessing if you are making money. Our automated Profit & Loss engine calculates your true net profit in real-time, helping you identify trends and grow your business with bank-grade security.',
  },
  ig: {
    appTitle: 'BizTrack',
    appTagline: 'Ndekọ ahịa dị mfe maka ndị na-azụ ahịa dum',
    heroBadge: '✨ Ahịa Na-arụ Yana Mgbe Adighi Internet',
    heroDesc:
      'A kwabere ya nke mbụ maka ndị ahịa na mgbidi, ndị nrere nrere, nakwa ndị ufe kpara. Kọwaa akpa ahịa gị, nweta mgbako elele ahịa azu niile na ngọngọ oge—ma ọ bụ mgbe adịghị intanet!',
    getStartedFree: 'Bido N’Ụgwọ Gaghị Kpabigara',
    existingAccount: 'Banye na Akwada Ahịa Gị',
    footerDesc: 'Na-akwalite ikike akpa ahịa ndị Afrịka gaa ozi dijital mfe dị ukwu.',
    signInTitle: 'Banye Na Ndekọ Ahịa Gị',
    signInSubtitle:
      'Banye nọmba ekwentị gị gbatala kọgide ma ọ bụ email yana PIN Nọmba nzuzo 6-digit gị.',
    registerTitle: 'Mee Akụrọnga Ahịa Gị ebe a',
    registerSubtitle:
      'Enweghị mkpa email ma ọ bụ akparamaogugu nkwaru! Mee akpa ahịa ma tinye naanị Nọmba Ekwentị na Nọmba PIN gazi dị 6.',
    phoneLabel: 'Nọmba Ekwentị Gị (ma ọ bụ Email)',
    phonePlaceholder: 'e.g., 08012345678',
    phoneHelper: 'Ndị ahịa nweere onwe ha gazi nọmba ekwentị ekwe na ahịa niile.',
    pinLabel: 'Nọmba nzuzo PIN gị nke 6-digit',
    pinPlaceholder: 'e.g., 123456 (Dịka nọmba POS gị)',
    ownerNameLabel: 'Aha Zuru Oke Nke Onye Ahịa',
    ownerNamePlaceholder: 'e.g., Mama Ngozi ma ọ bụ Chidubem',
    forgotPin: 'I chetụla nọmba nzuzo PIN gị?',
    useMagicLink: 'Ziga na adreesị kpatarazị ogo E-mail Gị',
    signInButton: 'Banye Ugbu A 🚀',
    registerButton: 'Mee Kpaa Ndị Ahịa Gị 🚀',
    noAccountYet: 'Ọ naghị adịrị gị kpa ma ọ dị o doro akpa ahịa nkeni?',
    registerNowLink: 'Debanye Aha Gị Ugbu A',
    alreadyRegistered: 'I dewela Ndekọ Ahịa Gị na kọputa gị ugbu a?',
    signInHereLink: 'Banye Nsogbu Ndu Ebe a',
    securityQuestionLabel: 'Ajụjụ Obo Nzuzo Gị (Mbe ị chetụla nọmba nzuzo PIN gị)',
    secretAnswerLabel: 'Azabere Siri Gị Nzuzo',
    secretAnswerPlaceholder: 'e.g., Onitsha ma ọ bụ Aba',
    secretAnswerHelper:
      'Gbaagide azabere nke a gaa otu nọmba imee PIN gị nkenke nke enweghị email!',
    offlineNotice: 'Intanet adịghị ugbu a. Anyị echebewochi ahịa gị nọmba offline na ekwentị gị!',
    dashboard: 'Obodo Ahịa Gị',
    transactions: 'Azụmaahịa Gị Oge Na Nso Nso A',
    logout: 'Pụọ (Sign Out)',
    noRecords: 'Ọ dịghị azụmaahịa ma ọ bụ ahie dere ugbu a.',
    welcomeBack: 'Nnọọ ọzọ na Ndekọ Ahịa Gị!',
    invTitle: 'Ngongha Ahịa Na Akpa Gị',
    invSubtitle: 'Hụ ngongha ngwoja gị, ọnụ ahịa, na ngụkọta owa niile gị churu na ụzọ ntanịsike.',
    invAddBtn: 'Tụfuo Ngwoja n’Ahịa Gị',
    invHistoryBtn: 'Hụ Otu Ndekọ Ahịa Oge',
    invSearchPlaceholder: 'Tuchie achọpụta akpa ma ọ bụ aha ahịa ebe kachasị mma...',
    invLowStockToggle: 'Zụpere Naanị Nke Kacha Ntakịrị Azụmaahịa Na Gwa Ya',
    colItemName: 'AHA NGWOJA NA AHỊA GỊ',
    colCategory: 'DỌNGHA OBODO AHỊA GỊ',
    colSellingPrice: 'ỌNỤ AHỊA RỊO ERE MERE GA',
    colCostPrice: 'ỌNỤ AGHAKU GỊ GBARA NRERE A',
    colRemainingStock: 'ỌTỤ NGWOJA N’AGATARA N’ỌKỌ GỊ',
    colActions: 'HE ARU YARU',
    btnAdjust: 'Gbanwee Ngwoja a',
    btnEdit: 'Gbanwee Okwa Ya',
    btnDelete: 'Hichapụ ngwoja a',
    invEmptyState: 'Ọ nweghi ihe nchikọnri mbegụlọ nile aruru gi.',
    statTotalItems: 'ỌNỤ ỌNGUGỌ NGWOJA',
    unitItems: 'ngwoja',
    statTotalValue: 'NGỤTỌ UDUM ỌNỤ EZE',
    statValueSub: 'E mere ya mgbakọ site na ego i jịzuru azuzu pụrụ igba otu mgbakọ',
    statLowStock: 'NGWOJA PỤRỤ RECHA',
    unitAlerts: 'ntakịrị',
    statOutOfStock: 'NGWOJA ZAGBULA GBA',
    modalTitleAdd: 'Dehie Ngwoja Ọ Hụ n’Ije Ahịa Gị na Akpa',
    modalTitleEdit: 'Dehie Gburugburu Zere Nsara Nri ngwoja a mgbidi a',
    fieldItemName: 'Aha Ngwoja',
    helperItemName:
      'Aha ụlọm na ndi ahyazube akpala ya ngwo nile (maka atamfa gị ma obu nnu ma okoro ya)',
    fieldCategory: 'Ọgbasa ngwoja ibuzu ihe ahụ ebe akwa hiru ebe a na ndiri ebo',
    optNewCategory: '+ Zikwe Otu Ọhuru ngwoja ahụ n’ahịa otu a nwayọ odo...',
    fieldSku:
      'koodup ma bụ agwa bar azụmaahịa o danye izenri (mgbara nso kpasuru gi mkpeche re gazi mgbirichi)',
    fieldSellingPrice: 'Ere Ya ahụ Ọ nọ Na Omenala ahụ kachasi na onunu ahịa nkem a',
    helperSellingPrice:
      'Ọnụ ahịazị o danye onye ahịa ji kwuo nkwa gị ahụ otu otu mgbasa i chọtụ nsonzu gi bụ oge otu ma akwu ebe a mma-mma m',
    fieldCostPrice:
      'Ego a pụtaru na ahịa e goro yari o (ahịa gị a i goro mfe mgbatala ndekọnụ mma-mma o)',
    helperCostPrice:
      'Anyi na ewe kpalaba gị recha rita n’akụkụ elele ahịa kpatara otu niiri kpakpara ya na kọlụzị ebe a mbido rụ nọ mgbari nzọbute oge!',
    fieldUnit: 'Otu Gịnụ Kpakpara A hụ Na Ewe Tu Ya Agwa Mmadu? (i tute rụ otu akwa ma ọ bu ngige)',
    fieldOpeningStock: 'Agata Ngwo gị Pụwa N’ụka Ugbu a (ihe ị nwere gbata n’obodo ebe a ugbu a)',
    helperOpeningStock:
      'Anwa bụzụ nzara e webe rụ otu kpa akwa otom ya na nnyoncha kpa zọgbụ na mbute mma ya gba mkpecha mma-mma o',
    fieldLowStock:
      'Oge ole ka i na achọ kpam kparazu ya n’ihi na ngwo e chuba azịma re? e wee me kpam kparaba gi ngige a otu otu re',
    helperLowStock:
      'Mbe o danye nkwụji nke oburu otụ obụrọ na ije akpa ebe ya gba nnyochaba kpalita nke ozo nkeni gwa ya ndo mgbasa rita ri a mgbatala gi ri',
    fieldRemarks: 'Obere ozi agba ya ne okwazi kpa ri ewe re m',
    placeholderRemarks: 'dịka atamfa anyanwu ngigba agwọkoro ya n’alụm ma kparita mfe ebe rụ nkem',
    btnCancel: 'kwusi ya mma mma',
    btnSaveItem: 'e kwebekwanụ gụ yari',
    btnSaveChanges:
      'Chebekere Ogo A hụ ngwo n’okoro ya nwayo mbado ri ebe ahụ kpakpụgwu yari n’okụ ahịa a rita gi ri',
    modalTitleCategory: 'Zikwe Mgbara Okpurukpu he a hụ ebo ngwa a',
    fieldCatName: 'Aha ebo e hiri na ọsọ e zobe ahụ ogo kpakpu obiri yari',
    placeholderCatName:
      'e dere he kpakpu ewe re yari obodo obụ kpa a gbu mgbado zikwe mmiri ya ma akpa afo n’akụ rụ yari o',
    fieldCatColor: 'Kwee Uru ụkwụ rita gị ri ruru ngwocha obiri mbe ihu kpa akụ rita ri m',
    helperCatColor:
      'Odi akpukpu na ihu i rebe otu iji hu eziokwu n’otu oku echebe re ekwentị otu nwayi akpa o bu ri mfe rụ yari ri ya o',
    btnSaveCategory: 'chebekwanu ruru ngwa nzere a odo na obiri mbe oku ya nwayọ nkem ebe rụ',
    modalTitleAdjust: 'dozie ihe bu yazi nzube gi ri okwa ya ngwo kpa',
    currentStockText: 'ihenị fụ nkeni ngwo fọdụrụ ugbu a niile: {n}',
    fieldReason: 'Mmadu e chiri nke iwe tu gi gidi odo gi a',
    reasonStockIn: 'a tụchawa o rụrụ ri gị ri ihe eji arita azụ ahịa mfe e goro nwayọ rụ yari m',
    reasonStockOut:
      'okpata gba zọtụtụ otu yari ri otọ m ma ya nwezobe ogo nnyeme n’ike nti kpa ri ebe ahụ odo m',
    reasonDamaged:
      'ihe gbarazuru mụhie otoro yari mgbatara gba pu gbaji mma n’ihi he o bu otu e wee zabe ri yari ebe ya ri ya o mfe kpam ri',
    reasonLost:
      'ngwo fụ e fuzabe rụ ruru gị otọ ya ma ndi ori kpasuru nti nkeni zaba ri yari e wee m',
    reasonReturn: 'nye azụ gbasara akwa e nwezobe yari n’okwu azu rụ ebe a mma-mma o',
    fieldAdjustQty: 'ọtu ole izuzu ihe i ji arita ya rị o ogo otụ yari ri?',
    fieldAdjustCost: 'ego kpam nri ahịa na oge ri o rụrụ ogo (ọkwa i wee chọrọ)',
    fieldAdjustRemarks:
      'Ugwuo ahụ pụgụ e we tu re nti zụrụ odo mgbara ruru (otu oge o zube zere ahụ na e jere)',
    placeholderAdjustRemarks: 'ebibe kpam ya ebe rụ 20 bags na obụ rụ onye ọzo obụ obodo mma-mma m',
    btnSaveAdjustment: 'chebekwanu yari ri o',
    historyTitle: 'Tarihin Ahịa n’okwa gị mbụkọta e kwebekwere he ndekọ',
    historySubtitle: 'Hu ezinne ihe mgbasa na e hirie yari mbe zabe akpa i chigozibe ri o',
    historySearchPlaceholder: 'Tuchie ndekọ ndu zọtụ mgbara re...',
    filterAllMovements: 'Ngongha Izu Ọ zụ akpa n’akwà ahịa mbụ kpa ri ebe a gidi o',
    colDate: 'ỤBỌ CHỊ YANA OGE OBORỤ EBE AHỤ',
    colType: 'HE OBU RỤ O KPA RA M',
    colQtyChange: 'HE GBA RA ODO M',
    colNewBalance: 'HE I NWERE RE UG BU A',
    colRemarks: 'NKO E WE TU RE NTI OGE OBỌRI YE M',
    tabSales: 'Ree Ahịa',
    cartTitle: 'Ihe Ndị A Họọrọ',
    cartEmpty: 'Enweghị ihe ọ bụla. Chọọ ihe tinye.',
    cartTotal: 'Ego Ole Ọ Bụ',
    btnCheckout: 'Kụọ Ahịa',
    payMethodCash: 'Ego Cash',
    payMethodPOS: 'POS / Kaadị',
    payMethodTransfer: 'Nyefee Ego (Transfer)',
    payMethodMobile: 'Ego Ekwentị',
    checkoutSuccess: 'Ahịa gara nke ọma!',
    saleFailed: 'Ahịa agaghị. Biko nwaa ọzọ.',
    receiptTitle: 'Akwụkwọ Nnata Ahịa',
    printReceipt: 'Bipụta Akwụkwọ',
    salesHistoryTitle: 'Akụkọ Ahịa na Akwụkwọ',
    salesHistorySubtitle: 'Hụ ahịa gara aga yana ego abanyela.',
    colReceiptNo: 'NỌMBA NNATA',
    colTotalAmount: 'EGO OLE',
    tabExpenses: 'Ndepụta Ego Fọrọ',
    expensesTitle: 'Ego I mebiri na nchụso ahịa',
    expensesSubtitle: 'Dekọọ ebe ego gị na-aga ka ị ghara tụfu uru ahịa.',
    btnRecordExpense: 'Dekọọ Ego I Mebiri',
    todayExpenses: 'Ego I Mebiri Taa',
    weeklyExpenses: 'Ego I Mebiri na Izu a',
    monthlyExpenses: 'Ego I Mebiri n’Ọnwa a',
    largestCategory: 'Ebe Kachasị Mebie Ego',
    modalTitleAddExpense: 'Dekọọ Ego Ọhụrụ I Mebiri',
    modalTitleEditExpense: 'Ndozi Ihe Ego I Mebiri',
    fieldExpenseAmount: 'Adịghị Ego',
    fieldExpenseDate: 'Ụbọchị Ego I Mebiri',
    fieldExpenseDesc: 'Ihe I Jiri Ego ahù Mee',
    fieldExpensePayMethod: 'Ụzọ I Siri Kwụọ Ego',
    fieldReceiptUpload: 'Tinye Akwụkwọ Rasiti (Nhọrọ)',
    btnSaveExpense: 'Chekwaa Ndekọ Ego',
    confirmDeleteExpense: 'Ị doro anya na ị chọrọ ihichapụ ndekọ ego a?',
    deleteExpenseSuccess: 'E wepụla ndekọ ego a nke ọma!',
    deleteExpenseFailed: 'Ihichapụ ndekọ ego a enweghị isi. Gbalịa ọzọ.',
    expenseDateFutureError: 'A naghị anabata ụbọchị n’ihu maka ndekọ ego.',
    tabFinancials: 'Ndegharị Ego',
    financialsTitle: 'Nchọpụta Ego Ahịa',
    financialsSubtitle: 'Mgbako ego abanyela, ego i ji zụọ ahịa, uru na ahụike ahịa gị.',
    revenueLabel: 'Ego Abanyela (Revenue)',
    cogsLabel: 'Ego E Jiri Zụọ Ahịa E Rere (COGS)',
    grossProfitLabel: 'Uru Mbụ (Gross Profit)',
    netProfitLabel: 'Uru Zuru Oke (Net Profit)',
    cashPositionLabel: 'Ego Dị N’aka (Cash)',
    inventoryValueLabel: 'Ego Akpa Ahịa Gị ruru',
    healthScoreLabel: 'Makin Ahụike Ahịa',
    healthRatingLabel: 'Ọkwa Ahụike Ahịa',
    periodSelectorLabel: 'Oge Akụkọ',
    startDateLabel: 'Daga',
    endDateLabel: 'Ruo',
    dashTabOverview: 'Ntụhachi Ahịa',
    dashTabCharts: 'Nlecha Ahịa',
    dashTabStock: "Ngwa N'Ahịa",
    dashTabHealth: 'Ahụike Ahịa',
    dashQuickActionsTitle: 'NzọỤgwu Mba',
    dashRecordSale: 'Kanyen Ego Azụru',
    dashRecordSaleSub: "Aha Nke Cash m'ọbụ Banku Ta",
    dashLogExpense: 'Kanyen Iri Ego',
    dashLogExpenseSub: 'Gụọ Ngalagwu niile Ahịa gị',
    dashAddProduct: "Tụkwasị Ngwa Ọ́gh́a N'ụlo Ahịa",
    dashAddProductSub: 'Kpá nwepụrụ maka aḥịạ uzo',
    dashCheckStock: 'Lee Kpaa Ngwa Kpam Ahịa Niile',
    dashCheckStockSub: 'Lechere Akwa agwa nkwere gi ogan irin',
    dashTodaySales: 'Ahịa Ehere Taa',
    dashTodayExpenses: 'Ego Efuru Taa',
    dashActualProfit: 'Ezi Udele Anyị',
    dashAvailableCash: "Ego Nlecha N'Aka Nkwue",
    dashStockValue: 'Ọpụ̀ Ọ́nụ Nka Ngwa Ubi',
    dashItemsInShop: 'Onuogbo Ngwa Anyị Kwakpobiri',
    dashBestsellersTitle: 'Ngwa Ahịa Kachara Ahia Eriri',
    dashLowStockTitle: 'Oti Kpesie Ngwa Azula Akwa',
    dashActivitiesTitle: 'Omimi Ngere & Usoro Ngwere Ahịa',
    dashHealthTitle: 'Ebere Ahụike Ahịa Gị',
    tabReports: 'Akụkọ Azụmahịa',
    reportsTitle: 'Nhazi & Usoro Akụkọ Ego',
    reportsSubtitle:
      'Nyochaa ngwaahịa gị, mbipụta akwụkwọ ego, yana mbipute data na-enweghị ịntanịetị.',
    repTabSales: 'Ego Batara na Ahịa',
    repTabExpenses: 'Ego Eji Mepụta Ahịa',
    repTabStock: 'Oru Ngwaahịa & Ahịa',
    repTabProfit: 'Ezigbo Uru Ahịa',
    repTabBank: 'Nchịkọta Mbaidị Banki',
    repTabHistory: 'Akụkọ Ndị Emere',
    btnExportPDF: 'Deta dịka PDF',
    btnExportExcel: 'Deta dịka Excel',
    btnExportCSV: 'Deta dịka CSV',
    btnPrintReport: 'Bipụta Akụkọ a',

    mockupSalesHeader: 'Record New Sale (Pidgin)',
    mockupSalesItemLabel: 'Wetin you sell? (Item Name)',
    mockupSalesItemValue: '2 Bags of Rice',
    mockupSalesAmountLabel: 'How much you collect? (₦)',
    mockupSalesAmountValue: '₦ 84,000',
    mockupSalesSaveBtn: 'Save Record',
    mockupInvHeader: 'Smart Inventory',
    mockupInvItem1: 'Indomie Carton',
    mockupInvRestock: 'Last restocked: Today',
    mockupInvInStock: 'In Stock',
    mockupInvItem2: 'Peak Milk (Tin)',
    mockupInvLowStock: 'Low Stock Warning',
    mockupInvRemaining: 'Remaining',
    mockupProfitHeader: 'Profit & Loss Engine',
    mockupProfitNetTitle: 'Net Profit (This Week)',
    mockupProfitNetValue: '₦ 142,500',
    mockupProfitNetTrend: '+15.2% vs Last Week',
    mockupProfitSales: 'Total Sales',
    mockupProfitSalesValue: '₦ 380,000',
    mockupProfitExpenses: 'Total Expenses',
    mockupProfitExpensesValue: '₦ 237,500',
    showcaseSalesTitle: 'Record Sales in Seconds',
    showcaseSalesDesc:
      'No complicated accounting jargon. Our Pidgin English interface makes it incredibly easy for any shop owner or attendant to log daily sales instantly, saving you hours of manual bookkeeping.',
    showcaseOfflineTitle: '100% Offline Capable',
    showcaseOfflineDesc:
      'Bad network? No problem. Track your inventory and receive low stock alerts entirely offline. BizTrack uses advanced local databases to save your data instantly, syncing securely to the cloud only when your connection returns.',
    showcaseSmartTitle: 'Make Smart Decisions',
    showcaseSmartDesc:
      'Stop guessing if you are making money. Our automated Profit & Loss engine calculates your true net profit in real-time, helping you identify trends and grow your business with bank-grade security.',
  },
  yo: {
    appTitle: 'BizTrack',
    appTagline: 'Ọkàn ni iṣakoso owo ati kikọ asiko owo fun gbogbo oniṣowo',
    heroBadge: '✨ Ṣíṣàkósò Owo Láláisi Internet Lori Eko Gbagede',
    heroDesc:
      'A ti yan an lara lati ṣe atunke re tààrà fun awọn obinrin ọjà, awọn ta oúnjẹ, títà aṣọ pọlu gbogbo oluṣoju ra igekoko riri! Ni itumo ri ọjà re pata, si koo jale owo si iṣe kàn laisigiri leralera!',
    getStartedFree: 'Bẹ́rẹ́ Alaišiṣi Ọja Lórùn',
    existingAccount: 'Wọlé Ibudo Igbakori Owo',
    footerDesc: 'Nfi agbara kun ileiṣè ati isẹṣe afirika ti ko fọ oye soke lori iṣowo digital.',
    signInTitle: 'Wọlé Sínu Ibi Owo Rẹ',
    signInSubtitle: 'Tọpasẹ Nọmba Eto Oju Eko (abi Email) rọru ati Nọmba PIN Irubo Mẹfa rururu.',
    registerTitle: 'Ṣí Alaišiṣi fun Ọja Rẹ Ni Ibika',
    registerSubtitle:
      'Ko si idi lati ri Ikawe tabi Email gbo oro! Ši alaišiši laigiri pọlu Nọmba Eko Alagbeka tò 6-Digit PIN.',
    phoneLabel: 'Nọmba Eko Alagbeka (tara Email)',
    phonePlaceholder: 'e.g., 08012345678',
    phoneHelper:
      'Awọn oniwo gbogbo lẹ sọle lo nọmba fóònù alagbeko nikan. Supermarket si lo email.',
    pinLabel: 'Nọmba PIN Irubo Mẹfa Rara',
    pinPlaceholder: 'e.g., 123456 (Gẹ́gẹ́bi o ti ń se lori POS)',
    ownerNameLabel: 'Orukọ Gbagede Olopo Oja Rẹ',
    ownerNamePlaceholder: 'e.g., Mama Ngozi tabi Iyaa Wuraola',
    forgotPin: 'Ṣe o gbe PIN rẹ tabi Kpọọlẹ pamọ ni?',
    useMagicLink: 'Lo Eto Link E-mail Alarinrin',
    signInButton: 'Wọlé Ni 🚀',
    registerButton: 'Bẹrẹ Alaišiṣi Ọja Rẹ 🚀',
    noAccountYet: 'Ṣé kankán ni lori gidi roro báyé ti o jẹwẹ ibo na ri?',
    registerNowLink: 'Yi Rajista Ni Wura Ri',
    alreadyRegistered: 'Boro ni ikoje ti o ṣí alaišiši rẹ tan lati ko le wewe?',
    signInHereLink: 'Wọlé Nibayi Ni Nso',
    securityQuestionLabel: 'Ibeere Aabo (Ti o ba gbagbe PIN rẹ ni o jẹ wowo wi)',
    secretAnswerLabel: 'Idahan Siririrẹ Gidigodo',
    secretAnswerPlaceholder: 'e.g., Balogun tabi Oshodi',
    secretAnswerHelper:
      'Ni imona gẹgan de re lori idahan yi so ki o le yi PIN rorirori tabi email ra.',
    offlineNotice:
      'Ko si isimi internet lọ wọliyi. Gbogbo ìtàn si ni foju pamo lori sèlù o offline!',
    dashboard: 'Ofe Owo',
    transactions: 'Atokọ Gbogbo Iṣowo rẹ Lilo Ni Ojo Kan',
    logout: 'Jade (Sign Out)',
    noRecords: 'A gbekari ati ko si atokọ iṣowo kookan ni o wẹri lori isẹgun ri.',
    welcomeBack: 'Kaabo pada silè owo rẹ ri!',
    invTitle: 'Awọn Ọjà Tọ Wà Lọwọ Oje Ri',
    invSubtitle: 'Wò riri ọjà gbagede rẹ, oye to ń ta, pẹlu eka owo to ku lori iserere ni kiakia.',
    invAddBtn: 'FI ỌJÀ TUTU SINU ŠOOBI',
    invHistoryBtn: 'Wo Gbogbo Itan Ọjà',
    invSearchPlaceholder: 'Wa ọjà pẹlu orukọ tabi gbagede...',
    invLowStockToggle: 'Fi Ọjà tọ fẹyìn wẹ kókó sori nikan the ri',
    colItemName: 'ORUKỌ ỌJÀ RẸ NIBYI',
    colCategory: 'IKOLE / GBAGEDE NLA',
    colSellingPrice: 'OYE TỌ TỌ RỌ TA SI BÁ',
    colCostPrice: 'OWỌ RE SI BI O SE RA LO JA SORI',
    colRemainingStock: 'IYE TE RE TO WA LI SHOBI BYI BYI',
    colActions: 'ISE BI ATUNKỌ',
    btnAdjust: 'Tun iye se ri',
    btnEdit: 'Ṣatunṣe Ọjà YI RI NIKAN',
    btnDelete: 'Parẹ lera lera oja yiyi kọ kúrò njè niyi',
    invEmptyState:
      'A ko rira oja koko to jẹmọ ohun te kà nibe lẹnu yi o ti yé lera re ri mfe rọ orun kò wa soke.',
    statTotalItems: 'GBOGBO IYE ỌJÀ RI',
    unitItems: 'ọjà',
    statTotalValue: 'IYE OWO GBOGBO ỌJÀ',
    statValueSub:
      'A ṣe idan sise yi laigiri lori owo ibara ro rọ ta ja nso byi rẹ kékè mọ rọ rùn na de',
    statLowStock: 'ỌJÀ TỌ N BÙ YARA RE SOKE',
    unitAlerts: 'kékè',
    statOutOfStock: 'ỌJÀ TỌ TAN PÁTÁPÁTÁ',
    modalTitleAdd: 'Fi Oja Tuntun Kún Sinu Shoobi rẹ yi lori nkan de',
    modalTitleEdit: 'Ṣatunṣe Ikọ Ọjà Rẹ',
    fieldItemName: 'Orukọ Ọjà Rẹ',
    helperItemName:
      'Orukọ ti awọn alabobo ojà ma fi mo nkan yi mpe ro (e.g., Garri, Rice, Aso Ankara gbọrọ ko tọ re)',
    fieldCategory: 'Ẹkà Gbigba / Ikole ti tọ',
    optNewCategory: '+ Kó Ẹkà Tuntun sẹ soke mọ ri...',
    fieldSku: 'Nọmba Ọjà kika tabi Barcode kika so ri na (Bomi iṣoro ko kò)',
    fieldSellingPrice: 'Owo tita Ọjà rẹ nla nikan (Elo lo ń ta oja kan soso njẹ nnyi nkan mpe)',
    helperSellingPrice:
      'Iye owo ta mbo tà lori agbo bi kiakia fùn alabobo si nọ kán na re yi mọ jẹ ki sọ soke de',
    fieldCostPrice:
      'Owo Ti O Fi Ra Ọjà ri sọ (Elo rẹ mbe la fi ra kikan soso ti tọ niyi so ri de mọ yi ko le)',
    helperCostPrice:
      'Atí tesi re ṣakoso igberiki kiakia, ati jẹwowo ètò ìjọ fòyèriri èlọ wa ri lọ bọrọ kiakia ti tọ mbe rọ!',
    fieldUnit:
      'Báwo lase m̀bẹrẹ rò ojà yiyi ni shoobi ra rọ tọ so? (yè nkan kika rorun ti kò bọ sọ soke de ri rọ kán)',
    fieldOpeningStock: 'Melọ loni tọ ti wè n’igbale lowo lọ jọ lo yi bi ko mọ yi re nkan yi',
    helperOpeningStock: 'Iná ṣé akotun bẹ̀yì sori akoto owo rẹ̀ fun kiakia le jale nla',
    fieldLowStock:
      'Níbi iye méló lo fẹ ki a ṣe ikilo wipe o jà riri de fẹrẹ pín ti na ko tọ wé o ra nnyi',
    helperLowStock:
      'Ni ìgbà ti ó ba dinku ni de eka yii ati le gbo rò kókó jéyín ri jà gbà na so gbegun jọ riri ti tọ ra rọ',
    fieldRemarks:
      'Àlọjọ Ọjà to kù sọ nipa rẹ̀ wowo riri jù bẹyì lo (Oko soso ti ko ni lara le ki sọ mbe rọ jọ ri nkan)',
    placeholderRemarks:
      'bi ti pe a ra ta lati Alaba, iletọ agbo nọna tabi oruko alaraju kikan ri jọ nni soke nnyi rẹ de le',
    btnCancel: 'Fagilee mọ ri tọn rọ nkan re ti',
    btnSaveItem: 'Kó Ọjà pamọ sinu Shoobi ri le nkani de re',
    btnSaveChanges: 'Chebè Ayipada Rẹ kàn kiakia',
    modalTitleCategory: 'Ṣí Ikole Ọjà Tuntun sọ tọ kọrọ',
    fieldCatName:
      'Orukọ Ikole Ọjà to nwa lati fi se akosi ri de rọ nkan mọ yi ri niyi tọ kọ ri jọ mpe kò',
    placeholderCatName:
      'bábi oúnje tò dun ta ri ko le wọwo, aṣọtẹlẹ kán kán riri jọ, pọlu ata, eja wowo tabi soko tọ dun mọ ra rẹ so',
    fieldCatColor: 'Yan Àwọ̀ to daju silu ikole oja rẹ yi ti kò ku kàn ri ti tọ soke de mbe la lori',
    helperCatColor:
      'Irun awọ riri yi yo ṣí imọn de le lo kankan lorii oju eko foonu alagbeka kikan sọ mpe wowo ri nkani',
    btnSaveCategory: 'Chebè Ikole oja yiyi kọ kán na de le rọ riri so kọ bẹ yọ rọ ti rọ le gbogbo',
    modalTitleAdjust: 'Yíiye Ọjà Tọ Ti Wa Pada Si Oju Kọ kọ rọ riri njè nnyi de ta re njẹ nkan',
    currentStockText: 'Iye tọ ti wa ni igbale lọkàn gbagede riri na: {n}',
    fieldReason:
      'Idi wo ti i wá yíiyè ọjà lara byi nnyi te re njẹ nkan gbẹyin yi nkan so ri kò mpe de re?',
    reasonStockIn:
      'A ti fi Ọjà Tuntun ku sori nkan ta (Atunko oja ti e gba lójá ra ra jẹ na yi njè ko ri)',
    reasonStockOut:
      'A tọ kò ojà ita (Lo se akopo kọ tabi fun alabobo gbigbe kyauta kyauta lẹ rọ le mpe)',
    reasonDamaged:
      'Ọjà Tọ Kọ Ti Fura/baje kàn kàn njè nnyi ta ri kò le wọwo ti nkan njẹ nni so ri nkan ri mpe',
    reasonLost: 'Ọjà Tọ sonù abi enikokan ji gbé kyauta lẹ mpe ta de wọ riri',
    reasonReturn: 'Alábobo da Ọjà yi Kọ Pada wa silè ojà byi byi nkani sọ le re',
    fieldAdjustQty:
      'Méló gbagede ni tẹ fẹ jéyín ri mọ yé lera re ri oju ko sọ mbe rọ nkan na ri de mọ rọ jọ?',
    fieldAdjustCost:
      'Owo rẹ̀ tọ ra kọ tọ so bi de ri (ko kọ mbe ta ri kò de rọ mbe rọ kán nni de mpe)',
    fieldAdjustRemarks:
      'Alaye ruru/Idi rẹ ti e fi pa sọ (A gbọ fún akotun ni iṣẹ lera re ri kọ mbe rọ njẹ nkani riri na de)',
    placeholderAdjustRemarks:
      'bábi mo gbé àkọ méejị yọ ri látoṣo wè Alhaji yọ ti rọ tọ ra rọ kán de mpe ko nni le',
    btnSaveAdjustment: 'Chebè Itano Yíiyè rẹ lera re ri na de soke',
    historyTitle: 'Itan ati Àtòjọ Kọ Kọ Iṣé Ọjà gbẹyin ri sori eko gbagede ro ri nkani le re so ki',
    historySubtitle:
      'Wo itani ti gbogbo aye e fi mu ọjà wole ti won si kó o jale lẹ rọ ri mfe rọ orun kyauta njè mpe rẹ so',
    historySearchPlaceholder: 'Wa iti lori orukọ ọjà tabi alaye atunko lera re...',
    filterAllMovements: 'Wò Gbogbo Ékọ Akoto Atunko Ri Na De',
    colDate: 'OJO ATI ASIKO',
    colType: 'KIN LE HẸSAYIN',
    colQtyChange: 'IYE TỌ NI PA YI SI',
    colNewBalance: 'IYE TE KÙ NYI RI DE',
    colRemarks: 'IDI / ALAYE ATUNKE',
    tabSales: 'Taja',
    cartTitle: 'Ọjà Tí A Yàn',
    cartEmpty: 'Kò sí nǹkan. Wa ọjà kí o fi kún.',
    cartTotal: 'Iye Owó Gbapọ',
    btnCheckout: 'Pari Tita',
    payMethodCash: 'Owó Ọwọ (Cash)',
    payMethodPOS: 'POS / Kaadi',
    payMethodTransfer: 'Fi Owó Ránṣẹ (Transfer)',
    payMethodMobile: 'Owó orí Ẹrọ (Mobile)',
    checkoutSuccess: 'Tita ọjà yọrí sí rere!',
    saleFailed: 'Tita ọjà kùnà. Jọwọ tún gbìyànjú.',
    receiptTitle: 'Iwe Ẹrí Tita',
    printReceipt: 'Tẹ Iwe Ẹrí',
    salesHistoryTitle: 'Ìwé Ìtàn Tita',
    salesHistorySubtitle: 'Wo àwọn tita tẹ́lẹ̀ àti owó tó wọlé.',
    colReceiptNo: 'NỌMBA ẸRÍ',
    colTotalAmount: 'IYE OWÓ',
    tabExpenses: 'Àkọsílẹ̀ Owó Tí Ó Jáde',
    expensesTitle: 'Owó Tí Ó Jáde Lẹ́nu Húsùlù',
    expensesSubtitle: 'Kọ gbogbo owó tó jáde sílẹ̀ láti mọ èrè rẹ gangan.',
    btnRecordExpense: 'Kọ Owó Tó Jáde Tuntun',
    todayExpenses: 'Owó Tó Jáde Lónìí',
    weeklyExpenses: 'Owó Tó Jáde Lọ́sẹ̀ Yìí',
    monthlyExpenses: 'Owó Tó Jáde Lóṣù Yìí',
    largestCategory: 'Ẹ̀ka Tó Gba Owó Jùlọ',
    modalTitleAddExpense: 'Kọ Owó Tó Jáde Tuntun sílẹ̀',
    modalTitleEditExpense: 'Atúnṣe Owó Tó Jáde',
    fieldExpenseAmount: 'Iye Owó Tó Jáde',
    fieldExpenseDate: 'Ọjọ́ Tó Jáde',
    fieldExpenseDesc: 'Kí Lo Lo Owó Náà Fún',
    fieldExpensePayMethod: 'Bí O Ṣe San Owó Náà',
    fieldReceiptUpload: 'Fi Rasiti Kún Un (Kò Pọn Dandan)',
    btnSaveExpense: 'Fi Owó Tó Jáde Pamọ́',
    confirmDeleteExpense: 'Ṣé o dájú pé o fẹ́ pa owó tí ó jáde yìí rẹ́?',
    deleteExpenseSuccess: 'A ti pa owó tí ó jáde rẹ́ láṣeyọrí!',
    deleteExpenseFailed: 'Kò rọrùn láti pa owó náà rẹ́, jọ̀wọ́ gbìyànjú sẹ́.',
    expenseDateFutureError: 'Kò gba ọjọ́ ọjọ́wájú fún owó tí ó jáde.',
    tabFinancials: 'Ìṣirò Owó',
    financialsTitle: 'Òye Nipa Owó Rẹ',
    financialsSubtitle:
      'Ṣayẹwo owo tó wọle, iye owo ti o fi ra ọja, èrè gangan ati àlááfíà oko òwò rẹ.',
    revenueLabel: 'Owo Tó Wọlé (Revenue)',
    cogsLabel: 'Owo Gbapọ Ọja Tita (COGS)',
    grossProfitLabel: 'Èrè Kọkọọkan (Gross Profit)',
    netProfitLabel: 'Èrè Gangan (Net Profit)',
    cashPositionLabel: 'Owo Lọwọ (Cash)',
    inventoryValueLabel: 'Iye Ọjà Tó Kù silẹ',
    healthScoreLabel: 'Makin Àlááfíà Òwò',
    healthRatingLabel: 'Ipò Àlááfíà Òwò',
    periodSelectorLabel: 'Àkókò Àkọsílẹ̀',
    startDateLabel: 'Láti',
    endDateLabel: 'Sí',
    dashTabOverview: 'Akoko Ọja Oni',
    dashTabCharts: 'Aworan Owó Ọoja',
    dashTabStock: 'Ẹkún Rẹni Ọjà',
    dashTabHealth: 'Ilera Owò',
    dashQuickActionsTitle: 'Awọ̀n Pátá Gbá Lára',
    dashRecordSale: 'Ṣowopo Owó Títà Ọjà',
    dashRecordSaleSub: 'Bójú mu owo cashi tàbí transfer lọ́fẹ̀',
    dashLogExpense: 'Fi Ọmọra owó tó jàsí Kankan',
    dashLogExpenseSub: 'Lẹsẹẹkankan ra lori aláyàn Ojà re',
    dashAddProduct: 'Kojọ Ọjà Títún Sínú Shago',
    dashAddProductSub: 'Ṣefihan orukọ ọjà kò sí fún rájá',
    dashCheckStock: 'Ṣáwò Gbogbo Ege Oja Re Ni kikun',
    dashCheckStockSub: 'Kó gbogbon ka ohun èlòmíràn re nígbà',
    dashTodaySales: 'Titu Owó Ọjà Oni',
    dashTodayExpenses: 'Owó Tó Jáde Oni',
    dashActualProfit: 'Èdidi Ere ti a Ni',
    dashAvailableCash: 'Owo Gbege Tó Wà Ni Ọwò',
    dashStockValue: 'Idan owo Ọjà Ti A gba rari',
    dashItemsInShop: 'Ajo-eṣe gbá gba Ọjà gbọrọ',
    dashBestsellersTitle: 'Ọjà ti won n ra Jùlọ',
    dashLowStockTitle: 'Ida Oruku Eru Tó fẹ Rèẹ Sile',
    dashActivitiesTitle: 'Àtúnje Lẹẹjì Báyin, Àwọn Ete',
    dashHealthTitle: 'Eyo Ilere Gbógbo Ojà Re',
    tabReports: 'Ìròyìn Owò',
    reportsTitle: 'Àwọn Ìròyìn Gbèdéke Ọjà',
    reportsSubtitle: 'Wo ojú owo titi ọjà rẹ, yan ọti titun gbagbọ, ati ki gba sí abẹ-kíkọ.',
    repTabSales: 'Owó Titi Wọlé',
    repTabExpenses: 'Owó Nà lójojúmọ́',
    repTabStock: 'Aṣojú Ojà Lílọ́',
    repTabProfit: 'Èrè Rere ti Ọjà',
    repTabBank: 'Ìròyìn ti Bankí',
    repTabHistory: 'Àtẹ-Àkọ́sì Báyin',
    btnExportPDF: 'Ya Síṣe sí PDF',
    btnExportExcel: 'Ya Síṣe sí Excel',
    btnExportCSV: 'Ya Síṣe sí CSV',
    btnPrintReport: 'Kọ̀sí Béèrè Ìròyìn',

    mockupSalesHeader: 'Record New Sale (Pidgin)',
    mockupSalesItemLabel: 'Wetin you sell? (Item Name)',
    mockupSalesItemValue: '2 Bags of Rice',
    mockupSalesAmountLabel: 'How much you collect? (₦)',
    mockupSalesAmountValue: '₦ 84,000',
    mockupSalesSaveBtn: 'Save Record',
    mockupInvHeader: 'Smart Inventory',
    mockupInvItem1: 'Indomie Carton',
    mockupInvRestock: 'Last restocked: Today',
    mockupInvInStock: 'In Stock',
    mockupInvItem2: 'Peak Milk (Tin)',
    mockupInvLowStock: 'Low Stock Warning',
    mockupInvRemaining: 'Remaining',
    mockupProfitHeader: 'Profit & Loss Engine',
    mockupProfitNetTitle: 'Net Profit (This Week)',
    mockupProfitNetValue: '₦ 142,500',
    mockupProfitNetTrend: '+15.2% vs Last Week',
    mockupProfitSales: 'Total Sales',
    mockupProfitSalesValue: '₦ 380,000',
    mockupProfitExpenses: 'Total Expenses',
    mockupProfitExpensesValue: '₦ 237,500',
    showcaseSalesTitle: 'Record Sales in Seconds',
    showcaseSalesDesc:
      'No complicated accounting jargon. Our Pidgin English interface makes it incredibly easy for any shop owner or attendant to log daily sales instantly, saving you hours of manual bookkeeping.',
    showcaseOfflineTitle: '100% Offline Capable',
    showcaseOfflineDesc:
      'Bad network? No problem. Track your inventory and receive low stock alerts entirely offline. BizTrack uses advanced local databases to save your data instantly, syncing securely to the cloud only when your connection returns.',
    showcaseSmartTitle: 'Make Smart Decisions',
    showcaseSmartDesc:
      'Stop guessing if you are making money. Our automated Profit & Loss engine calculates your true net profit in real-time, helping you identify trends and grow your business with bank-grade security.',
  },
};
