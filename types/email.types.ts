export type EmailType =
  | "send-welcome-email"
  | "send-admin-welcome-email"
  | "send-forgot-password-email"
  | "send-change-password-email"
  | "send-credit-email"
  | "send-debit-email"
  | "send-admin-invite-email"
  | "send-admin-account-creation-email"
  | "send-passcode-reset-email"
  | "send-admin-electricity-topup-email"
  | "send-disco-token-email";

export type EmailProps =
  | WelcomeEmailProps
  | ForgotPasswordEmailProps
  | ChangePasswordEmailProps
  | CreditEmailProps
  | DebitEmailProps
  | AdminInviteEmailProps
  | AdminWelcomeEmailProps
  | AdminAccountCreationEmailProps
  | ForgotPasscodeEmailProps
  | SendAdminElectricityTopupEmailProps
  | SendDiscoTokenEmailProps;

export interface WelcomeEmailProps {
  firstName: string;
  lastName: string;
  otp: string;
  recipientEmail: string;
}

export interface SendDiscoTokenEmailProps {
  firstName: string;
  metertoken: string;
  recipientEmail: string;
}

export interface SendAdminElectricityTopupEmailProps {
  recipientEmail: string;
}

export interface ForgotPasscodeEmailProps {
  firstName: string;
  lastName: string;
  otp: string;
  recipientEmail: string;
}

export interface AdminAccountCreationEmailProps {
  firstName: string;
  lastName: string;
  password: string;
  recipientEmail: string;
}

export interface AdminWelcomeEmailProps {
  firstName: string;
  lastName: string;
  otp: string;
  recipientEmail: string;
}

export interface AdminInviteEmailProps {
  invitedBy: string;
  role: string;
  id: string;
  recipientEmail: string;
}

export interface CreditEmailProps {
  recipientFirstName: string;
  senderName: string;
  amount: string;
  recipientEmail: string;
}

export interface DebitEmailProps {
  from: string;
  to: string;
  amount: string;
  recipientEmail: string;
}

export interface ChangePasswordEmailProps {
  firstName: string;
  lastName: string;
  recipientEmail: string;
}

export interface ForgotPasswordEmailProps {
  firstName: string;
  lastName: string;
  otp: string;
  id: string;
  recipientEmail: string;
}
