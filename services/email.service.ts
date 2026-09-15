import { Resend } from "resend";
import { resendClient, nodemailerClient } from "../config/mail";
import { EmailProps, EmailType } from "../types/email.types";
import { getEmailTemplate } from "../utils/email.utils";

class EmailService {
  private resend: Resend;
  private nodemailer: any;

  constructor() {
    this.resend = resendClient;
    this.nodemailer = nodemailerClient;
  }

  async sendEmail({ type, data }: { type: EmailType; data: EmailProps }) {
    const { recipientEmail } = data;
    const result = await getEmailTemplate({ type, data });

    if (result) {
      const { subject, template } = result;

      try {
        await this.nodemailer
          .sendMail({
            to: [recipientEmail],
            from: "PeerHub <support@usepeerhub.com>",
            subject: subject,
            html: template,
          })
          .then((res: any) => {
            console.log(res);
          });
      } catch (error) {
        // Re-throw — swallowing this here meant a real send failure (wrong
        // host, bad auth, etc.) still resolved sendEmail() successfully, so
        // the queue job reported "completed" with no email ever sent and no
        // error visible anywhere. Let it propagate so processJob's catch
        // (queue/consumer.ts) marks the job failed and logs the real cause.
        console.error(`Failed to send ${type} email to ${recipientEmail}:`, error);
        throw error;
      }
    } else {
      throw new Error("Email template not found");
    }
  }
}

export default EmailService;
