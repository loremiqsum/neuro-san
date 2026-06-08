const BASE = '/api';

async function json(url, opts) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  getExercises: (day) => json(`/exercises/${day}`),
  getAllExercises: () => json('/exercises'),
  addExercise: (data) => json('/exercises', { method: 'POST', body: JSON.stringify(data) }),
  deleteExercise: (id) => json(`/exercises/${id}`, { method: 'DELETE' }),

  saveLogs: (date, entries) =>
    json('/logs', { method: 'POST', body: JSON.stringify({ date, entries }) }),
  getLogs: (date) => json(`/logs/${date}`),
  getHistory: () => json('/logs'),
  getLastLog: (exerciseId) => json(`/logs/last/${exerciseId}`),
  getStreak: () => json('/stats/streak'),
  getPRs: () => json('/stats/prs'),
  getPreviousBatch: (exerciseIds, date) =>
    json(`/logs/previous-batch?exercises=${exerciseIds.join(',')}&date=${date}`),
};
