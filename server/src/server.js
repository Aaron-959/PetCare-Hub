import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = Number(process.env.PORT) || 5000;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be configured with at least 32 characters.");
  process.exit(1);
}

mongoose.set("bufferCommands", false);
connectDatabase().catch(error => {
  console.error(`MongoDB connection failed: ${error.message}`);
  console.error("The API will remain available and return a clear 503 until MongoDB is configured and the server is restarted.");
});

app.listen(port, () => console.log(`PetCare Hub API listening on http://localhost:${port}`));
