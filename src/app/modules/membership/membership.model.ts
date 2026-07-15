import { Schema, model } from 'mongoose';
import { IMembership, MembershipModel } from './membership.interface'; 

const membershipSchema = new Schema<IMembership, MembershipModel>({
  // Define schema fields here
});

export const Membership = model<IMembership, MembershipModel>('Membership', membershipSchema);
