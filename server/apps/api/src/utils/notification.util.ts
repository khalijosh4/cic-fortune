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
