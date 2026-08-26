export enum SafulPayWebhookType {
  COLLECTION_COMPLETED = "collection_completed",
  COLLECTION_CREATED = "collection_created",
  DISBURSMENT_CREATED = "disbursement_created",
  DISBURSMENT_COMPLETED = "disbursement_completed",
}

export interface DisbursementCompletedData {
  amount: number;
  completed_at: string; // ISO datetime
  currency: string;
  merchant_code: string;
  order_id: string | null;
  outflow_id: string;
  recipient_name: string;
  recipient_phone: string;
  service_slug: string;
  metadata: {
    order_id: string;
  };
}

export interface CollectionCompletedData {
  amount: number;
  completed_at: string; // ISO datetime
  currency: string;
  customer_name: string;
  customer_phone: string;
  inflow_id: string;
  merchant_code: string;
  metadata: {
    order_id: string;
  };
  service_slug: string;
}

export type SafulPayWebhookEvent =
  | {
      webhook_type: SafulPayWebhookType.DISBURSMENT_COMPLETED;
      data: DisbursementCompletedData;
      timestamp: string;
      webhook_id: string;
    }
  | {
      webhook_type: SafulPayWebhookType.COLLECTION_COMPLETED;
      data: CollectionCompletedData;
      timestamp: string;
      webhook_id: string;
    }
  | {
      webhook_type: SafulPayWebhookType.DISBURSMENT_CREATED;
      data: unknown; // TODO: define when sample payload is available
      timestamp: string;
      webhook_id: string;
    }
  | {
      webhook_type: SafulPayWebhookType.COLLECTION_CREATED;
      data: unknown; // TODO: define when sample payload is available
      timestamp: string;
      webhook_id: string;
    };
