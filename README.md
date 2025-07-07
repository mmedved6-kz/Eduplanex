# University Timetable Scheduling System

A full-stack web application for managing university timetables, staff, students, rooms, and scheduling events. Built as a project for CSC3002, this system provides automated and manual scheduling, user authentication, and a modern web interface.

## Features
- Automated timetable scheduling with constraint optimization
- Manual event and timetable management
- Staff, student, room, module, and course management
- User authentication and role-based access
- RESTful API (Node.js/Express backend)
- Modern frontend (Next.js + Tailwind CSS)
- PostgreSQL database integration
- File/image upload for staff profiles

## Tech Stack
- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** Next.js, React, Tailwind CSS
- **Other:** JWT Auth, Multer, pg-promise

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL

### Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure your PostgreSQL database in `backend/config/db.js`.
3. Run database migrations and seed data (see `postgres/` folder).
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
- Access the web app at `http://localhost:3000`.
- Use the provided API endpoints for integration (see backend routes).
- Admin users can manage all resources; staff and students have limited access.

## Folder Structure
- `backend/` — Express API, models, controllers, routes, scheduling logic
- `frontend/` — Next.js app, React components, pages, styles
- `postgres/` — SQL schemas, seed data, migrations

## Contributing
Contributions are welcome! Please fork the repo and submit a pull request.

## Authors
- Medet Murzakhanov (QUB Graduate)
