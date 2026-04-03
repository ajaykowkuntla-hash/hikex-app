import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Thermometer, Droplets, Heart, Activity, 
  MapPin, Cpu, Phone, Clock, Wifi, WifiOff,
  TriangleAlert
} from 'lucide-react';

export default function DashboardPage() {
  const { sensorData, isDemoMode, isConnected, profile } = useApp();
  const navigate = useNavigate();

  if (!sensorData) {
    return (
      <div className="page-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading sensor data...</p>
        </div>
      </div>
    );
  }

  const riskClass = sensorData.riskLevel.toLowerCase();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between mb-md animate-in">
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Welcome back,</p>
          <h1 style={{ fontSize: '1.75rem' }}>{profile?.name || 'Hiker'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isDemoMode && (
            <span className="badge badge-demo" id="demo-badge">
              <TriangleAlert size={12} />
              DEMO
            </span>
          )}
          <span className={`badge ${isConnected ? 'badge-connected' : 'badge-disconnected'}`} id="connection-badge">
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Risk Level */}
      <div className={`risk-card ${riskClass} animate-in stagger-1`} id="risk-level-card">
        <div>
          <div className="risk-label">RISK LEVEL</div>
          <div className="risk-value">
            <span className={`risk-dot ${riskClass}`}></span>
            <span style={{ color: riskClass === 'safe' ? 'var(--accent-green-dark)' : riskClass === 'moderate' ? 'var(--accent-yellow-dark)' : riskClass === 'high' ? 'var(--accent-orange)' : 'var(--accent-red-dark)' }}>
              {sensorData.riskLevel}
            </span>
          </div>
        </div>
        <div className="risk-terrain">
          <div className="risk-terrain-label">Terrain</div>
          <div className="risk-terrain-value">{sensorData.terrain}</div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="sensor-grid animate-in stagger-2">
        <div className="sensor-card" id="temp-card">
          <div className="sensor-icon" style={{ background: 'var(--accent-orange-bg)', color: 'var(--accent-orange)' }}>
            <Thermometer size={18} />
          </div>
          <div className="sensor-label">Temperature</div>
          <div className="sensor-value">
            {sensorData.temperature}
            <span className="sensor-unit">°C</span>
          </div>
        </div>

        <div className="sensor-card" id="humidity-card">
          <div className="sensor-icon" style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }}>
            <Droplets size={18} />
          </div>
          <div className="sensor-label">Humidity</div>
          <div className="sensor-value">
            {sensorData.humidity}
            <span className="sensor-unit">%</span>
          </div>
        </div>

        <div className="sensor-card" id="heartrate-card">
          <div className="sensor-icon" style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)' }}>
            <Heart size={18} />
          </div>
          <div className="sensor-label">Heart Rate</div>
          <div className="sensor-value">
            {sensorData.heartRate}
            <span className="sensor-unit">bpm</span>
          </div>
        </div>

        <div className="sensor-card" id="spo2-card">
          <div className="sensor-icon" style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)' }}>
            <Activity size={18} />
          </div>
          <div className="sensor-label">SpO2</div>
          <div className="sensor-value">
            {sensorData.spo2}
            <span className="sensor-unit">%</span>
          </div>
        </div>
      </div>

      {/* Status Row */}
      <div className="status-row animate-in stagger-3">
        <div className="status-item">
          <div className="status-item-label">Motion</div>
          <div className={`status-item-value ${sensorData.motion === 'High' ? 'warning' : ''}`}>
            {sensorData.motion}
          </div>
        </div>
        <div className="status-item">
          <div className="status-item-label">Human Nearby</div>
          <div className={`status-item-value ${sensorData.humanNearby === 'Yes' ? 'on' : ''}`}>
            {sensorData.humanNearby}
          </div>
        </div>
        <div className="status-item">
          <div className="status-item-label">Buzzer</div>
          <div className={`status-item-value ${sensorData.buzzer === 'On' ? 'on' : 'off'}`}>
            {sensorData.buzzer}
          </div>
        </div>
      </div>

      {/* Updated timestamp */}
      <div className="updated-text animate-in stagger-3">
        <Clock size={14} />
        Updated less than a minute ago
      </div>

      {/* Quick Actions */}
      <div className="quick-actions animate-in stagger-4">
        <div className="quick-action-card card-clickable" onClick={() => navigate('/map')} id="quick-action-map">
          <MapPin size={20} className="action-icon" />
          <span className="action-label">Live Map</span>
        </div>
        <div className="quick-action-card card-clickable" onClick={() => navigate('/device')} id="quick-action-control">
          <Cpu size={20} className="action-icon" />
          <span className="action-label">Control Panel</span>
        </div>
        <div className="quick-action-card sos-action card-clickable" onClick={() => navigate('/sos')} id="quick-action-sos">
          <Phone size={20} className="action-icon" />
          <span className="action-label">Emergency SOS</span>
        </div>
      </div>
    </div>
  );
}
