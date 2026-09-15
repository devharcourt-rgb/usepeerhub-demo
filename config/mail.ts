import { Resend } from "resend";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;

/**
 * This document contains two different configs to send emails. Use either one of them
 * 1. resendClient - use resend to send emails
 * 2. transporter - use nodemailer to send emails
 */

// use resend to send emails
export const resendClient = new Resend(resendApiKey);

// use nodemailer to send emails
export const nodemailerClient = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
