import config from '../config';
import {
  IPartnerApplicationUserConfirmation,
  IPartnerApplicationAdminNotification,
  IPartnerStatusUpdate,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1785305810/logo-hubology_1x_tnmfnk.png';
};

export const partnerApplicationUserConfirmation = (
  values: IPartnerApplicationUserConfirmation,
) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: `Partner Application Received: ${values.partnerName}`,
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
                <span style="background-color: #e0f2fe; color: #0369a1; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Application Submitted ✓
                </span>
              </div>
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Partner Application Under Review
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you for applying to become a partner with Hubology. We have received your application for <strong>${values.partnerName}</strong>.
              </p>
              
              <!-- Info Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.5;">
                  Our administrative team will review your partner profile details. You will be notified via email once your application status is updated.
                </p>
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
                This is an automated notification. Please do not reply directly to this email.
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

export const partnerApplicationAdminNotification = (
  values: IPartnerApplicationAdminNotification,
) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.adminEmail,
    subject: `New Partner Application: ${values.partnerName}`,
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
                New Partner Application
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                A new partner application has been submitted by <strong>${values.applicantName}</strong> (${values.applicantEmail}).
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%; border-bottom: 1px solid #f3f4f6;">Partner Name:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #173616;">${values.partnerName}</td>
                  </tr>
                  ${
                    values.contactEmail
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Contact Email:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.contactEmail}</td>
                  </tr>`
                      : ''
                  }
                  ${
                    values.contactPhone
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Contact Phone:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.contactPhone}</td>
                  </tr>`
                      : ''
                  }
                  ${
                    values.website
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Website:</td>
                    <td><a href="${values.website}" style="color: #0D1026;">${values.website}</a></td>
                  </tr>`
                      : ''
                  }
                </table>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Log into the admin portal to review and manage this application.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0; line-height: 1.5;">
                This is an administrative email notification.
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

export const partnerStatusUpdate = (values: IPartnerStatusUpdate) => {
  const logoUrl = getLogoUrl();
  const statusUpper = values.status ? values.status.toUpperCase() : '';
  const statusBadgeStyle =
    values.status === 'APPROVED'
      ? 'background-color: #d1fae5; color: #065f46;'
      : values.status === 'REJECTED'
        ? 'background-color: #fee2e2; color: #991b1b;'
        : 'background-color: #f3f4f6; color: #374151;';

  return {
    to: values.email,
    subject: `Partner Application Status Updated: ${statusUpper}`,
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
                Partner Application Status Update
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                The status of your partner application for <strong>${values.partnerName}</strong> has been updated:
              </p>
              
              <!-- Status Badge Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">New Status</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 18px; font-weight: bold; border-radius: 50px; ${statusBadgeStyle}">
                  ${statusUpper}
                </span>
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
                This is an automated administrative notification. Please do not reply directly to this email.
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
