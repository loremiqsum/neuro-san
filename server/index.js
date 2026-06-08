const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function main() {
  const db = await initDatabase();

  // --------------- EXERCISES (template) ---------------

  app.get('/api/exercises/:day', (req, res) => {
    const day = req.params.day.toLowerCase();
    const rows = db
      .prepare('SELECT * FROM exercises WHERE day = ? ORDER BY sort_order')
      .all(day);
    res.json(rows);
  });

  app.get('/api/exercises', (_req, res) => {
    const rows = db
      .prepare('SELECT * FROM exercises ORDER BY day, sort_order')
      .all();
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.day]) grouped[row.day] = [];
      grouped[row.day].push(row);
    }
    res.json(grouped);
  });

  app.post('/api/exercises', (req, res) => {
    const { name, day, muscle_group } = req.body;
    if (!name || !day) return res.status(400).json({ error: 'name and day are required' });

    const maxOrder = db
      .prepare('SELECT COALESCE(MAX(sort_order), 0) as m FROM exercises WHERE day = ?')
      .get(day.toLowerCase()).m;

    const result = db
      .prepare('INSERT INTO exercises (name, day, muscle_group, sort_order) VALUES (?, ?, ?, ?)')
      .run(name, day.toLowerCase(), muscle_group || '', maxOrder + 1);

    const newExercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newExercise);
  });

  app.delete('/api/exercises/:id', (req, res) => {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM workout_logs WHERE exercise_id = ?').run(id);
    const info = db.prepare('DELETE FROM exercises WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'not found' });
    res.json({ success: true });
  });

  // --------------- WORKOUT LOGS (multi-set) ---------------

  // Save workout: entries is flat array of { exercise_id, set_number, weight, reps }
  app.post('/api/logs', (req, res) => {
    const { date, entries } = req.body;
    if (!date || !Array.isArray(entries))
      return res.status(400).json({ error: 'date and entries[] are required' });

    const saveAll = db.transaction((rows) => {
      db.prepare('DELETE FROM workout_logs WHERE date = ?').run(date);
      for (const e of rows) {
        db.prepare(
          'INSERT INTO workout_logs (exercise_id, date, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)'
        ).run(e.exercise_id, date, e.set_number || 1, e.weight || 0, e.reps || 0);
      }
    });

    saveAll(entries);
    res.status(201).json({ success: true, count: entries.length });
  });

  // Batch previous-session data for multiple exercises (most recent BEFORE given date)
  app.get('/api/logs/previous-batch', (req, res) => {
    const { exercises, date } = req.query;
    if (!exercises) return res.json({});

    const ids = exercises
      .split(',')
      .map(Number)
      .filter(Boolean);
    const result = {};

    for (const id of ids) {
      const lastDate = db
        .prepare(
          'SELECT date FROM workout_logs WHERE exercise_id = ? AND date < ? ORDER BY date DESC LIMIT 1'
        )
        .get(id, date || '9999-12-31');

      if (lastDate) {
        result[id] = {
          date: lastDate.date,
          sets: db
            .prepare(
              'SELECT set_number, weight, reps FROM workout_logs WHERE exercise_id = ? AND date = ? ORDER BY set_number'
            )
            .all(id, lastDate.date),
        };
      }
    }

    res.json(result);
  });

  // Get logs for a date — returns all sets, ordered by exercise then set_number
  app.get('/api/logs/:date', (req, res) => {
    const rows = db
      .prepare(
        `SELECT wl.id, wl.exercise_id, wl.set_number, wl.weight, wl.reps,
                e.name as exercise_name, e.muscle_group, e.sort_order
         FROM workout_logs wl
         JOIN exercises e ON wl.exercise_id = e.id
         WHERE wl.date = ?
         ORDER BY e.sort_order, wl.set_number`
      )
      .all(req.params.date);
    res.json(rows);
  });

  // History summary
  app.get('/api/logs', (_req, res) => {
    const rows = db
      .prepare(
        `SELECT date,
                COUNT(DISTINCT exercise_id) as exercise_count,
                COUNT(*) as total_sets,
                SUM(weight * reps) as total_volume
         FROM workout_logs
         GROUP BY date
         ORDER BY date DESC
         LIMIT 30`
      )
      .all();
    res.json(rows);
  });

  // Last logged sets for an exercise
  app.get('/api/logs/last/:exerciseId', (req, res) => {
    const lastDate = db
      .prepare('SELECT date FROM workout_logs WHERE exercise_id = ? ORDER BY date DESC LIMIT 1')
      .get(Number(req.params.exerciseId));
    if (!lastDate) return res.json([]);

    const rows = db
      .prepare(
        'SELECT * FROM workout_logs WHERE exercise_id = ? AND date = ? ORDER BY set_number'
      )
      .all(Number(req.params.exerciseId), lastDate.date);
    res.json(rows);
  });

  // Streak stats
  app.get('/api/stats/streak', (_req, res) => {
    const rows = db
      .prepare('SELECT DISTINCT date FROM workout_logs ORDER BY date DESC')
      .all()
      .map((r) => r.date);

    if (rows.length === 0) {
      return res.json({ current: 0, best: 0, totalWorkouts: 0 });
    }

    const dateSet = new Set(rows);
    const totalWorkouts = rows.length;

    function isSunday(dateStr) {
      return new Date(dateStr + 'T12:00:00').getDay() === 0;
    }

    function prevDay(dateStr) {
      const d = new Date(dateStr + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    }

    // Current streak: walk backwards from today skipping Sundays
    const today = new Date().toISOString().slice(0, 10);
    let current = 0;
    let cursor = today;

    // If today has no workout yet, start from yesterday
    if (!dateSet.has(cursor)) {
      cursor = prevDay(cursor);
    }

    while (true) {
      if (isSunday(cursor)) {
        cursor = prevDay(cursor);
        continue;
      }
      if (dateSet.has(cursor)) {
        current++;
        cursor = prevDay(cursor);
      } else {
        break;
      }
    }

    // Best streak: scan all dates chronologically
    const sorted = [...rows].sort();
    let best = 0;
    let run = 0;
    let prev = null;

    for (const dateStr of sorted) {
      if (!prev) {
        run = 1;
      } else {
        let expected = prevDay(dateStr);
        // Skip Sundays in gap
        while (isSunday(expected)) {
          expected = prevDay(expected);
        }
        if (expected === prev) {
          run++;
        } else {
          run = 1;
        }
      }
      if (run > best) best = run;
      prev = dateStr;
    }

    res.json({ current, best, totalWorkouts });
  });

  // --------------- PERSONAL RECORDS ---------------

  app.get('/api/stats/prs', (_req, res) => {
    const rows = db
      .prepare(
        `SELECT wl.exercise_id,
                e.name AS exercise_name,
                MAX(wl.weight) AS best_weight,
                MAX(wl.reps) AS best_reps,
                MAX(wl.weight * wl.reps) AS best_volume
         FROM workout_logs wl
         JOIN exercises e ON wl.exercise_id = e.id
         WHERE wl.weight > 0 OR wl.reps > 0
         GROUP BY wl.exercise_id`
      )
      .all();

    const prs = {};
    for (const r of rows) {
      prs[r.exercise_id] = {
        bestWeight: r.best_weight,
        bestReps: r.best_reps,
        bestVolume: r.best_volume,
        exerciseName: r.exercise_name,
      };
    }
    res.json(prs);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
