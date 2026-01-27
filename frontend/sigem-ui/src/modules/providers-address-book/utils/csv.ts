import { Provider } from "../types";

export function exportToCSV(providers: Provider[], filename = "providers.csv") {
  const headers = [
    "ID",
    "Name",
    "Category",
    "Status",
    "Phones",
    "Emails",
    "Country",
    "City",
    "Street",
    "ZipCode",
    "Tags",
    "Created At",
    "Updated At",
    "Created By",
    "Notes",
  ];

  const rows = providers.map((p) => [
    p.id,
    p.name,
    p.category,
    p.status,
    p.phones.join("; "),
    p.emails.join("; "),
    p.address.country,
    p.address.city,
    p.address.street,
    p.address.zipCode || "",
    p.tags.join("; "),
    p.createdAt,
    p.updatedAt,
    p.createdBy || "",
    (p.notes || "").replace(/\n/g, " "),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
