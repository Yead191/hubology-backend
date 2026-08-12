import config from '../config';
import {
  IMembershipSubscriptionUserConfirmation,
  IAdminMembershipNotification,
  ISubscriptionPaymentSuccess,
  ISubscriptionPaymentFailed,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1785305810/logo-hubology_1x_tnmfnk.png';
};

export const membershipSubscriptionUserConfirmation = (
  values: IMembershipSubscriptionUserConfirmation,
) => {
  const logoUrl = getLogoUrl();
  const statusLabel = values.isTrial
    ? `Active (${values.trialPeriodDays || 0}-Day Free Trial)`
    : 'Active Subscription ✓';

  return {
    to: values.email,
    subject: `Membership Subscribed: ${values.membershipName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #0D1026; padding: 35px 20px; border-bottom: 4px solid #bba15c;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: ${values.isTrial ? '#dbeafe' : '#d1fae5'}; color: ${values.isTrial ? '#1e40af' : '#065f46'}; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  ${statusLabel}
                </span>
              </div>
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Welcome to ${values.membershipName}!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                ${
                  values.isTrial
                    ? `Your free trial for <strong>${values.membershipName}</strong> is now active for <strong>${values.trialPeriodDays} days</strong>.`
                    : `Your subscription to <strong>${values.membershipName}</strong> has been successfully activated.`
                } Here are your membership details:
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%; border-bottom: 1px solid #f3f4f6;">Membership Plan:</td>
                    <td style="font-weight: bold; color: #173616; border-bottom: 1px solid #f3f4f6;">${values.membershipName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Billing Cycle:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; text-transform: capitalize;">${values.recurring}ly</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Price:</td>
                    <td style="font-weight: bold; color: #173616; border-bottom: 1px solid #f3f4f6;">$${values.price.toFixed(2)} / ${values.recurring}</td>
                  </tr>
                  ${
                    values.isTrial
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Trial Status:</td>
                    <td style="color: #1e40af; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${values.trialPeriodDays}-Day Free Trial ${values.trialEndDate ? `(Ends ${values.trialEndDate})` : ''}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Subscription ID:</td>
                    <td style="font-family: monospace;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated subscription confirmation email.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Hubology. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
    `,
  };
};

export const adminMembershipNotification = (
  values: IAdminMembershipNotification,
) => {
  const logoUrl = getLogoUrl();

  return {
    to: values.adminEmail,
    subject: `New Subscription: ${values.membershipName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #0D1026; padding: 35px 20px; border-bottom: 4px solid #bba15c;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                New Membership Subscription
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello Administrator,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                <strong>${values.customerName}</strong> (${values.customerEmail}) has subscribed to the <strong>${values.membershipName}</strong> plan.
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%; border-bottom: 1px solid #f3f4f6;">Customer:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.customerName} (${values.customerEmail})</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Plan:</td>
                    <td style="font-weight: bold; color: #173616; border-bottom: 1px solid #f3f4f6;">${values.membershipName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Price:</td>
                    <td style="font-weight: bold; color: #173616; border-bottom: 1px solid #f3f4f6;">$${values.price.toFixed(2)} / ${values.recurring}</td>
                  </tr>
                  ${
                    values.isTrial
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Trial Status:</td>
                    <td style="color: #1e40af; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${values.trialPeriodDays}-Day Free Trial ${values.trialEndDate ? `(Ends ${values.trialEndDate})` : ''}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Subscription ID:</td>
                    <td style="font-family: monospace;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology System</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This is an automated administrative subscription notification.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
    `,
  };
};

export const subscriptionPaymentSuccess = (
  values: ISubscriptionPaymentSuccess,
) => {
  const logoUrl = getLogoUrl();

  return {
    to: values.email,
    subject: `Subscription Payment Received: ${values.membershipName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <tr>
            <td align="center" style="background-color: #0D1026; padding: 35px 20px; border-bottom: 4px solid #bba15c;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #d1fae5; color: #065f46; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Payment Successful ✓
                </span>
              </div>
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Payment Receipt for ${values.membershipName}
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                We have successfully received your recurring membership payment for <strong>${values.membershipName}</strong>. Your subscription is active and up to date!
              </p>
              
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%; border-bottom: 1px solid #f3f4f6;">Plan:</td>
                    <td style="font-weight: bold; color: #173616; border-bottom: 1px solid #f3f4f6;">${values.membershipName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Amount Paid:</td>
                    <td style="font-weight: bold; color: #173616; border-bottom: 1px solid #f3f4f6;">$${values.amountPaid.toFixed(2)}</td>
                  </tr>
                  ${
                    values.nextBillingDate
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Next Billing Date:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.nextBillingDate}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Transaction ID:</td>
                    <td style="font-family: monospace;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                &copy; ${new Date().getFullYear()} Hubology. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
    `,
  };
};

export const subscriptionPaymentFailed = (
  values: ISubscriptionPaymentFailed,
) => {
  const logoUrl = getLogoUrl();

  return {
    to: values.email,
    subject: `Payment Failed: ${values.membershipName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <tr>
            <td align="center" style="background-color: #0D1026; padding: 35px 20px; border-bottom: 4px solid #dc2626;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #fee2e2; color: #dc2626; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Action Required: Payment Failed
                </span>
              </div>
              <h1 style="color: #dc2626; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Payment Failed for ${values.membershipName}
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                We were unable to process your recurring subscription payment of <strong>$${values.amountDue.toFixed(2)}</strong> for your <strong>${values.membershipName}</strong> plan.
              </p>
              ${
                values.reason
                  ? `<p style="font-size: 14px; color: #dc2626; background-color: #fef2f2; padding: 12px; border-radius: 6px; margin-bottom: 24px;">Reason: ${values.reason}</p>`
                  : ''
              }
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Please log in to your account and update your payment method to avoid any interruption to your membership services.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                &copy; ${new Date().getFullYear()} Hubology. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
    `,
  };
};
