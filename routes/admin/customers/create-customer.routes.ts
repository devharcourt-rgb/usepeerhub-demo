import { NextFunction, Request, Response, Router } from "express";
import protect from "../../../middlewares/auth";
import { body, validationResult } from "express-validator";
import createCustomerHandlerForAdmin from "../../../handlers/admin/customers/create-customer.handler";

const router = Router();

const validateRequest = () => {
  return [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("emailAddress").isEmail().withMessage("Invalid email address"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];
};

router.post(
  "/create",
  protect,
  validateRequest(),
  createCustomerHandlerForAdmin
);

export default router;
