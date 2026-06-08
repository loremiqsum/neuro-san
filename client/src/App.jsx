import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Dumbbell, CalendarCog, History, Music } from 'lucide-react';
import DailyTracker from './pages/DailyTracker';
import RoutinePlanner from './pages/RoutinePlanner';
import WorkoutHistory from './pages/WorkoutHistory';
import GymMusic from './pages/GymMusic';

const NAV = [
  { to: '/', icon: Dumbbell, label: 'Workout' },
  { to: '/planner', icon: CalendarCog, label: 'Planner' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/music', icon: Music, label: 'Music' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gym-bg pb-20">
        <Routes>
          <Route path="/" element={<DailyTracker />} />
          <Route path="/planner" element={<RoutinePlanner />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/music" element={<GymMusic />} />
        </Routes>

        {/* Bottom tab bar - mobile first */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gym-card border-t border-gym-border z-50">
          <div className="max-w-lg mx-auto flex justify-around">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center py-3 px-4 text-xs transition-colors ${
                    isActive
                      ? 'text-gym-accent-light'
                      : 'text-gym-muted hover:text-gym-text'
                  }`
                }
              >
                <Icon size={22} />
                <span className="mt-1">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </BrowserRouter>
  );
}
