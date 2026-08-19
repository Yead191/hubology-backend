import { Model, Types } from 'mongoose';
import { RefundStatus, RefundType } from './refund.constants';

export type IRefund = {
  order: Types.ObjectId;
  user: Types.ObjectId;
  reason: string;
  images?: string[];
  status: RefundStatus;
  refundType?: RefundType;
  refundAmount?: number;
  adminNote?: string;
  stripeRefundId?: string;
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RefundModel = Model<IRefund>;
