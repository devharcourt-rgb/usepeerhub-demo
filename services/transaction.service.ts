import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { transactionReceiptTemplate } from "../templates/transaction-receipt.template";
import logger from "../utils/logger.utils";
import EmailService from "./email.service";
import { resendClient } from "../config/mail";

class TransactionService {
  private emailService: EmailService;
  private resend: any;

  constructor() {
    this.emailService = new EmailService();
    this.resend = resendClient;
  }

  async generateReceipt({
    id,
    amount,
    type,
    status,
    transactionDate,
    currency,
    recipientEmail,
  }: {
    id: string;
    amount: number;
    type: string;
    status: string;
    transactionDate: string;
    currency: string;
    recipientEmail: string;
  }) {
    let browser = null;
    let tempFilePath = null;
    let pdfPath = null;

    try {
      // Launch the browser and open a new blank page
      browser = await puppeteer.launch({
        headless: true,
      });
      const page = await browser.newPage();

      // Get the HTML template as a string
      const htmlTemplate = transactionReceiptTemplate();

      // Replace placeholders with actual transaction data
      const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount / 100);

      const processedHTML = htmlTemplate
        .replace(/{{transactionId}}/g, id)
        .replace(/{{amount}}/g, formattedAmount)
        .replace(/{{type}}/g, type)
        .replace(/{{status}}/g, status)
        .replace(/{{date}}/g, transactionDate)
        .replace(/{{currency}}/g, currency);

      // Create temporary HTML file
      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      tempFilePath = path.join(tempDir, `receipt-${id}.html`);
      fs.writeFileSync(tempFilePath, processedHTML);

      // Load the processed HTML file
      await page.goto(`file://${tempFilePath}`, {
        waitUntil: "networkidle0",
      });

      // Ensure output directory exists
      const outputDir = path.join(process.cwd(), "receipts");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      pdfPath = path.join(outputDir, `${id}.pdf`);

      // Generate PDF
      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "1cm",
          right: "1cm",
          bottom: "1cm",
          left: "1cm",
        },
      });

      logger.info(`PDF receipt generated for transaction ${id} at ${pdfPath}`);

      // Read the PDF file into memory before sending
      const pdfBuffer = fs.readFileSync(pdfPath);

      // Send email with PDF attachment. Resend doesn't throw on a send
      // failure — it resolves with { data: null, error } instead — so this
      // must be checked explicitly, or a failed send here would look
      // identical to a successful one to every caller.
      const { error: sendError } = await this.resend.emails.send({
        to: [recipientEmail],
        from: "PeerHub <support@usepeerhub.com>",
        subject: "Transaction Receipt",
        html: `<p>Please find your transaction receipt attached.</p>`,
        attachments: [
          {
            filename: `${id}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      if (sendError) {
        throw new Error(
          `Resend error (${sendError.name}): ${sendError.message}`,
        );
      }

      logger.info(
        `Receipt email sent to ${recipientEmail} for transaction ${id}`,
      );

      return pdfPath;
    } catch (error: any) {
      logger.error(`Error generating receipt for transaction ${id}:`, error);
      throw new Error(`Failed to generate receipt: ${error.message}`);
    } finally {
      // Cleanup operations - execute regardless of success or failure
      try {
        // Close the browser if it was opened
        if (browser) {
          await browser.close();
          logger.debug(`Browser closed for transaction ${id}`);
        }

        // Delete the temporary HTML file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          logger.debug(`Temporary HTML file deleted for transaction ${id}`);
        }

        // Delete the PDF file after sending the email
        if (pdfPath && fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
          logger.debug(
            `PDF file deleted for transaction ${id} after sending email`,
          );
        }
      } catch (cleanupError: any) {
        // Log cleanup errors but don't throw them
        logger.warn(
          `Error during cleanup for transaction ${id}: ${cleanupError.message}`,
        );
      }
    }
  }
}

export default TransactionService;
