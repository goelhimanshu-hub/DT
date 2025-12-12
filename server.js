// Simple Express backend for Roast & Rebuild
// - Form submission endpoint
// - Interaction capture
// - Basic stats
// To run: node server.js  (see package.json below)

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());               // allow http://localhost file or other ports
app.use(express.json());       // parse JSON bodies

// In-memory storage (replace with DB if needed)
const bookings = [];
const interactions = [];

// POST /api/book — save booking form
app.post("/api/book", (req, res) => {
  const { name, email, url, top, details } = req.body;
  if (!name || !email || !url || !top) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const emailRegex = /.+@.+\..+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: "URL must start with http(s)://" });
  }

  const entry = {
    id: Date.now(),
    name,
    email,
    url,
    top,
    details: details || "",
    createdAt: new Date().toISOString(),
  };
  bookings.push(entry);
  return res.json({ success: true, message: "Booking saved", entry });
});

// POST /api/interaction — record slider heat, fix adds, etc.
app.post("/api/interaction", (req, res) => {
  const { type, data } = req.body || {};
  if (!type) return res.status(400).json({ error: "Missing type" });
  interactions.push({
    id: Date.now(),
    type,
    data: data || {},
    timestamp: new Date().toISOString(),
  });
  return res.json({ success: true });
});

// GET /api/stats — simple stats
app.get("/api/stats", (req, res) => {
  const totalBookings = bookings.length;
  const heatEvents = interactions.filter(i => i.type === "heat");
  const avgHeat = heatEvents.length
    ? Math.round(
        heatEvents.reduce((acc, cur) => acc + (Number(cur.data?.value) || 0), 0) /
        heatEvents.length
      )
    : 0;
  res.json({ totalBookings, avgHeat });
});

// Admin (no auth, dev only)
app.get("/api/admin/bookings", (req, res) => res.json(bookings));
app.get("/api/admin/interactions", (req, res) => res.json(interactions));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
