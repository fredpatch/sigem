export interface LogActionPayload {
  action: string;
  performedBy: string;
  targetUser?: string;
  description?: string;
  context: string;
  timestamp?: string;
  ipAddress?: string;
  userAgent?: string;
  isSensitive?: boolean;
}

export interface LogActionDTO {
  type: "USER_ACTION";
  payload: LogActionPayload;
}
