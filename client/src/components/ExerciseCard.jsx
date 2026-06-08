import { useRef, useCallback } from 'react';
import { Weight, Repeat, Hash, Plus, Trash2, TrendingUp } from 'lucide-react';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ExerciseCard({
  exercise,
  sets,
  onSetChange,
  onAddSet,
  onRemoveSet,
  accentHex,
  previousData,
}) {
  const inputRefs = useRef({});

  const getRef = useCallback((setIndex, field) => {
    const key = `${setIndex}-${field}`;
    if (!inputRefs.current[key]) {
      inputRefs.current[key] = { current: null };
    }
    return inputRefs.current[key];
  }, []);

  const setRef = useCallback((setIndex, field, el) => {
    const key = `${setIndex}-${field}`;
    if (!inputRefs.current[key]) {
      inputRefs.current[key] = { current: null };
    }
    inputRefs.current[key].current = el;
  }, []);

  function handleKeyDown(e, setIndex, field) {
    if (e.key !== ' ') return;
    e.preventDefault();

    const nextField = field === 'weight' ? 'reps' : field === 'reps' ? 'setNum' : null;
    if (nextField) {
      const ref = getRef(setIndex, nextField);
      ref.current?.focus();
      ref.current?.select();
    }
  }

  const prevSets = previousData?.sets;
  const prevDate = previousData?.date;

  return (
    <div className="bg-gym-card border border-gym-border rounded-xl p-4">
      {/* Exercise header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: accentHex }} />
          <div>
            <h3 className="font-semibold text-gym-text text-sm">{exercise.name}</h3>
            <p className="text-gym-muted text-xs">{exercise.muscle_group}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddSet}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-gym-input border border-gym-border text-gym-accent hover:border-gym-accent hover:bg-gym-accent/10"
        >
          <Plus size={14} />
          Set
        </button>
      </div>

      {/* Previous session hint */}
      {prevSets && prevSets.length > 0 ? (
        <div className="ml-4 mb-3 bg-gym-input/50 border border-gym-border/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-gym-accent shrink-0" />
            <span className="text-[11px] font-medium text-gym-accent">
              Last session{prevDate ? ` (${formatDate(prevDate)})` : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {prevSets.map((s, i) => (
              <span key={i} className="text-xs text-gym-muted font-mono">
                Set {s.set_number}: <span className="text-gym-text font-semibold">{s.weight}kg</span> x {s.reps}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-2" />
      )}

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_2fr_2fr_1.2fr_auto] gap-1.5 mb-1.5 px-1">
        <span className="text-[9px] uppercase tracking-wider text-gym-muted flex items-center gap-0.5">
          <Hash size={8} />
        </span>
        <span className="text-[9px] uppercase tracking-wider text-gym-muted flex items-center gap-0.5">
          <Weight size={8} /> Weight
        </span>
        <span className="text-[9px] uppercase tracking-wider text-gym-muted flex items-center gap-0.5">
          <Repeat size={8} /> Reps
        </span>
        <span className="text-[9px] uppercase tracking-wider text-gym-muted">
          Set #
        </span>
        <span className="w-6" />
      </div>

      {/* Set rows */}
      <div className="space-y-1.5">
        {sets.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_2fr_1.2fr_auto] gap-1.5 items-center">
            {/* Row index */}
            <span className="text-xs text-gym-muted font-mono text-center">{i + 1}</span>

            {/* Weight */}
            <input
              ref={(el) => setRef(i, 'weight', el)}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={s.weight}
              onChange={(e) => onSetChange(i, 'weight', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i, 'weight')}
              placeholder={
                prevSets && prevSets[i]
                  ? String(prevSets[i].weight)
                  : '0'
              }
              className="w-full bg-gym-input border border-gym-border rounded-lg px-2 py-2 text-center text-gym-text text-sm font-medium placeholder:text-gym-muted/30 focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent transition"
            />

            {/* Reps */}
            <input
              ref={(el) => setRef(i, 'reps', el)}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={s.reps}
              onChange={(e) => onSetChange(i, 'reps', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i, 'reps')}
              placeholder={
                prevSets && prevSets[i]
                  ? String(prevSets[i].reps)
                  : '0'
              }
              className="w-full bg-gym-input border border-gym-border rounded-lg px-2 py-2 text-center text-gym-text text-sm font-medium placeholder:text-gym-muted/30 focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent transition"
            />

            {/* Set number (auto-filled, editable) */}
            <input
              ref={(el) => setRef(i, 'setNum', el)}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={s.setNum}
              onChange={(e) => onSetChange(i, 'setNum', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i, 'setNum')}
              className="w-full bg-gym-input border border-gym-border rounded-lg px-2 py-2 text-center text-gym-text text-sm font-medium placeholder:text-gym-muted/50 focus:outline-none focus:border-gym-accent focus:ring-1 focus:ring-gym-accent transition"
            />

            {/* Remove row */}
            {sets.length > 1 ? (
              <button
                type="button"
                onClick={() => onRemoveSet(i)}
                className="flex items-center justify-center w-6 h-6 text-gym-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            ) : (
              <span className="w-6" />
            )}
          </div>
        ))}
      </div>

      {/* Spacebar hint */}
      <p className="text-[9px] text-gym-muted/60 mt-2 text-right italic">
        Press space to jump between fields
      </p>
    </div>
  );
}
