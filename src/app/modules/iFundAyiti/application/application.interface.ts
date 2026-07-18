import { Model, Types } from 'mongoose';
export type TApplicationStatus =
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'Finalist'
  | 'Winner'
  | 'Archived';

export interface IPersonalInformation {
  name: string;
  dob: Date;
  nationality: string;
  location: string;
}

export interface IContactInformation {
  email: string;
  phone: string;
}
export interface IIdentificationInformation {
  nationalId: string;
  passport?: string;
}
export interface IGrantInformation {
  projectName: string;
  projectDescription: string;
  requestedAmount: number;
  fundUsage: string;
  expectedImpact: string;
}

export interface IBackgroundInformation {
  occupation: string;
  financialBackground: string;
}

export interface IDocument {
  type: string;
  url: string;
}
export type IApplication = {
  applicationPeriod: Types.ObjectId;

  personal: IPersonalInformation;

  contact: IContactInformation;

  identification: IIdentificationInformation;

  grant: IGrantInformation;

  background: IBackgroundInformation;

  documents: IDocument[];

  status: TApplicationStatus;

  reviewedBy?: Types.ObjectId;

  reviewedAt?: Date;

  rejectionReason?: string;
};

export type ApplicationModel = Model<IApplication>;
