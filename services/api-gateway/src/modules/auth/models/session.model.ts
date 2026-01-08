import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import { thirtyDaysFromNow } from "src/utils/date";

export interface SessionDocument extends mongoose.Document {
  userId: UserDocument;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
  userId: { ref: "User", type: mongoose.Schema.Types.ObjectId, index: true },
  userAgent: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, default: thirtyDaysFromNow() },
});

const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);

export default SessionModel;
