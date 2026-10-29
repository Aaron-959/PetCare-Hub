import Veterinarian from "../models/Veterinarian.js";
import { cleanText, fail, isObjectId } from "../utils/http.js";
import { getAvailableSlots } from "../utils/slots.js";

export async function listVeterinarians(req, res) {
  const filter = { active: true };
  if (req.query.specialization) {
    const escaped = String(req.query.specialization).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.specialization = new RegExp(`^${escaped}$`, "i");
  }
  if (req.query.maxFee && Number.isFinite(Number(req.query.maxFee))) filter.consultationFee = { $lte: Number(req.query.maxFee) };
  const veterinarians = await Veterinarian.find(filter).sort({ name: 1 }).limit(100);
  res.json({ veterinarians });
}

export async function getVeterinarian(req, res) {
  if (!isObjectId(req.params.id)) return fail(400, "Invalid veterinarian ID.");
  const veterinarian = await Veterinarian.findOne({ _id: req.params.id, active: true });
  if (!veterinarian) return fail(404, "Veterinarian not found.");
  res.json({ veterinarian });
}

export async function listSlots(req, res) {
  if (!isObjectId(req.params.id)) return fail(400, "Invalid veterinarian ID.");
  const veterinarian = await Veterinarian.findOne({ _id: req.params.id, active: true });
  if (!veterinarian) return fail(404, "Veterinarian not found.");
  const slots = await getAvailableSlots(veterinarian, String(req.query.date || ""));
  if (slots === null) return fail(400, "Date must use YYYY-MM-DD format and be valid.");
  res.json({ date: req.query.date, slots, timeZone: "Asia/Kolkata" });
}

export function veterinarianData(body) {
  const name = cleanText(body.name, 80);
  const specialization = cleanText(body.specialization, 80);
  const experienceYears = Number(body.experienceYears);
  const consultationFee = Number(body.consultationFee);
  if (!name || !specialization || !Number.isFinite(experienceYears) || experienceYears < 0 || experienceYears > 60 || !Number.isFinite(consultationFee) || consultationFee < 0) {
    return fail(400, "Enter a valid name, specialization, experience and consultation fee.");
  }
  if (body.weeklySchedule != null && !Array.isArray(body.weeklySchedule)) {
    return fail(400, "Veterinarian schedule must be a list of working days.");
  }
  const weeklySchedule = Array.isArray(body.weeklySchedule) ? body.weeklySchedule.map(item => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return fail(400, "Each veterinarian schedule entry must include a working day and times.");
    }
    return { dayOfWeek: Number(item.dayOfWeek), startTime: item.startTime, endTime: item.endTime };
  }) : [];
  const scheduledDays = new Set();
  for (const schedule of weeklySchedule) {
    const validTime = value => {
      if (!/^\d{2}:\d{2}$/.test(value || "")) return false;
      const [hour, minute] = value.split(":").map(Number);
      return hour < 24 && minute < 60;
    };
    if (!Number.isInteger(schedule.dayOfWeek) || schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6 || scheduledDays.has(schedule.dayOfWeek) ||
      !validTime(schedule.startTime) || !validTime(schedule.endTime) ||
      schedule.endTime <= schedule.startTime) return fail(400, "Veterinarian schedule contains an invalid day or time.");
    scheduledDays.add(schedule.dayOfWeek);
  }
  if (body.active !== undefined && typeof body.active !== "boolean") {
    return fail(400, "Veterinarian active status must be true or false.");
  }
  const slotDurationMinutes = body.slotDurationMinutes === undefined ? 30 : Number(body.slotDurationMinutes);
  if (!Number.isInteger(slotDurationMinutes) || slotDurationMinutes < 15 || slotDurationMinutes > 120) {
    return fail(400, "Appointment slot duration must be a whole number between 15 and 120 minutes.");
  }
  const photoUrl = cleanText(body.photoUrl, 500);
  if (photoUrl && !/^https?:\/\//i.test(photoUrl)) return fail(400, "Photo URL must start with http:// or https://.");
  return {
    name, specialization, experienceYears, consultationFee,
    bio: cleanText(body.bio, 600), photoUrl, weeklySchedule,
    slotDurationMinutes, active: body.active !== false
  };
}
