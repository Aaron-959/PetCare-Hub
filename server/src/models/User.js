import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["owner", "admin"], default: "owner", immutable: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
