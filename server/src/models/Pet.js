import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  species: { type: String, required: true, enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"] },
  breed: { type: String, trim: true, maxlength: 60, default: "" },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
  weightKg: { type: Number, min: 0, max: 250, default: null },
  notes: { type: String, trim: true, maxlength: 500, default: "" },
  photoUrl: { type: String, trim: true, maxlength: 500, default: "" }
}, { timestamps: true });

export default mongoose.model("Pet", petSchema);
