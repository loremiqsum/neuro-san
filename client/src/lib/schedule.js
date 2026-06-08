export const DAYS = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

export const DAY_CONFIG = {
  monday:    { type: 'Push',             hex: '#ef4444', muscles: 'Chest & Triceps' },
  tuesday:   { type: 'Pull',             hex: '#3b82f6', muscles: 'Back & Biceps' },
  wednesday: { type: 'Legs / Shoulders', hex: '#22c55e', muscles: 'Shoulders & Legs' },
  thursday:  { type: 'Push',             hex: '#ef4444', muscles: 'Chest & Triceps' },
  friday:    { type: 'Pull',             hex: '#3b82f6', muscles: 'Back & Biceps' },
  saturday:  { type: 'Shoulders',        hex: '#f59e0b', muscles: 'Shoulders' },
  sunday:    { type: 'Rest Day',         hex: '#8b5cf6', muscles: 'Recovery' },
};

export function getTodayKey() {
  return DAYS[new Date().getDay()];
}

export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
