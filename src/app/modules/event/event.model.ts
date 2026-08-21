import { Schema, model } from 'mongoose';
import { IEvent, EventModel, IEventOrganization } from './event.interface';
import { EVENT_STATUS, EVENT_TYPE } from './event.constants';

const eventOrganizationSchema = new Schema<IEventOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false },
);
const eventSchema = new Schema<IEvent, EventModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    eventDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
    },

    location: {
      type: String,
      trim: true,
    },

    coverImage: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    type: {
      type: String,
      enum: Object.values(EVENT_TYPE),
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.DRAFT,
      index: true,
    },

    organization: {
      type: eventOrganizationSchema,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);
eventSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

eventSchema.index({
  eventDate: -1,
  status: 1,
});
export const Event = model<IEvent, EventModel>('Event', eventSchema);
