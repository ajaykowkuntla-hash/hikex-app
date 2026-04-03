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
  const [isDemoMode, setIsDemoMode] = useState(true);
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

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('hikex_darkmode', darkMode);
  }, [darkMode]);

  // Demo mode sensor data polling
  useEffect(() => {
    if (isDemoMode) {
      // Generate initial data
      setSensorData(generateSensorData());
      
      // Update every 3 seconds
      intervalRef.current = setInterval(() => {
        setSensorData(generateSensorData());
      }, 3000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      // Live Firebase mode
      const unsubscribe = subscribeSensorData((data) => {
        setSensorData(data);
      });
      return () => unsubscribe();
    }
  }, [isDemoMode]);

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
