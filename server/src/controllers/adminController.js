import Appointment from "../models/Appointment.js";
import Pet from "../models/Pet.js";
import SlotReservation from "../models/SlotReservation.js";
import Veterinarian from "../models/Veterinarian.js";
import { indiaDateTime } from "../utils/slots.js";
import { veterinarianData } from "./veterinarianController.js";
import { fail, isObjectId } from "../utils/http.js";

export async function dashboard(req, res) {
  const [appointments, pending, confirmed, completed, pets, veterinarians, recent] = await Promise.all([
    Appointment.countDocuments(), Appointment.countDocuments({ status: "Pending" }),
    Appointment.countDocuments({ status: "Confirmed" }), Appointment.countDocuments({ status: "Completed" }),
    Pet.countDocuments(), Veterinarian.countDocuments({ active: true }),
    Appointment.find().populate([{ path: "pet", select: "name species" }, { path: "veterinarian", select: "name" }, { path: "owner", select: "name email" }])
      .sort({ createdAt: -1 }).limit(8)
  ]);
  res.json({ stats: { appointments, pending, confirmed, completed, pets, veterinarians }, recent });
}

export async function setAppointmentStatus(req, res) {
  if (!isObjectId(req.params.id)) return fail(400, "Invalid appointment ID.");
  const status = req.body.status;
  if (!["Confirmed", "Completed", "Cancelled"].includes(status)) return fail(400, "Choose a valid appointment status.");
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return fail(404, "Appointment not found.");
  const transitions = { Pending: ["Confirmed", "Cancelled"], Confirmed: ["Completed", "Cancelled"] };
  if (!transitions[appointment.status]?.includes(status)) return fail(409, `Cannot change ${appointment.status} to ${status}.`);
  if (status === "Completed") {
    const now = indiaDateTime();
    const today = `${now.year}-${now.month}-${now.day}`;
    const dateKey = appointment.appointmentDate.toISOString().slice(0, 10);
    if (dateKey > today || (dateKey === today && appointment.endTime > `${now.hour}:${now.minute}`)) {
      return fail(409, "An appointment can only be marked completed after its scheduled time.");
    }
  }
  const previous = { status: appointment.status, veterinarian: appointment.veterinarian, appointmentDate: appointment.appointmentDate, startTime: appointment.startTime };
  const result = await Appointment.updateOne({
    _id: appointment.id, status: previous.status,
    appointmentDate: previous.appointmentDate, startTime: previous.startTime
  }, { $set: { status } });
  if (!result.modifiedCount) return fail(409, "This appointment was updated. Refresh and try again.");
  if (status === "Cancelled") {
    await SlotReservation.deleteOne({ appointment: appointment._id, veterinarian: previous.veterinarian, dateKey: previous.appointmentDate.toISOString().slice(0, 10), startTime: previous.startTime });
  }
  res.json({ appointment: await Appointment.findById(appointment.id).populate([{ path: "pet", select: "name species" }, { path: "veterinarian", select: "name specialization" }, { path: "owner", select: "name email" }]) });
}

export async function listAdminVeterinarians(req, res) {
  res.json({ veterinarians: await Veterinarian.find().sort({ name: 1 }) });
}

export async function createVeterinarian(req, res) {
  res.status(201).json({ veterinarian: await Veterinarian.create(veterinarianData(req.body)) });
}

export async function updateVeterinarian(req, res) {
  if (!isObjectId(req.params.id)) return fail(400, "Invalid veterinarian ID.");
  const veterinarian = await Veterinarian.findByIdAndUpdate(req.params.id, veterinarianData(req.body), { new: true, runValidators: true });
  if (!veterinarian) return fail(404, "Veterinarian not found.");
  res.json({ veterinarian });
}

export async function deactivateVeterinarian(req, res) {
  if (!isObjectId(req.params.id)) return fail(400, "Invalid veterinarian ID.");
  const veterinarian = await Veterinarian.findById(req.params.id);
  if (!veterinarian) return fail(404, "Veterinarian not found.");
  if (await Appointment.exists({ veterinarian: veterinarian.id, status: { $in: ["Pending", "Confirmed"] } })) {
    return fail(409, "Resolve all pending or confirmed appointments before deactivating this veterinarian.");
  }
  veterinarian.active = false;
  await veterinarian.save();
  res.json({ veterinarian });
}
