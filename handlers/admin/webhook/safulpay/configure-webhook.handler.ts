import { NextFunction, Request, Response } from "express";
import { SafulPayClient } from "../../../../lib/safulpay";
import HTTPException from "../../../../utils/error.utils";
import { HTTPStatus } from "../../../../utils/http.utils";
import { SafulPayConfigureWebhookResponse } from "../../../../lib/safulpay/interface";

async function configureSafulPayWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { url } = req.body;
  const safulPayClient = new SafulPayClient();

  try {
    const response = await safulPayClient.configureWebhook({
      webhook_url: url,
      webhook_secret:
        process.env.SAFUL_PAY_WEBHOOK_SECRET || "defaultweb__hook-secret",
    });

    const { success, message, data } =
      response as SafulPayConfigureWebhookResponse;

    if (success !== true) {
      throw new HTTPException(HTTPStatus.BAD_GATEWAY, message);
    }

    return res.json({
      message: "Webhook configured",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export default configureSafulPayWebhook;
