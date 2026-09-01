import dotenv from "dotenv";
import { Mutex } from "async-mutex";
import redisConnection from "../../config/redis";
import {
  BankAccountLookupDTO,
  BankTransferDTO,
  CreateVirtualAccountDTO,
  NombaBank,
  NombaBankAccount,
  NombaTransfer,
  NombaCachedToken,
  NombaConfig,
  NombaRequestOptions,
  NombaTokenResponse,
  NombaVirtualAccount,
} from "./interface";

dotenv.config();

/** Error thrown for any non-2xx reply, or a 2xx envelope whose `code` is not "00". */
export class NombaApiError extends Error {
  status: number;
  /** Nomba's business code, e.g. "00" for success. */
  code?: string;
  description?: string;
  body?: unknown;

  constructor(
    message: string,
    status: number,
    options: { code?: string; description?: string; body?: unknown } = {},
  ) {
    super(message);
    this.name = "NombaApiError";
    this.status = status;
    this.code = options.code;
    this.description = options.description;
    this.body = options.body;
  }
}

const DEFAULT_BASE_URL = "https://api.nomba.com/v1";
const DEFAULT_EXPIRY_LEEWAY_SECONDS = 60;
const TOKEN_CACHE_KEY = "nomba:auth:access-token";

/**
 * Envelope codes that are not failures. Most endpoints answer "00"; the v2
 * transfer endpoints answer "200" on success and "201" when the transfer is
 * accepted but still pending.
 */
const SUCCESS_CODES = new Set(["00", "200", "201"]);

/**
 * Thin authenticated client for the Nomba API.
 *
 * It issues a client-credentials access token on first use, caches it in
 * memory and in Redis until shortly before it expires, and attaches it to
 * every request. A 401 is retried once with a freshly issued token, so callers
 * never deal with the token lifecycle themselves.
 *
 * @see https://developer.nomba.com/docs/getting-started/authentication
 *
 * @example
 * ```ts
 * import nomba from "../../lib/nomba";
 *
 * const accounts = await nomba.get("/accounts/virtual", {
 *   query: { limit: 20 },
 * });
 * ```
 */
export class NombaClient {
  private config: NombaConfig;
  private token: NombaCachedToken | null = null;
  private tokenMutex = new Mutex();

  constructor(config: Partial<NombaConfig> = {}) {
    this.config = {
      clientId: config.clientId ?? (process.env.NOMBA_CLIENT_ID as string),
      clientSecret:
        config.clientSecret ?? (process.env.NOMBA_CLIENT_SECRET as string),
      accountId: config.accountId ?? (process.env.NOMBA_ACCOUNT_ID as string),
      baseUrl: (
        config.baseUrl ??
        process.env.NOMBA_API_URL ??
        DEFAULT_BASE_URL
      ).replace(/\/+$/, ""),
      expiryLeewaySeconds:
        config.expiryLeewaySeconds ?? DEFAULT_EXPIRY_LEEWAY_SECONDS,
    };
  }

  private assertConfigured() {
    const missing = (["clientId", "clientSecret", "accountId"] as const).filter(
      (key) => !this.config[key],
    );

    if (missing.length) {
      const envNames = {
        clientId: "NOMBA_CLIENT_ID",
        clientSecret: "NOMBA_CLIENT_SECRET",
        accountId: "NOMBA_ACCOUNT_ID",
      };
      throw new Error(
        `Nomba is not configured: missing ${missing
          .map((key) => envNames[key])
          .join(", ")}`,
      );
    }
  }

  private isFresh(token: NombaCachedToken | null): token is NombaCachedToken {
    if (!token) return false;
    const leeway = (this.config.expiryLeewaySeconds ?? 0) * 1000;
    return token.expiresAt - leeway > Date.now();
  }

  private async readCachedToken(): Promise<NombaCachedToken | null> {
    try {
      const cached = await redisConnection.get(TOKEN_CACHE_KEY);
      return cached ? (JSON.parse(cached) as NombaCachedToken) : null;
    } catch (error) {
      // A cache failure must never take the request down; issue a token instead.
      console.error("Failed to read cached Nomba token:", error);
      return null;
    }
  }

  private async writeCachedToken(token: NombaCachedToken): Promise<void> {
    const ttl = Math.floor(
      (token.expiresAt - Date.now()) / 1000 -
        (this.config.expiryLeewaySeconds ?? 0),
    );
    if (ttl <= 0) return;

    try {
      await redisConnection.set(
        TOKEN_CACHE_KEY,
        JSON.stringify(token),
        "EX",
        ttl,
      );
    } catch (error) {
      console.error("Failed to cache Nomba token:", error);
    }
  }

  /**
   * Exchanges the client credentials for a fresh access token.
   *
   * @see https://developer.nomba.com/docs/getting-started/authentication
   */
  private async issueToken(): Promise<NombaCachedToken> {
    const path = "/auth/token/issue";

    const res = await this.rawRequest(path, {
      method: "POST",
      skipAuth: true,
      body: {
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      },
    });

    const payload = (await this.parse(res, path)) as
      NombaTokenResponse | undefined;
    const data = payload?.data;

    if (!data?.access_token) {
      throw new NombaApiError(
        "Nomba token response did not contain an access token",
        res.status,
        {
          code: payload?.code,
          description: payload?.description,
          body: payload,
        },
      );
    }

    const expiresAt = Date.parse(data.expiresAt);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      // Tokens live 30 minutes; only fall back to that when `expiresAt` is
      // missing or unparseable.
      expiresAt: Number.isNaN(expiresAt)
        ? Date.now() + 30 * 60 * 1000
        : expiresAt,
    };
  }

  /**
   * Returns a valid access token, issuing one only when the cached token is
   * missing or about to expire. Concurrent callers share a single issuance.
   *
   * @param forceRefresh - Ignore both caches and issue a new token.
   */
  async getAccessToken(forceRefresh = false): Promise<string> {
    this.assertConfigured();

    if (!forceRefresh && this.isFresh(this.token)) {
      return this.token.accessToken;
    }

    return this.tokenMutex.runExclusive(async () => {
      // Another caller may have refreshed while we waited on the lock.
      if (!forceRefresh && this.isFresh(this.token)) {
        return this.token.accessToken;
      }

      if (!forceRefresh) {
        const cached = await this.readCachedToken();
        if (this.isFresh(cached)) {
          this.token = cached;
          return cached.accessToken;
        }
      }

      const token = await this.issueToken();
      this.token = token;
      await this.writeCachedToken(token);
      return token.accessToken;
    });
  }

  /** Drops the cached token so the next request issues a new one. */
  async clearToken(): Promise<void> {
    this.token = null;
    try {
      await redisConnection.del(TOKEN_CACHE_KEY);
    } catch (error) {
      console.error("Failed to clear cached Nomba token:", error);
    }
  }

  /**
   * Resolves a path against the configured base URL. A path that carries its
   * own API version (`/v2/transfers/bank`) is resolved against the API root
   * instead, since Nomba splits endpoints across versions.
   */
  private buildUrl(path: string, query?: NombaRequestOptions["query"]): string {
    const relative = path.replace(/^\/+/, "");
    const base = /^v\d+\//.test(relative)
      ? this.config.baseUrl.replace(/\/v\d+$/, "")
      : this.config.baseUrl;

    const url = new URL(`${base}/${relative}`);

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }

    return url.toString();
  }

  private async rawRequest(
    path: string,
    options: NombaRequestOptions,
  ): Promise<Response> {
    const { method = "GET", body, query, headers, signal, skipAuth } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      accountId: this.config.accountId,
      ...headers,
    };

    if (!skipAuth) {
      requestHeaders.Authorization = `Bearer ${await this.getAccessToken()}`;
    }

    return fetch(this.buildUrl(path, query), {
      method,
      headers: requestHeaders,
      signal,
      body:
        body === undefined
          ? undefined
          : typeof body === "string"
            ? body
            : JSON.stringify(body),
    });
  }

  /** Parses the JSON envelope and turns any failure into a `NombaApiError`. */
  private async parse(res: Response, path: string): Promise<unknown> {
    const text = await res.text();

    let payload: any;
    try {
      payload = text ? JSON.parse(text) : undefined;
    } catch {
      payload = text;
    }

    if (!res.ok) {
      throw new NombaApiError(
        `Nomba ${path} failed (${res.status}): ${
          payload?.description ?? payload?.message ?? res.statusText
        }`,
        res.status,
        {
          code: payload?.code,
          description: payload?.description,
          body: payload,
        },
      );
    }

    // Nomba signals business failures with a non-success code on a 2xx response.
    if (
      payload &&
      typeof payload === "object" &&
      "code" in payload &&
      !SUCCESS_CODES.has(String(payload.code))
    ) {
      throw new NombaApiError(
        `Nomba ${path} failed (${payload.code}): ${
          payload.description ?? "unknown error"
        }`,
        res.status,
        {
          code: payload.code,
          description: payload.description,
          body: payload,
        },
      );
    }

    return payload;
  }

  /** Sends the request, retrying once with a new token if the token was rejected. */
  private async send(
    path: string,
    options: NombaRequestOptions,
  ): Promise<unknown> {
    let res = await this.rawRequest(path, options);

    // Covers a token revoked or expired earlier than its `expiresAt` claimed.
    if (res.status === 401 && !options.skipAuth) {
      await this.clearToken();
      await this.getAccessToken(true);
      res = await this.rawRequest(path, options);
    }

    return this.parse(res, path);
  }

  /**
   * Performs an authenticated request and returns the `data` field of the
   * response envelope.
   *
   * @param path - Path relative to the API base, e.g. `/accounts/virtual`.
   * @param options - Method, body, query string and extra headers.
   * @returns The unwrapped `data` payload.
   * @throws {NombaApiError} When Nomba replies with a non-2xx status or a
   * non-"00" code.
   *
   * @example
   * ```ts
   * const order = await nomba.request<OrderResponse>("/checkout/order", {
   *   method: "POST",
   *   body: { order: { amount: 5000, currency: "NGN" } },
   * });
   * ```
   */
  async request<T = unknown>(
    path: string,
    options: NombaRequestOptions = {},
  ): Promise<T> {
    const payload = await this.send(path, options);

    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: T }).data;
    }

    return payload as T;
  }

  /**
   * Same as {@link NombaClient.request} but returns the full
   * `{ code, description, data }` envelope.
   */
  async requestRaw<T = unknown>(
    path: string,
    options: NombaRequestOptions = {},
  ): Promise<T> {
    return (await this.send(path, options)) as T;
  }

  get<T = unknown>(
    path: string,
    options: Omit<NombaRequestOptions, "method" | "body"> = {},
  ) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T = unknown>(
    path: string,
    body?: unknown,
    options: Omit<NombaRequestOptions, "method" | "body"> = {},
  ) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T = unknown>(
    path: string,
    body?: unknown,
    options: Omit<NombaRequestOptions, "method" | "body"> = {},
  ) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T = unknown>(
    path: string,
    body?: unknown,
    options: Omit<NombaRequestOptions, "method" | "body"> = {},
  ) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T = unknown>(
    path: string,
    options: Omit<NombaRequestOptions, "method" | "body"> = {},
  ) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /* ----------------------------- Virtual accounts ---------------------------- */

  /**
   * Creates a virtual account that funds can be paid into on behalf of a
   * customer.
   *
   * `accountRef` must be unique per account — reusing one is rejected by Nomba,
   * so derive it from something stable on your side (the customer id, say).
   *
   * @param payload - Account reference, name and optional BVN/expiry/amount.
   * @returns The created account, including the bank account number to show the
   * customer.
   * @throws {NombaApiError} When Nomba rejects the request.
   *
   * @see https://developer.nomba.com/nomba-api-reference/virtual-accounts/create-virtual-account
   *
   * @example
   * ```ts
   * const account = await nomba.createVirtualAccount({
   *   accountRef: `peerhub-${customer._id}`,
   *   accountName: "Daniel Scorsese",
   *   bvn: "12345678901",
   * });
   *
   * console.log(account.bankAccountNumber, account.bankName);
   * ```
   */
  async createVirtualAccount(
    payload: CreateVirtualAccountDTO,
  ): Promise<NombaVirtualAccount> {
    // Nomba enforces these lengths; failing here gives a clearer error than a 400.
    if (payload.accountRef.length < 16 || payload.accountRef.length > 64) {
      throw new Error(
        `Nomba accountRef must be 16-64 characters, got ${payload.accountRef.length}`,
      );
    }

    if (payload.accountName.length < 8 || payload.accountName.length > 64) {
      throw new Error(
        `Nomba accountName must be 8-64 characters, got ${payload.accountName.length}`,
      );
    }

    return this.post<NombaVirtualAccount>("/accounts/virtual", payload);
  }

  /* -------------------------------- Transfers -------------------------------- */

  /**
   * Fetches the banks Nomba can transfer to, with the codes the lookup and
   * transfer endpoints expect.
   *
   * @returns Every supported bank, each with its `code`, `name`, `nipCode` and
   * `logo`.
   * @throws {NombaApiError} When Nomba rejects the request.
   *
   * @see https://developer.nomba.com/nomba-api-reference/transfers/fetch-bank-codes-and-names
   *
   * @example
   * ```ts
   * const banks = await nomba.getBanks();
   * const gtb = banks.find((bank) => bank.name === "GTBank");
   * ```
   */
  async getBanks(): Promise<NombaBank[]> {
    return this.get<NombaBank[]>("/transfers/banks");
  }

  /**
   * Resolves an account number to the name it is held under, so a transfer can
   * be confirmed with the user before it is sent.
   *
   * @param payload - The 10-digit account number and a bank code from
   * {@link NombaClient.getBanks}.
   * @returns The account number and the resolved account name.
   * @throws {NombaApiError} When the account cannot be resolved.
   *
   * @see https://developer.nomba.com/nomba-api-reference/transfers/perform-bank-account-lookup
   *
   * @example
   * ```ts
   * const account = await nomba.lookupBankAccount({
   *   accountNumber: "0554772814",
   *   bankCode: "058",
   * });
   *
   * console.log(account.accountName); // "M.A Animashaun"
   * ```
   */
  async lookupBankAccount(
    payload: BankAccountLookupDTO,
  ): Promise<NombaBankAccount> {
    // Nomba requires exactly 10 digits; catching it here saves a round trip.
    if (!/^\d{10}$/.test(payload.accountNumber)) {
      throw new Error(
        `Nomba accountNumber must be 10 digits, got "${payload.accountNumber}"`,
      );
    }

    if (!payload.bankCode) {
      throw new Error("Nomba bankCode is required for a bank account lookup");
    }

    return this.post<NombaBankAccount>("/transfers/bank/lookup", payload);
  }

  /**
   * Sends money from the parent account to a bank account.
   *
   * `merchantTxRef` is the idempotency key: generate one per transfer, persist
   * it before calling, and reuse the *same* ref if you ever resend, so a retry
   * cannot double-spend.
   *
   * A returned status of `PENDING_BILLING` means the transfer was accepted but
   * is not final — record it as pending and wait for the webhook. Do not retry
   * it. A failed transfer settles as `REFUND`, with the parent account
   * automatically refunded.
   *
   * @param payload - Amount, destination account, bank code and unique ref.
   * @returns The transfer, including its `id` and {@link NombaTransferStatus}.
   * @throws {NombaApiError} When Nomba rejects the transfer outright. An error
   * here means Nomba did not accept it; a transfer that was accepted and later
   * failed comes back as `REFUND` instead.
   *
   * @see https://developer.nomba.com/nomba-api-reference/transfers/perform-bank-account-transfer-from-the-parent-account
   *
   * @example
   * ```ts
   * const recipient = await nomba.lookupBankAccount({
   *   accountNumber: "0554772814",
   *   bankCode: "058",
   * });
   *
   * const transfer = await nomba.transferToBank({
   *   amount: 5000,
   *   accountNumber: recipient.accountNumber,
   *   accountName: recipient.accountName,
   *   bankCode: "058",
   *   merchantTxRef: payout.reference,
   *   narration: "Peerhub payout",
   * });
   *
   * if (transfer.status === "PENDING_BILLING") {
   *   // Settle from the webhook, never by retrying.
   * }
   * ```
   */
  async transferToBank(payload: BankTransferDTO): Promise<NombaTransfer> {
    if (!/^\d{10}$/.test(payload.accountNumber)) {
      throw new Error(
        `Nomba accountNumber must be 10 digits, got "${payload.accountNumber}"`,
      );
    }

    if (!(payload.amount > 0)) {
      throw new Error(
        `Nomba transfer amount must be greater than 0, got ${payload.amount}`,
      );
    }

    if (!payload.merchantTxRef) {
      throw new Error(
        "Nomba merchantTxRef is required; it is the idempotency key for the transfer",
      );
    }

    if (!payload.bankCode) {
      throw new Error("Nomba bankCode is required for a transfer");
    }

    // Lives on v2 while the rest of the client is on v1.
    return this.post<NombaTransfer>("/v2/transfers/bank", payload);
  }
}

/** Shared client configured from the environment. */
export const nomba = new NombaClient();

export default nomba;
