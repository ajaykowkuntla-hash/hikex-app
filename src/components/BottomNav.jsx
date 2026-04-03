import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Bell, Settings, Cpu } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/device', icon: Cpu, label: 'Control' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();

  // Hide on login page
  if (location.pathname === '/login') return null;

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id={`nav-${label.toLowerCase()}`}
        >
          <span className="nav-icon">
            <Icon size={20} />
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
