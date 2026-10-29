import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Veterinarian from "../models/Veterinarian.js";
import { connectDatabase } from "../config/db.js";

const weekdays = [1, 2, 3, 4, 5, 6];
const schedule = weekdays.map(dayOfWeek => ({ dayOfWeek, startTime: "09:00", endTime: "17:00" }));
const doctors = [
  ["Dr. Ananya Rao", "Small Animal Medicine", 9, 650, "Demonstration profile focused on preventive care and lifelong wellness."],
  ["Dr. Kabir Mehta", "Surgery", 12, 900, "Demonstration profile with a focus on safe, compassionate surgical care."],
  ["Dr. Isha Menon", "Dentistry", 7, 550, "Demonstration profile helping pets stay comfortable and healthy."],
  ["Dr. Rohan Shah", "Avian & Exotics", 8, 700, "Demonstration profile for birds and small companion animals."],
  ["Dr. Tara Iyer", "Dermatology", 6, 600, "Demonstration profile for skin, coat and allergy consultations."]
];

try {
  await connectDatabase();
  for (const [name, specialization, experienceYears, consultationFee, bio] of doctors) {
    await Veterinarian.updateOne(
      { name },
      { $set: { specialization, experienceYears, consultationFee, bio, active: true, weeklySchedule: schedule, slotDurationMinutes: 30 } },
      { upsert: true }
    );
  }

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  const email = ADMIN_EMAIL?.trim().toLowerCase();
  let administratorSeeded = false;
  if (email && ADMIN_PASSWORD && ADMIN_PASSWORD.length >= 12) {
    const existing = await User.findOne({ email }).select("+passwordHash");
    if (existing && existing.role !== "admin") {
      console.warn("Administrator seeding skipped: ADMIN_EMAIL belongs to an owner account.");
    } else if (existing) {
      console.log("Existing administrator account left unchanged.");
    } else {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await User.create({ name: ADMIN_NAME || "PetCare Administrator", email, phone: "0000000000", passwordHash, role: "admin" });
      administratorSeeded = true;
    }
  } else if (email || ADMIN_PASSWORD) {
    console.warn("Administrator seeding skipped: configure both ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.");
  }

  console.log(`Seed complete: 5 demonstration veterinarians are ready; administrator ${administratorSeeded ? "created or updated" : "left unchanged"}.`);
} catch (error) {
  console.error(`Seed failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
