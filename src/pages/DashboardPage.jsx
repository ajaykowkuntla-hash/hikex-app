import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Battery, MapPin, Wifi, WifiOff, Bluetooth, BluetoothOff, AlertTriangle, Shield, Radio, Zap, Activity, Navigation, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const MAX_HISTORY = 60; // Keep last 60 readings

export default function DashboardPage() {
  const navigate = useNavigate();
  const { deviceData, bleStatus, firebaseConnected, isDeviceOffline, isFirebaseOnline, connectBLE, disconnectBLE, isDemoMode, clearWarning } = useApp();
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [showHRModal, setShowHRModal] = useState(false);
  const [bpmHistory, setBpmHistory] = useState([]);
  const [uiClearSOS, setUiClearSOS] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Pulse animation for heart tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Last update timer calculation
  useEffect(() => {
    const timer = setInterval(() => {
      if (deviceData.timestamp) {
        const diff = Math.floor((Date.now() - deviceData.timestamp) / 1000);
        setSecondsAgo(diff);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deviceData.timestamp]);

  // Reset UI clear if SOS turns on again
  useEffect(() => {
    if (deviceData.sos) {
      setUiClearSOS(false);
    }
  }, [deviceData.sos]);

  // Collect BPM history
  useEffect(() => {
    if (deviceData.bpm > 0) {
      setBpmHistory(prev => {
        const entry = { bpm: deviceData.bpm, time: Date.now() };
        const updated = [...prev, entry];
        return updated.slice(-MAX_HISTORY);
      });
    }
  }, [deviceData.bpm, deviceData.timestamp]);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      await connectBLE();
    } catch (err) {
      setConnectError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const isBLEConnected = bleStatus === 'connected';
  
  // GOAL #2 - Offline Status Parsing
  const sourceLabel = isBLEConnected ? 'Live Data 🟢' : (isDeviceOffline && !isDemoMode) ? 'Device Offline ❌' : firebaseConnected ? 'Live Data 🟢' : isDemoMode ? 'Demo Server' : 'Connecting...';
  const sourceColor = sourceLabel.includes('Offline') ? '#dc2626' : sourceLabel.includes('Live') ? '#10b981' : '#f59e0b';

  const statusIcon = () => {
    if (isBLEConnected) return <Bluetooth size={14} color="#10b981" />;
    if (sourceLabel.includes('Offline')) return <WifiOff size={14} color="#dc2626" />;
    if (firebaseConnected) return <Wifi size={14} color="#10b981" />;
    return <Radio size={14} color="#f59e0b" />;
  };

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>

      {/* Header */}
      <header className="animate-in stagger-1" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>HIKEX Wearable</p>
            <h1 className="display-text text-2xl font-bold tracking-tight" style={{ color: '#fff' }}>Device Monitor</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', background: `${sourceColor}15`, border: `1px solid ${sourceColor}30` }}>
            {statusIcon()}
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: sourceColor }}>{sourceLabel}</span>
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '12px', lineHeight: 1.5 }}>
          HIKEX is a real-time IoT wearable system that monitors heart rate and location, and provides emergency alerts for hikers. This system performs real-time monitoring. Future versions may include predictive analytics.
        </p>
      </header>

      {/* SOS EMERGENCY BANNER */}
      {deviceData.sos && !uiClearSOS && (
        <div className="animate-in" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '2px solid #ef4444', boxShadow: '0 0 40px rgba(239,68,68,0.4)', animation: 'sosPulse 1.5s infinite' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertTriangle size={28} color="#fff" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>🚨 EMERGENCY DETECTED</h2>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>SOS signal active from device</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button onClick={() => navigate('/map')} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>View Map</button>
            <button onClick={() => setUiClearSOS(true)} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>Clear Warning (UI only)</button>
            <button onClick={clearWarning} style={{ flex: '1 1 100%', padding: '12px 20px', background: '#fff', border: '1px solid #fff', borderRadius: '12px', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>Acknowledge Emergency</button>
          </div>
        </div>
      )}

      {/* LOW BATTERY WARNING */}
      {deviceData.lowBattery && !deviceData.sos && (
        <div className="animate-in" style={{ background: 'rgba(245,158,11,0.15)', borderRadius: '16px', padding: '14px 16px', marginBottom: '20px', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Zap size={20} color="#f59e0b" />
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>Low Battery Warning</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Device battery at {deviceData.battery}%. Charge soon.</p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="animate-in stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>

        {/* Large Heart Rate Typography */}
        <div style={{ gridColumn: 'span 2', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s' }}>
          
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.15), transparent)', filter: 'blur(20px)' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '8px' }}>Heart Rate</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', transition: 'all 0.3s ease-out' }}>
                  <span style={{ fontSize: '4.5rem', fontWeight: '800', color: '#ef4444', lineHeight: 1, textShadow: '0 4px 20px rgba(239,68,68,0.3)' }}>
                    {deviceData.bpm || '--'}
                  </span>
                  <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>BPM</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: deviceData.bpm > 120 ? '#ef4444' : deviceData.bpm > 100 ? '#f59e0b' : deviceData.bpm > 0 ? '#10b981' : 'var(--text-secondary)', fontWeight: 600, marginTop: '8px' }}>
                  {deviceData.bpm > 120 ? '⚠ Elevated Risk' : deviceData.bpm > 100 ? '↗ High Activity' : deviceData.bpm > 0 ? '✓ Safe & Stable' : '— Searching...'}
                </p>
              </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Heart
                size={48}
                color="#ef4444"
                fill={pulse ? '#ef4444' : 'none'}
                style={{ transition: 'all 0.3s', transform: pulse ? 'scale(1.15)' : 'scale(1)', opacity: deviceData.bpm > 0 ? 1 : 0.3 }}
              />
            </div>
          </div>
          {/* Mini sparkline preview */}
          {bpmHistory.length > 2 && (
            <svg width="100%" height="30" style={{ marginTop: '12px', opacity: 0.5 }} viewBox={`0 0 ${bpmHistory.length - 1} 30`} preserveAspectRatio="none">
              <polyline
                fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                points={bpmHistory.map((h, i) => {
                  const minB = Math.min(...bpmHistory.map(x => x.bpm));
                  const maxB = Math.max(...bpmHistory.map(x => x.bpm));
                  const range = maxB - minB || 1;
                  const y = 28 - ((h.bpm - minB) / range) * 26;
                  return `${i},${y}`;
                }).join(' ')}
              />
            </svg>
          )}
        </div>

      {/* ===== HEART RATE DETAIL MODAL ===== */}
      {showHRModal && (() => {
        const bpms = bpmHistory.map(h => h.bpm);
        const minBpm = bpms.length > 0 ? Math.min(...bpms) : 0;
        const maxBpm = bpms.length > 0 ? Math.max(...bpms) : 0;
        const avgBpm = bpms.length > 0 ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : 0;
        const latest = bpmHistory.slice(-10).reverse();
        const graphW = 320;
        const graphH = 160;
        const padX = 35;
        const padY = 15;
        const plotW = graphW - padX - 10;
        const plotH = graphH - padY * 2;
        const range = (maxBpm - minBpm) || 1;

        // Zone classification
        const zone = deviceData.bpm > 140 ? { label: 'Peak', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
          : deviceData.bpm > 120 ? { label: 'Cardio', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
          : deviceData.bpm > 100 ? { label: 'Active', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' }
          : { label: 'Resting', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowHRModal(false)}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '430px', background: '#0f172a', borderRadius: '28px 28px 0 0', padding: '24px 20px 40px', maxHeight: '85vh', overflowY: 'auto', animation: 'fadeUp 0.4s ease-out' }}>
              
              {/* Handle bar */}
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)', margin: '0 auto 16px' }} />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Heart size={22} color="#ef4444" fill="#ef4444" />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Heart Rate</h2>
                </div>
                <button onClick={() => setShowHRModal(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Current + Zone */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#ef4444', lineHeight: 1 }}>{deviceData.bpm}</span>
                    <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>BPM</span>
                  </div>
                </div>
                <div style={{ padding: '8px 16px', borderRadius: '12px', background: zone.bg, border: `1px solid ${zone.color}30` }}>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zone</p>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', color: zone.color, margin: 0 }}>{zone.label}</p>
                </div>
              </div>

              {/* SVG Graph */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px 8px 8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
                <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '8px', paddingLeft: '8px' }}>Live Trend</p>
                {bpmHistory.length > 2 ? (
                  <svg width="100%" viewBox={`0 0 ${graphW} ${graphH}`} style={{ display: 'block' }}>
                    {/* Y-axis labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                      const val = Math.round(minBpm + range * (1 - frac));
                      const y = padY + plotH * frac;
                      return (
                        <g key={i}>
                          <line x1={padX} y1={y} x2={graphW - 10} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <text x={padX - 6} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end">{val}</text>
                        </g>
                      );
                    })}
                    {/* Gradient fill */}
                    <defs>
                      <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area fill */}
                    <polygon
                      fill="url(#hrFill)"
                      points={
                        bpmHistory.map((h, i) => {
                          const x = padX + (i / Math.max(1, bpmHistory.length - 1)) * plotW;
                          const y = padY + plotH - ((h.bpm - minBpm) / range) * plotH;
                          return `${x},${y}`;
                        }).join(' ') + ` ${padX + plotW},${padY + plotH} ${padX},${padY + plotH}`
                      }
                    />
                    {/* Line */}
                    <polyline
                      fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      points={bpmHistory.map((h, i) => {
                        const x = padX + (i / Math.max(1, bpmHistory.length - 1)) * plotW;
                        const y = padY + plotH - ((h.bpm - minBpm) / range) * plotH;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    {/* Current point dot */}
                    {bpmHistory.length > 0 && (() => {
                      const last = bpmHistory[bpmHistory.length - 1];
                      const x = padX + plotW;
                      const y = padY + plotH - ((last.bpm - minBpm) / range) * plotH;
                      return <circle cx={x} cy={y} r="4" fill="#ef4444" stroke="#fff" strokeWidth="2" />;
                    })()}
                  </svg>
                ) : (
                  <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
                    Collecting data... ({bpmHistory.length}/3 readings)
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Min', value: minBpm, icon: <TrendingDown size={14} color="#3b82f6" />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                  { label: 'Avg', value: avgBpm, icon: <Minus size={14} color="#f59e0b" />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  { label: 'Max', value: maxBpm, icon: <TrendingUp size={14} color="#ef4444" />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: s.bg, border: `1px solid ${s.color}20`, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
                      {s.icon}
                      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: s.color }}>{s.value}</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginLeft: '2px' }}>bpm</span>
                  </div>
                ))}
              </div>

              {/* Recent Readings */}
              <div>
                <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '10px' }}>Recent Readings</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {latest.length > 0 ? latest.map((entry, i) => {
                    const timeStr = new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                    const bpmColor = entry.bpm > 120 ? '#ef4444' : entry.bpm > 100 ? '#f59e0b' : '#10b981';
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{timeStr}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Heart size={12} color={bpmColor} fill={bpmColor} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: bpmColor }}>{entry.bpm}</span>
                          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>bpm</span>
                        </div>
                      </div>
                    );
                  }) : (
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '20px' }}>No readings yet</p>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: '16px' }}>
                Showing last {bpmHistory.length} of {MAX_HISTORY} readings
              </p>
            </div>
          </div>
        );
      })()}

        {/* Battery */}
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '20px', border: `1px solid ${deviceData.lowBattery ? 'rgba(245,158,11,0.3)' : 'var(--glass-border)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', fontWeight: 700, margin: 0 }}>Battery</p>
            <Battery size={18} color={deviceData.battery > 50 ? '#10b981' : deviceData.battery > 20 ? '#f59e0b' : '#ef4444'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', transition: 'all 0.3s ease-out' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: deviceData.battery > 50 ? '#10b981' : deviceData.battery > 20 ? '#f59e0b' : '#ef4444', lineHeight: 1 }}>
              {deviceData.battery}
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: deviceData.battery > 50 ? '#10b981' : deviceData.battery > 20 ? '#f59e0b' : '#ef4444' }}>%</span>
          </div>
          {/* Battery bar */}
          <div style={{ marginTop: '10px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${deviceData.battery}%`, borderRadius: '3px', background: deviceData.battery > 50 ? '#10b981' : deviceData.battery > 20 ? '#f59e0b' : '#ef4444', transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* GPS Status */}
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '20px', border: '1px solid var(--glass-border)', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', fontWeight: 700, margin: 0 }}>GPS Location</p>
            <MapPin size={18} color={deviceData.gpsReady ? '#10b981' : '#f59e0b'} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: deviceData.gpsReady ? '#10b981' : '#f59e0b', lineHeight: 1.2 }}>
            {deviceData.gpsReady ? 'Connected 🟢' : 'Searching for GPS signal (go outdoors)...'}
          </span>
          {deviceData.gpsReady && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', fontFamily: 'monospace' }}>
              Lat: {deviceData.lat.toFixed(5)} , Lng: {deviceData.lng.toFixed(5)}
            </p>
          )}
          {deviceData.gpsReady && (
            <button 
              onClick={() => window.open(`https://maps.google.com/?q=${deviceData.lat},${deviceData.lng}`, '_blank')}
              style={{ marginTop: '14px', width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Open in Maps
            </button>
          )}
        </div>

        {/* Device Connection Status */}
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '20px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', fontWeight: 700, margin: 0 }}>Device Link</p>
            <Radio size={18} color={isBLEConnected ? '#3b82f6' : firebaseConnected ? '#10b981' : '#ef4444'} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: isBLEConnected ? '#3b82f6' : firebaseConnected ? '#10b981' : '#ef4444' }}>
            {isBLEConnected ? 'BLE Connected 🟢' : firebaseConnected ? 'Cloud Sync Active 🟢' : 'Disconnected 🔴'}
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {secondsAgo > 0 ? `Last updated: ${secondsAgo} seconds ago` : 'Updated just now'}
          </p>
        </div>

        {/* SOS Status */}
        <div style={{ background: deviceData.sos ? 'rgba(239,68,68,0.15)' : 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '20px', border: `1px solid ${deviceData.sos ? 'rgba(239,68,68,0.4)' : 'var(--glass-border)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)', fontWeight: 700, margin: 0 }}>SOS</p>
            <Shield size={18} color={deviceData.sos ? '#ef4444' : '#10b981'} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: deviceData.sos ? '#ef4444' : '#10b981' }}>
            {deviceData.sos ? '🚨 ACTIVE' : '✓ Clear'}
          </span>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {deviceData.sos ? 'Emergency detected' : 'No emergency'}
          </p>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="animate-in stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {!isBLEConnected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: connecting ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', cursor: connecting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: connecting ? 'none' : '0 8px 24px rgba(59,130,246,0.3)', transition: 'all 0.3s' }}
          >
            {connecting ? (
              <><Activity size={18} style={{ animation: 'spin 1s linear infinite' }} /> Scanning for HIKEX_Device...</>
            ) : (
              <><Bluetooth size={18} /> Connect Device</>
            )}
          </button>
        ) : (
          <button
            onClick={disconnectBLE}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <BluetoothOff size={18} /> Disconnect Device
          </button>
        )}

        {connectError && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#ef4444" />
            <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{connectError}</span>
          </div>
        )}

        {(deviceData.sos || deviceData.lowBattery) && (
          <button onClick={clearWarning} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Shield size={16} /> Clear Warning
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="animate-in stagger-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button onClick={() => navigate('/map')} style={{ padding: '16px', borderRadius: '16px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Navigation size={22} color="#2dd4bf" />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Live Map</span>
        </button>
        <button onClick={() => navigate('/sos')} style={{ padding: '16px', borderRadius: '16px', background: deviceData.sos ? 'rgba(239,68,68,0.15)' : 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: `1px solid ${deviceData.sos ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)'}`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <AlertTriangle size={22} color="#ef4444" />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Emergency</span>
        </button>
      </div>

    </div>
  );
}
