/* =====================================================
   TABULAR EXPORT HELPERS

   Two formats share one row builder:
   - csv   → comma separated, Excel-safe
   - excel → tab-separated .xls, which Excel opens natively
             without needing a spreadsheet library
===================================================== */

/** Quote a value if it contains a delimiter, quote or newline. */
export const escapeCsv = (value: any): string => {
  if (value === null || value === undefined) return "";

  const str = String(value);

  // A leading =, +, - or @ is executed as a formula by Excel and
  // Sheets. Prefix with an apostrophe so exported data stays data.
  const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;

  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }

  return safe;
};

const escapeTsv = (value: any): string => {
  if (value === null || value === undefined) return "";
  // Tabs and newlines would break the row, so flatten them
  return String(value).replace(/[\t\r\n]+/g, " ");
};

export type ExportFormat = "csv" | "excel";

/** Byte-order mark — makes Excel read the file as UTF-8. */
const BOM = "\uFEFF";

/** Read and validate a ?format= query value. */
export const readFormat = (raw: any): ExportFormat => {
  const value = String(raw || "csv").toLowerCase();
  if (value === "excel" || value === "xls" || value === "xlsx") return "excel";
  return "csv";
};

/**
 * Render rows and stream them to the client as a download.
 */
export const sendTable = (
  res: any,
  {
    filename,
    headers,
    rows,
    format
  }: {
    filename: string;
    headers: string[];
    rows: any[][];
    format: ExportFormat;
  }
) => {
  if (format === "excel") {
    const body = [
      headers.map(escapeTsv).join("\t"),
      ...rows.map((r) => r.map(escapeTsv).join("\t"))
    ].join("\r\n");

    res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.xls"`
    );
    // BOM so Excel reads UTF-8 accents correctly
    return res.status(200).send(BOM + body);
  }

  const body = [
    headers.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(","))
  ].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
  // Expose the filename to browser JS doing a blob download
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  return res.status(200).send(BOM + body);
};
