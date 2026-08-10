Extended Product Requirement Document (PRD): CSV Bulk Restock & Error Resolution Module1. Module Overview & Product VisionThis module extends the Miniventory intake engine by introducing a Simple CSV Bulk Restock Flow. Designed specifically for low-tech and semi-literate users (e.g., small business clerks, shop managers), this module turns complex CSV data imports into an intuitive, guided step-by-step experience.Primary ObjectivesZero-Tech Barrier: Eliminate complex column mapping and strict formatting errors by accepting common column naming variations.Proactive Pre-flight Validation: Scan files for errors before committing data to the database, ensuring partial or corrupt uploads never pollute inventory.In-Line Visual Error Resolution: Instead of rejecting an entire file with cryptic code errors, display a clean spreadsheet-style interface highlighting exact problematic cells (e.g., duplicate barcode, missing price) with one-click inline corrections.Dual-Mode Compatibility: Seamlessly handle both Non-Serialized (Bulk) and Serialized (Unique Serial/IMEI) restock rows in a single simple file.2. Industry Comparison: Standard Tools vs. Miniventory ApproachProblem AreaTraditional Tools (Shopify, QuickBooks, Excel Import)Miniventory Simplified ApproachHeader RequirementsStrict exact case-sensitive match (e.g., Variant Barcode, Lineitem Quantity). Rejects import if headers differ slightly.Smart Header Mapping: Accepts variations like barcode, code, serial, sn, imei, qty, count, price, cost.Handling ErrorsRejects full file or imports partial data with an emailed text log file (e.g., Error on Line 43: Foreign Key Constraint).Visual Fix Grid: Highlights problematic cells in red directly on screen. Users fix the cell in browser and click "Retry".Template UsabilityBlanks with zero instructions; easily broken by users.Pre-formatted Template: Downloadable template pre-filled with 3 sample rows and explicit visual notes.Serialized vs BulkRequires separate files or complex multi-sheet relational imports.Single-File Dual Mode: Supports both bulk quantities and unique serials in one straightforward layout.3. CSV Standard File Specifications & Smart Mapping RulesA. Core CSV Field DefinitionCode snippetProduct Name,Barcode or Serial,Quantity,Cost Price,Selling Price
iPhone 10,SN-9001122,,450,600
iPhone 10,SN-9001123,,450,600
USB-C Cable,8901234567,50,2.5,5.0
B. Field Specifications & Flexible Mapping RulesOfficial FieldPurposeAccepted Alternate HeadersRequired?Default / Fallback RuleProduct NameIdentifies or creates parent itemProduct, Item, Item Name, Name, TitleYesIf blank, flags cell: "Missing product name".Barcode or SerialCode scanned/enteredBarcode, Serial, SN, IMEI, Code, UpcYesIf blank, flags cell: "Missing code".QuantityQuantity added (Non-Serialized)Qty, Count, Amount, Units, NumberNoDefault = 1 if left blank. If item is serialized, automatically set to 1.Cost PricePurchase cost per unitCost, Buy Price, Cost Price, Purchase PriceNoOptional; defaults to 0 or existing product cost if empty.Selling PriceRetail price per unitPrice, Sell Price, Retail Price, Selling PriceNoOptional; defaults to existing product selling price if empty.4. Simplified User Flow & Error Resolution Engine┌─────────────────────────────────────────────────────────────────────────┐
│ Step 1: Download Pre-filled Template or Drag & Drop Existing CSV File  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 2: Instant Background Validation Scan (<1 Second)                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    [ All Rows Valid (Green) ]              [ Errors Detected (Red Highlights) ]
                 │                                       │
                 │                                       ▼
                 │                          ┌──────────────────────────┐
                 │                          │  Interactive Fix Grid    │
                 │                          │  User edits red cells    │
                 │                          │  directly in browser     │
                 │                          └────────────┬─────────────┘
                 │                                       │
                 ├───────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 3: Success Confirmation Modal + Live Stock Addition Log            │
└─────────────────────────────────────────────────────────────────────────┘
A. Step 1: Guided Import ScreenBig drop-zone button: "Click here or drop your spreadsheet file".Prominent action link: "📥 Download Sample Excel/CSV Template (with instructions)".Supported file types: .csv, .xlsx, .xls (auto-converted under the hood to prevent file format confusion).B. Step 2: In-Line Error Correction Grid (The "No-Frustration" Editor)If errors are found during pre-flight validation, the user never leaves the screen to re-open Excel. Instead, an interactive grid renders showing only the rows that need attention:Common Errors & One-Click Fix Solutions┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ 2 items need your attention before we can complete the restock:                     │
├──────┬──────────────┬───────────────────┬──────────┬───────────┬───────────────────────┤
│ Row  │ Product Name │ Barcode / Serial  │ Quantity │ Cost ($)  │ Action Required       │
├──────┼──────────────┼───────────────────┼──────────┼───────────┼───────────────────────┤
│ #4   │ iPhone 10    │ [ SN-1002       ] │ 1        │ 450       │ ❌ Duplicate Serial   │
│      │              │ ^ Red Border      │          │           │ [Fix Automatically]   │
├──────┼──────────────┼───────────────────┼──────────┼───────────┼───────────────────────┤
│ #12  │ [          ] │ 8901239990        │ 20       │ 5         │ ❌ Missing Name       │
│      │ ^ Red Border │                   │          │           │ Type name here...     │
└──────┴──────────────┴───────────────────┴──────────┴───────────┴───────────────────────┘
Duplicate Barcode Error:Cause: Serial number already exists in DB or appears twice in file.Visual Cue: Red border around cell + audio warning cue.One-Click Actions:Action A: Edit the cell directly in browser.Action B: Click "Skip This Row" button.Action C: Click "Auto-Append Suffix" (e.g., SN-1002-1).Missing Product Name Error:Cause: Barcode provided without an associated product name.One-Click Actions:Click cell to type product name, or select from dropdown of existing store products.Invalid Price / Quantity Error:Cause: Letters typed in quantity field (e.g., ten).One-Click Action: Cell highlights with notice "Please enter numbers only". System defaults to 1 on click.5. Technical Requirements & Implementation DetailsA. File Parsing EngineUse client-side JavaScript parser (PapaParse or xlsx.js) to process files instantly in the browser without server upload latency.Normalize all column headers (strip spaces, lowercase, match aliases against fuzzy dictionary).B. Validation Rules LogicPythondef validate_restock_row(row, db_context):
    errors = []
    
    # 1. Product Name Validation
    if not row.get('product_name'):
        errors.append({'field': 'product_name', 'code': 'MISSING_NAME', 'message': 'Product name required'})
        
    # 2. Barcode/Serial Uniqueness Check
    barcode = row.get('barcode_or_serial')
    if not barcode:
        errors.append({'field': 'barcode_or_serial', 'code': 'MISSING_BARCODE', 'message': 'Barcode required'})
    elif db_context.is_serial_exists_active_or_sold(barcode):
        errors.append({'field': 'barcode_or_serial', 'code': 'DUPLICATE_SERIAL', 'message': 'Barcode already used'})
        
    # 3. Numeric Sanitization
    try:
        qty = int(row.get('quantity', 1))
        if qty < 1:
            errors.append({'field': 'quantity', 'code': 'INVALID_QTY', 'message': 'Quantity must be 1 or more'})
    except ValueError:
        errors.append({'field': 'quantity', 'code': 'NON_NUMERIC_QTY', 'message': 'Numbers only'})
        
    return errors
6. Sprint Integration Plan┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Sprint 1: Unified Inventory Schema (Serialized & Non-Serialized), Intake & Restock Engine │
│ ├── CSV Bulk Restock Parser & Smart Header Normalizer                                     │
│ ├── Pre-flight In-Browser Validation Engine                                                │
│ └── In-Line Visual Error Correction Grid & Template Generator                              │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ Sprint 2: High-Speed Multi-Scan POS Engine & Dual-Mode Collision Interceptor               │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ Sprint 3: Order Finalization, Dual-Mode Deductions & Audit Stock Logging                  │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ Sprint 4: Unit-Level & Bulk Returns, Financial Restorations & Business Report Sync        │
└───────────────────────────────────────────────────────────────────────────────────────────┘
Sprint 1 Additions (CSV Restock Deliverables)[ ] Template Download Button: Generates .xlsx and .csv files with pre-filled sample rows and clear instruction notes.[ ] Smart Header Resolver: Automatically maps non-standard column headers to system fields.[ ] Interactive Visual Fix Grid: Renders problematic rows on-screen with inline text inputs, dropdown selectors, and "Skip Row" controls.[ ] Batch Import Execution: Completes import inside a single database transaction, generating a RestockBatch log entry with restock metrics (Total Rows Processed, Total Items Added, Skipped Rows).