import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import twilio from 'twilio';

interface MemberDetails {
  firstName: string;
  lastName: string;
  branchName?: string | null;
  planName?: string | null;
  coverType?: string | null;
  premiumRate?: string | number | null;
}

export async function sendEnrollmentEmail(
  toEmail: string,
  member: MemberDetails,
  apiToken: string
) {
  const mailersend = new MailerSend({ apiKey: apiToken });
  const { firstName, lastName, branchName, planName, coverType, premiumRate } = member;
  const fullName = `${firstName} ${lastName}`;

  const sentFrom = new Sender('cic-fortune@test-xkjn41m31594z781.mlsender.net', 'CIC Fortune');
  const recipients = [new Recipient(toEmail, fullName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject('Welcome to CIC Fortune - Member Enrollment')
    .setHtml(`
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #005a8c;">Welcome to CIC Fortune, ${firstName}!</h2>
        <p>We are pleased to inform you that your enrollment has been successful.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Member Name:</strong> ${fullName}</p>
          <p><strong>Branch:</strong> ${branchName || 'N/A'}</p>
          <p><strong>Plan:</strong> ${planName || 'N/A'}</p>
          <p><strong>Cover Type:</strong> ${coverType || 'N/A'}</p>
          <p><strong>Premium Rate:</strong> KES ${premiumRate ? Number(premiumRate).toLocaleString() : '0'}</p>
        </div>
        <p>If you have any questions, please contact your branch manager.</p>
        <p>Best regards,<br>The CIC Fortune Team</p>
      </div>
    `)
    .setText(`Hello ${firstName}, welcome to CIC Fortune! You have been enrolled in the ${planName || 'plan'} under ${branchName || 'branch'}. Cover Type: ${coverType}. Premium: KES ${premiumRate}.`);

  return mailersend.email.send(emailParams);
}

export async function sendEnrollmentSms(
  toPhone: string,
  member: MemberDetails,
  accountSid: string,
  authToken: string,
  fromPhone: string
) {
  const client = twilio(accountSid, authToken);
  const { firstName, branchName, planName, coverType, premiumRate } = member;
  
  const message = `Hello ${firstName}, welcome to CIC Fortune! Enrolled in ${planName || 'plan'} at ${branchName || 'branch'}. Cover: ${coverType}. Premium: KES ${premiumRate}.`;

  // Handle Kenyan phone numbers (start with 07 or 01)
  let formattedPhone = toPhone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = `+254${formattedPhone.substring(1)}`;
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+${formattedPhone}`;
  }

  // Handle Kenyan phone numbers for the sender as well
  let formattedFrom = fromPhone;
  if (formattedFrom.startsWith('0')) {
    formattedFrom = `+254${formattedFrom.substring(1)}`;
  } else if (!formattedFrom.startsWith('+')) {
    formattedFrom = `+${formattedFrom}`;
  }

  return client.messages.create({
    body: message,
    from: formattedFrom,
    to: formattedPhone,
  });
}

export async function sendWelcomeEmail(
  toEmail: string,
  user: { firstName: string; lastName: string; id?: string | null; password?: string },
  apiToken: string
) {
  const mailersend = new MailerSend({ apiKey: apiToken });
  const { firstName, lastName, id, password } = user;
  const fullName = `${firstName} ${lastName}`;

  const sentFrom = new Sender('cic-fortune@test-xkjn41m31594z781.mlsender.net', 'CIC Fortune');
  const recipients = [new Recipient(toEmail, fullName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject('Welcome to CIC Fortune - Your Account Details')
    .setHtml(`
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #005a8c;">Welcome to CIC Fortune, ${firstName}!</h2>
        <p>Your administrative account has been created successfully.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Login ID:</strong> ${id || 'Use your email'}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p>Please log in at <a href="https://cic-fortune.vercel.app">CIC Fortune Portal</a>. You will be prompted to change your password on your first login.</p>
        <p>If you have any questions, please contact the system administrator.</p>
        <p>Best regards,<br>The CIC Fortune Team</p>
      </div>
    `)
    .setText(`Hello ${firstName}, welcome to CIC Fortune! Your Login ID is ${id || toEmail} and your temporary password is ${password}. Please login and change your password.`);

  return mailersend.email.send(emailParams);
}

export async function sendTransferEmail(
  toEmail: string,
  details: { 
    firstName: string; 
    lastName: string; 
    id: string; 
    branchName: string;
  },
  apiToken: string
) {
  const mailersend = new MailerSend({ apiKey: apiToken });
  const { firstName, lastName, id, branchName } = details;
  const fullName = `${firstName} ${lastName}`;

  const sentFrom = new Sender('cic-fortune@test-xkjn41m31594z781.mlsender.net', 'CIC Fortune');
  const recipients = [new Recipient(toEmail, fullName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject('Branch Transfer Notification - CIC Fortune')
    .setHtml(`
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #005a8c;">Branch Transfer Update</h2>
        <p>Hello ${firstName},</p>
        <p>This is to inform you that you have been transferred to a new branch and promoted/assigned as a <strong>Branch Manager</strong>.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>New Branch:</strong> ${branchName}</p>
          <p><strong>New User ID:</strong> ${id}</p>
          <p><strong>Role:</strong> Branch Manager</p>
        </div>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Please use your new <strong>User ID</strong> for future logins if you use ID-based login.</li>
          <li>Your existing password remains the same unless you were recently created.</li>
          <li>You now have administrative access to manage operations at the <strong>${branchName}</strong> branch.</li>
        </ol>
        <p>If you believe this transfer is an error, please contact the HR department or System Administrator immediately.</p>
        <p>Best regards,<br>The CIC Fortune Team</p>
      </div>
    `)
    .setText(`Hello ${firstName}, you have been transferred to the ${branchName} branch as a Branch Manager. Your new User ID is ${id}. Please use this for your future interactions with the system.`);

  return mailersend.email.send(emailParams);
}
