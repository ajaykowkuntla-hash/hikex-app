import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cpu, Wifi, WifiOff, Battery, Volume2, VolumeX,
  Radio, RotateCcw, Thermometer, Heart, MapPin,
  Activity, Gauge, Signal
} from 'lucide-react';

function getLogEntries() {
  const now = new Date();
  const entries = [
    { time: -2, msg: 'System initialized. All sensors online.' },
    { time: -15, msg: 'GPS lock acquired. 8 satellites.' },
    { time: -30, msg: 'Heart rate sensor calibrated.' },
    { time: -45, msg: 'IMU motion detection active.' },
    { time: -60, msg: 'WiFi connected. Signal: -65dBm' },
    { time: -90, msg: 'Firebase connection established.' },
    { time: -120, msg: 'SpO2 sensor ready. IR LED ok.' },
    { time: -180, msg: 'Temperature sensor: DHT22 detected.' },
    { time: -240, msg: 'Human presence sensor: PIR active.' },
    { time: -300, msg: 'Boot sequence complete. Device ID: ESP32-HKX-0127' },
  ];
  
  return entries.map(e => {
    const t = new Date(now.getTime() + e.time * 1000);
    return {
      time: t.toTimeString().slice(0, 8),
      msg: e.msg
    };
  });
}

export default function DevicePage() {
  const { sensorData, isConnected, setIsConnected } = useApp();
  const [buzzerOn, setBuzzerOn] = useState(false);
  const [beaconOn, setBeaconOn] = useState(false);
  const [logs] = useState(getLogEntries);

  const battery = sensorData?.battery || 85;
  const batteryClass = battery > 50 ? 'high' : battery > 20 ? 'medium' : 'low';

  const sensors = [
    { name: 'Heart Rate', icon: Heart, status: true, color: 'var(--accent-red)' },
    { name: 'SpO2', icon: Activity, status: true, color: 'var(--accent-blue)' },
    { name: 'Temperature', icon: Thermometer, status: true, color: 'var(--accent-orange)' },
    { name: 'GPS', icon: MapPin, status: true, color: 'var(--accent-green)' },
    { name: 'IMU/Motion', icon: Gauge, status: true, color: 'var(--accent-purple)' },
    { name: 'PIR Sensor', icon: Signal, status: true, color: 'var(--accent-yellow)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={24} />
          Control Panel
        </h1>
      </div>

      {/* Device Status */}
      <div className="device-status-card animate-in stagger-1" id="device-status">
        <div className="device-icon">
          <Cpu size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>ESP32-HIKEX</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Device ID: ESP32-HKX-0127
          </div>
        </div>
        <span 
          className={`badge ${isConnected ? 'badge-connected' : 'badge-disconnected'}`}
          onClick={() => setIsConnected(!isConnected)}
          style={{ cursor: 'pointer' }}
        >
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Battery */}
      <div className="card animate-in stagger-2 mb-md" id="battery-indicator">
        <div className="flex-between mb-sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Battery size={18} color={battery > 50 ? 'var(--accent-green)' : battery > 20 ? 'var(--accent-yellow)' : 'var(--accent-red)'} />
            <span style={{ fontWeight: 500 }}>Battery Level</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{battery}%</span>
        </div>
        <div className="battery-bar">
          <div className={`battery-fill ${batteryClass}`} style={{ width: `${battery}%` }}></div>
        </div>
      </div>

      {/* Controls Grid */}
      <h3 className="mb-sm animate-in stagger-2">Controls</h3>
      <div className="control-grid animate-in stagger-3">
        <div 
          className={`control-card ${buzzerOn ? 'active-control' : ''}`}
          onClick={() => setBuzzerOn(!buzzerOn)}
          id="buzzer-toggle"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {buzzerOn ? <Volume2 size={20} color="var(--accent-green)" /> : <VolumeX size={20} color="var(--text-muted)" />}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Buzzer</div>
          <div style={{ fontSize: '0.75rem', color: buzzerOn ? 'var(--accent-green)' : 'var(--text-muted)' }}>
            {buzzerOn ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div 
          className={`control-card ${beaconOn ? 'active-control' : ''}`}
          onClick={() => setBeaconOn(!beaconOn)}
          id="beacon-toggle"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Radio size={20} color={beaconOn ? 'var(--accent-green)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Emergency Beacon</div>
          <div style={{ fontSize: '0.75rem', color: beaconOn ? 'var(--accent-green)' : 'var(--text-muted)' }}>
            {beaconOn ? 'Broadcasting' : 'Off'}
          </div>
        </div>
      </div>

      {/* Sensor Availability */}
      <h3 className="mb-sm mt-md animate-in stagger-3">Sensor Status</h3>
      <div className="card animate-in stagger-4" style={{ padding: '12px' }}>
        {sensors.map((s, idx) => (
          <div key={idx} className="flex-between" style={{ padding: '10px 8px', borderBottom: idx < sensors.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <s.icon size={16} color={s.color} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{s.name}</span>
            </div>
            <span className="badge badge-connected" style={{ fontSize: '0.6875rem' }}>
              Active
            </span>
          </div>
        ))}
      </div>

      {/* Calibration */}
      <h3 className="mb-sm mt-md animate-in stagger-4">Calibration</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} className="animate-in stagger-5">
        <button className="btn btn-outline" style={{ fontSize: '0.8125rem', padding: '8px 14px' }}>
          <RotateCcw size={14} /> Calibrate IMU
        </button>
        <button className="btn btn-outline" style={{ fontSize: '0.8125rem', padding: '8px 14px' }}>
          <RotateCcw size={14} /> Reset GPS
        </button>
        <button className="btn btn-outline" style={{ fontSize: '0.8125rem', padding: '8px 14px' }}>
          <RotateCcw size={14} /> SpO2 Baseline
        </button>
      </div>

      {/* System Log */}
      <h3 className="mb-sm mt-md animate-in stagger-5">System Log</h3>
      <div className="system-log animate-in stagger-5" id="system-log">
        {logs.map((entry, idx) => (
          <div className="log-entry" key={idx}>
            <span className="log-time">[{entry.time}]</span>
            {entry.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
