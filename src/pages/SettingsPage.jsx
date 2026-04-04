import { ArrowLeft, Settings as SettingsIcon, LogOut, Sliders, Shield, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isDemoMode, setIsDemoMode, logout } = useApp();
  
  // Settings States
  const [notifications, setNotifications] = useState(true);
  const [offlineMap, setOfflineMap] = useState(false);
  const [metricUnits, setMetricUnits] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [broadcastMedical, setBroadcastMedical] = useState(true);
  const [lowPowerMode, setLowPowerMode] = useState(false);

  return (
    <div className="page-container">
      <header className="mb-6 flex items-center gap-4 animate-in stagger-1">
        <ArrowLeft size={24} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => navigate(-1)} />
        <h1 className="display-text text-2xl font-bold tracking-tight">System Settings</h1>
      </header>

      <div className="glass-panel mb-6 animate-in stagger-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
           <Sliders size={20} className="text-[var(--accent-primary)]" />
           <h3 className="font-display font-semibold text-white">Hardware Bridge</h3>
        </div>
        
        <div className="toggle-wrapper" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <div className="toggle-label">
            <span className="text-white text-sm">Force Local Simulation</span>
            <span>Disconnect from ESP32 & simulate payload</span>
          </div>
          <div className={`toggle ${isDemoMode ? 'active' : ''}`} onClick={() => setIsDemoMode(!isDemoMode)}></div>
        </div>

        <div className="toggle-wrapper">
          <div className="toggle-label">
            <span className="text-white text-sm">Low Power Mode (BTLE)</span>
            <span>Reduce hardware polling to save ESP32 battery</span>
          </div>
          <div className={`toggle ${lowPowerMode ? 'active' : ''}`} onClick={() => setLowPowerMode(!lowPowerMode)}></div>
        </div>
      </div>

      <div className="glass-panel mb-6 animate-in stagger-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
           <SettingsIcon size={20} className="text-[var(--text-secondary)]" />
           <h3 className="font-display font-semibold text-white">Application</h3>
        </div>
        
        <div className="toggle-wrapper" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <div className="toggle-label">
            <span className="text-white text-sm">Critical Push Notifications</span>
            <span>Receive alerts for high HR and drops</span>
          </div>
          <div className={`toggle ${notifications ? 'active' : ''}`} onClick={() => setNotifications(!notifications)}></div>
        </div>

        <div className="toggle-wrapper">
          <div className="toggle-label">
            <span className="text-white text-sm">Offline Map Caching</span>
            <span>Download 3D topography models locally</span>
          </div>
          <div className={`toggle ${offlineMap ? 'active' : ''}`} onClick={() => setOfflineMap(!offlineMap)}></div>
        </div>

        <div className="toggle-wrapper">
          <div className="toggle-label">
            <span className="text-white text-sm">Metric Units</span>
            <span>Use Celsius (°C) and Meters (m)</span>
          </div>
          <div className={`toggle ${metricUnits ? 'active' : ''}`} onClick={() => setMetricUnits(!metricUnits)}></div>
        </div>
      </div>

      <div className="glass-panel mb-8 animate-in stagger-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
           <Shield size={20} className="text-[var(--accent-amber)]" />
           <h3 className="font-display font-semibold text-white">Security & Privacy</h3>
        </div>
        
        <div className="toggle-wrapper" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <div className="toggle-label">
            <span className="text-white text-sm">Share Location to Basecamp</span>
            <span>Transmit live coordinates continuously</span>
          </div>
          <div className={`toggle ${shareLocation ? 'active' : ''}`} onClick={() => setShareLocation(!shareLocation)}></div>
        </div>

        <div className="toggle-wrapper">
          <div className="toggle-label">
            <span className="text-white text-sm">Broadcast Medical ID</span>
            <span>Attach medical data to outbound SOS packets</span>
          </div>
          <div className={`toggle ${broadcastMedical ? 'active' : ''}`} onClick={() => setBroadcastMedical(!broadcastMedical)}></div>
        </div>
      </div>

      <div className="animate-in stagger-5">
        <button 
          className="btn btn-full" 
          onClick={logout}
          style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.3)' }}
        >
          <LogOut size={18} /> Disconnect Account
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
           <p className="text-xs uppercase tracking-widest text-muted" style={{ opacity: 0.5 }}>HIKEX Firmware v2.1.0</p>
        </div>
      </div>

    </div>
  );
}
