import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import twilio from "twilio";

interface MemberDetails {
  id: string;
  firstName: string;
  lastName: string;
  branchName: string;
  coverType: string;
  dependentsCount: number;
  premiumRate: string;
  status: string;
  usedAnnualLimit: string;
}

export async function sendEnrollmentEmail(toEmail: string, memberDetails: MemberDetails, token: string) {
    const mailerSend = new MailerSend({
        apiKey: token,
    });

    const toName = `${memberDetails.firstName} ${memberDetails.lastName}`;
    const sentFrom = new Sender("info@cic-fortune.com", "CIC Fortune");
    const recipients = [new Recipient(toEmail, toName)];

    const subject = "Welcome to CIC Fortune - Enrollment Successful";
    const text = `Dear ${toName},\n\nYou have been successfully enrolled.\n\nDetails:\nBranch: ${memberDetails.branchName}\nMember ID: ${memberDetails.id}\nCover Type: ${memberDetails.coverType}\nDependents: ${memberDetails.dependentsCount}\nPremium Rate: KES ${memberDetails.premiumRate}\nStatus: ${memberDetails.status}\nUsed Limit: KES ${memberDetails.usedAnnualLimit}\n\nThank you for choosing CIC Fortune.`;

    const html = `
        <h3>Welcome to CIC Fortune!</h3>
        <p>Dear ${toName},</p>
        <p>You have been successfully enrolled. Here are your details:</p>
        <ul>
            <li><strong>Branch:</strong> ${memberDetails.branchName}</li>
            <li><strong>Member ID:</strong> ${memberDetails.id}</li>
            <li><strong>Cover Type:</strong> ${memberDetails.coverType}</li>
            <li><strong>Dependents:</strong> ${memberDetails.dependentsCount}</li>
            <li><strong>Premium Rate:</strong> KES ${memberDetails.premiumRate}</li>
            <li><strong>Status:</strong> ${memberDetails.status}</li>
            <li><strong>Used Limit:</strong> KES ${memberDetails.usedAnnualLimit}</li>
        </ul>
        <p>Thank you for choosing CIC Fortune.</p>
    `;

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(subject)
        .setHtml(html)
        .setText(text);

    return mailerSend.email.send(emailParams);
}

export async function sendEnrollmentSms(toPhone: string, memberDetails: MemberDetails, accountSid: string, authToken: string, fromPhone: string) {
    const client = twilio(accountSid, authToken);
    
    const message = `CIC Fortune: Enrollment successful! Member ID: ${memberDetails.id}. Cover: ${memberDetails.coverType}. Premium: KES ${memberDetails.premiumRate}. Branch: ${memberDetails.branchName}.`;

    return client.messages.create({
        body: message,
        from: fromPhone,
        to: toPhone
    });
}
