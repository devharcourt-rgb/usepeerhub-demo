import { electricityTopupNotificationTemplate } from "../templates/admin-electricity-topup.template";
import { adminInviteEmailTemplate } from "../templates/admin-invite.template";
import { adminWelcomeEmailTemplate } from "../templates/admin-welcome.template";
import { changePasswordEmailTemplate } from "../templates/change-password.template";
import { creditEmailTemplate } from "../templates/credit-email.template.template";
import { customerAccountCreationEmailTemplate } from "../templates/customer-account-creation.temple";
import { debitEmailTemplate } from "../templates/debit-email.template";
import { discoTokenEmailTemplate } from "../templates/disco-token.template";
import { forgotPasscodeEmailTemplate } from "../templates/forgot-passcode.template";
import { forgotTransactionPinEmailTemplate } from "../templates/forgot-transaction-pin.template";
import { forgotPasswordEmailTemplate } from "../templates/forgot-password.template";
import { welcomeEmailTemplate } from "../templates/welcome.template";
import { otpEmailTemplate } from "../templates/otp.template";
import { kycReviewEmailTemplate } from "../templates/kyc-review.template";
import {
  AdminAccountCreationEmailProps,
  AdminInviteEmailProps,
  AdminWelcomeEmailProps,
  ChangePasswordEmailProps,
  CreditEmailProps,
  DebitEmailProps,
  EmailProps,
  EmailType,
  ForgotPasscodeEmailProps,
  ForgotTransactionPinEmailProps,
  ForgotPasswordEmailProps,
  KycReviewEmailProps,
  OtpEmailProps,
  SendAdminElectricityTopupEmailProps,
  SendDiscoTokenEmailProps,
  WelcomeEmailProps,
} from "../types/email.types";

export async function getEmailTemplate({
  type,
  data,
}: {
  type: EmailType;
  data: EmailProps;
}) {
  switch (type) {
    case "send-welcome-email": {
      const { firstName } = data as WelcomeEmailProps;
      return {
        subject: "Welcome to PeerHub",
        template: welcomeEmailTemplate({
          firstName,
        }),
      };
    }

    case "send-otp-email": {
      const { firstName, otp } = data as OtpEmailProps;
      return {
        subject: "Verify Your Email Address",
        template: otpEmailTemplate({
          firstName,
          otp,
        }),
      };
    }

    case "send-kyc-review-email": {
      const { firstName } = data as KycReviewEmailProps;
      return {
        subject: "Your KYC Submission Is Under Review",
        template: kycReviewEmailTemplate({
          firstName,
        }),
      };
    }

    case "send-disco-token-email": {
      const { firstName, metertoken } = data as SendDiscoTokenEmailProps;
      return {
        subject: "[Notification] Purchase Successful",
        template: discoTokenEmailTemplate({
          firstName,
          metertoken,
        }),
      };
    }

    case "send-admin-electricity-topup-email": {
      return {
        subject: "[Urgent] Electricity Topup",
        template: electricityTopupNotificationTemplate(),
      };
    }

    case "send-admin-welcome-email": {
      const { firstName, lastName, otp } = data as AdminWelcomeEmailProps;
      return {
        subject: "Welcome to PeerHub Admin",
        template: adminWelcomeEmailTemplate({
          firstName,
          lastName,
          otp,
        }),
      };
    }

    case "send-change-password-email": {
      const { firstName, lastName } = data as ChangePasswordEmailProps;
      return {
        subject: "Password Changed",
        template: changePasswordEmailTemplate({
          firstName,
          lastName,
        }),
      };
    }

    case "send-forgot-password-email": {
      const { firstName, lastName, id, otp } = data as ForgotPasswordEmailProps;
      return {
        subject: "Forgot Password",
        template: forgotPasswordEmailTemplate({
          firstName,
          lastName,
          otp,
          id,
        }),
      };
    }

    case "send-credit-email": {
      const { recipientFirstName, amount, senderName } =
        data as CreditEmailProps;
      return {
        subject: "Credit Alert",
        template: creditEmailTemplate({
          recipientFirstName,
          senderName: senderName,
          amount,
        }),
      };
    }

    case "send-debit-email": {
      const { from, to, amount } = data as DebitEmailProps;
      return {
        subject: "Debit Alert",
        template: debitEmailTemplate({
          from,
          to,
          amount,
        }),
      };
    }

    case "send-admin-invite-email": {
      const { invitedBy, role, id } = data as AdminInviteEmailProps;

      return {
        subject: "Invite to BlowMoney",
        template: adminInviteEmailTemplate({
          role,
          id,
          invitedBy,
        }),
      };
    }

    case "send-admin-account-creation-email": {
      const { firstName, lastName, password, recipientEmail } =
        data as AdminAccountCreationEmailProps;

      return {
        subject: "Welcome to PeerHub",
        template: customerAccountCreationEmailTemplate({
          firstName,
          lastName,
          password,
          emailAddress: recipientEmail,
        }),
      };
    }

    case "send-passcode-reset-email": {
      const { firstName, lastName, otp } = data as ForgotPasscodeEmailProps;
      return {
        subject: "Do Not Disclose",
        template: forgotPasscodeEmailTemplate({
          firstName,
          lastName,
          otp,
        }),
      };
    }

    case "send-transaction-pin-reset-email": {
      const { firstName, lastName, otp } =
        data as ForgotTransactionPinEmailProps;
      return {
        subject: "Do Not Disclose",
        template: forgotTransactionPinEmailTemplate({
          firstName,
          lastName,
          otp,
        }),
      };
    }

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}
