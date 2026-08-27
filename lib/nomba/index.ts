import { isProduction } from "../../utils/core.utils";
import {
  AirtimePurchaseDto,
  AirtimePurchaseResponse,
  ApiResponse,
  ApiResponseWithMessage,
  Bank,
  BankAccountLookupDto,
  BankAccountLookupResponse,
  BankTransferDto,
  BankTransferResponse,
  BettingPaymentDto,
  BettingPaymentResponse,
  BettingProvider,
  BettingProvidersResponse,
  CableTvProduct,
  CableTvSubscriptionDto,
  CableTvSubscriptionResponse,
  CableTvType,
  CreateVirtualAccountDto,
  DataBundlePurchaseDto,
  DataBundlePurchaseResponse,
  DataPlan,
  ElectricityDisco,
  ElectricityPaymentDto,
  ElectricityPaymentResponse,
  Telco,
  TokenResponse,
  VirtualAccountDetailsResponse,
  WalletTransferDto,
  WalletTransferResponse,
} from "./type";

export class NombaClient {
  private static baseUrl =
    process.env.NOMBA_API_URL ??
    (isProduction ? "https://api.nomba.com/v1" : "https://sandbox.nomba.com/v1");

  // The wallet transfer endpoint lives under /v2 while everything else is
  // still /v1 — derive it from baseUrl rather than adding a second env var.
  private static get baseUrlV2(): string {
    return NombaClient.baseUrl.replace(/\/v1$/, "/v2");
  }

  // Token cache is static so it's shared across every NombaClient
  // instance — avoids re-authenticating on every call site.
  private static cachedToken: string | null = null;
  private static cachedRefreshToken: string | null = null;
  private static tokenExpiresAt: number | null = null; // epoch ms
  private static pendingLogin: Promise<string> | null = null;

  // Refresh slightly before actual expiry so a token doesn't die mid-request.
  private static readonly TOKEN_EXPIRY_BUFFER_MS = 30_000;

  private static get accountId(): string {
    const accountId = process.env.NOMBA_ACCOUNT_ID;

    if (!accountId) {
      throw new Error("NOMBA_ACCOUNT_ID is missing from environment variables");
    }

    return accountId;
  }

  private async login(): Promise<ApiResponse<TokenResponse>> {
    const clientId = process.env.NOMBA_CLIENT_ID;
    const clientSecret = process.env.NOMBA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        "NOMBA_CLIENT_ID or NOMBA_CLIENT_SECRET is missing from environment variables",
      );
    }

    const response = await fetch(`${NombaClient.baseUrl}/auth/token/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accountId: NombaClient.accountId,
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const apiResponse: ApiResponse<TokenResponse> = await response.json();

    if (!response.ok) {
      throw new Error(
        `Nomba login failed: ${apiResponse.description ?? response.statusText}`,
      );
    }

    return apiResponse;
  }

  /**
   * Exchanges the cached refresh token for a new access token. Cheaper than
   * a full login(), so getAccessToken() prefers this when a refresh token
   * is available.
   */
  private async refresh(): Promise<ApiResponse<TokenResponse>> {
    const response = await fetch(`${NombaClient.baseUrl}/auth/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accountId: NombaClient.accountId,
        Authorization: `Bearer ${NombaClient.cachedToken}`,
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: NombaClient.cachedRefreshToken,
      }),
    });

    const apiResponse: ApiResponse<TokenResponse> = await response.json();

    if (!response.ok) {
      throw new Error(
        `Nomba token refresh failed: ${apiResponse.description ?? response.statusText}`,
      );
    }

    return apiResponse;
  }

  private static cacheTokenResponse(apiResponse: ApiResponse<TokenResponse>): string {
    const { access_token, refresh_token, expiresAt } = apiResponse.data;

    NombaClient.cachedToken = access_token;
    NombaClient.cachedRefreshToken = refresh_token;
    NombaClient.tokenExpiresAt =
      new Date(expiresAt).getTime() - NombaClient.TOKEN_EXPIRY_BUFFER_MS;

    return access_token;
  }

  /**
   * Returns a valid, cached access token — only hits the network when
   * missing or near expiry, preferring a cheap refresh() over a full
   * login() when a refresh token is on hand. Concurrent callers share
   * one in-flight request instead of firing duplicates.
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (
      NombaClient.cachedToken &&
      NombaClient.tokenExpiresAt &&
      now < NombaClient.tokenExpiresAt
    ) {
      return NombaClient.cachedToken;
    }

    if (!NombaClient.pendingLogin) {
      const reauthenticate = NombaClient.cachedRefreshToken
        ? this.refresh().catch(() => this.login())
        : this.login();

      NombaClient.pendingLogin = reauthenticate
        .then((apiResponse) => NombaClient.cacheTokenResponse(apiResponse))
        .finally(() => {
          NombaClient.pendingLogin = null;
        });
    }

    return NombaClient.pendingLogin;
  }

  private async authorizedFetch<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        accountId: NombaClient.accountId,
        ...options.headers,
      },
    });

    const apiResponse: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(
        `Nomba request failed [${response.status}]: ${apiResponse.description ?? response.statusText}`,
      );
    }

    return apiResponse;
  }

  async createVirtualAccount(
    data: CreateVirtualAccountDto,
  ): Promise<ApiResponse<VirtualAccountDetailsResponse>> {
    return this.authorizedFetch<VirtualAccountDetailsResponse>(
      `${NombaClient.baseUrl}/accounts/virtual`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async fetchVirtualAccount(
    identifier: string,
  ): Promise<ApiResponse<VirtualAccountDetailsResponse>> {
    return this.authorizedFetch<VirtualAccountDetailsResponse>(
      `${NombaClient.baseUrl}/accounts/virtual/${identifier}`,
      { method: "GET" },
    );
  }

  /** Bank codes rarely change — callers should cache this response. */
  async fetchBanks(): Promise<ApiResponse<Bank[]>> {
    return this.authorizedFetch<Bank[]>(`${NombaClient.baseUrl}/transfers/banks`, {
      method: "GET",
    });
  }

  async lookupBankAccount(
    data: BankAccountLookupDto,
  ): Promise<ApiResponse<BankAccountLookupResponse>> {
    return this.authorizedFetch<BankAccountLookupResponse>(
      `${NombaClient.baseUrl}/transfers/bank/lookup`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  /**
   * Transfers from the parent account to an external Nigerian bank account.
   * Returns synchronously with data.status of SUCCESS or PENDING_BILLING —
   * for the latter, the final outcome arrives via webhook.
   */
  async transferToBankAccount(
    data: BankTransferDto,
  ): Promise<BankTransferResponse> {
    // This envelope carries an extra `message` and top-level `status`
    // boolean beyond the usual code/description/data — authorizedFetch
    // only types the latter three, so we widen the result here.
    return this.authorizedFetch<BankTransferResponse["data"]>(
      `${NombaClient.baseUrlV2}/transfers/bank`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ) as Promise<BankTransferResponse>;
  }

  /**
   * Transfers from the parent account to another Nomba wallet. Bypasses
   * external processors, so this settles near-instantly and returns
   * synchronously with data.status === "SUCCESS" rather than a pending
   * state you'd need to poll.
   */
  async performWalletTransfer(
    data: WalletTransferDto,
  ): Promise<ApiResponse<WalletTransferResponse>> {
    return this.authorizedFetch<WalletTransferResponse>(
      `${NombaClient.baseUrlV2}/transfers/wallet`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async fetchDataPlans(telco: Telco): Promise<ApiResponse<DataPlan[]>> {
    return this.authorizedFetch<DataPlan[]>(
      `${NombaClient.baseUrl}/bill/data-plan/${telco}`,
      { method: "GET" },
    );
  }

  async purchaseAirtime(
    data: AirtimePurchaseDto,
  ): Promise<ApiResponse<AirtimePurchaseResponse>> {
    return this.authorizedFetch<AirtimePurchaseResponse>(
      `${NombaClient.baseUrl}/bill/topup`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async purchaseDataBundle(
    data: DataBundlePurchaseDto,
  ): Promise<ApiResponse<DataBundlePurchaseResponse>> {
    return this.authorizedFetch<DataBundlePurchaseResponse>(
      `${NombaClient.baseUrl}/bill/data`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async fetchElectricityDiscos(): Promise<ApiResponse<ElectricityDisco[]>> {
    return this.authorizedFetch<ElectricityDisco[]>(
      `${NombaClient.baseUrl}/bill/electricity/discos`,
      { method: "GET" },
    );
  }

  async payElectricityBill(
    data: ElectricityPaymentDto,
  ): Promise<ApiResponse<ElectricityPaymentResponse>> {
    return this.authorizedFetch<ElectricityPaymentResponse>(
      `${NombaClient.baseUrl}/bill/electricity`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  /** Cable TV packages/prices for a provider — cache on the client, these rarely change. */
  async fetchCableTvProducts(
    cableTvType: CableTvType,
  ): Promise<ApiResponse<CableTvProduct[]>> {
    const query = new URLSearchParams({ cableTvType });

    return this.authorizedFetch<CableTvProduct[]>(
      `${NombaClient.baseUrl}/bill/cableTvProduct?${query}`,
      { method: "GET" },
    );
  }

  async subscribeCableTv(
    data: CableTvSubscriptionDto,
  ): Promise<ApiResponse<CableTvSubscriptionResponse>> {
    return this.authorizedFetch<CableTvSubscriptionResponse>(
      `${NombaClient.baseUrl}/bill/cabletv`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  /** Resolves a cable TV smart card / IUC number to the customer's name. */
  async lookupCableTvCustomer(
    customerId: string,
    cableTvType: CableTvType,
  ): Promise<ApiResponse<string>> {
    const query = new URLSearchParams({ customerId, cableTvType });

    return this.authorizedFetch<string>(
      `${NombaClient.baseUrl}/bill/cabletv/lookup?${query}`,
      { method: "GET" },
    );
  }

  /** Resolves an electricity meter/customer number to the customer's name. */
  async lookupElectricityCustomer(
    disco: string,
    customerId: string,
  ): Promise<ApiResponse<string>> {
    const query = new URLSearchParams({ disco, customerId });

    return this.authorizedFetch<string>(
      `${NombaClient.baseUrl}/bill/electricity/lookup?${query}`,
      { method: "GET" },
    );
  }

  async fetchBettingProviders(): Promise<BettingProvidersResponse> {
    // This envelope carries an extra `message` field beyond the usual
    // code/description/data — authorizedFetch only types the latter three,
    // so we widen the result to the fuller response shape here.
    return this.authorizedFetch<BettingProvider[]>(
      `${NombaClient.baseUrl}/bill/betting/providers`,
      { method: "GET" },
    ) as Promise<BettingProvidersResponse>;
  }

  /** Resolves a betting account customer ID to the customer's name. */
  async lookupBettingCustomer(
    providerId: string,
    customerId: string,
  ): Promise<ApiResponseWithMessage<string>> {
    const query = new URLSearchParams({ providerId, customerId });

    return this.authorizedFetch<string>(
      `${NombaClient.baseUrl}/bill/betting/lookup?${query}`,
      { method: "GET" },
    ) as Promise<ApiResponseWithMessage<string>>;
  }

  async payBettingBill(
    data: BettingPaymentDto,
  ): Promise<ApiResponse<BettingPaymentResponse>> {
    return this.authorizedFetch<BettingPaymentResponse>(
      `${NombaClient.baseUrl}/bill/betting`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }
}
