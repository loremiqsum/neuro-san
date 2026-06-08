# PPL Workout Tracker

A mobile-first web application for tracking gym workouts based on the **Push / Pull / Legs (PPL)** split.

## Features

- **Daily Workout Tracker** — Auto-detects the current day and shows the matching exercises
- **Routine Planner** — Add/remove exercises per day to customize your weekly template
- **Workout History** — Browse logged sessions with volume stats
- **Dark gym aesthetic** — High-contrast, mobile-responsive UI designed for use at the gym

## Weekly Schedule

| Day       | Split            | Focus             |
|-----------|------------------|-------------------|
| Monday    | Push             | Chest & Triceps   |
| Tuesday   | Pull             | Back & Biceps     |
| Wednesday | Legs / Shoulders | Shoulders & Legs  |
| Thursday  | Push             | Chest & Triceps   |
| Friday    | Pull             | Back & Biceps     |
| Saturday  | Shoulders        | Shoulders         |
| Sunday    | Rest Day         | Recovery          |

## Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React + Vite + Tailwind CSS v4    |
| Backend  | Express.js                        |
| Database | SQLite (via better-sqlite3)       |
| Icons    | Lucide React                      |

## Getting Started

```bash
# Install all dependencies
npm install && cd client && npm install && cd ../server && npm install && cd ..

# Run both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
