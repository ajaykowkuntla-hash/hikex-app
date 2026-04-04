import { db, ref, onValue, off, set, push, get } from './firebase';

// Subscribe to real-time sensor data from Firebase
export function subscribeSensorData(callback) {
  const sensorRef = ref(db, 'sensorData');
  onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  }, (error) => {
    console.error('Firebase sensor subscription error:', error);
  });

  // Return unsubscribe function
  return () => off(sensorRef);
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
  onValue(statusRef, (snapshot) => {
    callback(!!snapshot.val());
  });
  return () => off(statusRef);
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
  onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const alertsList = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value
      }));
      callback(alertsList);
    }
  });

  return () => off(alertsRef);
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
