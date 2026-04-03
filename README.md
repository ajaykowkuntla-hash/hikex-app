# 🏔️ HIKEX — Smart Hiking Safety & Monitoring System

A real-time hiking safety application that integrates IoT sensor data (simulated + Firebase) and provides emergency support, tracking, and user health monitoring.

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-RTDB-FFCA28?logo=firebase)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet)

---

## ✨ Features

### 🏠 Dashboard
- Real-time sensor data display (Heart Rate, SpO2, Temperature, Humidity)
- Risk level assessment with color-coded status
- Terrain type indicator
- Device connection status
- Quick action cards for Map, Control Panel, and Emergency SOS

### 🗺️ Live Map
- Interactive Leaflet map with Himalayan trekking path
- Custom markers for checkpoints (Start, Camp, Hut, Summit)
- User location tracking
- Safety and danger zone visualization
- Elevation and location overlay

### 🆘 Emergency SOS
- One-tap SOS activation with 30-second countdown
- Real-time sensor data transmission
- Emergency contact display
- Firebase alert integration

### ⚡ Control Panel
- ESP32 device simulation
- Buzzer and emergency beacon toggles
- Sensor availability status
- Battery level indicator
- System log display

### 🔔 Alerts
- Filterable alert history (Critical, Warning, Info)
- Chronological timeline with severity indicators
- Simulation controls for testing

### 📊 Hiking History
- Past hike records with detailed stats
- Duration, distance, elevation data
- Health metrics per hike

### 👤 Profile
- Editable user information
- Cumulative hiking statistics
- Quick links to Medical ID and settings

### 🏥 Medical ID
- Complete health profile
- Emergency contacts
- Blood type, allergies, medications
- DNR / Advance directives
- Doctor information

### ⚙️ Settings
- Demo/Live data mode toggle
- Simulation controls (fall detection, low SpO2, high HR)
- Dark mode toggle
- Notification preferences

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Firebase RTDB | Real-time data backend |
| Leaflet | Interactive maps |
| Lucide React | Icon library |
| Vanilla CSS | Styling with custom properties |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hikex.git
cd hikex

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npx vercel
```

---

## 📁 Project Structure

```
hikex/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Routing & layout
    ├── components/
    │   ├── BottomNav.jsx      # Bottom navigation bar
    │   └── FloatingSOS.jsx    # Floating SOS button
    ├── context/
    │   └── AppContext.jsx     # Global state management
    ├── pages/
    │   ├── LoginPage.jsx      # Authentication
    │   ├── DashboardPage.jsx  # Home dashboard
    │   ├── MapPage.jsx        # Live hiking map
    │   ├── SOSPage.jsx        # Emergency SOS
    │   ├── AlertsPage.jsx     # Alert history
    │   ├── DevicePage.jsx     # Control panel
    │   ├── HikingHistoryPage.jsx
    │   ├── ProfilePage.jsx
    │   ├── MedicalIDPage.jsx
    │   └── SettingsPage.jsx
    ├── services/
    │   ├── firebase.js        # Firebase configuration
    │   ├── sensorService.js   # Firebase RTDB operations
    │   └── demoData.js        # Simulated sensor data
    └── styles/
        └── index.css          # Design system & global styles
```

---

## 🔥 Firebase Configuration

The app connects to Firebase Realtime Database for live sensor data and SOS alerts.

### Database Structure
```
├── sensorData/          # Real-time ESP32 data
│   ├── heartRate
│   ├── spo2
│   ├── temperature
│   ├── humidity
│   ├── gps/
│   └── motion
├── alerts/              # SOS and system alerts
└── users/               # User profiles
```

---

## 📡 Demo Mode

Toggle between:
- **Demo Mode** (default): Simulated sensor data with realistic Himalayan hiking values
- **Live Mode**: Real-time data from Firebase RTDB (requires ESP32 hardware)

Simulation controls in Settings allow testing:
- Fall detection alerts
- Low SpO2 warnings
- High heart rate warnings

---

## 📱 Screenshots

The app features a mobile-first design with:
- Soft gradient outdoor color palette
- Card-based responsive layout
- Smooth animations and transitions
- Dark mode support

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with ❤️ for hiking safety.
