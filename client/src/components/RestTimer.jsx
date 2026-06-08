import { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw } from 'lucide-react';

const PRESETS = [
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '120s', seconds: 120 },
  { label: '3m', seconds: 180 },
];

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    function beep(time) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start(time);
      osc.stop(time + 0.15);
    }
    beep(ctx.currentTime);
    beep(ctx.currentTime + 0.3);
    beep(ctx.currentTime + 0.6);
  } catch {
    // Audio not available
  }
}

export default function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running || remaining <= 0) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          playBeep();
          try { navigator.vibrate?.([200, 100, 200, 100, 200]); } catch { /* ignore */ }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  function startTimer(seconds) {
    setDuration(seconds);
    setRemaining(seconds);
    setRunning(true);
  }

  function togglePause() {
    setRunning((prev) => !prev);
  }

  function reset() {
    setRunning(false);
    setRemaining(duration);
  }

  function handleCustomStart() {
    const secs = parseInt(customInput, 10);
    if (secs > 0) startTimer(secs);
  }

  const pct = duration > 0 ? remaining / duration : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const color =
    remaining === 0 && duration > 0
      ? '#ef4444'
      : pct > 0.5
        ? '#22c55e'
        : pct > 0.2
          ? '#eab308'
          : '#ef4444';

  // Floating button (collapsed) — pill shape with label
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gym-accent shadow-lg shadow-gym-accent/30 hover:bg-gym-accent-light transition-all active:scale-95"
      >
        <Timer size={20} className="text-white" />
        <span className="text-white font-semibold text-sm">
          {running ? `${mins}:${secs.toString().padStart(2, '0')}` : 'Rest'}
        </span>
      </button>
    );
  }

  const circumference = 2 * Math.PI * 45;

  // Expanded panel
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={() => { if (!running) setIsOpen(false); }}
    >
      <div
        className="w-full max-w-lg bg-gym-card border-t border-gym-border rounded-t-2xl p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gym-text flex items-center gap-2">
            <Timer size={20} className="text-gym-accent" />
            Rest Timer
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gym-muted hover:text-gym-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Timer display */}
        {duration > 0 && (
          <div className="text-center mb-6">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="45"
                  fill="none" stroke="#1e1e2e" strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct)}
                  style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold font-mono" style={{ color }}>
                  {mins}:{secs.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Play/pause + reset */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={reset}
                className="w-12 h-12 rounded-full bg-gym-input border border-gym-border flex items-center justify-center text-gym-muted hover:text-gym-text transition-colors"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={togglePause}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all active:scale-95"
                style={{ backgroundColor: color }}
              >
                {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
            </div>

            {remaining === 0 && duration > 0 && (
              <p className="text-green-400 font-semibold mt-3 animate-pulse">
                Rest complete! Get back to work!
              </p>
            )}
          </div>
        )}

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.seconds}
              onClick={() => startTimer(p.seconds)}
              className={`py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                duration === p.seconds && running
                  ? 'bg-gym-accent text-white'
                  : 'bg-gym-input border border-gym-border text-gym-text hover:border-gym-accent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomStart(); }}
            placeholder="Custom (seconds)"
            className="flex-1 bg-gym-input border border-gym-border rounded-xl px-3 py-2.5 text-sm text-gym-text placeholder:text-gym-muted/50 focus:outline-none focus:border-gym-accent"
          />
          <button
            onClick={handleCustomStart}
            className="px-4 py-2.5 bg-gym-accent rounded-xl text-white text-sm font-semibold hover:bg-gym-accent-light transition active:scale-95"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
