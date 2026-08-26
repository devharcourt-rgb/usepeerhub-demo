import { NextFunction, Request, Response } from "express";
import { getUser, validateUserPermission } from "../../../utils/core.utils";
import { KycModel } from "../../../models/kyc.model";
import { AdminRole } from "../../../types/role.types";
import getAllKycPipeline from "./pipelines/get-all-kyc";
import { APP_NAME } from "../transactions/get-transactions.handler";
import { BlowMoneyClient } from "../../../lib/blowmoney";
import HTTPException from "../../../utils/error.utils";
import { HTTPStatus } from "../../../utils/http.utils";

async function getAllKycHandlerForAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = getUser(req);
  const { page = 1, limit = 10, search, app = APP_NAME.BOTH } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  try {
    const blowmoneyClient = new BlowMoneyClient();

    // allow all admins to get all kyc data
    await validateUserPermission({
      userId,
      levels: Object.values(AdminRole),
    });

    let kycDocuments;

    const aggregation = await getAllKycPipeline({
      skip,
      limit: Number(limit),
      search: search as string,
    });

    switch (app) {
      case APP_NAME.BLOWPAY:
        kycDocuments = await KycModel.aggregate(aggregation);
        break;

      case APP_NAME.BLOWMONEY:
        const response = await blowmoneyClient.getAllKycs({
          page,
          limit,
          search,
          skip,
        });

        kycDocuments = response.data;
        break;

      case APP_NAME.BOTH:
        const blowpayResponse = await KycModel.aggregate(aggregation);

        const blowmoneyResponse = await blowmoneyClient.getAllKycs({
          page,
          limit,
          skip,
          search,
        });

        kycDocuments = [...blowpayResponse, ...blowmoneyResponse.data];

        // order by createdAt in descending order
        kycDocuments.sort((a: any, b: any) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        break;

      default:
        throw new HTTPException(HTTPStatus.BAD_REQUEST, "Invalid app");
    }

    return res.status(200).json({
      message: "Kyc documents fetched",
      data: kycDocuments,
    });
  } catch (error) {
    next(error);
  }
}

export default getAllKycHandlerForAdmin;
