import React from 'react';
import { useApp } from '../context/AppContext';
import { Radio, Bluetooth, Wifi, WifiOff } from 'lucide-react';

export default function GlobalStatusBar() {
  const { bleStatus, firebaseConnected, isDemoMode, deviceData } = useApp();

  const isBLE = bleStatus === 'connected';
  const isLive = isBLE || firebaseConnected;

  let label = 'Offline';
  let color = '#f43f5e';
  let Icon = WifiOff;

  if (isBLE) {
    label = 'BLE Connected (HIKEX_Device)';
    color = '#3b82f6';
    Icon = Bluetooth;
  } else if (firebaseConnected) {
    label = 'Firebase Connected (Cloud Sync)';
    color = '#10b981';
    Icon = Wifi;
  } else if (isDemoMode) {
    label = 'Demo Mode (Simulated Data)';
    color = '#f59e0b';
    Icon = Radio;
  }

  return (
    <div style={{
      width: '100%',
      height: '32px',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderBottom: `1px solid ${color}30`,
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 5000,
      backdropFilter: 'blur(8px)',
    }}>
      <Icon size={12} color={color} />
      <span style={{
        fontSize: '10px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color
      }}>
        {label}
      </span>
      {deviceData.battery > 0 && (
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>
          🔋 {deviceData.battery}%
        </span>
      )}
    </div>
  );
}
