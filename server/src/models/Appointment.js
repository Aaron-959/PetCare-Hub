import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  veterinarian: { type: mongoose.Schema.Types.ObjectId, ref: "Veterinarian", required: true },
  serviceType: { type: String, required: true, enum: ["General Checkup", "Vaccination", "Dental Care", "Grooming", "Emergency Consultation"] },
  appointmentDate: { type: Date, required: true },
  startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  reason: { type: String, trim: true, maxlength: 500, default: "" },
  consultationFee: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Pending", "Confirmed", "Completed", "Cancelled"], default: "Pending", index: true }
}, { timestamps: true });

appointmentSchema.index({ veterinarian: 1, appointmentDate: 1, startTime: 1, status: 1 });
export default mongoose.model("Appointment", appointmentSchema);
