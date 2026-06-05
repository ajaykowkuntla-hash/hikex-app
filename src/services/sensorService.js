import { db, ref, onValue, off, set, push } from './firebase';

// Subscribe to real-time sensor data from Firebase
export function subscribeSensorData(callback) {
  const deviceRef = ref(db, 'devices/device_001');

  const unsub = onValue(deviceRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      // Fallback handling when data is null
      callback({
        bpm: 0,
        battery: 0,
        lowBattery: false,
        lat: 0,
        lng: 0,
        sos: false,
        gpsReady: false,
        firebaseStatus: 'Offline',
        timestamp: Date.now()
      });
      return;
    }

    callback({
      bpm: data.health?.bpm ?? 0,
      battery: data.battery ?? 0,
      lowBattery: data.low_battery ?? false,
      lat: data.gps?.lat ?? 0,
      lng: data.gps?.lng ?? 0,
      sos: data.sos ?? false,
      gpsReady: data.status?.gps === 'Connected',
      firebaseStatus: data.status?.firebase ?? 'Offline',
      timestamp: data.last_seen || Date.now(),
      altitude: data.altitude ?? null,
      imu: {
        x: data.imu?.x ?? null,
        y: data.imu?.y ?? null,
        z: data.imu?.z ?? null,
      },
    });
  });

  return () => unsub();
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
    const path = node === 'buzzer' ? `controls/${node}` : `devices/device_001/controls/${node}`;
    const controlRef = ref(db, path);
    await set(controlRef, state);
    return { success: true };
  } catch (error) {
    console.error(`Error triggering ${node}:`, error);
    return { success: false, error: error.message };
  }
}

// Subscribe to hardware connection status directly from Firebase
export function subscribeDeviceStatus(callback) {
  const statusRef = ref(db, 'devices/device_001/deviceStatus/isOnline');
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
    const sensorRef = ref(db, 'devices/device_001/sensorData');
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
