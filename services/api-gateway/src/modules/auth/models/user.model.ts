import mongoose from "mongoose";
import { Role, ROLES } from "@sigem/shared";
import { compareValue, hashValue } from "src/utils/bcrypt";

export const STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

export interface UserDocument extends mongoose.Document {
  avatarUrl: string;
  email: string;
  password: string;
  username: string;
  matriculation: string;
  role: Role;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  isBlocked: boolean;
  lastLogin: Date;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  address: string;
  isDeleted: boolean;
  deletedAt: Date;
  isActive: boolean;
  is2FAValidated: boolean;
  is2FAEnabled: boolean;
  status: (typeof STATUS)[keyof typeof STATUS];
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    | "_id"
    | "email"
    | "username"
    | "matriculation"
    | "role"
    | "verified"
    | "createdAt"
    | "updatedAt"
    | "isBlocked"
    | "lastLogin"
    | "avatarUrl"
    | "firstName"
    | "lastName"
    | "jobTitle"
    | "department"
    | "address"
    | "isDeleted"
    | "deletedAt"
    | "isActive"
    | "is2FAValidated"
    | "is2FAEnabled"
    | "status"
  > &
    UserDocument;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, unique: true },
    matriculation: { type: String, unique: true },
    password: { type: String, required: false, select: false },
    email: { type: String },
    avatarUrl: { type: String },
    lastLogin: Date,
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.MG_AGT,
    },
    verified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    is2FAValidated: { type: Boolean, default: false },
    is2FAEnabled: { type: Boolean, default: false },
    // add a field to store the last login date
    jobTitle: { type: String }, // fonction RH
    department: { type: String }, // direction RH
    firstName: String,
    lastName: String,
    address: String,

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.PENDING,
    },
  },
  { timestamps: true }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string" }, // ou { $exists: true, $ne: null }
    },
  }
);

//
userSchema.pre("save", async function (next) {
  // sync legacy field
  this.isActive = this.status === "ACTIVE";

  if (!this.password) return next();
  if (!this.isModified("password")) return next();
  // check if password already hashed
  // if (this.password.startsWith("$2b$")) return next();
  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  if (!this.password) return false;
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
