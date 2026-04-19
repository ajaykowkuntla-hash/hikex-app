import { db, ref, onValue, off, set, push } from './firebase';

// Subscribe to real-time sensor data from Firebase
export function subscribeSensorData(callback) {
  let combinedData = {
    bpm: null,
    battery: null,
    lowBattery: false,
    lat: null,
    lng: null,
    sos: false,
    gpsReady: 'Searching',
    firebaseStatus: 'Offline',
    timestamp: Date.now()
  };

  const notify = () => {
    callback({
      bpm: combinedData.bpm,
      battery: combinedData.battery,
      lowBattery: combinedData.lowBattery,
      lat: combinedData.lat,
      lng: combinedData.lng,
      sos: combinedData.sos,
      gpsReady: combinedData.gpsReady === 'Connected',
      firebaseStatus: combinedData.firebaseStatus,
      timestamp: combinedData.timestamp || Date.now()
    });
  };

  const paths = [
    { p: 'health/bpm', key: 'bpm' },
    { p: 'battery', key: 'battery' },
    { p: 'low_battery', key: 'lowBattery' },
    { p: 'gps/lat', key: 'lat' },
    { p: 'gps/lng', key: 'lng' },
    { p: 'sos', key: 'sos' },
    { p: 'status/gps', key: 'gpsReady' },
    { p: 'status/firebase', key: 'firebaseStatus' },
    { p: 'last_seen', key: 'timestamp' }
  ];

  const unsubs = paths.map(({ p, key }) => {
    const r = ref(db, p);
    return onValue(r, (snapshot) => {
      combinedData[key] = snapshot.val();
      notify();
    });
  });

  return () => unsubs.forEach(unsub => unsub());
}

// Send SOS alert to Firebase
export async function sendSOSAlert(alertData) {
  try {
    const alertsRef = ref(db, 'alerts');
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, {
      ...alertData,
      timestamp: Date.now(),
      type: 'sos',
      status: 'active'
    });
    
    // Explicitly trigger the physical hardware buzzer on the IoT device
    await set(ref(db, 'controls/buzzer'), true);
    
    return { success: true, id: newAlertRef.key };
  } catch (error) {
    console.error('Error sending SOS alert:', error);
    return { success: false, error: error.message };
  }
}

// Trigger specific hardware control state
export async function triggerHardwareControl(node, state) {
  try {
    const controlRef = ref(db, `controls/${node}`);
    await set(controlRef, state);
    return { success: true };
  } catch (error) {
    console.error(`Error triggering ${node}:`, error);
    return { success: false, error: error.message };
  }
}

// Subscribe to hardware connection status directly from Firebase
export function subscribeDeviceStatus(callback) {
  const statusRef = ref(db, 'deviceStatus/isOnline');
  const unsub = onValue(statusRef, (snapshot) => {
    callback(!!snapshot.val());
  });
  return () => unsub();
}

// Track client connection to Firebase servers
export function subscribeConnectionStatus(callback) {
  const connectedRef = ref(db, '.info/connected');
  const unsub = onValue(connectedRef, (snap) => callback(snap.val() === true));
  return () => unsub();
}

// Update user profile in Firebase
export async function updateUserProfile(userId, profileData) {
  try {
    const userRef = ref(db, `users/${userId}`);
    await set(userRef, {
      ...profileData,
      updatedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

// Subscribe to alerts from Firebase
export function subscribeAlerts(callback) {
  const alertsRef = ref(db, 'alerts');
  const unsub = onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const alertsList = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value
      }));
      callback(alertsList);
    }
  });

  return () => unsub();
}

// Write sensor data to Firebase (for simulation)
export async function writeSensorData(data) {
  try {
    const sensorRef = ref(db, 'sensorData');
    await set(sensorRef, {
      ...data,
      timestamp: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error writing sensor data:', error);
    return { success: false, error: error.message };
  }
}
