import React from 'react';
import { useApp } from '../context/AppContext';
import { Radio } from 'lucide-react';

export default function GlobalStatusBar() {
  const { sensorData } = useApp();
  const isConnected = !!sensorData;

  return (
    <div style={{
      width: '100%',
      height: '32px',
      background: isConnected ? 'rgba(47, 127, 95, 0.15)' : 'rgba(244, 63, 94, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderBottom: isConnected ? '1px solid rgba(47, 127, 95, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 5000,
      backdropFilter: 'blur(8px)',
      animation: 'fadeUp 0.5s ease-out'
    }}>
      <Radio size={12} color={isConnected ? '#2dd4bf' : '#f43f5e'} className={isConnected ? '' : 'animate-pulse-heavy'} />
      <span style={{
        fontSize: '10px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: isConnected ? '#2dd4bf' : '#f43f5e'
      }}>
        {isConnected ? 'Device Connected (Live Sync)' : 'Device Disconnected (Offline)'}
      </span>
    </div>
  );
}
