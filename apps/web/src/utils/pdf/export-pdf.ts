import jsPDF from "jspdf";
import { renderMGVehicleReport } from "@/utils/pdf/mg-vehicle-report.template";

export function exportToPdf(
  filename: string,
  headers: string[],
  body: any[][],
  title?: string,
) {
  const doc = new jsPDF({
    orientation: headers.length > 6 ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });

  renderMGVehicleReport(doc, headers, body, {
    title: title ?? "Programme de suivi du matériel roulant",
    subtitle: "Rapport exporté depuis SIGEM",
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
