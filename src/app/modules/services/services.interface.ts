import { Model } from 'mongoose';

export interface IServicePrice {
  amount: number;
  frequency: string;
}

export interface IService {
  title: string;
  tagline: string;

  price: IServicePrice;

  features: string[];

  featured: boolean;

  longDescription: string;

  image: string;
}

export type ServicesModel = Model<IService>;
