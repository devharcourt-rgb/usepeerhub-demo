import { RedisClient, Worker } from "bullmq";
import { IJob } from "../types/job.types";
import EmailService from "../services/email.service";
import { EmailProps } from "../types/email.types";
import TransactionService from "../services/transaction.service";

// import { updateTransaction } from "../utils/transaction.utils";
// import { TransactionModel } from "../models/transaction.model";
// import BuyPowerClient from "../lib/buypower";
import redisConnection from "../config/redis";
import QueueProducer from "./producer";
import { DEFAULT_REDIS_QUEUE } from "../global/queue";
import { NotificationService } from "../utils/notification.utils";
import {
  CryptoService,
  CRYPTO_CHECK_DELAY_MS,
} from "../services/crypto.service";

const notificationService = NotificationService.getInstance();
const cryptoService = new CryptoService();

const queueProducer = new QueueProducer(redisConnection, DEFAULT_REDIS_QUEUE);
class QueueConsumer {
  emailService: EmailService;
  transactionService: TransactionService;

  constructor(private redisClient: RedisClient) {
    // Bind processJob method to the current instance of QueueConsumer
    this.processJob = this.processJob.bind(this);
    this.emailService = new EmailService();
    this.transactionService = new TransactionService();
  }

  /** Runs the crypto deposit verification state machine and re-queues itself while still unresolved. */
  private async handleVerifyCryptoDeposit(data: { depositId: string }) {
    const { depositId } = data;

    try {
      const { requeue } = await cryptoService.verifyDeposit(depositId);

      if (requeue) {
        await cryptoService.scheduleVerification(
          depositId,
          CRYPTO_CHECK_DELAY_MS,
        );
      }
    } catch (error: any) {
      console.error(
        `Failed to verify crypto deposit ${depositId}:`,
        error.message,
      );
      // Don't let one bad deposit stall forever — try again on the normal cadence.
      await cryptoService.scheduleVerification(
        depositId,
        CRYPTO_CHECK_DELAY_MS,
      );
    }
  }

  async consumeMessage(queueName: string) {
    const worker = new Worker(queueName, this.processJob.bind(this), {
      connection: this.redisClient,
      removeOnComplete: { count: 0 },
      concurrency: 5,
    });

    worker.on("completed", (job) => {
      console.log(`${job.id} has completed!`);
    });

    worker.on("failed", (job: any, err) => {
      console.log(`${job.id} has failed with ${err.message}`);
    });

    console.log("Worker started!");
  }

  async processJob(job: IJob) {
    console.log(`${job.name} going in`);
    try {
      switch (job.name) {
        case "send-welcome-email":
        case "send-admin-welcome-email":
        case "send-forgot-password-email":
        case "send-change-password-email":
        case "send-credit-email":
        case "send-debit-email":
        case "send-admin-invite-email":
        case "send-admin-account-creation-email":
        case "send-passcode-reset-email":
        case "send-transaction-pin-reset-email":
        case "send-admin-electricity-topup-email":
        case "send-disco-token-email":
          console.log("processing email job");

          await this.emailService.sendEmail({
            type: job.name,
            data: job.data as EmailProps,
          });
          break;

        case "generate-receipt":
          await this.transactionService.generateReceipt({
            id: (job.data as any).id,
            amount: (job.data as any).amount,
            currency: (job.data as any).currency,
            transactionDate: (job.data as any).transactionDate,
            type: (job.data as any).type,
            status: (job.data as any).status,
            recipientEmail: (job.data as any).recipient,
          });
          break;
        case "verify-crypto-deposit":
          await this.handleVerifyCryptoDeposit(
            job.data as { depositId: string },
          );
          break;
        default:
          throw new Error("Method not found to run Job");
      }
      return true;
    } catch (err) {
      console.error("Job failed:", err);
      throw err;
    }
  }
}

export default QueueConsumer;
