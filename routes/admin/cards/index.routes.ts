import { Router } from "express";

import getAllCardsRoute from "./get-all-cards.routes";
import getCardAnalyticsRoute from "./get-card-analytics.routes";
import getCardRoute from "./get-card.route";
import updateCardRoute from "./update-card.routes";
import activateCardRoute from "./activate-card.routes";
import blockCardRoute from "./block-card.routes";

const router = Router();

router.use(getAllCardsRoute);
router.use(getCardAnalyticsRoute);
router.use(getCardRoute);
router.use(updateCardRoute);
router.use(activateCardRoute);
router.use(blockCardRoute);

export default router;
