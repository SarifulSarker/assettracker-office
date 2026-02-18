import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

const formatDates = (dateString) => {
  if (!dateString) return "";

  return dateString
    .split(",")
    .map((d) => dayjs(d.trim()).format("Do MMM YYYY"))
    .join(", ");
};

const handleDownloadXLSX = async ({ assets }) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employee Assignment");

    // ===== Hide gridlines globally =====
    // worksheet.properties.showGridLines = false;
    worksheet.views = [{ showGridLines: false }];
    // ===== Header Row (start from column 2) =====
    const headers = [
      "SL",
      "Employee Name",
      "Employee UID",
      "Assigned Asset",
      "Asset Type",
      "Asset Price",
      "Asset Purchase Date",
    ];
    // ===== Header Row (start from row 4, column 2) =====
    const headerRow = worksheet.getRow(4); // first 3 rows skip
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 2); // column 2 theke start
      cell.value = header;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF084A90" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ===== Data Rows (start from row 5, column 2) =====
    assets.forEach((emp, rowIndex) => {
      const row = worksheet.getRow(rowIndex + 5); // rowIndex 0 → row 5
      const values = [
        rowIndex + 1,
        emp.employeeName,
        emp.employeeUid,
        emp.assignedAsset,
        emp.assetType,
        emp.assetPrice,
        formatDates(emp.purchaseDate),
      ];
      values.forEach((val, colIndex) => {
        const cell = row.getCell(colIndex + 2); // column 2 theke start
        cell.value = val;
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // ===== Column widths =====
    worksheet.columns = [
      { width: 6 }, // first empty column
      { width: 6 },
      { width: 20 },
      { width: 20 },
      { width: 30 },
      { width: 25 },
      { width: 18 },
      { width: 28 },
    ];

    // ===== Generate file =====
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Asset_Report.xlsx");
  } catch (err) {
    console.error(err);
  }
};

export default handleDownloadXLSX;
