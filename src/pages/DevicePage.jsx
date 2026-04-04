import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { triggerHardwareControl } from '../services/sensorService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Volume2, ShieldAlert } from 'lucide-react';

export default function DevicePage() {
  const navigate = useNavigate();
  const { sensorData } = useApp();
  const isOnline = !!sensorData;
  const [buzzerActive, setBuzzerActive] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (sensorData?.buzzer) {
      setBuzzerActive(sensorData.buzzer === 'On');
    }
  }, [sensorData]);

  const toggleBuzzer = async () => {
    const newState = !buzzerActive;
    setBuzzerActive(newState);
    
    // Send directly to Firebase hardware control route
    const success = await triggerHardwareControl('buzzer', newState ? 'On' : 'Off');
    
    addLog(success 
      ? `Command BUZZER_${newState ? 'ON' : 'OFF'} acknowledged by ESP32` 
      : `Failed: Hardware unresponsive`);
  };

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 10));
  };

  return (
    <div className="page-container">
      <header className="mb-8 flex items-center gap-4 pt-4 animate-in stagger-1">
        <ArrowLeft size={24} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => navigate(-1)} />
        <h1 className="display-text text-2xl font-bold tracking-tight">Hardware Node</h1>
      </header>
      
      <div className="glass-panel mb-6 animate-in stagger-2" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05, pointerEvents: 'none' }}>
           <Cpu size={200} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-widest">Target Connection</p>
            <h2 className="font-display font-bold text-2xl text-[var(--accent-primary)]">ESP32 Core</h2>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', border: `1px solid ${isOnline ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className={`risk-dot ${isOnline ? 'safe' : 'critical'}`} style={{ width: '8px', height: '8px' }}></div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isOnline ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px' }}>
             <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Telemetry</p>
             <p className="font-sans font-bold text-white text-lg">{isOnline ? 'Stable' : 'Lost'}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px' }}>
             <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Power Level</p>
             <p className="font-sans font-bold text-[var(--accent-emerald)] text-lg">98%</p>
          </div>
        </div>
      </div>
      
      <div className="glass-panel mb-6 animate-in stagger-3">
         <h3 className="text-xs text-muted font-semibold uppercase tracking-widest mb-4">Remote Execution</h3>
         
         <div className="toggle-wrapper" style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: buzzerActive ? 'var(--accent-rose-glow)' : 'rgba(255,255,255,0.05)' }}>
                <Volume2 size={20} color={buzzerActive ? 'var(--accent-rose)' : 'var(--text-secondary)'} />
              </div>
              <div className="toggle-label">
                <span className="text-white text-md">Emergency Siren</span>
                <span>Activate loud alarm remotely</span>
              </div>
           </div>
           
           <div className={`toggle ${buzzerActive ? 'active' : ''}`} onClick={toggleBuzzer}></div>
         </div>
      </div>

      <div className="animate-in stagger-4">
        <h3 className="text-xs text-muted font-semibold uppercase tracking-widest mb-2 pl-1">Server Handshake Logs</h3>
        <div style={{ background: '#000', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)', minHeight: '180px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.length === 0 && <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Listening for hardware execution events...</span>}
          {logs.map((log, idx) => (
             <span key={idx} style={{ color: log.includes('Failed') ? 'var(--accent-rose)' : 'var(--accent-primary)' }}>{log}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
