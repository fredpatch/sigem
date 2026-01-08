export type ObjectId = string;
export type ISODateString = string;

export interface BaseDocument {
  _id: ObjectId;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}
