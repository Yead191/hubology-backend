export type RefundStatus =
  | 'pending'
  | 'processing'
  | 'refunded'
  | 'rejected'
  | 'failed';

export type RefundType = 'full' | 'partial';
