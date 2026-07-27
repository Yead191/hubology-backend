export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};

export type IApplicationStatusUpdate = {
  email: string;
  name: string;
  projectName: string;
  status: string;
  rejectionReason?: string;
};

export type IDonationReceipt = {
  donorEmail: string;
  donorName: string;
  amount: number;
  transactionId?: string;
};

export type IDonationReceived = {
  adminEmail: string;
  adminName: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  transactionId?: string;
};
export type IOrderItem = {
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type IOrderConfirmation = {
  email: string;
  name: string;
  orderId: string;
  transactionId?: string;
  items: IOrderItem[];
  totalPrice: number;
  formattedAddress: string;
  contactNumber?: string;
};

export type IAdminOrderNotification = {
  adminEmail: string;
  adminName: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  transactionId?: string;
  items: IOrderItem[];
  totalPrice: number;
  formattedAddress: string;
};

export type IOrderStatusUpdate = {
  email: string;
  name: string;
  orderId: string;
  status: string;
  formattedAddress?: string;
  totalPrice?: number;
};
