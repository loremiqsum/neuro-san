import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { DAYS, DAY_CONFIG, capitalize } from '../lib/schedule';

const WEEKDAYS = DAYS.filter((d) => d !== 'sunday');

export default function RoutinePlanner() {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api.getExercises(selectedDay);
        if (!cancelled) setExercises(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedDay]);

  async function reloadExercises() {
    setLoading(true);
    try {
      const data = await api.getExercises(selectedDay);
      setExercises(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await api.addExercise({
        name: newName.trim(),
        day: selectedDay,
        muscle_group: newMuscle.trim() || DAY_CONFIG[selectedDay].muscles.split(' & ')[0],
      });
      setNewName('');
      setNewMuscle('');
      await reloadExercises();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteExercise(id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const config = DAY_CONFIG[selectedDay];

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-6">
      <h1 className="text-2xl font-bold mb-1">Routine Planner</h1>
      <p className="text-gym-muted text-sm mb-5">
        Configure your weekly exercise template
      </p>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {WEEKDAYS.map((day) => {
          const c = DAY_CONFIG[day];
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'bg-gym-card border border-gym-border text-gym-muted hover:text-gym-text'
              }`}
              style={isSelected ? { backgroundColor: c.hex } : undefined}
            >
              <span className="block">{capitalize(day).slice(0, 3)}</span>
              <span className={`block text-[10px] ${isSelected ? 'text-white/80' : ''}`}>
                {c.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* Header for selected day */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: config.hex }}>
            {capitalize(selectedDay)} &mdash; {config.type}
          </h2>
          <p className="text-gym-muted text-xs">{config.muscles}</p>
        </div>
        <span className="bg-gym-card border border-gym-border rounded-full px-3 py-1 text-xs text-gym-muted">
          {exercises.length} exercises
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={28} className="animate-spin text-gym-accent" />
        </div>
      ) : (
        <div className="space-y-2 mb-5">
          {exercises.map((ex, i) => (
            <div
              key={ex.id}
              className="flex items-center gap-3 bg-gym-card border border-gym-border rounded-xl px-4 py-3"
            >
              <span className="text-gym-muted text-xs font-mono w-5">{i + 1}</span>
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: config.hex }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gym-text truncate">{ex.name}</p>
                <p className="text-xs text-gym-muted">{ex.muscle_group}</p>
              </div>
              <button
                onClick={() => handleDelete(ex.id)}
                className="text-gym-muted hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="text-center text-gym-muted py-8 text-sm">
              No exercises yet. Add one below.
            </p>
          )}
        </div>
      )}

      {/* Add exercise form */}
      <form onSubmit={handleAdd} className="bg-gym-card border border-gym-border rounded-xl p-4">
        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Plus size={16} className="text-gym-accent" />
          Add Exercise
        </p>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Exercise name (e.g. Bench Press)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-gym-input border border-gym-border rounded-lg px-3 py-2.5 text-sm text-gym-text placeholder:text-gym-muted/50 focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent transition"
          />
          <input
            type="text"
            placeholder="Muscle group (optional)"
            value={newMuscle}
            onChange={(e) => setNewMuscle(e.target.value)}
            className="w-full bg-gym-input border border-gym-border rounded-lg px-3 py-2.5 text-sm text-gym-text placeholder:text-gym-muted/50 focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent transition"
          />
          <button
            type="submit"
            disabled={!newName.trim() || adding}
            className="w-full py-2.5 bg-gym-accent hover:bg-gym-accent-light text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add to {capitalize(selectedDay)}
          </button>
        </div>
      </form>
    </div>
  );
}
