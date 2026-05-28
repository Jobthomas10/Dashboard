import type { SalesRecord } from '../data/mockData';

/**
 * Parses raw CSV text into a structured list of SalesRecord objects.
 * Robust implementation following RFC-4180, managing quotes, escaped characters, and line breaks.
 */
export function parseCSV(text: string): SalesRecord[] {
  if (!text || text.trim() === '') return [];

  const lines: string[] = [];
  let row: string[] = [""];
  let insideQuotes = false;

  // Character-by-character scanner to accurately parse CSV layout
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped double quotes inside quoted string "" => "
        row[row.length - 1] += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Cell separator
      row.push("");
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      // Line break
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF after CR
      }
      lines.push(JSON.stringify(row));
      row = [""];
    } else {
      // General character
      row[row.length - 1] += char;
    }
  }
  
  // Push remaining cells if any
  if (row.length > 1 || row[0] !== "") {
    lines.push(JSON.stringify(row));
  }

  if (lines.length < 2) return [];

  // Parse and normalize headers
  const headers = JSON.parse(lines[0]).map((h: string) => h.trim().toLowerCase().replace(/[^a-z0-9]/gi, ''));
  const records: SalesRecord[] = [];

  // Header detection via alias lookup
  const findHeaderIndex = (aliases: string[]) => {
    return headers.findIndex((h: string) => aliases.includes(h));
  };

  const idIdx = findHeaderIndex(["id", "orderid", "orderno", "number", "order", "invoice"]);
  const dateIdx = findHeaderIndex(["date", "time", "orderedat", "timestamp", "day"]);
  const customerIdx = findHeaderIndex(["customer", "customername", "name", "client", "buyer"]);
  const productIdx = findHeaderIndex(["product", "productname", "item", "title", "goods"]);
  const categoryIdx = findHeaderIndex(["category", "type", "dept", "department", "genre"]);
  const regionIdx = findHeaderIndex(["region", "area", "country", "location", "continent"]);
  const revenueIdx = findHeaderIndex(["revenue", "sales", "price", "amount", "total", "cost"]);
  const profitIdx = findHeaderIndex(["profit", "margin", "earnings", "income"]);
  const statusIdx = findHeaderIndex(["status", "state", "shipping", "stage"]);

  for (let i = 1; i < lines.length; i++) {
    const values = JSON.parse(lines[i]);
    // Skip empty lines
    if (values.length === 1 && values[0].trim() === "") continue;
    
    const getVal = (idx: number, fallback: string = "") => {
      if (idx === -1 || idx >= values.length) return fallback;
      return values[idx]?.trim() || fallback;
    };

    const id = getVal(idIdx, `ORD-${1000 + i}`);
    const dateStr = getVal(dateIdx, "");
    
    // Normalize date (ensure YYYY-MM-DD)
    let date = new Date().toISOString().split('T')[0];
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    }

    const customerName = getVal(customerIdx, "Unknown Customer");
    const productName = getVal(productIdx, "Product Detail");
    
    // Normalize Category (fuzzy matching)
    let category = getVal(categoryIdx, "Electronics");
    const catLower = category.toLowerCase();
    if (/electronic|tech|phone|laptop|macbook|ipad|pc|audio|sony|headphone/i.test(catLower)) {
      category = "Electronics";
    } else if (/cloth|apparel|shirt|shoes|nike|adidas|wear|jacket/i.test(catLower)) {
      category = "Apparel";
    } else if (/home|dyson|kitchen|furniture|mug|roomba|appliances|house/i.test(catLower)) {
      category = "Home";
    } else if (/software|app|cloud|subscription|figma|adobe|license|slack/i.test(catLower)) {
      category = "Software";
    } else {
      // Fallback or exact check
      if (!["Electronics", "Apparel", "Home", "Software"].includes(category)) {
        category = "Electronics"; // standard default
      }
    }

    // Normalize Region (fuzzy matching)
    let region = getVal(regionIdx, "North America");
    const regLower = region.toLowerCase();
    if (/america|us|ca|canada|usa/i.test(regLower)) {
      region = "North America";
    } else if (/europe|uk|germany|france|italy|spain/i.test(regLower)) {
      region = "Europe";
    } else if (/asia|japan|china|tokyo|korea|india/i.test(regLower)) {
      region = "Asia";
    } else if (/latam|brazil|mexico|south|chile/i.test(regLower)) {
      region = "LATAM";
    } else if (/east|dubai|saudi|qatar|emirates|me/i.test(regLower)) {
      region = "Middle East";
    } else {
      if (!["North America", "Europe", "Asia", "LATAM", "Middle East"].includes(region)) {
        region = "North America";
      }
    }

    // Parse Revenue & Profit numbers
    const revenueRaw = getVal(revenueIdx, "0");
    const revenue = parseFloat(revenueRaw.replace(/[^0-9.-]/g, '')) || 0;
    
    const profitRaw = getVal(profitIdx, "0");
    let profit = parseFloat(profitRaw.replace(/[^0-9.-]/g, ''));
    if (isNaN(profit)) {
      // Default to 40% margin if profit column is absent
      profit = Math.round(revenue * 0.4 * 100) / 100;
    }

    // Normalize Status
    let status = getVal(statusIdx, "Delivered");
    const statLower = status.toLowerCase();
    if (/deliver/i.test(statLower)) {
      status = "Delivered";
    } else if (/ship|transit/i.test(statLower)) {
      status = "Shipped";
    } else if (/process|pend/i.test(statLower)) {
      status = "Processing";
    } else if (/cancel|refund/i.test(statLower)) {
      status = "Cancelled";
    } else {
      if (!["Delivered", "Shipped", "Processing", "Cancelled"].includes(status)) {
        status = "Delivered";
      }
    }

    records.push({
      id,
      date,
      customerName,
      productName,
      category: category as any,
      region: region as any,
      revenue,
      profit,
      status: status as any
    });
  }

  return records;
}

/**
 * Generates standard sample CSV template for users to download
 */
export function generateSampleCSVString(): string {
  const headers = "Order ID,Date,Customer,Product,Category,Region,Revenue,Profit,Status\n";
  const rows = [
    "ORD-2001,2026-05-15,Alicia Keys,Sony WH-1000XM5,Electronics,North America,399.00,140.00,Delivered",
    "ORD-2002,2026-05-18,Jean-Paul,Patagonia Torrentshell,Apparel,Europe,180.00,72.00,Delivered",
    "ORD-2003,2026-05-20,Kenji Sato,MacBook Pro M3,Electronics,Asia,2499.00,875.00,Shipped",
    "ORD-2004,2026-05-22,Maria Garcia,Figma Professional,Software,LATAM,180.00,162.00,Processing",
    "ORD-2005,2026-05-25,Rashid Khan,Dyson V15 Detect,Home,Middle East,749.00,225.00,Delivered",
    "ORD-2006,2026-05-26,Sarah Jenkins,Nike Air Max 270,Apparel,North America,150.00,65.00,Delivered",
    "ORD-2007,2026-05-27,Sophia Dubois,Adobe Creative Cloud,Software,Europe,600.00,540.00,Shipped",
    "ORD-2008,2026-05-28,Elena Petrova,iRobot Roomba j7,Home,Europe,599.00,180.00,Processing"
  ];
  return headers + rows.join("\n");
}
