import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateSensorData, getDemoAlerts } from '../services/demoData';
import { subscribeSensorData } from '../services/sensorService';

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

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hikex_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [sensorData, setSensorData] = useState(null);
  const [liveHardwareData, setLiveHardwareData] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(true); // User manual toggle
  const [isHardwareActive, setIsHardwareActive] = useState(false); // Auto-detected from IoT stream
  const [isConnected, setIsConnected] = useState(true);
  
  const [alerts, setAlerts] = useState(() => getDemoAlerts());
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hikex_darkmode') === 'true';
  });
  const [notifications, setNotifications] = useState(true);
  const [medicalID, setMedicalID] = useState(() => {
    const saved = localStorage.getItem('hikex_medical');
    return saved ? JSON.parse(saved) : defaultMedicalID;
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('hikex_profile');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const intervalRef = useRef(null);
  const stalenessTimerRef = useRef(null);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('hikex_darkmode', darkMode);
  }, [darkMode]);

  // LIVE HARDWARE SUBSCRIPTION
  useEffect(() => {
    const unsubscribe = subscribeSensorData((data) => {
      setLiveHardwareData(data);
      setIsHardwareActive(true);
      setIsConnected(true);
      
      // Reset the staleness watchdog timer every time the ESP32 pushes new data
      if (stalenessTimerRef.current) clearTimeout(stalenessTimerRef.current);
      stalenessTimerRef.current = setTimeout(() => {
        setIsHardwareActive(false);
        setIsConnected(false);
      }, 15000); // 15 seconds without data = offline
    });
    return () => {
      unsubscribe();
      if (stalenessTimerRef.current) clearTimeout(stalenessTimerRef.current);
    };
  }, []);

  // MASTER DATA ROUTER (Live vs Demo)
  useEffect(() => {
    // If user explicitly requests Demo Mode OR the hardware is totally offline -> use Fake Data Simulator
    if (isDemoMode || !isHardwareActive) {
      if (!sensorData || isHardwareActive) {
         setSensorData(generateSensorData()); // Seed immediately
      }
      
      intervalRef.current = setInterval(() => {
        setSensorData(generateSensorData());
      }, 3000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      // Hardware is online and transmitting! Map the real payload.
      if (liveHardwareData) {
        setSensorData(liveHardwareData);
      }
    }
  }, [isDemoMode, isHardwareActive, liveHardwareData]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem('hikex_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hikex_user');
    }
  }, [user]);

  // Persist medical ID
  useEffect(() => {
    localStorage.setItem('hikex_medical', JSON.stringify(medicalID));
  }, [medicalID]);

  // Persist profile
  useEffect(() => {
    localStorage.setItem('hikex_profile', JSON.stringify(profile));
  }, [profile]);

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

  const value = {
    user,
    setUser,
    login,
    logout,
    sensorData,
    isDemoMode,
    setIsDemoMode,
    isConnected,
    setIsConnected,
    alerts,
    setAlerts,
    addAlert,
    darkMode,
    setDarkMode,
    notifications,
    setNotifications,
    medicalID,
    setMedicalID,
    profile,
    setProfile,
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
