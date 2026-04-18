import { ArrowLeft, Bell, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AlertsPage() {
  const navigate = useNavigate();
  const { alerts } = useApp();

  return (
    <div className="page-container">
      <header className="mb-6 flex justify-between items-center animate-in stagger-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowLeft size={24} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => navigate(-1)} />
          <h1 className="display-text text-2xl font-bold tracking-tight">System Alerts</h1>
        </div>
      </header>

      <div className="glass-panel text-center animate-in stagger-2" style={{ marginBottom: '24px', padding: '24px 16px', background: 'rgba(34, 211, 238, 0.05)', borderColor: 'rgba(34, 211, 238, 0.2)' }}>
        <Bell size={32} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
        <h3 className="font-sans font-bold text-lg mb-1">Monitoring Active</h3>
        <p className="text-xs text-muted uppercase tracking-widest">Awaiting anomaly detection</p>
      </div>

      <div className="animate-in stagger-3">
        <h3 className="text-xs text-muted font-semibold uppercase tracking-widest mb-3 pl-1">Recent Events</h3>
        
        {alerts.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
            <p className="text-muted text-sm">No recent alerts recorded.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert) => (
              <div key={alert.id} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: alert.type === 'critical' ? 'var(--accent-rose-glow)' : 'var(--accent-amber-glow)' }}>
                  <AlertTriangle size={20} color={alert.type === 'critical' ? 'var(--accent-rose)' : 'var(--accent-amber)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                     <h4 className="font-bold text-white text-sm">{alert.title || alert.type}</h4>
                     <span className="text-xs text-muted">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-muted">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
