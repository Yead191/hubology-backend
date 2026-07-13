import { Schema, model } from 'mongoose';
import { IService, ServicesModel } from './services.interface';

const PriceSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  }
}, {
  _id: false,
})

const servicesSchema = new Schema<IService, ServicesModel>({
  // Define schema fields here
  title: {
    type: String,
    required: true,
    trim: true,
  },

  tagline: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: PriceSchema,
    required: true,
  },

  features: {
    type: [String],
    required: true,
    validate: {
      validator: (value: string[]) => value.length > 0,
      message: 'At least one feature is required.',
    },
  },

  featured: {
    type: Boolean,
    default: false,
  },

  longDescription: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
},
  {
    timestamps: true,

  });

export const Services = model<IService, ServicesModel>('Services', servicesSchema);
