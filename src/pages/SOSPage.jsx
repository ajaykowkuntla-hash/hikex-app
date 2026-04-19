import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { sendSOSAlert } from '../services/sensorService';
import { ShieldAlert, X, Satellite, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SOSPage() {
  const navigate = useNavigate();
  const { user, deviceData, medicalID, profile } = useApp();
  
  const [countdown, setCountdown] = useState(5);
  // IDLE → HOLDING → WARNING → TRANSMITTING → CONNECTED → FAILED
  const [status, setStatus] = useState('IDLE');
  const [failError, setFailError] = useState(null);
  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdAnimRef = useRef(null);

  const executeSOS = useCallback(async () => {
    setStatus('TRANSMITTING');
    setFailError(null);
    try {
      const payload = {
        user: user?.email || user?.name || 'Unknown',
        timestamp: Date.now(),
        location: { lat: deviceData.lat, lng: deviceData.lng },
        vitals: {
          heartRate: deviceData.bpm || 0,
          spo2: deviceData.spo2 || 0
        },
        medicalInfo: medicalID || {}
      };
      
      await sendSOSAlert(payload);
      setTimeout(() => setStatus('CONNECTED'), 2500); 
    } catch (err) {
      console.error('Failed to transmit SOS:', err);
      setFailError(err.message || 'Transmission failed');
      setStatus('FAILED');
    }
  }, [deviceData, medicalID, user]);

  // Countdown only runs during WARNING phase
  useEffect(() => {
    let timer;
    if (status === 'WARNING' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    } else if (status === 'WARNING' && countdown === 0) {
      setTimeout(() => {
        setStatus(s => { if (s === 'WARNING') { executeSOS(); } return s; });
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [countdown, status, executeSOS]);

  // Hold-to-activate: user must hold button for 2 seconds
  const startHold = useCallback(() => {
    holdStartRef.current = Date.now();
    setHoldProgress(0);
    
    const animate = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(1, elapsed / 2000);
      setHoldProgress(progress);
      
      if (progress >= 1) {
        // 2 seconds reached — move to WARNING countdown
        setStatus('WARNING');
        setCountdown(5);
        setHoldProgress(0);
        return;
      }
      holdAnimRef.current = requestAnimationFrame(animate);
    };
    holdAnimRef.current = requestAnimationFrame(animate);
  }, []);

  const cancelHold = useCallback(() => {
    if (holdAnimRef.current) cancelAnimationFrame(holdAnimRef.current);
    holdStartRef.current = null;
    setHoldProgress(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdAnimRef.current) cancelAnimationFrame(holdAnimRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);



  const handleCancel = () => {
    if (status === 'WARNING') {
      setStatus('IDLE');
      setCountdown(5);
    } else if (status === 'IDLE') {
      navigate(-1);
    }
  };

  return (
    <div className="app-layout" style={{ 
      background: status === 'WARNING' ? 'linear-gradient(to bottom, #4c0519, #000)' 
        : status === 'FAILED' ? 'linear-gradient(to bottom, #7f1d1d, #000)'
        : '#09090b', 
      transition: 'background 1s ease' 
    }}>
      
      {/* Immersive background pulse effect for warning state */}
      {status === 'WARNING' && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '100vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)', animation: 'riskPulse 1s infinite' }}></div>
        </div>
      )}

      <div className="page-container full-width" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', padding: '24px', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        
        {/* IDLE — Hold to Activate */}
        {status === 'IDLE' && (
          <div className="glass-panel text-center animate-in" style={{ width: '100%' }}>
            <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 20px', display: 'block' }} />
            
            <h1 className="font-display font-bold text-2xl mb-2 text-white">Emergency SOS</h1>
            <p className="text-muted text-sm" style={{ marginBottom: '24px', lineHeight: 1.6 }}>
              This will broadcast your GPS coordinates, vitals, and medical ID to emergency contacts and rescue services.
            </p>

            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 600 }}>⚠ Only use in genuine emergencies</p>
            </div>
            
            {/* Hold-to-activate button */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <button 
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                onTouchCancel={cancelHold}
                style={{ 
                  width: '100%', padding: '20px', borderRadius: '16px', 
                  background: holdProgress > 0 
                    ? `linear-gradient(90deg, rgba(239,68,68,0.6) ${holdProgress * 100}%, rgba(239,68,68,0.15) ${holdProgress * 100}%)`
                    : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(244,63,94,0.3))',
                  border: '2px solid rgba(239,68,68,0.5)', color: '#fff', 
                  fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                  transition: holdProgress > 0 ? 'none' : 'all 0.3s',
                  userSelect: 'none', WebkitUserSelect: 'none',
                }}
              >
                {holdProgress > 0 
                  ? `Hold... ${Math.round(holdProgress * 100)}%` 
                  : '🚨 Hold for 2s to Activate SOS'}
              </button>
            </div>

            <button className="btn btn-outline btn-full card-clickable" onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <X size={20} /> Cancel
            </button>
          </div>
        )}

        {/* WARNING — Countdown */}
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

        {/* TRANSMITTING */}
        {status === 'TRANSMITTING' && (
          <div className="text-center animate-in stagger-2">
            <Satellite size={64} color="var(--accent-primary)" className="mx-auto mb-8 animate-pulse-heavy" style={{ animationDuration: '0.8s' }} />
            <h2 className="font-display text-2xl font-bold tracking-widest text-[var(--accent-primary)] uppercase mb-2">Transmitting</h2>
            <p className="text-muted text-sm">Searching for Sentinel relay network...</p>
          </div>
        )}

        {/* CONNECTED — Success */}
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
                 <p className="font-sans font-bold text-white text-sm">{deviceData.lat?.toFixed(4)}</p>
                 <p className="font-sans font-bold text-white text-sm">{deviceData.lng?.toFixed(4)}</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px' }}>
                 <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Peak HR</p>
                 <p className="font-display font-bold text-[var(--accent-rose)] text-2xl">{Math.round(deviceData.bpm || 0)}</p>
              </div>
            </div>

            <button className="btn btn-outline btn-full card-clickable" onClick={() => navigate('/')}>
              Return to Monitoring
            </button>
          </div>
        )}

        {/* FAILED — Error with retry */}
        {status === 'FAILED' && (
          <div className="glass-panel animate-in" style={{ width: '100%', borderColor: 'rgba(239,68,68,0.4)', background: 'linear-gradient(145deg, rgba(127, 29, 29, 0.4), rgba(0,0,0,0.8))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={24} color="#fff" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Transmission Failed</h3>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Could not reach emergency network</p>
              </div>
            </div>

            {failError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.8rem', color: '#fca5a5', fontFamily: 'monospace' }}>{failError}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={executeSOS}
                style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} /> Retry
              </button>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-outline card-clickable"
                style={{ flex: 1, color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
