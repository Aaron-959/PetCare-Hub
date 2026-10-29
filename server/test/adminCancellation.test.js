import test from "node:test";
import assert from "node:assert/strict";
import Appointment from "../src/models/Appointment.js";
import SlotReservation from "../src/models/SlotReservation.js";
import { setAppointmentStatus } from "../src/controllers/adminController.js";

test("admin cancellation updates the appointment and releases its exact slot", async () => {
  const originalFindById = Appointment.findById;
  const originalUpdateOne = Appointment.updateOne;
  const originalDeleteOne = SlotReservation.deleteOne;
  const veterinarian = "507f1f77bcf86cd799439011";
  const appointmentId = "507f1f77bcf86cd799439012";
  const appointmentDate = new Date("2026-10-29T00:00:00.000Z");
  let findCalls = 0;
  let updateFilter;
  let reservationFilter;
  let responseBody;

  Appointment.findById = () => {
    findCalls += 1;
    if (findCalls === 1) {
      return Promise.resolve({
        id: appointmentId, _id: appointmentId, status: "Pending", veterinarian,
        appointmentDate, startTime: "09:00"
      });
    }
    return { populate: async () => ({ id: appointmentId, status: "Cancelled" }) };
  };
  Appointment.updateOne = async (filter, update) => {
    updateFilter = { filter, update };
    return { modifiedCount: 1 };
  };
  SlotReservation.deleteOne = async filter => {
    reservationFilter = filter;
    return { deletedCount: 1 };
  };

  try {
    await setAppointmentStatus(
      { params: { id: appointmentId }, body: { status: "Cancelled" } },
      { json(body) { responseBody = body; return this; } }
    );
    assert.equal(updateFilter.filter.appointmentDate, appointmentDate);
    assert.equal(updateFilter.filter.startTime, "09:00");
    assert.equal(updateFilter.update.$set.status, "Cancelled");
    assert.deepEqual(reservationFilter, {
      appointment: appointmentId,
      veterinarian,
      dateKey: "2026-10-29",
      startTime: "09:00"
    });
    assert.equal(responseBody.appointment.status, "Cancelled");
  } finally {
    Appointment.findById = originalFindById;
    Appointment.updateOne = originalUpdateOne;
    SlotReservation.deleteOne = originalDeleteOne;
  }
});
