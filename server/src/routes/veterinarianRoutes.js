import { Router } from "express";
import { getVeterinarian, listSlots, listVeterinarians } from "../controllers/veterinarianController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(listVeterinarians));
router.get("/:id/slots", asyncHandler(listSlots));
router.get("/:id", asyncHandler(getVeterinarian));
export default router;
