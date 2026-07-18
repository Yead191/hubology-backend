import { Model } from 'mongoose';

export type TApplicationPeriodStatus =
  | 'Upcoming'
  | 'Open'
  | 'Review'
  | 'WinnerSelection'
  | 'Completed';

export type IApplicationperiod = {
  title: string;

  startDate: Date;

  endDate: Date;

  maximumGrantAmount: number;

  status: TApplicationPeriodStatus;
};

export type ApplicationperiodModel = Model<IApplicationperiod>;
