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

