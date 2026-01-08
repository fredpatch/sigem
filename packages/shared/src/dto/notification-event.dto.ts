import { Severity } from "./event";

export interface RelatedResource {
  resourceType: string;
  resourceId: string;
}

// export interface NotificationEventPayload {
//   title: string;
//   message: string;
//   type: "info" | "success" | "warning" | "error";
//   recipients: string[];
//   relatedResource?: RelatedResource;
// }

export interface NotificationEventPayload {
  type?: string; // ex: "asset.created"
  title?: string;
  message?: string;
  severity?: Severity;
  userId?: string;
  role?: string;
  recipients?: string[]; // si tu l’utilises
  relatedResource?: RelatedResource;
  assetId?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface NotificationEvent {
  type: "NOTIFICATION_EVENT";
  payload: NotificationEventPayload;
}
