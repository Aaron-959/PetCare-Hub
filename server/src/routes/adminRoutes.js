import { Router } from "express";
import { createVeterinarian, dashboard, deactivateVeterinarian, listAdminVeterinarians, setAppointmentStatus, updateVeterinarian } from "../controllers/adminController.js";
import { listAppointments } from "../controllers/appointmentController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(asyncHandler(requireAuth), requireAdmin);
router.get("/dashboard", asyncHandler(dashboard));
router.get("/appointments", asyncHandler(listAppointments));
router.patch("/appointments/:id/status", asyncHandler(setAppointmentStatus));
router.get("/veterinarians", asyncHandler(listAdminVeterinarians));
router.post("/veterinarians", asyncHandler(createVeterinarian));
router.patch("/veterinarians/:id", asyncHandler(updateVeterinarian));
router.patch("/veterinarians/:id/deactivate", asyncHandler(deactivateVeterinarian));
export default router;
