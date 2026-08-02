import { createAccount, resetPassword } from '../templates/authTemplate';
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

export const emailTemplate = {
  createAccount,
  resetPassword,
  applicationStatusUpdate,
  donationReceipt,
  donationReceived,
  orderConfirmation,
  adminOrderNotification,
  orderStatusUpdate,
  vendorStatusUpdate,
  serviceBookingUserConfirmation,
  serviceBookingAdminNotification,
};
