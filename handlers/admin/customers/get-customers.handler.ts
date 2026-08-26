import { NextFunction, Request, Response } from "express";
import {
  getUser,
  sensitiveFields,
  validateUserPermission,
} from "../../../utils/core.utils";
import { AdminRole } from "../../../types/role.types";
import { UserModel } from "../../../models/user.model";
import { HTTPStatus } from "../../../utils/http.utils";
import { APP_NAME } from "../transactions/get-transactions.handler";
import { BlowMoneyClient } from "../../../lib/blowmoney";
import HTTPException from "../../../utils/error.utils";

async function getCustomersForAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getUser(req);
  const { search, app = APP_NAME.BOTH, limit = 10, page = 1 } = req.query;

  // Convert limit and page to numbers
  const pageSize = Number(limit);
  const currentPage = Number(page);

  // Validate pagination parameters
  if (
    isNaN(pageSize) ||
    isNaN(currentPage) ||
    pageSize <= 0 ||
    currentPage <= 0
  ) {
    throw new HTTPException(
      HTTPStatus.BAD_REQUEST,
      "Invalid pagination parameters",
    );
  }

  const query: Record<string, any> = {};

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }

  try {
    const blowmoneyClient = new BlowMoneyClient();

    // allows all admin roles to access this endpoint
    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    let customers: any[] = [];
    let totalCount = 0;

    switch (app) {
      case APP_NAME.BLOWPAY:
        // Get total count for pagination metadata
        totalCount = await UserModel.countDocuments(query);

        // Apply pagination to the query
        const blowpayCustomers = await UserModel.find(query)
          .select(sensitiveFields)
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize);

        // Add app source to each customer
        customers = blowpayCustomers.map((customer) => ({
          ...customer.toJSON(),
          app: APP_NAME.BLOWPAY,
        }));
        break;

      case APP_NAME.BLOWMONEY:
        // Pass pagination parameters to BlowMoney client
        const response = await blowmoneyClient.getUsers({
          ...query,
          limit: pageSize,
          page: currentPage,
        });

        // Add app source to each customer
        customers = response.data.map((customer: any) => ({
          ...customer,
          app: APP_NAME.BLOWMONEY,
        }));

        // Get total count from the BlowMoney response if available
        totalCount = response.totalCount || response.data.length;
        break;

      case APP_NAME.BOTH:
        // Get all customers from both sources first
        const blowpayResponse =
          await UserModel.find(query).select(sensitiveFields);

        // Add app source to blowpay customers
        const allBlowpayCustomers = blowpayResponse.map((customer) => ({
          ...customer.toJSON(),
          app: APP_NAME.BLOWPAY,
        }));

        const blowmoneyResponse = await blowmoneyClient.getUsers(query);

        // Add app source to blowmoney customers
        const allBlowmoneyCustomers = blowmoneyResponse.data.map(
          (customer: any) => ({
            ...customer,
            app: APP_NAME.BLOWMONEY,
          }),
        );

        // Combine and sort all customers
        const allCustomers = [...allBlowpayCustomers, ...allBlowmoneyCustomers];
        allCustomers.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        // Apply pagination after sorting
        totalCount = allCustomers.length;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        customers = allCustomers.slice(startIndex, endIndex);
        break;

      default:
        throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid app name");
    }

    // Pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(HTTPStatus.OK).json({
      message: "Customers fetched successfully",
      data: customers,
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        pageSize,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default getCustomersForAdmin;
