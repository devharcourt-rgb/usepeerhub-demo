import { TransactionStatus } from "../types/transaction.types";

export function updateTransaction(value: any) {
  const message = value.message;
  if (message.includes("You are paying below the minimum vend amount")) {
    return {
      status: TransactionStatus.FAILED,
      retry: false,
      TTR: 0,
      reason: "Minimum vend",
    };
  }
  if (message.includes("Electricity purchased successfully")) {
    return {
      status: TransactionStatus.COMPLETED,
      retry: false,
      TTR: 0,
      reason: "Vend Successful",
    };
  }
  if (message.includes("Successful transaction")) {
    return {
      status: TransactionStatus.COMPLETED,
      retry: false,
      TTR: 0,
      reason: "Vend Successful",
    };
  }
  if (message.includes("Possible duplicate transaction")) {
    return {
      status: TransactionStatus.PROCESSING,
      retry: true,
      TTR: 20000,
      reason: "This might be a duplicate, requery to get value",
    };
  }
  if (message.includes("Service unavailable, please try again later")) {
    return {
      status: TransactionStatus.FAILED,
      retry: false,
      TTR: 0,
      reason: "The service is down, no hope",
    };
  }
  if (message.includes("Service unavailable. Please try again later")) {
    return {
      status: TransactionStatus.FAILED,
      retry: false,
      TTR: 0,
      reason: "The service is down, no hope",
    };
  }
  if (message.includes("We received an unexpected response from your service provider")) {
    return {
      status: TransactionStatus.PROCESSING,
      retry: true,
      TTR: 0,
      reason: "The service is down, no hope",
    };
  }
  if (message.includes("Transaction is still in progress")) {
    return {
      status: TransactionStatus.PROCESSING,
      retry: true,
      TTR: 20000,
      reason: "This is a pending, requery to get value",
    };
  }

  if (message.includes("Transaction is still processing. Kindly retry")) {
    return {
      status: TransactionStatus.PROCESSING,
      retry: true,
      TTR: 120000,
      reason: "This is a pending, requery to get value",
    };
  }

  if (message.includes("This account requires maintenance")) {
    return {
      status: TransactionStatus.FAILED,
      retry: false,
      TTR: 0,
      reason:
        "This account requires maintenance. Customer is advised to visit their service provider to resolve.",
    };
  }
  if (message.includes("Request already received")) {
    return {
      status: TransactionStatus.PROCESSING,
      retry: false,
      TTR: 0,
      reason: "Server Didn't Debounce this order, no need for queue",
    };
  }

  if (message.includes("An unexpected error occurred. Please requery")) {
    return {
      status: TransactionStatus.PROCESSING,
      retry: true,
      TTR: 10000,
      reason: "likely time out, we would need to requery",
    };
  }
  if (message.includes("Transaction failed. Refund already processed.")) {
    return {
      status: TransactionStatus.FAILED,
      retry: false,
      TTR: 0,
      reason: "Buypower Paided up back",
    };
  }
  if (message.includes("No transaction found with reference:")) {
    return {
      status: TransactionStatus.FAILED,
      retry: false,
      TTR: 0,
      reason: "Order Didnt go",
    };
  }
  return {
    status: TransactionStatus.PROCESSING,
    retry: true,
    TTR: 10000,
    reason: "Well not I dont know?",
  };
}
