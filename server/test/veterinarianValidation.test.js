import test from "node:test";
import assert from "node:assert/strict";
import { veterinarianData } from "../src/controllers/veterinarianController.js";

const validVeterinarian = {
  name: "Dr. Asha Rao",
  specialization: "General Care",
  experienceYears: 5,
  consultationFee: 500,
  weeklySchedule: [
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 3, startTime: "10:00", endTime: "16:00" }
  ]
};

test("veterinarian validation accepts a valid working schedule", () => {
  const data = veterinarianData(validVeterinarian);
  assert.equal(data.name, "Dr. Asha Rao");
  assert.equal(data.weeklySchedule.length, 2);
  assert.equal(data.active, true);
});

test("veterinarian validation rejects duplicate days and non-boolean active flags", () => {
  const duplicateDay = {
    ...validVeterinarian,
    weeklySchedule: [validVeterinarian.weeklySchedule[0], validVeterinarian.weeklySchedule[0]]
  };
  assert.throws(() => veterinarianData(duplicateDay), { status: 400 });
  assert.throws(() => veterinarianData({ ...validVeterinarian, active: "false" }), { status: 400 });
});

test("veterinarian validation rejects malformed schedules and fractional slot lengths", () => {
  assert.throws(() => veterinarianData({ ...validVeterinarian, weeklySchedule: [null] }), { status: 400 });
  assert.throws(() => veterinarianData({ ...validVeterinarian, slotDurationMinutes: 30.5 }), { status: 400 });
});
