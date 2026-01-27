import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ANAC_LOGO } from "./pdf-assets";

type VehicleReportOptions = {
  title: string;
  subtitle?: string;
  generatedAt?: Date;
};

export function renderMGVehicleReport(
  doc: jsPDF,
  headers: string[],
  body: any[][],
  options: VehicleReportOptions,
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  /* LOGO */
  doc.addImage(ANAC_LOGO.data, "PNG", 30, 5, ANAC_LOGO.width, ANAC_LOGO.height);

  /* TITLE */
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(options.title, pageWidth / 2, 45, { align: "center" });

  /* SUBTITLE */
  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(options.subtitle, pageWidth / 2, 60, { align: "center" });
  }

  /* META */
  doc.setFontSize(9);
  doc.text(
    `Généré le : ${(options.generatedAt ?? new Date()).toLocaleDateString("fr-FR")}`,
    pageWidth - 40,
    40,
    { align: "right" },
  );

  /* TABLE */
  autoTable(doc, {
    head: [headers],
    body,
    startY: 80,
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 20,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // FOOTER WITH PAGE NUMBERS
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
  }
}
