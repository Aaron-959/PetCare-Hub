import SlotReservation from "../models/SlotReservation.js";

export function isDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function indiaDateTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

export async function getAvailableSlots(veterinarian, dateKey) {
  if (!isDateKey(dateKey)) return null;
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const schedule = veterinarian.weeklySchedule.find(item => item.dayOfWeek === date.getUTCDay());
  if (!schedule) return [];
  const start = schedule.startTime.split(":").reduce((h, m) => h * 60 + Number(m), 0);
  const end = schedule.endTime.split(":").reduce((h, m) => h * 60 + Number(m), 0);
  if (end <= start) return [];
  const now = indiaDateTime();
  const todayKey = `${now.year}-${now.month}-${now.day}`;
  const nowMinutes = Number(now.hour) * 60 + Number(now.minute);
  const reserved = await SlotReservation.find({ veterinarian: veterinarian._id, dateKey }).select("startTime -_id").lean();
  const taken = new Set(reserved.map(item => item.startTime));
  const slots = [];
  for (let minute = start; minute + veterinarian.slotDurationMinutes <= end; minute += veterinarian.slotDurationMinutes) {
    const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
    if (dateKey === todayKey && minute <= nowMinutes) continue;
    if (!taken.has(time)) slots.push(time);
  }
  return slots;
}

export function addMinutes(time, duration) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + duration;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
