import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Activity, Heart, Navigation, Siren, ShieldCheck, MapIcon, Radio, CloudSun, History, Wind } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, sensorData, profile } = useApp();

  const heartRate = Math.round(sensorData?.heartRate || 72);
  const spo2 = Math.round(sensorData?.spo2 || 98);
  const isOnline = !!sensorData;

  // Risk assessment mapping
  let riskLevel = 'Safe';
  let riskClass = 'safe';
  
  if (heartRate > 120 || spo2 < 92) {
    riskLevel = 'Moderate';
    riskClass = 'moderate';
  }
  if (heartRate > 160 || spo2 < 85) {
    riskLevel = 'Critical';
    riskClass = 'critical';
  }

  // Simulated Weather Data
  const currentTemp = 24;
  const condition = "Clear / Dry";
  const windStr = "12 km/h";

  return (
    <div className="page-container">
      {/* Header Profile Ribbon */}
      <header className="animate-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="display-text text-primary" style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.02em', marginBottom: '4px' }}>HIKEX</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Welcome back, <span style={{ color: 'white' }}>{profile?.name || 'Explorer'}</span>.
          </p>
        </div>
        <button 
          onClick={() => navigate('/profile')}
          className="card-clickable"
          style={{ 
            width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--glass-border)', 
            background: 'linear-gradient(135deg, var(--accent-primary), #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontFamily: 'var(--font-display)', fontWeight: 'bold', fontSize: '1.25rem', color: '#fff',
            boxShadow: '0 10px 20px var(--accent-primary-glow)', cursor: 'pointer', outline: 'none'
          }}
          aria-label="Enter Profile Page"
        >
          {profile?.avatar || 'H'}
        </button>
      </header>

      {/* Environmental & Trail Conditions Module */}
      <div className="glass-panel animate-in stagger-2" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.2)' }}>
            <CloudSun size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
              <span className="font-display font-bold text-white text-2xl" style={{ lineHeight: 1 }}>{currentTemp}°C</span>
              <span className="text-secondary font-semibold" style={{ fontSize: '0.875rem', paddingBottom: '2px' }}>Trail Base</span>
            </div>
            <p className="text-xs tracking-widest uppercase font-bold" style={{ color: 'var(--accent-amber)', marginTop: '4px' }}>{condition}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
             <span className="text-xs font-bold text-muted uppercase">{windStr}</span>
             <Wind size={16} color="var(--text-secondary)" />
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
             <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
             <span className="text-[10px] font-bold tracking-widest text-[#10b981] uppercase" style={{ lineHeight: 1 }}>AQI 42</span>
          </div>
        </div>
      </div>
      
      {/* Risk Indicator Card */}
      <div className={`risk-card ${riskClass} mb-6 animate-in stagger-2`}>
        <div className="risk-content">
          <div className="risk-label">Environment Risk</div>
          <div className="risk-value">
            {riskLevel} <div className={`risk-dot ${riskClass}`}></div>
          </div>
        </div>
        <div className="risk-content text-right">
          <div className="risk-label">Altitude</div>
          <div className="risk-value" style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>
            2,840 m
          </div>
        </div>
      </div>

      {/* Sensor Grid (Glassmorphism) */}
      <div className="sensor-grid animate-in stagger-3">
        <div className="sensor-card">
          <div className="sensor-icon" style={{ background: 'var(--accent-rose-glow)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <Heart size={20} color="var(--accent-rose)" />
          </div>
          <div className="sensor-label">Heart Rate</div>
          <div className="sensor-value-block">
            <span className="sensor-value">{heartRate}</span>
            <span className="sensor-unit">bpm</span>
          </div>
        </div>
        
        <div className="sensor-card">
          <div className="sensor-icon" style={{ background: 'var(--accent-primary-glow)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <Activity size={20} color="var(--accent-primary)" />
          </div>
          <div className="sensor-label">Blood Oxygen</div>
          <div className="sensor-value-block">
            <span className="sensor-value">{spo2}</span>
            <span className="sensor-unit">%</span>
          </div>
        </div>
      </div>

      {/* Network Hardware Status Link */}
      <div 
        className="glass-panel text-center py-4 mb-6 cursor-pointer flex justify-center items-center gap-3 animate-in stagger-4 hover:bg-[rgba(255,255,255,0.05)]"
        onClick={() => navigate('/device')}
      >
        <Radio size={20} className={isOnline ? "text-[var(--accent-emerald)]" : "text-[var(--accent-rose)]"} />
        <span className="font-600 text-[var(--text-secondary)] text-sm tracking-wide">
          ESP32 HARDWARE: <span className={isOnline ? "text-[var(--accent-emerald)]" : "text-[var(--accent-rose)]"}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </span>
      </div>

      {/* Action Grid */}
      <h3 className="animate-in stagger-4 text-muted" style={{ marginBottom: '16px', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Mission Controls</h3>
      <div className="action-grid animate-in stagger-4">
        
        <div className="action-widget sos card-clickable" onClick={() => navigate('/sos')}>
          <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center border border-[rgba(244,63,94,0.5)] animate-pulse-heavy">
            <Siren size={24} color="var(--accent-rose)" />
          </div>
          <div>
            <h4 className="font-display font-bold text-lg text-white tracking-wide">EMERGENCY SOS</h4>
            <p className="text-xs text-[rgba(255,255,255,0.6)] uppercase tracking-wide">Broadcast Signal</p>
          </div>
        </div>
        
        <div className="action-widget card-clickable" onClick={() => navigate('/map')}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <MapIcon size={20} />
          </div>
          <span className="font-display font-semibold text-[var(--text-primary)]">Recon Map</span>
        </div>
        
        <div className="action-widget card-clickable" onClick={() => navigate('/medical')}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <ShieldCheck size={20} />
          </div>
          <span className="font-display font-semibold text-[var(--text-primary)]">Medical ID</span>
        </div>

        <div className="action-widget card-clickable" onClick={() => navigate('/history')}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <History size={20} />
          </div>
          <span className="font-display font-semibold text-[var(--text-primary)]">Historic Routes</span>
        </div>
      </div>
    </div>
  );
}
