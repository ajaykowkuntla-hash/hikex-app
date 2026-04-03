import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Settings, ToggleLeft, Bell, Moon, Sun, User,
  Shield, Heart, Database, Zap, AlertTriangle,
  Mountain, Info, ChevronRight, Wifi
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    isDemoMode, setIsDemoMode, 
    darkMode, setDarkMode,
    notifications, setNotifications,
    isConnected, setIsConnected,
    addAlert
  } = useApp();
  const navigate = useNavigate();

  const simulateFall = () => {
    addAlert({
      type: 'critical',
      title: 'Fall Detected!',
      message: 'Sudden acceleration change detected. Emergency protocol initiated.',
    });
  };

  const simulateLowSpO2 = () => {
    addAlert({
      type: 'warning',
      title: 'SpO2 Warning',
      message: 'Blood oxygen dropped to 89%. Consider descending to lower altitude.',
    });
  };

  const simulateHighHR = () => {
    addAlert({
      type: 'warning',
      title: 'High Heart Rate',
      message: 'Heart rate spiked to 165 bpm. Rest recommended immediately.',
    });
  };

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={24} />
          Settings
        </h1>
      </div>

      {/* Data Mode */}
      <div className="settings-section animate-in stagger-1">
        <div className="settings-section-title">Data Source</div>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon" style={{ background: 'var(--accent-yellow-bg)', color: 'var(--accent-yellow)' }}>
                <Database size={18} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Demo Mode</span>
                <span className="settings-item-desc">Use simulated sensor data</span>
              </div>
            </div>
            <div 
              className={`toggle ${isDemoMode ? 'active' : ''}`}
              onClick={() => setIsDemoMode(!isDemoMode)}
              id="demo-mode-toggle"
            ></div>
          </div>
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon" style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)' }}>
                <Wifi size={18} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Device Connection</span>
                <span className="settings-item-desc">ESP32 simulation status</span>
              </div>
            </div>
            <div 
              className={`toggle ${isConnected ? 'active' : ''}`}
              onClick={() => setIsConnected(!isConnected)}
              id="connection-toggle"
            ></div>
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      {isDemoMode && (
        <div className="settings-section animate-in stagger-2">
          <div className="settings-section-title">Simulation Controls</div>
          <div className="settings-card">
            <div className="settings-item" onClick={simulateFall}>
              <div className="settings-item-left">
                <div className="settings-icon" style={{ background: 'var(--accent-red-bg)', color: 'var(--accent-red)' }}>
                  <AlertTriangle size={18} />
                </div>
                <div className="settings-item-text">
                  <span className="settings-item-title">Simulate Fall</span>
                  <span className="settings-item-desc">Trigger fall detection alert</span>
                </div>
              </div>
              <Zap size={16} color="var(--accent-red)" />
            </div>
            <div className="settings-item" onClick={simulateLowSpO2}>
              <div className="settings-item-left">
                <div className="settings-icon" style={{ background: 'var(--accent-orange-bg)', color: 'var(--accent-orange)' }}>
                  <AlertTriangle size={18} />
                </div>
                <div className="settings-item-text">
                  <span className="settings-item-title">Simulate Low SpO2</span>
                  <span className="settings-item-desc">Trigger oxygen warning</span>
                </div>
              </div>
              <Zap size={16} color="var(--accent-orange)" />
            </div>
            <div className="settings-item" onClick={simulateHighHR}>
              <div className="settings-item-left">
                <div className="settings-icon" style={{ background: 'var(--accent-yellow-bg)', color: 'var(--accent-yellow)' }}>
                  <Heart size={18} />
                </div>
                <div className="settings-item-text">
                  <span className="settings-item-title">Simulate High Heart Rate</span>
                  <span className="settings-item-desc">Trigger heart rate warning</span>
                </div>
              </div>
              <Zap size={16} color="var(--accent-yellow)" />
            </div>
          </div>
        </div>
      )}

      {/* Preferences */}
      <div className="settings-section animate-in stagger-2">
        <div className="settings-section-title">Preferences</div>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon" style={{ background: 'var(--accent-purple-bg)', color: 'var(--accent-purple)' }}>
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Dark Mode</span>
                <span className="settings-item-desc">{darkMode ? 'Dark theme active' : 'Light theme active'}</span>
              </div>
            </div>
            <div 
              className={`toggle ${darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
              id="dark-mode-toggle"
            ></div>
          </div>
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon" style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }}>
                <Bell size={18} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Notifications</span>
                <span className="settings-item-desc">{notifications ? 'Alerts enabled' : 'Alerts disabled'}</span>
              </div>
            </div>
            <div 
              className={`toggle ${notifications ? 'active' : ''}`}
              onClick={() => setNotifications(!notifications)}
              id="notifications-toggle"
            ></div>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="settings-section animate-in stagger-3">
        <div className="settings-section-title">Account</div>
        <div className="settings-card">
          <div className="settings-item" onClick={() => navigate('/profile')}>
            <div className="settings-item-left">
              <div className="settings-icon" style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }}>
                <User size={18} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Profile</span>
                <span className="settings-item-desc">Manage your account</span>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
          <div className="settings-item" onClick={() => navigate('/medical')}>
            <div className="settings-item-left">
              <div className="settings-icon" style={{ background: 'var(--accent-red-bg)', color: 'var(--accent-red)' }}>
                <Heart size={18} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Medical ID</span>
                <span className="settings-item-desc">Health & emergency info</span>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
          <div className="settings-item" onClick={() => navigate('/history')}>
            <div className="settings-item-left">
              <div className="settings-icon" style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)' }}>
                <Mountain size={18} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Hiking History</span>
                <span className="settings-item-desc">View past hikes</span>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings-section animate-in stagger-4">
        <div className="settings-section-title">About</div>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-icon" style={{ background: 'var(--bg-secondary)' }}>
                <Info size={18} color="var(--text-secondary)" />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">HIKEX</span>
                <span className="settings-item-desc">Version 1.0.0 • Smart Hiking Safety</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
