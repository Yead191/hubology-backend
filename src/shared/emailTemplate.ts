import { ICreateAccount, IResetPassword, IApplicationStatusUpdate, IDonationReceipt, IDonationReceived } from '../types/emailTamplate';
import config from '../config';

const getLogoUrl = () => {
  const host = config.ip_address === '0.0.0.0' ? 'localhost' : config.ip_address;
  const base = host && (host.startsWith('http://') || host.startsWith('https://')) ? host : `http://${host}`;
  return `${base}:${config.port}/logo-hubology.svg`;
};

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Toothlens Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const applicationStatusUpdate = (values: IApplicationStatusUpdate) => {
  const logoUrl = getLogoUrl();
  let statusText = values.status;
  let statusStyle = 'background-color: #e5e7eb; color: #374151;';
  let messageDetailHtml = '';
  let rejectionReasonHtml = '';

  if (values.status === 'submitted') {
    statusText = 'Submitted';
    statusStyle = 'background-color: #f3f4f6; color: #374151;';
  } else if (values.status === 'underReview') {
    statusText = 'Under Review';
    statusStyle = 'background-color: #dbeafe; color: #1e40af;';
  } else if (values.status === 'approved') {
    statusText = 'Approved';
    statusStyle = 'background-color: #d1fae5; color: #065f46;';
    messageDetailHtml = `
      <div style="margin-top: 24px; padding: 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
        <p style="font-size: 15px; color: #065f46; margin: 0; line-height: 1.5; text-align: center;">
          🎉 <strong>Congratulations!</strong> Your application has been approved. The team will contact you soon with the next steps.
        </p>
      </div>
    `;
  } else if (values.status === 'rejected') {
    statusText = 'Rejected';
    statusStyle = 'background-color: #fee2e2; color: #991b1b;';
    if (values.rejectionReason) {
      rejectionReasonHtml = `
        <div style="margin-top: 16px; padding: 12px 16px; background-color: #fff5f5; border-left: 4px solid #ef4444; text-align: left; border-radius: 4px;">
          <strong style="color: #991b1b; font-size: 14px; display: block; margin-bottom: 4px;">Reason for Rejection:</strong>
          <p style="color: #b91c1c; font-size: 14px; margin: 0; line-height: 1.4;">${values.rejectionReason}</p>
        </div>
      `;
    }
  } else if (values.status === 'finalist') {
    statusText = 'Finalist';
    statusStyle = 'background-color: #fef3c7; color: #92400e;';
    messageDetailHtml = `
      <div style="margin-top: 24px; padding: 16px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
        <p style="font-size: 15px; color: #92400e; margin: 0; line-height: 1.5; text-align: center;">
          ✨ <strong>Exciting News!</strong> Your application has progressed to the <strong>Finalist</strong> stage. Congratulations on making it this far!
        </p>
      </div>
    `;
  } else if (values.status === 'winner') {
    statusText = 'Winner';
    statusStyle = 'background-color: #fefce8; color: #713f12; border: 1px solid #ca8a04;';
    messageDetailHtml = `
      <div style="margin-top: 24px; padding: 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
        <p style="font-size: 15px; color: #713f12; margin: 0; line-height: 1.5; text-align: center;">
          🏆 <strong>Phenomenal!</strong> Your application has been selected as a <strong>Winner</strong>! We are absolutely thrilled to support your project.
        </p>
      </div>
    `;
  } else if (values.status === 'archived') {
    statusText = 'Archived';
    statusStyle = 'background-color: #f3f4f6; color: #374151;';
  }

  const data = {
    to: values.email,
    subject: `Hubology Application Status Update: ${statusText}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #173616; padding: 35px 20px; border-bottom: 4px solid #bba15c;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Application Status Update
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you for applying to the <strong>iFundAyiti</strong> grant program. We are writing to notify you that the status of your application for the project <strong>"${values.projectName}"</strong> has been updated.
              </p>
              
              <!-- Status Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">Current Status</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 18px; font-weight: bold; border-radius: 50px; ${statusStyle}">
                  ${statusText}
                </span>
                
                ${rejectionReasonHtml}
              </div>
              
              ${messageDetailHtml}
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology & iFundAyiti Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated email notification regarding your application status. Please do not reply directly to this email.
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
  return data;
};

const donationReceipt = (values: IDonationReceipt) => {
  const logoUrl = getLogoUrl();
  const data = {
    to: values.donorEmail,
    subject: `Thank you for your donation to iFundAyiti!`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #173616; padding: 35px 20px; border-bottom: 4px solid #bba15c;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Thank You for Your Donation!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.donorName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you so much for your generous support. Your contribution to the <strong>iFundAyiti</strong> program fund helps us continue our mission and support impactful projects. We truly appreciate your generosity.
              </p>
              
              <!-- Donation Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; color: #173616; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Donation Receipt</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 15px; color: #4b5563;">
                  <tr>
                    <td width="40%" style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donor Name:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0;">${values.donorName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donor Email:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0;">${values.donorEmail}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Amount Contributed:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0; font-size: 18px; color: #173616; font-weight: bold;">$${values.amount.toFixed(2)}</td>
                  </tr>
                  ${values.transactionId ? `
                  <tr>
                    <td style="font-weight: bold; padding-left: 0;">Transaction ID:</td>
                    <td style="word-break: break-all; padding-right: 0; font-family: monospace; font-size: 13px;">${values.transactionId}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology & iFundAyiti Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated receipt for your records. Please do not reply directly to this email.
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
  return data;
};

const donationReceived = (values: IDonationReceived) => {
  const logoUrl = getLogoUrl();
  const data = {
    to: values.adminEmail,
    subject: `New Donation Received: $${values.amount} from ${values.donorName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #173616; padding: 35px 20px; border-bottom: 4px solid #bba15c;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                New Donation Received!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.adminName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Great news! A new donation has been received for the <strong>iFundAyiti</strong> program fund.
              </p>
              
              <!-- Donation Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 15px; color: #4b5563;">
                  <tr>
                    <td width="40%" style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donor Name:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0;">${values.donorName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donor Email:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0;">${values.donorEmail}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donation Amount:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0; font-size: 18px; color: #173616; font-weight: bold;">$${values.amount.toFixed(2)}</td>
                  </tr>
                  ${values.transactionId ? `
                  <tr>
                    <td style="font-weight: bold; padding-left: 0;">Transaction ID:</td>
                    <td style="word-break: break-all; padding-right: 0; font-family: monospace; font-size: 13px;">${values.transactionId}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology & iFundAyiti Team</strong>
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
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  applicationStatusUpdate,
  donationReceipt,
  donationReceived,
};
