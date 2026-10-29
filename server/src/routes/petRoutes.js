import { Router } from "express";
import { createPet, deletePet, listPets, updatePet } from "../controllers/petController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(asyncHandler(requireAuth));
router.get("/", asyncHandler(listPets));
router.post("/", asyncHandler(createPet));
router.patch("/:id", asyncHandler(updatePet));
router.delete("/:id", asyncHandler(deletePet));
export default router;
