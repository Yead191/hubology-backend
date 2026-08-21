import { Model } from 'mongoose';
import { EVENT_STATUS, EVENT_TYPE } from './event.constants';

export interface IEventOrganization {
  name: string;
  designation?: string;
  email?: string;
}
export type IEvent = {
  title: string;
  slug: string;

  description?: string;

  eventDate: Date;
  endDate?: Date;

  location?: string;

  coverImage: string;

  images: string[];
  type: (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];
  status: (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];
  organization: IEventOrganization;
  tags: string[];
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EventModel = Model<IEvent>;
