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


