# MediVault — Care Management

A modern, responsive healthcare care management web application built purely with **HTML5, CSS3, and JavaScript**. Zero backend dependencies or installations required.

## Features
- **Zero Dependencies**: Pure standard HTML, CSS, and vanilla JavaScript.
- **Client-Side Persistence**: Automatic `localStorage` support — all patient profiles, medical records, appointments, and prescriptions persist across refreshes.
- **Dynamic Analytics Dashboard**:
  - Live KPI metric cards (Patients, Records, Appointments today, Prescriptions).
  - SVG Care activity trend chart calculated dynamically over the last 7 days.
  - Interactive SVG/Conic category distribution donut chart.
- **Full Patient Management**: Search, filter, view complete patient medical history, add new profiles, and export to CSV.
- **Medical Records**: Clinical notes, diagnostic lab results, imaging reports, and discharge summaries.
- **Appointment Scheduling**: Status tracking (Scheduled, Pending, Cancelled) and calendar date/time management.
- **Prescription Tracking**: Detailed dosages, administration instructions, and prescribing physician records.
- **Sample Data Included**: Comes preloaded with realistic sample data, plus a "Reset sample data" button.

## How to Run
Simply open `index.html` in any modern web browser:

- **Direct file**: Double-click `index.html`.
- **VS Code Live Server**: Right-click `index.html` -> "Open with Live Server" (`http://localhost:5500`).
- **GitHub Pages**: Fully compatible with GitHub Pages out of the box.

## Project Structure
- `index.html` — Main single-page application shell.
- `styles.css` — Modern healthcare SaaS styling, glassmorphism, responsive grid & mobile navigation.
- `app.js` — Client-side state machine, data models, charts, modals, and local persistence.
- `frontend/` — Mirrored standalone frontend assets.
- `dsa/` — Project algorithms and reference material.
