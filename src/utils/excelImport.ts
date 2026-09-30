import * as XLSX from 'xlsx';

export interface ParsedRegistrationRow {
  fullName: string;
  itemQuantity: number;
  email: string;
  phone: string;
  paymentStatus: string;
  isCaptured: boolean;
  isValid: boolean;
  skipReason?: string;
  originalRowIndex: number;
  rawRow: Record<string, any>;
}

export interface ExcelColumnMapping {
  fullNameKey: string | null;
  itemQuantityKey: string | null;
  emailKey: string | null;
  phoneKey: string | null;
  paymentStatusKey: string | null;
  allColumns: string[];
}

export interface ParseResult {
  rows: ParsedRegistrationRow[];
  columns: ExcelColumnMapping;
  totalRows: number;
  capturedCount: number;
  skippedCount: number;
  errorMessages: string[];
}

/**
 * Normalizes column header keys to find the best match for required fields.
 */
function findBestColumnKey(
  keys: string[],
  targetType: 'payment_status' | 'full_name' | 'item_quantity' | 'email' | 'phone'
): string | null {
  const list = keys.map(k => ({
    raw: k,
    norm: String(k).toLowerCase().replace(/[^a-z0-9]/g, '')
  }));

  if (targetType === 'payment_status') {
    // Explicitly looking for "payment status = captured"
    const exact = list.find(n => n.norm === 'paymentstatus' || n.norm === 'paymentstate');
    if (exact) return exact.raw;
    const withPayment = list.find(n => n.norm.includes('payment') && n.norm.includes('status'));
    if (withPayment) return withPayment.raw;
    const statusOnly = list.find(n => n.norm === 'status' || n.norm === 'state');
    if (statusOnly) return statusOnly.raw;
    return null;
  }

  if (targetType === 'full_name') {
    // Explicitly looking for "full_name"
    const exactFullName = list.find(n => n.norm === 'fullname');
    if (exactFullName) return exactFullName.raw;
    const hasFullName = list.find(n => n.norm.includes('fullname'));
    if (hasFullName) return hasFullName.raw;
    const nameOnly = list.find(n => n.norm === 'name');
    if (nameOnly) return nameOnly.raw;
    const attendee = list.find(
      n =>
        n.norm.includes('attendee') ||
        n.norm.includes('participant') ||
        n.norm.includes('buyer') ||
        n.norm.includes('customer')
    );
    if (attendee) return attendee.raw;
    return null;
  }

  if (targetType === 'item_quantity') {
    // Explicitly looking for "item quantity"
    const exactItemQty = list.find(n => n.norm === 'itemquantity' || n.norm === 'itemqty');
    if (exactItemQty) return exactItemQty.raw;
    const qty = list.find(n => n.norm === 'quantity' || n.norm === 'qty');
    if (qty) return qty.raw;
    const pax = list.find(
      n =>
        n.norm === 'pax' ||
        n.norm === 'paxcount' ||
        n.norm === 'tickets' ||
        n.norm === 'ticketcount' ||
        n.norm === 'ticketquantity' ||
        n.norm === 'items'
    );
    if (pax) return pax.raw;
    return null;
  }

  if (targetType === 'email') {
    const exactEmail = list.find(n => n.norm === 'email');
    if (exactEmail) return exactEmail.raw;
    const emailAddr = list.find(n => n.norm.includes('email') || n.norm === 'mail');
    if (emailAddr) return emailAddr.raw;
    return null;
  }

  if (targetType === 'phone') {
    const exactPhone = list.find(n => n.norm === 'phone');
    if (exactPhone) return exactPhone.raw;
    const phoneOrMobile = list.find(
      n =>
        n.norm.includes('phone') ||
        n.norm.includes('mobile') ||
        n.norm.includes('contact') ||
        n.norm.includes('whatsapp')
    );
    if (phoneOrMobile) return phoneOrMobile.raw;
    return null;
  }

  return null;
}

/**
 * Parses numeric item quantity from strings like "2", "2 Tickets", 3.
 */
function parseQuantity(val: any): number {
  if (typeof val === 'number' && !isNaN(val) && val > 0) {
    return Math.floor(val);
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }
  return 1;
}

/**
 * Parses Excel (.xlsx, .xls) ArrayBuffer or CSV text into strictly filtered registration rows.
 * Considers ONLY:
 *  - payment status = captured
 *  - full_name
 *  - item quantity
 *  - email
 *  - phone
 */
export function parseExcelOrCsv(input: ArrayBuffer | string): ParseResult {
  let rawJsonRows: Record<string, any>[] = [];

  try {
    let workbook: XLSX.WorkBook;
    if (typeof input === 'string') {
      workbook = XLSX.read(input, { type: 'string', raw: true });
    } else {
      workbook = XLSX.read(input, { type: 'array' });
    }

    const firstSheetName = workbook.SheetNames[0];
    if (firstSheetName) {
      const sheet = workbook.Sheets[firstSheetName];
      rawJsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        defval: '',
        blankrows: false
      });
    }
  } catch (err: any) {
    return {
      rows: [],
      columns: {
        fullNameKey: null,
        itemQuantityKey: null,
        emailKey: null,
        phoneKey: null,
        paymentStatusKey: null,
        allColumns: []
      },
      totalRows: 0,
      capturedCount: 0,
      skippedCount: 0,
      errorMessages: [`Failed to parse spreadsheet: ${err?.message || 'Invalid format'}`]
    };
  }

  if (rawJsonRows.length === 0) {
    return {
      rows: [],
      columns: {
        fullNameKey: null,
        itemQuantityKey: null,
        emailKey: null,
        phoneKey: null,
        paymentStatusKey: null,
        allColumns: []
      },
      totalRows: 0,
      capturedCount: 0,
      skippedCount: 0,
      errorMessages: ['Spreadsheet contains no data rows.']
    };
  }

  // Collect all available column headers from the rows
  const allColumnsSet = new Set<string>();
  rawJsonRows.forEach(row => {
    Object.keys(row).forEach(k => allColumnsSet.add(k));
  });
  const allColumns = Array.from(allColumnsSet);

  // Map only the designated columns
  const paymentStatusKey = findBestColumnKey(allColumns, 'payment_status');
  const fullNameKey = findBestColumnKey(allColumns, 'full_name');
  const itemQuantityKey = findBestColumnKey(allColumns, 'item_quantity');
  const emailKey = findBestColumnKey(allColumns, 'email');
  const phoneKey = findBestColumnKey(allColumns, 'phone');

  const columnMapping: ExcelColumnMapping = {
    fullNameKey,
    itemQuantityKey,
    emailKey,
    phoneKey,
    paymentStatusKey,
    allColumns
  };

  const parsedRows: ParsedRegistrationRow[] = [];
  const errorMessages: string[] = [];
  let capturedCount = 0;
  let skippedCount = 0;

  rawJsonRows.forEach((row, idx) => {
    const rowNum = idx + 2; // Accounting for 1-based index and header row

    // 1. Payment status check (Filter: payment status = captured)
    const rawPaymentStatus = paymentStatusKey ? String(row[paymentStatusKey] || '').trim() : '';
    // If payment status column exists in Excel, it must be 'captured' (case-insensitive)
    const hasStatusColumn = Boolean(paymentStatusKey);
    const isCaptured = hasStatusColumn
      ? rawPaymentStatus.toLowerCase() === 'captured'
      : true; // If no payment status column is present, treat as captured by default

    // 2. Extract full_name
    const fullName = fullNameKey ? String(row[fullNameKey] || '').trim() : '';

    // 3. Extract item quantity
    const itemQuantity = itemQuantityKey ? parseQuantity(row[itemQuantityKey]) : 1;

    // 4. Extract email
    let email = emailKey ? String(row[emailKey] || '').trim().toLowerCase() : '';
    if (!email && fullName) {
      // Clean fallback email if column not present
      email = `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;
    }

    // 5. Extract phone
    const phone = phoneKey ? String(row[phoneKey] || '').trim() : '';

    // Validation
    let isValid = true;
    let skipReason: string | undefined = undefined;

    if (hasStatusColumn && !isCaptured) {
      isValid = false;
      skipReason = `Payment status '${rawPaymentStatus || 'empty'}' is not 'captured'`;
    } else if (!fullName) {
      isValid = false;
      skipReason = 'Missing full_name';
    }

    if (isValid && isCaptured) {
      capturedCount++;
    } else {
      skippedCount++;
      if (skipReason) {
        errorMessages.push(`Row ${rowNum}: ${skipReason} (${fullName || 'Unknown'})`);
      }
    }

    parsedRows.push({
      fullName,
      itemQuantity,
      email,
      phone,
      paymentStatus: rawPaymentStatus || (isCaptured ? 'captured' : 'unknown'),
      isCaptured,
      isValid,
      skipReason,
      originalRowIndex: rowNum,
      rawRow: row
    });
  });

  return {
    rows: parsedRows,
    columns: columnMapping,
    totalRows: rawJsonRows.length,
    capturedCount,
    skippedCount,
    errorMessages
  };
}
