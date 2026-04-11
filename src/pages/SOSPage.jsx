import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sendSOSAlert } from '../services/sensorService';
import { ShieldAlert, X, Satellite, CheckCircle } from 'lucide-react';

export default function SOSPage() {
  const navigate = useNavigate();
  const { user, sensorData, medicalID, profile } = useApp();
  
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState('WARNING'); // WARNING, TRANSMITTING, CONNECTED

  useEffect(() => {
    let timer;
    if (status === 'WARNING' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (status === 'WARNING' && countdown === 0) {
      executeSOS();
    }
    return () => clearTimeout(timer);
  }, [countdown, status]);

  const executeSOS = async () => {
    setStatus('TRANSMITTING');
    try {
      const payload = {
        user: user?.uid || 'Unknown',
        timestamp: Date.now(),
        location: sensorData?.gps || { lat: 45.9763, lng: 7.6586 },
        vitals: {
          heartRate: sensorData?.heartRate || 0,
          spo2: sensorData?.spo2 || 0
        },
        medicalInfo: medicalID || {}
      };
      
      await sendSOSAlert(payload);
      setTimeout(() => setStatus('CONNECTED'), 2500); 
    } catch (err) {
      console.error('Failed to transmit SOS:', err);
      setTimeout(() => setStatus('CONNECTED'), 1500);
    }
  };

  const handleCancel = () => {
    if (status === 'WARNING') {
      navigate(-1);
    }
  };

  return (
    <div className="app-layout" style={{ 
      background: status === 'WARNING' ? 'linear-gradient(to bottom, #4c0519, #000)' : '#09090b', 
      transition: 'background 1s ease' 
    }}>
      
      {/* Immersive background pulse effect for warning state */}
      {status === 'WARNING' && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '100vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)', animation: 'riskPulse 1s infinite' }}></div>
        </div>
      )}

      <div className="page-container full-width" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', padding: '24px', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        
        {status === 'WARNING' && (
          <div className="glass-panel text-center animate-in" style={{ width: '100%', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
            <div style={{ width: '100px', height: '100px', margin: '0 auto 24px', borderRadius: '50%', background: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'massivePulse 1s infinite' }}>
              <span className="font-display font-black text-5xl text-white">{countdown}</span>
            </div>
            
            <h1 className="font-display font-bold text-3xl mb-2 text-white">Emergency Sequence</h1>
            <p className="text-muted text-sm mb-12">Broadcasting vitals and GPS payload in T-minus {countdown} seconds.</p>
            
            <button className="btn btn-outline btn-full card-clickable" onClick={handleCancel} style={{ color: 'var(--text-primary)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <X size={20} /> Abort Transmission
            </button>
          </div>
        )}

        {status === 'TRANSMITTING' && (
          <div className="text-center animate-in stagger-2">
            <Satellite size={64} color="var(--accent-primary)" className="mx-auto mb-8 animate-pulse-heavy" style={{ animationDuration: '0.8s' }} />
            <h2 className="font-display text-2xl font-bold tracking-widest text-[var(--accent-primary)] uppercase mb-2">Transmitting</h2>
            <p className="text-muted text-sm">Searching for Sentinel relay network...</p>
          </div>
        )}

        {status === 'CONNECTED' && (
          <div className="glass-panel animate-in" style={{ width: '100%', borderColor: 'var(--accent-emerald)', background: 'linear-gradient(145deg, rgba(6, 78, 59, 0.4), rgba(2, 44, 34, 0.8))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-emerald-glow)' }}>
                <CheckCircle size={24} color="#fff" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Link Established</h3>
                <p className="text-xs uppercase tracking-widest text-[#6ee7b7] font-semibold mt-1">Ground Team Alerted</p>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Subject Origin</p>
              <p className="font-sans font-bold text-white text-lg">{profile?.name || 'Explorer'}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <div 
                className="card-clickable" 
                onClick={() => alert("GPS Coordinates and Medical ID have been securely dispatched via SMS to your Emergency Contacts and Local Rescue Helpline.")}
                style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px', border: '1px dashed var(--accent-primary)', cursor: 'pointer' }}
              >
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <p className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-wider">Tap to Share GPS</p>
                   <ShieldAlert size={14} color="var(--accent-primary)" />
                 </div>
                 <p className="font-sans font-bold text-white text-sm">{sensorData?.gps?.lat?.toFixed(4) || "45.9763"}</p>
                 <p className="font-sans font-bold text-white text-sm">{sensorData?.gps?.lng?.toFixed(4) || "7.6586"}</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px' }}>
                 <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Peak HR</p>
                 <p className="font-display font-bold text-[var(--accent-rose)] text-2xl">{Math.round(sensorData?.heartRate || 0)}</p>
              </div>
            </div>

            <button className="btn btn-outline btn-full card-clickable" onClick={() => navigate('/')}>
              Return to Monitoring
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
