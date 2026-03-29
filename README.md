# BoilerRides (R2DU)
A full-stack transit and ride-sharing platform built for students, staff and faculty at Purdue University.

## Project Description
Students at Purdue University face a persistent problem: getting between the West Lafayette campus, the Indianapolis campus, and the major regional airports (IND/ORD). This is due to it being expensive, unreliable, or both. Existing solutions are fragmented, there's no single, student-first platform that handles both free on-campus shuttles and low-cost regional rides.

__Boiler Rides__ solves this with a unified, Boiler-branded web application where students can:
* Book __free on-campus shuttle routes__ using their Purdue ID
* Reserve __low-cost regional rides__ to Indianapolis, O'Hare, and surrounding hubs
* Browse __interactive maps__ to find and visualize nearby pickup points
* Manage their __account and booking history__ in a secure, student-only environment

The platform bridges the gap between campus life and regional mobility - all under one roof.

---

## Tech Stack
### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | Reactive, component-driven UI |
| **Vite** | Lightning-fast bundler and dev server |
| **Tailwind CSS** | Utility-first styling, themed with Purdue's Charcoal & Gold palette |
| **React Leaflet** | Interactive geospatial maps for pickup location visualization |
| **Canvas Confetti** | Micro-interaction polish on successful bookings |
 
### Backend
 
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for the server layer |
| **Express** | RESTful API framework handling reservation logic and routing |
| **MongoDB** | NoSQL database for ride schedules and user profiles |
| **Mongoose** | ODM layer for schema modeling and query management |
| **JSON Web Tokens (JWT)** | Stateless, secure session management |
| **Bcrypt** | Password hashing and secure credential storage |

### Developer Tooling

| Technology | Purpose |
|---|---|
| **Concurrently** | Runs frontend and backend dev servers simultaneously in one terminal |

---

## What Was Built

Our team moved from concept to a fully functional MVP during the hackathon. Here's a breakdown of every core module shipped:

---

### 🛠️ Reservation Engine
 
The heart of the platform — a robust seat-booking system designed to handle concurrent requests safely.
 
- **Atomic Transactions:** Seat reservations use MongoDB's `findOneAndUpdate` to atomically increment `seatsBooked` only when `seatsBooked < totalSeats`. This prevents race conditions and overbooking without the need for distributed locks.
- **Multi-Step Booking Funnel:** A 5-stage checkout process — **Date → Route → Time → Details → Checkout** — that breaks complex transit data into a digestible, linear user flow. Each step validates before progressing, reducing errors and drop-offs.
 
---

### 📍 Geospatial Discovery
 
Students shouldn't have to guess where to go. The platform uses real location data to surface the most relevant pickup points.
 
- **Real-Time Proximity Calculation:** Implements the **Haversine Formula** to compute the precise distance (in miles) between the student's current geolocation and every available pickup hub.
- **Interactive Mapping:** Leaflet markers with **"FlyTo" animation logic** let users visually inspect pickup locations at airports and campus landmarks. Clicking a hub smoothly pans and zooms the map to that location.
 
---

### 🔐 Student-First Security
 
The platform is designed to be a trusted, closed environment for Purdue students only.
 
- **Verified Registration:** The signup flow enforces `.edu` email domain validation, ensuring only students can create accounts and keeping the community safe.
- **JWT Authentication:** Stateless token-based sessions keep the server lean and responsive without storing session state.
- **GDPR-Compliant Account Deletion ("Right to be Forgotten"):** When a user deletes their account, the system cleanses all personal data *and* restores any booked seats back to the available inventory pool — maintaining data integrity across the platform.
 
---

### 🌀 Rolling Schedule Ecosystem (The Seeder)
 
To simulate a living transit network, the team built a dynamic data seeder.
 
- **14-Day Rolling Schedule:** Generates 1,000+ unique ride instances covering the next two weeks, automatically refreshing to always reflect a realistic upcoming timetable.
- **Tiered Pricing:** Rides are categorized as **Free** (on-campus shuttles) or **Paid** (regional routes), with pricing logic baked into the seeder.
- **Symmetric Duration Matrix:** Arrival times are computed dynamically from a route duration matrix where every route pair is consistent in both directions (e.g., PMU ↔ IND is always 105 minutes). This ensures schedule integrity without hardcoding individual times.
 
---

## Technical Highlights
 
1. **Atomic Overbooking Prevention** — MongoDB's `findOneAndUpdate` with a conditional guard handles concurrent booking requests at the database level, not the application level.
 
2. **Haversine Geolocation** — Distance to pickup hubs is calculated on the fly using the Haversine Formula, with no third-party geolocation service dependency.
 
3. **Stateless Architecture** — JWT-based auth means the Express server holds zero session state, making it horizontally scalable from day one.
 
4. **Symmetric Route Matrix** — The duration matrix ensures bidirectional route consistency, eliminating the need to maintain separate outbound/return schedules.
 
5. **UI/UX Polish** — Map fly-to animations, card scaling effects, and confetti on booking completion elevate the experience well beyond a standard form-based app.
 
---

## Getting Started
 
### Prerequisites
 
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn
 
### Installation
 
```bash
# Clone the repository
git clone https://github.com/your-org/boiler-rides.git
cd boiler-rides
 
# Install dependencies for both frontend and backend
npm install

# Set up environment variables
cp .env.example .env
# → Fill in MONGO_URI, JWT_SECRET, and PORT
 
# Seed the rolling schedule (generates 14 days of rides)
npm run seed
 
# Start both servers concurrently
npm run dev
```
The frontend will be available at `http://localhost:5173` and the API at `http://localhost:3000`.
 
---
 
## 👥 Team
 
Built with ❤️ at HackIndy by the Boiler Rides team - Ramitha, Mridini, and Meraj
 
---
