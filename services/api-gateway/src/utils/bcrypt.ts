import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds?: number) =>
  await bcrypt.hash(value, saltRounds || 12);

export const compareValue = async (value: string, hashedValue: string) =>
  await bcrypt.compare(value, hashedValue).catch(() => false);
