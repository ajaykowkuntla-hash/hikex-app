import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function FloatingSOS() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on login and SOS pages
  if (location.pathname === '/login' || location.pathname === '/sos') return null;

  return (
    <button
      className="floating-sos"
      onClick={() => navigate('/sos')}
      id="floating-sos-button"
      aria-label="Emergency SOS"
    >
      <AlertCircle size={28} />
    </button>
  );
}
