import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Moon, AlertTriangle, User, Activity } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  if (location.pathname === '/login') return null;

  const links = [
    { to: '/', icon: Home },
    { to: '/dashboard', icon: Activity },
    { to: '/map', icon: Map },
    { to: '/stars', icon: Moon },
    { to: '/warnings', icon: AlertTriangle },
    { to: '/profile', icon: User }
  ];

  return (
    <nav id="bottom-navigation">
      {links.map((link) => (
        <NavLink 
          key={link.to} 
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => {
            const Icon = link.icon;
            return <Icon size={22} className={isActive ? 'drop-shadow-md' : 'opacity-60'} strokeWidth={isActive ? 2.5 : 2} />;
          }}
        </NavLink>
      ))}
    </nav>
  );
}
