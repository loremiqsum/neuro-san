const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'workout.db');

/**
 * Compatibility wrapper around sql.js that exposes a better-sqlite3-like API.
 * This allows the rest of the server code to remain unchanged.
 */
class Database {
  constructor(sqlDb) {
    this._db = sqlDb;
    this._inTransaction = false;
  }

  exec(sql) {
    this._db.exec(sql);
    if (!this._inTransaction) this._save();
  }

  pragma(str) {
    try {
      this._db.run(`PRAGMA ${str}`);
    } catch { /* ignore unsupported pragmas */ }
  }

  prepare(sql) {
    const self = this;
    return {
      get(...params) {
        let stmt;
        try {
          stmt = self._db.prepare(sql);
          if (params.length) stmt.bind(params);
          if (stmt.step()) {
            return stmt.getAsObject();
          }
          return undefined;
        } finally {
          if (stmt) stmt.free();
        }
      },
      all(...params) {
        const results = [];
        let stmt;
        try {
          stmt = self._db.prepare(sql);
          if (params.length) stmt.bind(params);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
        } finally {
          if (stmt) stmt.free();
        }
        return results;
      },
      run(...params) {
        self._db.run(sql, params);
        const changes = self._db.getRowsModified();
        // Get last insert rowid
        let lastInsertRowid = 0;
        let idStmt;
        try {
          idStmt = self._db.prepare('SELECT last_insert_rowid() as id');
          if (idStmt.step()) {
            lastInsertRowid = idStmt.getAsObject().id;
          }
        } finally {
          if (idStmt) idStmt.free();
        }
        if (!self._inTransaction) self._save();
        return { changes, lastInsertRowid };
      },
    };
  }

  transaction(fn) {
    const self = this;
    return (...args) => {
      self._db.run('BEGIN TRANSACTION');
      self._inTransaction = true;
      try {
        fn(...args);
        self._db.run('COMMIT');
        self._inTransaction = false;
        self._save();
      } catch (e) {
        self._db.run('ROLLBACK');
        self._inTransaction = false;
        throw e;
      }
    };
  }

  _save() {
    const data = this._db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

async function initDatabase() {
  const SQL = await initSqlJs();

  let rawDb;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    rawDb = new SQL.Database(buffer);
  } else {
    rawDb = new SQL.Database();
  }

  const db = new Database(rawDb);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      day TEXT NOT NULL,
      muscle_group TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      set_number INTEGER DEFAULT 1,
      weight REAL DEFAULT 0,
      reps INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exercises_day ON exercises(day);
    CREATE INDEX IF NOT EXISTS idx_logs_date ON workout_logs(date);
    CREATE INDEX IF NOT EXISTS idx_logs_exercise ON workout_logs(exercise_id);
  `);

  // Migrate: add set_number column if missing (existing DBs)
  try {
    db.prepare('SELECT set_number FROM workout_logs LIMIT 1').get();
  } catch {
    db.exec('ALTER TABLE workout_logs ADD COLUMN set_number INTEGER DEFAULT 1');
  }

  // Seed default exercises if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM exercises').get().c;
  if (count === 0) {
    const defaults = [
      ['Flat Bench Press', 'monday', 'Chest', 1],
      ['Incline Dumbbell Press', 'monday', 'Chest', 2],
      ['Cable Flyes', 'monday', 'Chest', 3],
      ['Tricep Pushdowns', 'monday', 'Triceps', 4],
      ['Overhead Tricep Extension', 'monday', 'Triceps', 5],
      ['Dips', 'monday', 'Triceps', 6],

      ['Deadlifts', 'tuesday', 'Back', 1],
      ['Barbell Rows', 'tuesday', 'Back', 2],
      ['Lat Pulldowns', 'tuesday', 'Back', 3],
      ['Seated Cable Rows', 'tuesday', 'Back', 4],
      ['Barbell Curls', 'tuesday', 'Biceps', 5],
      ['Hammer Curls', 'tuesday', 'Biceps', 6],

      ['Squats', 'wednesday', 'Legs', 1],
      ['Leg Press', 'wednesday', 'Legs', 2],
      ['Leg Curls', 'wednesday', 'Legs', 3],
      ['Overhead Press', 'wednesday', 'Shoulders', 4],
      ['Lateral Raises', 'wednesday', 'Shoulders', 5],
      ['Front Raises', 'wednesday', 'Shoulders', 6],

      ['Flat Bench Press', 'thursday', 'Chest', 1],
      ['Incline Dumbbell Press', 'thursday', 'Chest', 2],
      ['Cable Flyes', 'thursday', 'Chest', 3],
      ['Tricep Pushdowns', 'thursday', 'Triceps', 4],
      ['Overhead Tricep Extension', 'thursday', 'Triceps', 5],
      ['Dips', 'thursday', 'Triceps', 6],

      ['Deadlifts', 'friday', 'Back', 1],
      ['Barbell Rows', 'friday', 'Back', 2],
      ['Lat Pulldowns', 'friday', 'Back', 3],
      ['Seated Cable Rows', 'friday', 'Back', 4],
      ['Barbell Curls', 'friday', 'Biceps', 5],
      ['Hammer Curls', 'friday', 'Biceps', 6],

      ['Overhead Press', 'saturday', 'Shoulders', 1],
      ['Lateral Raises', 'saturday', 'Shoulders', 2],
      ['Front Raises', 'saturday', 'Shoulders', 3],
      ['Rear Delt Flyes', 'saturday', 'Shoulders', 4],
      ['Shrugs', 'saturday', 'Shoulders', 5],
    ];

    const insertSeed = db.transaction((rows) => {
      for (const [name, day, muscle_group, sort_order] of rows) {
        db.prepare(
          'INSERT INTO exercises (name, day, muscle_group, sort_order) VALUES (?, ?, ?, ?)'
        ).run(name, day, muscle_group, sort_order);
      }
    });
    insertSeed(defaults);
  }

  return db;
}

module.exports = { initDatabase };
