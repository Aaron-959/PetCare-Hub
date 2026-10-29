import crypto from "node:crypto";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Pet from "../models/Pet.js";
import Veterinarian from "../models/Veterinarian.js";
import SlotReservation from "../models/SlotReservation.js";
import { cleanText, fail, isObjectId } from "../utils/http.js";
import { addMinutes, getAvailableSlots, indiaDateTime, isDateKey } from "../utils/slots.js";

const services = ["General Checkup", "Vaccination", "Dental Care", "Grooming", "Emergency Consultation"];
const populate = [
  { path: "pet", select: "name species breed" },
  { path: "veterinarian", select: "name specialization consultationFee photoUrl" },
  { path: "owner", select: "name email phone" }
];

export async function listAppointments(req, res) {
  const filter = req.user.role === "admin" ? {} : { owner: req.user.id };
  if (req.query.status) {
    if (!["Pending", "Confirmed", "Completed", "Cancelled"].includes(req.query.status)) {
      return fail(400, "Choose a valid appointment status filter.");
    }
    filter.status = req.query.status;
  }
  if (req.query.from || req.query.to) {
    if ((req.query.from && !isDateKey(String(req.query.from))) || (req.query.to && !isDateKey(String(req.query.to)))) {
      return fail(400, "Appointment date filters must use valid YYYY-MM-DD dates.");
    }
    if (req.query.from && req.query.to && req.query.from > req.query.to) {
      return fail(400, "The appointment start date must be on or before the end date.");
    }
    filter.appointmentDate = {};
    if (req.query.from) filter.appointmentDate.$gte = new Date(`${req.query.from}T00:00:00.000Z`);
    if (req.query.to) filter.appointmentDate.$lte = new Date(`${req.query.to}T00:00:00.000Z`);
  }
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
  const [appointments, total] = await Promise.all([
    Appointment.find(filter).populate(populate).sort({ appointmentDate: -1, startTime: -1 }).skip((page - 1) * limit).limit(limit),
    Appointment.countDocuments(filter)
  ]);
  res.json({ appointments, page, pages: Math.ceil(total / limit), total });
}

function validateSlot(dateKey, startTime, veterinarian) {
  if (!isDateKey(dateKey) || new Date(`${dateKey}T00:00:00.000Z`) < new Date(`${indiaDateTime().year}-${indiaDateTime().month}-${indiaDateTime().day}T00:00:00.000Z`)) {
    fail(400, "Choose a valid appointment date that is today or later.");
  }
  if (!/^\d{2}:\d{2}$/.test(startTime || "")) fail(400, "Choose a valid appointment time.");
  const [hour, minute] = startTime.split(":").map(Number);
  if (hour > 23 || minute > 59) fail(400, "Choose a valid appointment time.");
  const now = indiaDateTime();
  if (dateKey === `${now.year}-${now.month}-${now.day}` && hour * 60 + minute <= Number(now.hour) * 60 + Number(now.minute)) {
    fail(400, "Appointments cannot be booked in the past.");
  }
  return getAvailableSlots(veterinarian, dateKey).then(slots => {
    if (!slots?.includes(startTime)) fail(409, "That appointment time is no longer available. Please choose another slot.");
  });
}

export async function createAppointment(req, res) {
  const { petId, veterinarianId, serviceType } = req.body;
  const dateKey = String(req.body.date || "");
  const startTime = String(req.body.startTime || "");
  const reason = cleanText(req.body.reason, 500);
  if (!isObjectId(petId) || !isObjectId(veterinarianId)) return fail(400, "Select a valid pet and veterinarian.");
  if (!services.includes(serviceType)) return fail(400, "Select a valid service.");
  const [pet, veterinarian] = await Promise.all([
    Pet.findOne({ _id: petId, owner: req.user.id }),
    Veterinarian.findOne({ _id: veterinarianId, active: true })
  ]);
  if (!pet) return fail(404, "Pet not found in your account.");
  if (!veterinarian) return fail(404, "Veterinarian not found or inactive.");
  await validateSlot(dateKey, startTime, veterinarian);
  const appointmentId = new mongoose.Types.ObjectId();
  try {
    await SlotReservation.create({ veterinarian: veterinarian.id, dateKey, startTime, appointment: appointmentId });
  } catch (error) {
    if (error.code === 11000) return fail(409, "That appointment time was just booked. Please choose another slot.");
    throw error;
  }
  try {
    const appointment = await Appointment.create({
      _id: appointmentId, bookingReference: `PCH-${crypto.randomBytes(5).toString("hex").toUpperCase()}`,
      owner: req.user.id, pet: pet.id, veterinarian: veterinarian.id, serviceType,
      appointmentDate: new Date(`${dateKey}T00:00:00.000Z`), startTime,
      endTime: addMinutes(startTime, veterinarian.slotDurationMinutes),
      reason, consultationFee: veterinarian.consultationFee, status: "Pending"
    });
    await appointment.populate(populate);
    return res.status(201).json({ appointment });
  } catch (error) {
    await SlotReservation.deleteOne({ appointment: appointmentId });
    throw error;
  }
}

async function ownedAppointment(req) {
  if (!isObjectId(req.params.id)) return fail(400, "Invalid appointment ID.");
  const filter = { _id: req.params.id };
  if (req.user.role !== "admin") filter.owner = req.user.id;
  const appointment = await Appointment.findOne(filter).populate(populate);
  if (!appointment) return fail(404, "Appointment not found.");
  return appointment;
}

export async function getAppointment(req, res) {
  res.json({ appointment: await ownedAppointment(req) });
}

export async function cancelAppointment(req, res) {
  const appointment = await ownedAppointment(req);
  if (!["Pending", "Confirmed"].includes(appointment.status)) return fail(409, "Only pending or confirmed appointments can be cancelled.");
  const previous = { status: appointment.status, veterinarian: appointment.veterinarian.id, appointmentDate: appointment.appointmentDate, startTime: appointment.startTime };
  const result = await Appointment.updateOne({
    _id: appointment.id, status: previous.status,
    veterinarian: previous.veterinarian, appointmentDate: previous.appointmentDate, startTime: previous.startTime
  }, { $set: { status: "Cancelled" } });
  if (!result.modifiedCount) return fail(409, "This appointment was updated. Refresh and try again.");
  await SlotReservation.deleteOne({ appointment: appointment._id, veterinarian: previous.veterinarian, dateKey: previous.appointmentDate.toISOString().slice(0, 10), startTime: previous.startTime });
  res.json({ message: "Appointment cancelled.", appointment: await Appointment.findById(appointment.id).populate(populate) });
}

export async function rescheduleAppointment(req, res) {
  const appointment = await ownedAppointment(req);
  if (!["Pending", "Confirmed"].includes(appointment.status)) return fail(409, "Only pending or confirmed appointments can be rescheduled.");
  const dateKey = String(req.body.date || "");
  const startTime = String(req.body.startTime || "");
  const veterinarian = await Veterinarian.findOne({ _id: appointment.veterinarian.id, active: true });
  if (!veterinarian) return fail(409, "This veterinarian is no longer available.");
  await validateSlot(dateKey, startTime, veterinarian);
  const oldSlot = { veterinarian: appointment.veterinarian.id, dateKey: appointment.appointmentDate.toISOString().slice(0, 10), startTime: appointment.startTime };
  if (oldSlot.dateKey === dateKey && oldSlot.startTime === startTime) return fail(400, "Choose a different appointment time.");
  try {
    await SlotReservation.create({ veterinarian: veterinarian.id, dateKey, startTime, appointment: appointment._id });
  } catch (error) {
    if (error.code === 11000) return fail(409, "That appointment time was just booked. Please choose another slot.");
    throw error;
  }
  const result = await Appointment.updateOne(
    { _id: appointment.id, status: appointment.status, appointmentDate: appointment.appointmentDate, startTime: appointment.startTime },
    { $set: { appointmentDate: new Date(`${dateKey}T00:00:00.000Z`), startTime, endTime: addMinutes(startTime, veterinarian.slotDurationMinutes), status: "Pending" } }
  );
  if (!result.modifiedCount) {
    await SlotReservation.deleteOne({ appointment: appointment._id, veterinarian: veterinarian.id, dateKey, startTime });
    return fail(409, "This appointment was updated. Refresh and try again.");
  }
  await SlotReservation.deleteOne({ appointment: appointment._id, ...oldSlot });
  res.json({ appointment: await Appointment.findById(appointment.id).populate(populate) });
}
