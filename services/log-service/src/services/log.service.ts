import { LogEntryModel } from "../models/log-entry.model";

export async function saveLog(doc: {
  eventId?: string;
  type: string;
  topic: string;
  userId?: string;
  username?: string;
  role?: string;
  dept?: string;
  resourceType?: string;
  resourceId?: string;
  payload?: any;
  severity?: "info" | "success" | "warning" | "error" | "critical";
  createdAt?: Date;
}) {
  return LogEntryModel.create(doc);
}
