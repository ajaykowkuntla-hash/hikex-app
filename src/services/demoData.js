// Realistic simulated sensor data for HIKEX demo mode

const trekkingPath = [
  { lat: 28.5983, lng: 83.9311, name: 'Ghorepani (Start)', elevation: 2860 },
  { lat: 28.6012, lng: 83.9345, name: 'Deurali Pass', elevation: 3100 },
  { lat: 28.6065, lng: 83.9402, name: 'Forest Camp', elevation: 3200 },
  { lat: 28.6110, lng: 83.9450, name: 'Rest Hut', elevation: 3350 },
  { lat: 28.6148, lng: 83.9510, name: 'High Camp', elevation: 3500 },
  { lat: 28.6194, lng: 83.9567, name: 'Poon Hill Summit', elevation: 3210 },
];

const terrainTypes = ['Rocky', 'Slippery', 'Muddy', 'Snow', 'Trail', 'Gravel'];
const motionLevels = ['Low', 'Medium', 'High'];

let pathIndex = 0;
let timeOffset = 0;

function randomInRange(min, max, decimals = 1) {
  const val = min + Math.random() * (max - min);
  return Number(val.toFixed(decimals));
}

function fluctuate(base, range) {
  return base + (Math.random() - 0.5) * range * 2;
}

export function generateSensorData() {
  timeOffset++;
  const cyclePosition = (timeOffset % 60) / 60; // 0-1 cycle

  // Heart rate varies with simulated activity
  const baseHR = 75 + Math.sin(cyclePosition * Math.PI * 2) * 25;
  const heartRate = Math.round(fluctuate(baseHR, 8));

  // SpO2 drops slightly at higher elevations
  const currentPoint = trekkingPath[pathIndex % trekkingPath.length];
  const elevationFactor = Math.max(0, (currentPoint.elevation - 3000) / 1000);
  const spo2 = Math.round(Math.min(99, Math.max(88, 97 - elevationFactor * 4 + (Math.random() - 0.5) * 3)));

  // Temperature decreases with elevation
  const temperature = randomInRange(
    Math.max(2, 20 - currentPoint.elevation / 300),
    Math.max(5, 25 - currentPoint.elevation / 300)
  );

  // Humidity
  const humidity = Math.round(randomInRange(45, 85, 0));

  // GPS with slight jitter
  const gps = {
    lat: currentPoint.lat + (Math.random() - 0.5) * 0.001,
    lng: currentPoint.lng + (Math.random() - 0.5) * 0.001,
    altitude: currentPoint.elevation + randomInRange(-10, 10, 0),
    accuracy: randomInRange(3, 15)
  };

  // Motion based on time
  const motionIndex = Math.floor(Math.random() * 3);
  const motion = motionLevels[motionIndex];

  // Risk level calculation
  let riskLevel = 'Safe';
  let riskScore = 0;
  if (heartRate > 120) riskScore += 2;
  if (heartRate > 140) riskScore += 2;
  if (spo2 < 92) riskScore += 3;
  if (spo2 < 90) riskScore += 3;
  if (temperature < 5) riskScore += 1;
  if (motion === 'High') riskScore += 1;
  
  if (riskScore >= 6) riskLevel = 'Critical';
  else if (riskScore >= 4) riskLevel = 'High';
  else if (riskScore >= 2) riskLevel = 'Moderate';

  // Advance along path occasionally
  if (timeOffset % 10 === 0) {
    pathIndex = (pathIndex + 1) % trekkingPath.length;
  }

  return {
    heartRate: Math.max(55, Math.min(160, heartRate)),
    spo2: Math.max(85, Math.min(100, spo2)),
    temperature,
    humidity,
    gps,
    motion,
    humanNearby: Math.random() > 0.7 ? 'Yes' : 'No',
    buzzer: 'Off',
    riskLevel,
    terrain: terrainTypes[Math.floor(Math.random() * terrainTypes.length)],
    battery: Math.max(15, Math.round(95 - timeOffset * 0.1 + Math.random() * 5)),
    timestamp: Date.now(),
    currentLocation: currentPoint.name,
    elevation: currentPoint.elevation
  };
}

export function getTrekkingPath() {
  return trekkingPath;
}

export function getHikingHistory() {
  return [
    {
      id: 1,
      name: 'Poon Hill Trek',
      date: '2026-03-28',
      duration: '6h 45m',
      distance: '12.4 km',
      elevation: '1,200 m',
      avgHeartRate: 98,
      maxHeartRate: 142,
      avgSpO2: 94,
      calories: 1850,
      status: 'completed',
      route: 'Ghorepani → Poon Hill → Tadapani'
    },
    {
      id: 2,
      name: 'Annapurna Base Camp',
      date: '2026-03-22',
      duration: '8h 20m',
      distance: '18.6 km',
      elevation: '2,100 m',
      avgHeartRate: 105,
      maxHeartRate: 155,
      avgSpO2: 91,
      calories: 2400,
      status: 'completed',
      route: 'Deurali → MBC → ABC'
    },
    {
      id: 3,
      name: 'Mardi Himal Trek',
      date: '2026-03-15',
      duration: '5h 10m',
      distance: '9.8 km',
      elevation: '980 m',
      avgHeartRate: 92,
      maxHeartRate: 128,
      avgSpO2: 95,
      calories: 1420,
      status: 'completed',
      route: 'Low Camp → High Camp → Viewpoint'
    },
    {
      id: 4,
      name: 'Ghandruk Loop',
      date: '2026-03-08',
      duration: '4h 30m',
      distance: '8.2 km',
      elevation: '650 m',
      avgHeartRate: 88,
      maxHeartRate: 118,
      avgSpO2: 96,
      calories: 1100,
      status: 'completed',
      route: 'Nayapul → Ghandruk → Kimche'
    },
    {
      id: 5,
      name: 'Sarangkot Sunrise',
      date: '2026-03-01',
      duration: '3h 15m',
      distance: '5.4 km',
      elevation: '420 m',
      avgHeartRate: 82,
      maxHeartRate: 108,
      avgSpO2: 97,
      calories: 780,
      status: 'completed',
      route: 'Lakeside → Sarangkot Peak'
    },
    {
      id: 6,
      name: 'Dhampus Trail',
      date: '2026-02-22',
      duration: '7h 00m',
      distance: '14.1 km',
      elevation: '1,450 m',
      avgHeartRate: 101,
      maxHeartRate: 148,
      avgSpO2: 93,
      calories: 2050,
      status: 'completed',
      route: 'Phedi → Dhampus → Australian Camp'
    }
  ];
}

export function getDemoAlerts() {
  const now = Date.now();
  return [
    {
      id: 1,
      type: 'warning',
      title: 'SpO2 Warning',
      message: 'Blood oxygen dropped to 91%. Consider reducing altitude.',
      timestamp: now - 300000,
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Human Detected Nearby',
      message: 'Another hiker detected within 50m radius.',
      timestamp: now - 600000,
      read: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'High Heart Rate',
      message: 'Heart rate exceeded 140 bpm. Take a rest break.',
      timestamp: now - 1200000,
      read: false
    },
    {
      id: 4,
      type: 'critical',
      title: 'Fall Detected',
      message: 'Sudden acceleration change detected. Are you okay?',
      timestamp: now - 1800000,
      read: true
    },
    {
      id: 5,
      type: 'info',
      title: 'Checkpoint Reached',
      message: 'You have reached Forest Camp. 3.2 km to summit.',
      timestamp: now - 2400000,
      read: true
    },
    {
      id: 6,
      type: 'warning',
      title: 'Temperature Drop',
      message: 'Ambient temperature dropped below 5°C. Stay warm.',
      timestamp: now - 3600000,
      read: false
    },
    {
      id: 7,
      type: 'info',
      title: 'Battery Low',
      message: 'Device battery at 25%. Consider conserving power.',
      timestamp: now - 5400000,
      read: true
    },
    {
      id: 8,
      type: 'critical',
      title: 'Signal Lost',
      message: 'GPS signal lost for 2 minutes. Last known position saved.',
      timestamp: now - 7200000,
      read: true
    }
  ];
}
