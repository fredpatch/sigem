import mongoose, { Schema } from "mongoose";

export const otpPurpose = {
  ACCOUNT_ACTIVATION: "ACCOUNT_ACTIVATION",
  PASSWORD_RESET: "PASSWORD_RESET",
  LOGIN_2FA: "LOGIN_2FA",
} as const;

export type OtpPurpose = (typeof otpPurpose)[keyof typeof otpPurpose];

const otpSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  purpose: {
    type: String,
    enum: Object.values(otpPurpose),
    default: otpPurpose.LOGIN_2FA,
    required: true,
  },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
otpSchema.index({ userId: 1, purpose: 1, expiresAt: 1 });

const OtpModel = mongoose.model("Otp", otpSchema);

export default OtpModel;
