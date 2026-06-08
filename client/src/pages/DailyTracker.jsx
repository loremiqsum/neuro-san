import { useState, useEffect, useRef } from 'react';
import { Flame, Save, CheckCircle, Loader2, BedDouble, Trophy, X, Shield } from 'lucide-react';
import { api } from '../lib/api';
import { getTodayKey, getTodayISO, DAY_CONFIG, capitalize } from '../lib/schedule';
import ExerciseCard from '../components/ExerciseCard';
import RestTimer from '../components/RestTimer';

function makeEmptySet(num) {
  return { weight: '', reps: '', setNum: String(num) };
}

export default function DailyTracker() {
  const todayKey = getTodayKey();
  const todayISO = getTodayISO();
  const config = DAY_CONFIG[todayKey];

  const [exercises, setExercises] = useState([]);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previousData, setPreviousData] = useState({});
  const [celebration, setCelebration] = useState(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const prsRef = useRef({});
  const wakeLockRef = useRef(null);

  // ── Wake Lock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLockRef.current.addEventListener('release', () => setWakeLockActive(false));
        }
      } catch {
        setWakeLockActive(false);
      }
    }
    requestWakeLock();

    function handleVisibility() {
      if (document.visibilityState === 'visible') requestWakeLock();
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      wakeLockRef.current?.release().catch(() => {});
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [exerciseList, todayLogs] = await Promise.all([
          api.getExercises(todayKey),
          api.getLogs(todayISO).catch(() => []),
        ]);
        if (cancelled) return;
        setExercises(exerciseList);

        const data = {};
        for (const ex of exerciseList) {
          const exLogs = todayLogs.filter((l) => l.exercise_id === ex.id);
          if (exLogs.length > 0) {
            data[ex.id] = exLogs.map((l) => ({
              weight: l.weight ? String(l.weight) : '',
              reps: l.reps ? String(l.reps) : '',
              setNum: String(l.set_number || 1),
            }));
          } else {
            data[ex.id] = [makeEmptySet(1)];
          }
        }
        setFormData(data);
        if (todayLogs.length > 0) setSaved(true);

        // Load previous session data & PRs
        const ids = exerciseList.map((e) => e.id);
        if (ids.length > 0) {
          const [prevData, prs] = await Promise.all([
            api.getPreviousBatch(ids, todayISO).catch(() => ({})),
            api.getPRs().catch(() => ({})),
          ]);
          if (!cancelled) {
            setPreviousData(prevData);
            prsRef.current = prs;
          }
        }
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [todayKey, todayISO]);

  // ── Form handlers ─────────────────────────────────────────────────────────
  function updateSetField(exerciseId, setIndex, field, value) {
    setSaved(false);
    setFormData((prev) => {
      const sets = [...(prev[exerciseId] || [makeEmptySet(1)])];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      return { ...prev, [exerciseId]: sets };
    });
  }

  function addSet(exerciseId) {
    setSaved(false);
    setFormData((prev) => {
      const sets = [...(prev[exerciseId] || [makeEmptySet(1)])];
      const nextNum = sets.length + 1;
      return { ...prev, [exerciseId]: [...sets, makeEmptySet(nextNum)] };
    });
  }

  function removeSet(exerciseId, setIndex) {
    setSaved(false);
    setFormData((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      if (sets.length <= 1) return prev;
      sets.splice(setIndex, 1);
      const renumbered = sets.map((s, i) => ({ ...s, setNum: String(i + 1) }));
      return { ...prev, [exerciseId]: renumbered };
    });
  }

  // ── Save with PR detection ────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    try {
      const entries = [];
      for (const ex of exercises) {
        const sets = formData[ex.id] || [makeEmptySet(1)];
        for (const s of sets) {
          entries.push({
            exercise_id: ex.id,
            set_number: Number(s.setNum) || 1,
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
          });
        }
      }
      await api.saveLogs(todayISO, entries);
      setSaved(true);

      // PR detection
      const newPRs = await api.getPRs().catch(() => ({}));
      const oldPRs = prsRef.current;
      const records = [];

      for (const [exIdStr, newPR] of Object.entries(newPRs)) {
        const exId = Number(exIdStr);
        if (!exercises.some((e) => e.id === exId)) continue;

        const oldPR = oldPRs[exId];
        if (!oldPR) {
          if (newPR.bestWeight > 0) {
            records.push({
              name: newPR.exerciseName,
              detail: `First log: ${newPR.bestWeight}kg x ${newPR.bestReps} reps`,
            });
          }
        } else {
          if (newPR.bestWeight > oldPR.bestWeight) {
            records.push({
              name: newPR.exerciseName,
              detail: `New max weight: ${newPR.bestWeight}kg (was ${oldPR.bestWeight}kg)`,
            });
          } else if (newPR.bestVolume > oldPR.bestVolume) {
            records.push({
              name: newPR.exerciseName,
              detail: `New best volume: ${newPR.bestVolume} (was ${oldPR.bestVolume})`,
            });
          }
        }
      }

      prsRef.current = newPRs;
      if (records.length > 0) setCelebration(records);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  // ── Auto-dismiss celebration ──────────────────────────────────────────────
  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), 6000);
    return () => clearTimeout(t);
  }, [celebration]);

  // ── Sunday rest day ───────────────────────────────────────────────────────
  if (todayKey === 'sunday') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <BedDouble size={64} style={{ color: config.hex }} className="mb-4" />
        <h1 className="text-3xl font-bold mb-2">Rest Day</h1>
        <p className="text-gym-muted text-lg max-w-sm">
          Recovery is part of the process. Stretch, hydrate, and come back stronger tomorrow.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gym-muted text-sm uppercase tracking-wider mb-1">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          {wakeLockActive && (
            <span className="flex items-center gap-1 text-[10px] text-green-400/70 uppercase tracking-wider">
              <Shield size={10} /> Screen On
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flame size={24} style={{ color: config.hex }} />
          {capitalize(todayKey)} &mdash; {config.type}
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: config.hex }}>
          {config.muscles}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-gym-accent" />
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                sets={formData[ex.id] || [makeEmptySet(1)]}
                onSetChange={(setIdx, field, val) => updateSetField(ex.id, setIdx, field, val)}
                onAddSet={() => addSet(ex.id)}
                onRemoveSet={(setIdx) => removeSet(ex.id, setIdx)}
                accentHex={config.hex}
                previousData={previousData[ex.id] || null}
              />
            ))}
          </div>

          {exercises.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-4 rounded-xl font-semibold text-white text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] mb-6 ${
                saved
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gym-accent hover:bg-gym-accent-light'
              }`}
            >
              {saving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : saved ? (
                <CheckCircle size={20} />
              ) : (
                <Save size={20} />
              )}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Workout'}
            </button>
          )}
        </>
      )}

      {/* Rest Timer FAB */}
      <RestTimer />

      {/* PR Celebration Modal */}
      {celebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setCelebration(null)}
        >
          <div
            className="bg-gym-card border border-yellow-500/30 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl shadow-yellow-500/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCelebration(null)}
              className="absolute top-4 right-4 text-gym-muted hover:text-gym-text"
            >
              <X size={18} />
            </button>
            <Trophy size={48} className="text-yellow-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-yellow-400 mb-1">NEW PR!</h2>
            <p className="text-gym-muted text-sm mb-4">Personal Record Broken!</p>
            <div className="space-y-2 mb-5">
              {celebration.map((r, i) => (
                <div
                  key={i}
                  className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3"
                >
                  <p className="font-semibold text-gym-text text-sm">{r.name}</p>
                  <p className="text-xs text-yellow-300">{r.detail}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCelebration(null)}
              className="w-full py-3 rounded-xl bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition active:scale-[0.98]"
            >
              Keep Pushing!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
