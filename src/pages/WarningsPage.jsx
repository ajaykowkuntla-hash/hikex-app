import React from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, AlertTriangle, ShieldAlert, HeartPulse, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WarningsPage() {
  const { alerts, setAlerts } = useApp();
  const navigate = useNavigate();

  const handleClear = () => {
    if (window.confirm('CRITICAL ACTION: Are you sure you want to clear all telemetry warnings? This cannot be undone.')) {
      setAlerts([]);
    }
  };

  const getIconForType = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('heart') || msg.includes('bpm')) return <HeartPulse size={24} color="#f43f5e" />;
    if (msg.includes('fall') || msg.includes('motion')) return <Activity size={24} color="#f59e0b" />;
    return <AlertTriangle size={24} color="#f43f5e" />;
  };

  return (
    <div className="page-container" style={{ paddingTop: '50px' }}>
      
      <header className="animate-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
             <ShieldAlert size={24} color="var(--accent-rose)" className="animate-pulse-heavy" />
             <h1 className="display-text text-2xl font-bold tracking-tight text-white">System Logs</h1>
          </div>
          <p className="text-secondary text-sm">Real-time hardware anomaly tracking.</p>
        </div>
        
        {alerts.length > 0 && (
          <button onClick={handleClear} className="card-clickable" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '100px', color: 'var(--accent-rose)', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <Trash2 size={16} /> CLEAR LOGS
          </button>
        )}
      </header>

      {alerts.length === 0 ? (
        <div className="animate-in stagger-2" style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '24px', background: 'var(--glass-bg)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--accent-emerald)' }}>
             <ShieldAlert size={32} color="var(--accent-emerald)" />
          </div>
          <h3 className="text-white font-display font-bold text-xl mb-2">No Warnings</h3>
          <p className="text-muted text-sm">Your telemetry stream looks crystal clear. No anomalies detected on the current route.</p>
        </div>
      ) : (
        <div className="animate-in stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.map((alert, idx) => (
            <div key={idx} className="glass-panel card-clickable" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', borderLeft: alert.type === 'critical' ? '4px solid var(--accent-rose)' : '4px solid var(--accent-amber)' }}>
               
               <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 {getIconForType(alert.message || alert.title)}
               </div>
               
               <div style={{ flex: 1 }}>
                 <h4 className="text-white font-display font-bold text-lg" style={{ lineHeight: 1.2 }}>{alert.title || "Anomaly Detected"}</h4>
                 <p className="text-muted text-sm" style={{ marginTop: '4px' }}>{alert.message}</p>
                 <span className="text-xs font-bold" style={{ color: alert.type === 'critical' ? 'var(--accent-rose)' : 'var(--accent-amber)', textTransform: 'uppercase', marginTop: '8px', display: 'block', letterSpacing: '0.1em' }}>
                   {alert.time || "JUST NOW"} • TACTICAL LOG
                 </span>
               </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
