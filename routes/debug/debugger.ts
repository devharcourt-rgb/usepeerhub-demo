import express, { Response } from "express";
import { TransactionModel } from "../../models/transaction.model";

const router = express.Router();

router.get("/", async (req, res: Response, next) => {
  try {
    const result = await TransactionModel.aggregate([
      {
        $setWindowFields: {
          sortBy: { createdAt: 1 },
          output: {
            nextUser: {
              $shift: {
                output: "$user",
                by: 1,
                default: null,
              },
            },
            nextCreatedAt: {
              $shift: {
                output: "$createdAt",
                by: 1,
                default: null,
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$user", "$nextUser"] },
              {
                $lte: [
                  { $abs: { $subtract: ["$createdAt", "$nextCreatedAt"] } },
                  3000,
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          transaction1: "$$ROOT",
          transaction2: {
            _id: "$_id",
            user: "$user",
            createdAt: "$nextCreatedAt",
          },
        },
      },
    ]);

    return res.json({
      message: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
