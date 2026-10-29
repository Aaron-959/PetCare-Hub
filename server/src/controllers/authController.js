import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { cleanText, fail } from "../utils/http.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
});

function issueSession(user, res) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("petcare_session", token, cookieOptions());
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

export async function register(req, res) {
  const name = cleanText(req.body.name, 80);
  const email = cleanText(req.body.email, 254).toLowerCase();
  const phone = cleanText(req.body.phone, 20);
  const password = req.body.password;
  if (!name || !emailPattern.test(email) || !/^[+\d\s()-]{8,20}$/.test(phone) || typeof password !== "string" || password.length < 8 || password.length > 72) {
    return fail(400, "Enter a name, valid email and phone number, and a password of at least 8 characters.");
  }
  if (await User.exists({ email })) return fail(409, "An account with that email already exists.");
  const user = await User.create({ name, email, phone, passwordHash: await bcrypt.hash(password, 12) });
  issueSession(user, res);
  res.status(201).json({ user: publicUser(user) });
}

export async function login(req, res) {
  const email = cleanText(req.body.email, 254).toLowerCase();
  const password = req.body.password;
  if (!emailPattern.test(email) || typeof password !== "string") return fail(400, "Enter a valid email and password.");
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return fail(401, "Email or password is incorrect.");
  issueSession(user, res);
  res.json({ user: publicUser(user) });
}

export async function logout(req, res) {
  res.clearCookie("petcare_session", { ...cookieOptions(), maxAge: undefined });
  res.json({ message: "You have been signed out." });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  const name = cleanText(req.body.name, 80);
  const phone = cleanText(req.body.phone, 20);
  if (!name || !/^[+\d\s()-]{8,20}$/.test(phone)) return fail(400, "Enter a valid name and phone number.");
  req.user.name = name;
  req.user.phone = phone;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 72) {
    return fail(400, "Enter your current password and a new password of at least 8 characters.");
  }
  const user = await User.findById(req.user.id).select("+passwordHash");
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return fail(400, "Current password is incorrect.");
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.clearCookie("petcare_session", cookieOptions());
  res.json({ message: "Password updated. Please sign in again." });
}
