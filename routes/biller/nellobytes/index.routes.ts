import { Router } from "express";
const router = Router();

import getElecticityDiscosRoute from "./get-discos.routes";
import validateDiscoCustomerRoute from "./validate-customer.routes";
import createOrderRoute from "./create-order.routes";
import getElectricityTokenRoute from "./get-token.routes";
import getCablesRoute from "./get-cables.routes";
import validateCableRoute from "./validate-cable.routes";
import createCableOrderRoute from "./create-cable-order.routes";
import getBettingCompaniesRoute from "./get-betting-companies.routes";
import fundBettingWalletRoute from "./fund-betting-wallet.routes";
import verifyBettingWalletRoute from "./verify-betting-wallet.routes";

router.use("/nb", getBettingCompaniesRoute);
router.use("/nb", getElecticityDiscosRoute);
router.use("/nb", validateDiscoCustomerRoute);
router.use("/nb", createOrderRoute);
router.use("/nb", getElectricityTokenRoute);
router.use("/nb", validateCableRoute);
router.use("/nb", getCablesRoute);
router.use("/nb", createCableOrderRoute);
router.use("/nb", fundBettingWalletRoute);
router.use("/nb", verifyBettingWalletRoute);

export default router;
