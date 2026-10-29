import { Router } from "express";
import { cancelAppointment, createAppointment, getAppointment, listAppointments, rescheduleAppointment } from "../controllers/appointmentController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(asyncHandler(requireAuth));
router.get("/", asyncHandler(listAppointments));
router.post("/", asyncHandler(createAppointment));
router.get("/:id", asyncHandler(getAppointment));
router.patch("/:id/cancel", asyncHandler(cancelAppointment));
router.patch("/:id/reschedule", asyncHandler(rescheduleAppointment));
export default router;
