import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateSensorData, getDemoAlerts } from '../services/demoData';
import { subscribeSensorData, subscribeConnectionStatus } from '../services/sensorService';
import { db, ref, set } from '../services/firebase';
import bleService from '../services/bleService';

const AppContext = createContext(null);

const defaultUser = {
  name: 'Ajay',
  email: 'ajay@hikex.com',
  age: 24,
  avatar: 'A',
  memberSince: 'March 2026',
  totalHikes: 12,
  totalTime: '48h 30m',
  totalDistance: '92.5 km'
};

const defaultMedicalID = {
  fullName: 'Ajay Kowkuntla',
  dob: '2002-05-15',
  bloodType: 'O+',
  allergies: 'None known',
  chronicConditions: 'None',
  medications: 'None',
  medicalDevices: 'None',
  emergencyContact1: { name: 'Parent', phone: '+91 98765 43210', relation: 'Father' },
  emergencyContact2: { name: 'Friend', phone: '+91 87654 32109', relation: 'Friend' },
  primaryDoctor: 'Dr. Sharma',
  doctorPhone: '+91 99887 76655',
  dnr: false,
  advanceDirectives: 'None'
};

// Normalize any incoming data (BLE, Firebase, or Demo) to the standard HIKEX format
function normalizeDeviceData(raw) {
  // If already in the new format (BLE / direct Firebase)
  if (raw && raw.bpm !== undefined) {
    return {
      bpm: raw.bpm ?? 0,
      lat: raw.lat ?? 17.385,
      lng: raw.lng ?? 78.486,
      battery: raw.battery ?? 100,
      lowBattery: raw.lowBattery ?? (raw.battery != null ? raw.battery < 20 : false),
      gpsReady: raw.gpsReady ?? true,
      sos: raw.sos ?? false,
      source: raw.source || 'firebase',
      timestamp: raw.timestamp || Date.now(),
      // Preserve any extra fields from legacy data
      heartRate: raw.bpm ?? raw.heartRate ?? 0,
      spo2: raw.spo2 ?? null,
      temperature: raw.temperature ?? null,
      humidity: raw.humidity ?? null,
      motion: raw.motion ?? null,
      riskLevel: raw.riskLevel ?? null,
      elevation: raw.elevation ?? null,
      gps: raw.gps ?? { lat: raw.lat ?? 17.385, lng: raw.lng ?? 78.486 },
    };
  }

  // Legacy format from demoData / old Firebase structure
  if (raw && raw.heartRate !== undefined) {
    return {
      bpm: raw.heartRate,
      lat: raw.gps?.lat ?? 17.385,
      lng: raw.gps?.lng ?? 78.486,
      battery: raw.battery ?? 100,
      lowBattery: raw.battery != null ? raw.battery < 20 : false,
      gpsReady: true,
      sos: false,
      source: 'demo',
      timestamp: raw.timestamp || Date.now(),
      heartRate: raw.heartRate,
      spo2: raw.spo2,
      temperature: raw.temperature,
      humidity: raw.humidity,
      motion: raw.motion,
      riskLevel: raw.riskLevel,
      elevation: raw.elevation,
      gps: raw.gps,
    };
  }

  return null;
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hikex_user');
    return saved ? JSON.parse(saved) : null;
  });

  // ===== UNIFIED DEVICE DATA =====
  const [deviceData, setDeviceData] = useState({
    bpm: 0, lat: 17.385, lng: 78.486, battery: 100,
    lowBattery: false, gpsReady: false, sos: false,
    source: 'none', timestamp: 0,
  });

  // Legacy sensorData — kept for backward compat with existing pages
  const [sensorData, setSensorData] = useState(null);

  const [bleStatus, setBleStatus] = useState('disconnected'); // scanning, connecting, connected, disconnected, error, reconnecting
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [isDeviceOffline, setIsDeviceOffline] = useState(false);
  const [isFirebaseOnline, setIsFirebaseOnline] = useState(true);

  // EMA Data Smoothing (GOAL #3 and #4)
  const applySmoothing = useCallback((prev, norm) => {
    if (!norm) return null;
    if (!prev || prev.bpm === 0) return norm; 
    
    // Alphas (smoothing factors): Lower = smoother but slower response
    const alphaHR = 0.3; 
    const alphaBat = 0.1;

    // GOAL #3 - Battery Clamp
    const clampedBat = Math.max(0, Math.min(100, norm.battery || 0));
    
    // EMA smoothing
    const smoothedBpm = Math.round((norm.bpm * alphaHR) + (prev.bpm * (1 - alphaHR)));
    const smoothedBat = Math.round((clampedBat * alphaBat) + ((prev.battery || 100) * (1 - alphaBat)));

    return { ...norm, bpm: smoothedBpm, battery: smoothedBat, heartRate: smoothedBpm };
  }, []);

  const [alerts, setAlerts] = useState(() => getDemoAlerts());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('hikex_darkmode') === 'true');
  const [notifications, setNotifications] = useState(true);
  const [medicalID, setMedicalID] = useState(() => {
    const saved = localStorage.getItem('hikex_medical');
    return saved ? JSON.parse(saved) : defaultMedicalID;
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('hikex_profile');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const demoIntervalRef = useRef(null);
  const stalenessTimerRef = useRef(null);
  const sosAlertFiredRef = useRef(false);
  
  const bleStatusRef = useRef(bleStatus);
  useEffect(() => { bleStatusRef.current = bleStatus; }, [bleStatus]);

  // ===== BLE INTEGRATION =====
  const connectBLE = useCallback(async () => {
    try {
      const result = await bleService.connect();
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const disconnectBLE = useCallback(() => {
    bleService.disconnect();
  }, []);

  // BLE status listener
  useEffect(() => {
    const unsub = bleService.onStatusChange((status) => {
      setBleStatus(status);
      if (status === 'connected') {
        setIsConnected(true);
      }
    });
    return unsub;
  }, []);

  // BLE data listener — highest priority
  useEffect(() => {
    const unsub = bleService.onData((data) => {
      const normalized = normalizeDeviceData(data);
      if (normalized) {
        setDeviceData(prev => applySmoothing(prev, normalized));
        setSensorData(prev => applySmoothing(prev, normalized));
        setIsDeviceOffline(false);
      }
    });
    return unsub;
  }, [applySmoothing]);

  // ===== FIREBASE INTEGRATION — background sync =====
  useEffect(() => {
    const unsubConnection = subscribeConnectionStatus(status => {
      setIsFirebaseOnline(status);
    });

    const unsubscribe = subscribeSensorData((data) => {
      setFirebaseConnected(true);
      setIsConnected(true);

      // Only use Firebase data if BLE is NOT connected (BLE has priority)
      if (bleStatus !== 'connected') {
        const normalized = normalizeDeviceData(data);
        if (normalized) {
          normalized.source = 'firebase';
          setDeviceData(prev => applySmoothing(prev, normalized));
          setSensorData(prev => applySmoothing(prev, normalized));
          setIsDeviceOffline(false);
        }
      }

      // Reset staleness timer (GOAL #2)
      if (stalenessTimerRef.current) clearTimeout(stalenessTimerRef.current);
      stalenessTimerRef.current = setTimeout(() => {
        setIsDeviceOffline(true);
        if (bleStatusRef.current !== 'connected') {
          setIsConnected(false);
        }
      }, 10000); // 10 second strict dropout bound
    });

    return () => {
      unsubscribe();
      unsubConnection();
      if (stalenessTimerRef.current) clearTimeout(stalenessTimerRef.current);
    };
  }, [bleStatus, applySmoothing]);

  // ===== DEMO MODE FALLBACK — only when nothing is live =====
  useEffect(() => {
    if (isDemoMode && bleStatus !== 'connected' && !firebaseConnected) {
      setSensorData(generateSensorData()); // Seed
      const normalized = normalizeDeviceData(generateSensorData());
      if (normalized) setDeviceData(prev => applySmoothing(prev, normalized));

      demoIntervalRef.current = setInterval(() => {
        const demoData = generateSensorData();
        setSensorData(demoData);
        const norm = normalizeDeviceData(demoData);
        if (norm) setDeviceData(prev => applySmoothing(prev, norm));
      }, 3000);

      return () => {
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      };
    } else {
      // Stop demo when live source is active
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
    }
  }, [isDemoMode, bleStatus, firebaseConnected]);

  // ===== SOS DETECTION (BUG 4 FIX: deduplicated) =====
  useEffect(() => {
    if (deviceData.sos && !sosAlertFiredRef.current) {
      sosAlertFiredRef.current = true;
      addAlert({
        type: 'critical',
        title: '🚨 EMERGENCY SOS ACTIVATED',
        message: `SOS triggered at ${deviceData.lat.toFixed(4)}, ${deviceData.lng.toFixed(4)}. Contacting emergency services.`,
      });
    } else if (!deviceData.sos) {
      // Reset the flag when SOS is cleared so future SOS events can trigger again
      sosAlertFiredRef.current = false;
    }
  }, [deviceData.sos]);

  // ===== PERSISTENCE =====
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('hikex_darkmode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (user) localStorage.setItem('hikex_user', JSON.stringify(user));
    else localStorage.removeItem('hikex_user');
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('hikex_medical', JSON.stringify(medicalID));
      } catch (e) {
        console.error('Storage failed:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [medicalID]);
  useEffect(() => { localStorage.setItem('hikex_profile', JSON.stringify(profile)); }, [profile]);

  const login = useCallback((userData) => {
    const newUser = { ...defaultUser, ...userData };
    setUser(newUser);
    setProfile(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('hikex_user');
  }, []);

  const addAlert = useCallback((alert) => {
    setAlerts(prev => [{ ...alert, id: Date.now(), timestamp: Date.now() }, ...prev]);
  }, []);

  const clearWarning = useCallback(async () => {
    // Update local state immediately
    setDeviceData(prev => ({ ...prev, sos: false, lowBattery: false }));
    // BUG 5 FIX: Write directly to paths used by ESP32 firmware
    try {
      await set(ref(db, 'sos'), false);
      await set(ref(db, 'low_battery'), false);
    } catch (err) {
      console.error('Failed to clear warning in Firebase:', err);
    }
  }, []);

  const value = {
    user, setUser, login, logout,
    // New unified device data
    deviceData,
    bleStatus,
    firebaseConnected,
    isFirebaseOnline,
    isDeviceOffline,
    connectBLE,
    disconnectBLE,
    clearWarning,
    // Legacy compat
    sensorData,
    isDemoMode, setIsDemoMode,
    isConnected, setIsConnected,
    alerts, setAlerts, addAlert,
    darkMode, setDarkMode,
    notifications, setNotifications,
    medicalID, setMedicalID,
    profile, setProfile,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
