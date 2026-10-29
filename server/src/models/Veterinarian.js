import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ }
}, { _id: false });

const veterinarianSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  specialization: { type: String, required: true, trim: true, maxlength: 80 },
  experienceYears: { type: Number, required: true, min: 0, max: 60 },
  consultationFee: { type: Number, required: true, min: 0, max: 100000 },
  bio: { type: String, trim: true, maxlength: 600, default: "" },
  photoUrl: { type: String, trim: true, maxlength: 500, default: "" },
  active: { type: Boolean, default: true },
  weeklySchedule: { type: [scheduleSchema], default: [] },
  slotDurationMinutes: { type: Number, min: 15, max: 120, default: 30 }
}, { timestamps: true });

export default mongoose.model("Veterinarian", veterinarianSchema);
