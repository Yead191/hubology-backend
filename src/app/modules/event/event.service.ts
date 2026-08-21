import { generateSlug } from '../../../util/generateSlug';
import { EventModel, IEvent } from './event.interface';
import { Event } from './event.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import { EVENT_SEARCHABLE_FIELDS, EVENT_STATUS } from './event.constants';
import unlinkFile from '../../../shared/unlinkFile';

const createEventToDB = async (payload: IEvent) => {
  const slug = generateSlug(payload.title);
  const isExistSlug = await Event.findOne({ slug });
  if (isExistSlug) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Event already exists with this slug',
    );
  }
  const result = await Event.create({ ...payload, slug });
  return result;
};

const getSingleEvent = async (slug: string) => {
  const result = await Event.findOne({ slug });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  return result;
};

const updateEvent = async (id: string, payload: Partial<IEvent>) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  let slug = event.slug;
  if (payload.title && payload.title !== event.title) {
    slug = generateSlug(payload.title);
    const isExistSlug = await Event.findOne({ slug });
    if (isExistSlug) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Event already exists with this slug',
      );
    }
  }
  if (payload.coverImage) {
    unlinkFile(event.coverImage);
  }
  // Images changed
  if (payload.images) {
    const oldImages = event.images || [];
    const newImages = payload.images;

    // Find images that were removed
    const removedImages = oldImages.filter(
      oldImage => !newImages.includes(oldImage),
    );

    // Delete removed files from upload folder
    removedImages.forEach(image => {
      unlinkFile(image);
    });
  }
  const result = await Event.findByIdAndUpdate(
    id,
    { ...payload, slug },
    { new: true },
  );
  return result;
};

const deleteEvent = async (id: string) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  const result = await Event.findByIdAndDelete(id);
  return result;
};

const getAllEvents = async (user: JwtPayload, query: Record<string, any>) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  )
    ? {}
    : { status: EVENT_STATUS.PUBLISHED };

  const qb = new QueryBuilder(Event.find(initQuery), query)
    .search(EVENT_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate()
    .fields();
  const [events, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return { events, pagination };
};

export const EventServices = {
  createEventToDB,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
};
