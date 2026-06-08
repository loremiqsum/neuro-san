import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Loader2, ChevronDown, ChevronUp, Flame, Trophy, Dumbbell } from 'lucide-react';
import { api } from '../lib/api';
import { DAY_CONFIG, DAYS } from '../lib/schedule';

const STREAK_MESSAGES = [
  { min: 0, text: "Start your first workout to begin a streak!", sub: "Every journey starts with a single rep." },
  { min: 1, text: "You're on fire! Keep it going!", sub: "One day at a time — you've got this." },
  { min: 3, text: "Consistency is building!", sub: "Three days strong — the habit is forming." },
  { min: 5, text: "Beast mode activated!", sub: "Five days in a row — you're unstoppable." },
  { min: 7, text: "A full week! Incredible!", sub: "You just proved you can do anything for a week." },
  { min: 14, text: "Two weeks of pure dedication!", sub: "This isn't luck — this is discipline." },
  { min: 30, text: "30-day warrior! Legendary!", sub: "You've built an unbreakable habit." },
];

function getMotivation(streak) {
  let msg = STREAK_MESSAGES[0];
  for (const m of STREAK_MESSAGES) {
    if (streak >= m.min) msg = m;
  }
  return msg;
}

export default function WorkoutHistory() {
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [details, setDetails] = useState({});

  useEffect(() => {
    Promise.all([
      api.getHistory(),
      api.getStreak(),
    ])
      .then(([hist, streakData]) => {
        setHistory(hist);
        setStreak(streakData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function toggleExpand(date) {
    if (expanded === date) {
      setExpanded(null);
      return;
    }
    setExpanded(date);
    if (!details[date]) {
      try {
        const logs = await api.getLogs(date);
        setDetails((prev) => ({ ...prev, [date]: logs }));
      } catch (err) {
        console.error(err);
      }
    }
  }

  function getDayInfo(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    const dayKey = DAYS[d.getDay()];
    return { dayKey, config: DAY_CONFIG[dayKey] };
  }

  const motivation = streak ? getMotivation(streak.current) : null;

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-6">
      <h1 className="text-2xl font-bold mb-1">Workout History</h1>
      <p className="text-gym-muted text-sm mb-5">
        Your last 30 logged sessions
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-gym-accent" />
        </div>
      ) : (
        <>
          {/* Streak Banner */}
          {streak && (
            <div className="bg-gym-card border border-gym-border rounded-xl p-4 mb-5">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame size={18} className="text-orange-400" />
                    <span className="text-2xl font-bold text-orange-400">{streak.current}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-gym-muted">Current</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy size={18} className="text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-400">{streak.best}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-gym-muted">Best</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Dumbbell size={18} className="text-gym-accent" />
                    <span className="text-2xl font-bold text-gym-accent">{streak.totalWorkouts}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-gym-muted">Total</p>
                </div>
              </div>

              {/* Motivation */}
              {motivation && (
                <div className="border-t border-gym-border pt-3 text-center">
                  <p className="text-sm font-semibold text-gym-text">{motivation.text}</p>
                  <p className="text-xs text-gym-muted mt-0.5">{motivation.sub}</p>
                </div>
              )}
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gym-muted mb-3" />
              <p className="text-gym-muted">No workouts logged yet.</p>
              <p className="text-gym-muted text-sm">Start tracking today!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h) => {
                const { config } = getDayInfo(h.date);
                const isOpen = expanded === h.date;
                const logs = details[h.date];

                return (
                  <div key={h.date} className="bg-gym-card border border-gym-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleExpand(h.date)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      <div
                        className="w-1.5 h-10 rounded-full"
                        style={{ backgroundColor: config.hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gym-text">
                          {new Date(h.date + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric',
                          })}
                          <span className="ml-2 text-xs" style={{ color: config.hex }}>
                            {config.type}
                          </span>
                        </p>
                        <p className="text-xs text-gym-muted flex items-center gap-2">
                          <span>{h.exercise_count} exercises · {h.total_sets} sets</span>
                          {h.total_volume > 0 && (
                            <>
                              <TrendingUp size={10} />
                              <span>{Number(h.total_volume).toLocaleString()} vol</span>
                            </>
                          )}
                        </p>
                      </div>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-gym-muted" />
                      ) : (
                        <ChevronDown size={18} className="text-gym-muted" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-gym-border px-4 py-3 space-y-2">
                        {logs ? (
                          logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between text-xs">
                              <span className="text-gym-text font-medium truncate flex-1">
                                {log.exercise_name}
                              </span>
                              <div className="flex gap-4 text-gym-muted ml-2">
                                <span>Set {log.set_number}</span>
                                <span>{log.weight}kg</span>
                                <span>{log.reps}r</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <Loader2 size={16} className="animate-spin text-gym-accent mx-auto" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
