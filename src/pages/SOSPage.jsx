import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sendSOSAlert } from '../services/sensorService';
import { 
  AlertCircle, Phone, Heart, Activity, 
  MapPin, X, Shield, User 
} from 'lucide-react';

export default function SOSPage() {
  const { sensorData, addAlert, profile, medicalID } = useApp();
  const navigate = useNavigate();
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [sent, setSent] = useState(false);
  const intervalRef = useRef(null);

  const handleTrigger = () => {
    setTriggered(true);
    setCountdown(30);
  };

  const handleCancel = () => {
    setTriggered(false);
    setCountdown(30);
    setSent(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (triggered && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(intervalRef.current);
    } else if (triggered && countdown <= 0 && !sent) {
      // Auto-send SOS
      handleSend();
    }
  }, [triggered, countdown, sent]);

  const handleSend = async () => {
    setSent(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const alertData = {
      type: 'sos',
      userName: profile?.name || 'Unknown',
      location: sensorData?.gps || { lat: 28.5983, lng: 83.9311 },
      heartRate: sensorData?.heartRate,
      spo2: sensorData?.spo2,
      message: 'Emergency SOS triggered by user',
    };

    await sendSOSAlert(alertData);
    
    addAlert({
      type: 'critical',
      title: 'SOS Alert Sent',
      message: 'Emergency alert has been sent to all contacts and rescue services.',
    });
  };

  return (
    <div className="page-container">
      <div className="sos-wrapper">
        {/* Header */}
        <div className="flex-between" style={{ width: '100%', marginBottom: '8px' }}>
          <h1 style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={24} />
            Emergency SOS
          </h1>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: 'none', color: 'var(--text-secondary)', padding: '8px' }}
            id="sos-close-btn"
          >
            <X size={24} />
          </button>
        </div>

        {!triggered && !sent && (
          <>
            <p className="sos-status-text">
              Press the SOS button to send an emergency alert.<br />
              You will have 30 seconds to cancel.
            </p>
            <button 
              className="sos-main-btn" 
              onClick={handleTrigger}
              id="sos-trigger-btn"
            >
              SOS
            </button>
          </>
        )}

        {triggered && !sent && (
          <>
            <div className="sos-countdown animate-in" id="sos-countdown">
              {countdown}
            </div>
            <p className="sos-status-text">
              SOS alert will be sent in {countdown} seconds.<br />
              Press cancel if you are safe.
            </p>
            <button 
              className="sos-main-btn triggered" 
              onClick={handleSend}
              id="sos-send-now-btn"
            >
              SEND NOW
            </button>
          </>
        )}

        {sent && (
          <div className="animate-in" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'var(--accent-red-bg)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <Shield size={40} color="var(--accent-red)" />
            </div>
            <h2 style={{ color: 'var(--accent-red)', marginBottom: '8px' }}>SOS Alert Sent!</h2>
            <p className="sos-status-text">
              Emergency services and your contacts have been notified.<br />
              Stay where you are if possible.
            </p>
          </div>
        )}

        {/* Live Sensor Readings */}
        {sensorData && (
          <div className="sos-sensors animate-in stagger-2">
            <div className="sos-sensor-card">
              <Heart size={16} color="var(--accent-red)" />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Heart Rate</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{sensorData.heartRate} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>bpm</span></div>
            </div>
            <div className="sos-sensor-card">
              <Activity size={16} color="var(--accent-blue)" />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>SpO2</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{sensorData.spo2}<span style={{ fontSize: '0.75rem', fontWeight: 400 }}>%</span></div>
            </div>
            <div className="sos-sensor-card">
              <MapPin size={16} color="var(--accent-green)" />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Location</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{sensorData.gps?.lat.toFixed(3)}, {sensorData.gps?.lng.toFixed(3)}</div>
            </div>
            <div className="sos-sensor-card">
              <User size={16} color="var(--accent-purple)" />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Blood Type</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{medicalID?.bloodType || 'O+'}</div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="card" style={{ width: '100%', maxWidth: '400px', marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={16} color="var(--accent-blue)" />
            Emergency Contacts
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{medicalID?.emergencyContact1?.name || 'Parent'}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{medicalID?.emergencyContact1?.relation || 'Father'}</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--accent-blue)', fontWeight: 500 }}>
                {medicalID?.emergencyContact1?.phone || '+91 98765 43210'}
              </div>
            </div>
            <div className="flex-between" style={{ padding: '8px 0' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Rescue Service</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Nepal</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--accent-red)', fontWeight: 500 }}>
                +977 1-4228094
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {(triggered || sent) && (
          <button 
            className="sos-cancel-btn animate-in" 
            onClick={handleCancel}
            id="sos-cancel-btn"
          >
            {sent ? 'Back to Home' : "I'm Safe — Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}
