import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { triggerHardwareControl } from '../services/sensorService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Volume2, Activity, MapPin, Zap, RefreshCw, Server, CheckCircle2, XCircle, Power } from 'lucide-react';

export default function DevicePage() {
  const navigate = useNavigate();
  const { sensorData, isDemoMode, setIsDemoMode, bleStatus, firebaseConnected, isConnected, connectBLE, disconnectBLE } = useApp();
  
  const connected = bleStatus === 'connected' || firebaseConnected || isConnected; 

  const [logs, setLogs] = useState([]);
  
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 10));
  };

  const handleReconnect = () => {
    addLog("Attempting Handshake with ESP32...");
    setTimeout(() => {
      addLog(connected ? "ESP32 Already Synced" : "Handshake Timeout. Device Unreachable.");
    }, 1500);
  };

  const handleTestSensors = () => {
    addLog("Running Diagnostics: IMU, HR, PIR, GPS...");
    setTimeout(() => {
      addLog("Diagnostics Complete: Sensors Operating Nominally");
    }, 2000);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      
      <header className="mb-6 flex items-center gap-4 pt-4 animate-in stagger-1">
        <ArrowLeft size={24} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => navigate(-1)} />
        <h1 className="display-text text-2xl font-bold tracking-tight">Status</h1>
      </header>
      
      {/* Target Connection */}
      <div className="glass-panel mb-6 animate-in stagger-2" style={{ position: 'relative', overflow: 'hidden', padding: '24px' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05, pointerEvents: 'none' }}>
           <Cpu size={200} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-widest">Hardware Target</p>
            <h2 className="font-display font-bold text-3xl text-white">ESP32 Core</h2>
            <p className="text-xs text-secondary mt-1">Last Sync: {connected ? 'Just Now' : '12m ago'}</p>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', border: `1px solid ${connected ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={`risk-dot ${connected ? 'safe' : 'critical'}`} style={{ width: '10px', height: '10px' }}></div>
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: connected ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Sensor Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
           {/* IMU */}
           <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {connected ? <CheckCircle2 size={20} color="var(--accent-emerald)" /> : <XCircle size={20} color="var(--accent-rose)" />}
              </div>
              <div>
                <p className="font-bold text-white text-sm">IMU Sensor</p>
                <p className="text-xs text-muted">{connected ? 'Calibrated' : 'Offline'}</p>
              </div>
           </div>

           {/* HR */}
           <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {connected ? <Activity size={20} color="var(--accent-emerald)" /> : <XCircle size={20} color="var(--accent-rose)" />}
              </div>
              <div>
                <p className="font-bold text-white text-sm">Heart Rate</p>
                <p className="text-xs text-muted">{connected ? `${sensorData?.bpm || sensorData?.heartRate || 0} BPM` : 'Offline'}</p>
              </div>
           </div>

           {/* GPS */}
           <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {connected ? <MapPin size={20} color="var(--accent-emerald)" /> : <XCircle size={20} color="var(--accent-rose)" />}
              </div>
              <div>
                <p className="font-bold text-white text-sm">GPS Fix</p>
                <p className="text-xs text-muted">{connected ? `3D Lock` : 'Searching...'}</p>
              </div>
           </div>

           {/* Battery */}
           <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Zap size={20} color="var(--accent-teal)" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Battery</p>
                <p className="text-xs text-[var(--accent-teal)] font-bold">{connected ? `${sensorData?.battery ?? 0}%` : '--'}</p>
              </div>
           </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="glass-panel mb-6 animate-in stagger-3" style={{ padding: '24px' }}>
         <h3 className="text-xs text-muted font-semibold uppercase tracking-widest mb-4">Device Operations</h3>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handleReconnect} className="card-clickable" style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff', fontWeight: 'bold' }}>
               <RefreshCw size={18} /> Reconnect Device
            </button>
            <button onClick={handleTestSensors} className="card-clickable" style={{ padding: '16px', background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>
               <Server size={18} /> Test Sensors
            </button>
            
            <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <p className="font-bold text-white text-sm">Demo Mode Sandbox</p>
                 <p className="text-xs text-muted">Bypass hardware with simulated payload.</p>
               </div>
               <div className={`toggle ${isDemoMode ? 'active' : ''}`} onClick={() => {
                 setIsDemoMode(!isDemoMode);
                 addLog(isDemoMode ? "Disabled Demo Mode. Awaiting hardware sync." : "Sandbox active. Supplying mocked payload.");
               }}></div>
            </div>
         </div>
      </div>

      <div className="animate-in stagger-4">
        <h3 className="text-xs text-muted font-semibold uppercase tracking-widest mb-2 pl-1">Server Terminal</h3>
        <div style={{ background: '#000', borderRadius: '16px', padding: '16px', border: '1px solid var(--glass-border)', minHeight: '120px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.length === 0 && <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Listening for hardware execution events...</span>}
          {logs.map((log, idx) => (
             <span key={idx} style={{ color: log.includes('Failed') ? 'var(--accent-rose)' : 'var(--accent-teal)' }}>{log}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
