import config from '../config';
import {
  IRefundRequestUserConfirmation,
  IRefundRequestAdminNotification,
  IRefundApprovedUserConfirmation,
  IRefundRejectedUserConfirmation,
  IRefundProcessedAdminNotification,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  const host =
    config.ip_address === '0.0.0.0' ? 'localhost' : config.ip_address;
  const base =
    host && (host.startsWith('http://') || host.startsWith('https://'))
      ? host
      : `http://${host}`;
  return `${base}:${config.port}/logo-hubology.svg`;
};

export const refundRequestUserConfirmation = (
  values: IRefundRequestUserConfirmation,
) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: `Refund Request Received - #${values.orderId}`,
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
                <span style="background-color: #fef3c7; color: #92400e; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Request Submitted ⏳
                </span>
              </div>
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Refund Request Received
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                We have received your refund request for Order <strong>#${values.orderId}</strong>. Our support team is reviewing your request and will process it shortly.
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: bold; color: #173616;">#${values.orderId}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Reason:</td>
                    <td>${values.reason}</td>
                  </tr>
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

export const refundRequestAdminNotification = (
  values: IRefundRequestAdminNotification,
) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.adminEmail,
    subject: `[New Refund Request] Order #${values.orderId}`,
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
                New Refund Request ⚠️
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello <strong>${values.adminName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                A new refund request has been submitted for Order <strong>#${values.orderId}</strong>.
              </p>
              
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: bold; color: #173616;">#${values.orderId}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Customer:</td>
                    <td>${values.customerName} (${values.customerEmail})</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Reason:</td>
                    <td>${values.reason}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Please log into the admin dashboard to review and approve or reject this request.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Automated Admin Notification - Hubology System
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

export const refundApprovedUserConfirmation = (
  values: IRefundApprovedUserConfirmation,
) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: `Refund Approved & Processed - #${values.orderId}`,
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
                <span style="background-color: #d1fae5; color: #065f46; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Refund Approved ✓
                </span>
              </div>
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Your Refund Has Been Processed
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Your refund request for Order <strong>#${values.orderId}</strong> has been approved and processed back to your original payment method via Stripe.
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: bold; color: #173616;">#${values.orderId}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Refund Type:</td>
                    <td style="text-transform: capitalize;">${values.refundType} Refund</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Refund Amount:</td>
                    <td style="font-size: 16px; font-weight: bold; color: #065f46;">$${values.refundAmount.toFixed(2)}</td>
                  </tr>
                  ${
                    values.stripeRefundId
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Stripe Refund ID:</td>
                    <td style="font-family: monospace;">${values.stripeRefundId}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.adminNote
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Admin Note:</td>
                    <td>${values.adminNote}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
                Note: Depending on your bank or card issuer, funds usually take 5–10 business days to appear on your statement.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
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

export const refundRejectedUserConfirmation = (
  values: IRefundRejectedUserConfirmation,
) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: `Refund Request Update - #${values.orderId}`,
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
                <span style="background-color: #fee2e2; color: #991b1b; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Request Rejected
                </span>
              </div>
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Refund Request Status Update
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                We have reviewed your refund request for Order <strong>#${values.orderId}</strong>. Regrettably, your refund request has been rejected.
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: bold; color: #173616;">#${values.orderId}</td>
                  </tr>
                  ${
                    values.adminNote
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Note from Admin:</td>
                    <td style="color: #991b1b;">${values.adminNote}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                If you have any questions or feel this is an error, please contact our support team.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
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

export const refundProcessedAdminNotification = (
  values: IRefundProcessedAdminNotification,
) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.adminEmail,
    subject: `[Refund Processed] Order #${values.orderId} - $${values.refundAmount.toFixed(2)}`,
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
                Refund Processed 💸
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello <strong>${values.adminName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                A refund has been successfully processed for Order <strong>#${values.orderId}</strong>.
              </p>
              
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: bold; color: #173616;">#${values.orderId}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Customer:</td>
                    <td>${values.customerName} (${values.customerEmail})</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Refund Type:</td>
                    <td style="text-transform: capitalize;">${values.refundType} Refund</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Refund Amount:</td>
                    <td style="font-size: 16px; font-weight: bold; color: #065f46;">$${values.refundAmount.toFixed(2)}</td>
                  </tr>
                  ${
                    values.stripeRefundId
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Stripe Refund ID:</td>
                    <td style="font-family: monospace;">${values.stripeRefundId}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.adminNote
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Admin Note:</td>
                    <td>${values.adminNote}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                Automated Admin Notification - Hubology System
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
