import mongoose from "mongoose";

const slotReservationSchema = new mongoose.Schema({
  veterinarian: { type: mongoose.Schema.Types.ObjectId, ref: "Veterinarian", required: true },
  dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  appointment: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }
}, { timestamps: true });

slotReservationSchema.index({ veterinarian: 1, dateKey: 1, startTime: 1 }, { unique: true });
export default mongoose.model("SlotReservation", slotReservationSchema);
