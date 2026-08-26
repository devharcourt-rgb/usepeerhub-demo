import {
  BillOrderDto,
  GetBillerByCategoryDto,
  GetBillerProductsDto,
  GetBillersCategoriesDto,
  GetBillersDto,
  GetSingleBillerDto,
  LintLoginDto,
  LintRegisterDto,
  LintVerifyBvnDto,
  RefreshTokenDto,
} from "./types";

class LintClient {
  static baseUrl = "https://api.lint.finance/api/v1";

  async register(data: LintRegisterDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async login(data: LintLoginDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async verifyBvn(data: LintVerifyBvnDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/bvn/verify/via-dob`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + data.token,
        },
        body: JSON.stringify({
          bvn: data.bvn,
          dob: data.dob,
        }),
      });

      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async getRefreshToken(data: RefreshTokenDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/auth/refresh`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + data.token,
        },
      });

      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async getBillers(data: GetBillersDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/billers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + data.token,
        },
      });
      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async getSingleBiller(data: GetSingleBillerDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/billers/${data.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + data.token,
        },
      });
      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async getBillersCategories(data: GetBillersCategoriesDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/billers/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + data.token,
        },
      });
      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async getBillersByCategory(data: GetBillerByCategoryDto) {
    try {
      const res = await fetch(
        `${LintClient.baseUrl}/billers/category/${data.categoryId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + data.token,
          },
        }
      );
      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async getBillersProducts(data: GetBillerProductsDto) {
    try {
      const res = await fetch(
        `${LintClient.baseUrl}/billers/${data.billerId}/products`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + data.token,
          },
        }
      );
      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async createPinBasedBillOrder(data: BillOrderDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/billers/orders/create`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + data.token,
        },
        body: JSON.stringify({
          customer_id: data.customer_id,
          biller_product_id: data.biller_product_id,
          amount_entered: data.amount_entered,
          product_field_entries: data.product_field_entries,
        }),
      });
      return res.json();
    } catch (error) {
      throw error;
    }
  }

  async createBillOrder(data: BillOrderDto) {
    try {
      const res = await fetch(`${LintClient.baseUrl}/billers/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + data.token,
        },
        body: JSON.stringify({
          customer_id: data.customer_id,
          biller_product_id: data.biller_product_id,
          amount_entered: data.amount_entered,
          product_field_entries: data.product_field_entries,
        }),
      });
      return res.json();
    } catch (error) {
      throw error;
    }
  }
}

export default LintClient;
