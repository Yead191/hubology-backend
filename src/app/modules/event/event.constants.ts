export enum EVENT_STATUS {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export const EVENT_TYPE = {
  NETWORKING: 'NETWORKING',
  CONFERENCE: 'CONFERENCE',
  WORKSHOP: 'WORKSHOP',
  SEMINAR: 'SEMINAR',
  MEETUP: 'MEETUP',
  SOCIAL: 'SOCIAL',
  OTHER: 'OTHER',
} as const;

export const EVENT_SEARCHABLE_FIELDS = [
  'title',
  'shortDescription',
  'description',
  'location.city',
  'location.country',
  'tags',
];
