import mongoose from "mongoose";
import SlotReservation from "../models/SlotReservation.js";

export async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  await mongoose.connect(uri);
  try {
    await SlotReservation.init();
  } catch (error) {
    await mongoose.disconnect();
    throw new Error(`Could not create the unique appointment slot index: ${error.message}`);
  }
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
