import { Types } from "mongoose";

export function isValidObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

export function asObjectId(value: string) {
  if (!isValidObjectId(value)) return null;
  return new Types.ObjectId(value);
}

