import { Model, Types } from 'mongoose';
export enum REPORT_REASON {
  SPAM = "spam",
  HARASSMENT = "harassment",
  INAPPROPRIATE = "inappropriate",
  OFF_TOPIC = "off-topic",
  OTHER = "other",
}
export type TReportStatus =
  | "pending"
  | "accepted"
  | "rejected";
export type IReport = {
  post: Types.ObjectId;

  reporter: Types.ObjectId;

  reason: REPORT_REASON;

  description?: string;

  status: TReportStatus;

  createdAt?: Date;

  updatedAt?: Date;
};

export type ReportModel = Model<IReport>;
