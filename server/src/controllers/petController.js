import Pet from "../models/Pet.js";
import Appointment from "../models/Appointment.js";
import { cleanText, fail, isObjectId } from "../utils/http.js";
import { isDateKey } from "../utils/slots.js";

const species = ["Dog", "Cat", "Bird", "Rabbit", "Other"];
const genders = ["Male", "Female", "Unknown"];

function petData(body) {
  if (!species.includes(body.species) || !genders.includes(body.gender || "Unknown")) fail(400, "Choose a valid species and gender.");
  const name = cleanText(body.name, 60);
  if (!name) fail(400, "Pet name is required.");
  let dateOfBirth = null;
  if (body.dateOfBirth) {
    if (!isDateKey(body.dateOfBirth)) fail(400, "Date of birth must be a valid date in the past.");
    dateOfBirth = new Date(`${body.dateOfBirth}T00:00:00.000Z`);
    if (dateOfBirth > new Date()) fail(400, "Date of birth must be a valid date in the past.");
  }
  const weightKg = body.weightKg === "" || body.weightKg == null ? null : Number(body.weightKg);
  if (weightKg !== null && (!Number.isFinite(weightKg) || weightKg < 0 || weightKg > 250)) fail(400, "Weight must be between 0 and 250 kg.");
  const photoUrl = cleanText(body.photoUrl, 500);
  if (photoUrl && !/^https?:\/\//i.test(photoUrl)) fail(400, "Photo URL must start with http:// or https://.");
  return {
    name, species: body.species, gender: body.gender || "Unknown", dateOfBirth, weightKg,
    breed: cleanText(body.breed, 60), notes: cleanText(body.notes, 500), photoUrl
  };
}

export async function listPets(req, res) {
  res.json({ pets: await Pet.find({ owner: req.user.id }).sort({ createdAt: -1 }) });
}

export async function createPet(req, res) {
  res.status(201).json({ pet: await Pet.create({ ...petData(req.body), owner: req.user.id }) });
}

export async function updatePet(req, res) {
  if (!isObjectId(req.params.id)) return fail(400, "Invalid pet ID.");
  const pet = await Pet.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, petData(req.body), { new: true, runValidators: true });
  if (!pet) return fail(404, "Pet not found.");
  res.json({ pet });
}

export async function deletePet(req, res) {
  if (!isObjectId(req.params.id)) return fail(400, "Invalid pet ID.");
  const pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });
  if (!pet) return fail(404, "Pet not found.");
  if (await Appointment.exists({ pet: pet.id, status: { $in: ["Pending", "Confirmed"] } })) {
    return fail(409, "This pet has an upcoming appointment. Cancel or complete it before removing the pet.");
  }
  await pet.deleteOne();
  res.json({ message: "Pet removed." });
}
