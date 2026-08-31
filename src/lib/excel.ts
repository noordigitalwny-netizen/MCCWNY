import * as XLSX from "xlsx";

/**
 * Reusable helper function to convert array of objects into an Excel (.xlsx) file and trigger download.
 * @param data Array of JSON objects representing table rows
 * @param filename Target filename (e.g. Student_Roster.xlsx)
 * @param sheetName Optional worksheet name (defaults to "Sheet1")
 */
export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  sheetName: string = "Data"
) {
  if (!data || data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    let maxLen = key.length;
    data.forEach((row) => {
      const val = row[key] ? String(row[key]) : "";
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });

  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const fullFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, fullFilename);
}
