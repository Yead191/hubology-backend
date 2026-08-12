import {
  createAccount,
  resetPassword,
  welcomeAccount,
} from '../templates/authTemplate';
import { applicationStatusUpdate } from '../templates/applicationTemplate';
import {
  donationReceipt,
  donationReceived,
} from '../templates/donationTemplate';
import {
  orderConfirmation,
  adminOrderNotification,
  orderStatusUpdate,
} from '../templates/orderTemplate';
import { vendorStatusUpdate } from '../templates/vendorTemplate';
import {
  serviceBookingUserConfirmation,
  serviceBookingAdminNotification,
} from '../templates/serviceBookingTemplate';
import {
  inquiryUserConfirmation,
  inquiryAdminNotification,
} from '../templates/inquiryTemplate';
import {
  membershipSubscriptionUserConfirmation,
  adminMembershipNotification,
  subscriptionPaymentSuccess,
  subscriptionPaymentFailed,
} from '../templates/subscriptionTemplate';

export const emailTemplate = {
  createAccount,
  resetPassword,
  welcomeAccount,
  applicationStatusUpdate,
  donationReceipt,
  donationReceived,
  orderConfirmation,
  adminOrderNotification,
  orderStatusUpdate,
  vendorStatusUpdate,
  serviceBookingUserConfirmation,
  serviceBookingAdminNotification,
  inquiryUserConfirmation,
  inquiryAdminNotification,
  membershipSubscriptionUserConfirmation,
  adminMembershipNotification,
  subscriptionPaymentSuccess,
  subscriptionPaymentFailed,
};
