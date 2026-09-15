import { Resend } from "resend";
import { resendClient } from "../config/mail";
import { EmailProps, EmailType } from "../types/email.types";
import { getEmailTemplate } from "../utils/email.utils";

class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = resendClient;
  }

  async sendEmail({ type, data }: { type: EmailType; data: EmailProps }) {
    const { recipientEmail } = data;
    const result = await getEmailTemplate({ type, data });

    if (!result) {
      throw new Error("Email template not found");
    }

    const { subject, template } = result;

    // Resend's SDK doesn't throw on a send failure — it resolves with
    // { data: null, error } instead. Checking and throwing on `error` here
    // is required, not optional: skipping it is exactly the bug that made
    // failed sends silently report "completed" before (see git history on
    // this file) — the queue job needs a real throw to be marked failed.
    const { data: sendResult, error } = await this.resend.emails.send({
      to: [recipientEmail],
      from: "PeerHub <support@usepeerhub.com>",
      subject: subject,
      html: template,
    });

    if (error) {
      console.error(`Failed to send ${type} email to ${recipientEmail}:`, error);
      throw new Error(`Resend error (${error.name}): ${error.message}`);
    }

    console.log(`Email sent: ${type} -> ${recipientEmail} (id: ${sendResult?.id})`);
  }
}

export default EmailService;
