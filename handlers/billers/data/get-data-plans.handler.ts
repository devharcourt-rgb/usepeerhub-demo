import { NextFunction, Request, Response } from "express";
import { DataService } from "../../../services/data.service";
import { Telco } from "../../../lib/nomba/type";

const dataService = new DataService();

async function getDataPlansHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { telco } = req.params as { telco: Telco };

  try {
    const plans = await dataService.fetchDataPlans(telco);

    return res.json({
      message: "Data plans fetched",
      data: plans,
    });
  } catch (error) {
    next(error);
  }
}

export default getDataPlansHandler;
