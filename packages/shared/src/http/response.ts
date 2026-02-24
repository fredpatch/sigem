/**
 * Map severity levels to UI notification types
 */
export function mapSeverityToNotificationType(
  s?: string,
): "success" | "error" | "info" | "warning" {
  switch (s) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
    case "critical":
      return "error";
    default:
      return "info";
  }
}
