import { Router } from "express";
import rateLimit from "express-rate-limit";
import { changePassword, login, logout, me, register, updateProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: "Too many sign-in attempts. Try again shortly." } });
router.post("/register", loginLimit, asyncHandler(register));
router.post("/login", loginLimit, asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", asyncHandler(requireAuth), asyncHandler(me));
router.patch("/profile", asyncHandler(requireAuth), asyncHandler(updateProfile));
router.patch("/change-password", asyncHandler(requireAuth), asyncHandler(changePassword));
export default router;
