import { Schema, model } from 'mongoose';
import { IReport, REPORT_REASON, ReportModel } from './report.interface';

const reportSchema = new Schema<IReport, ReportModel>({
  post: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },

  reporter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  reason: {
    type: String,
    enum: REPORT_REASON,
    required: true
  },

  description: {
    type: String,
    trim: true,
    max: 500
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },

}, { timestamps: true });

reportSchema.index(
  {
    post: 1,
    reporter: 1
  },
  {
    unique: true
  })

export const Report = model<IReport, ReportModel>('Report', reportSchema);
