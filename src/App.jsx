import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertTriangle, MapPin } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import FloatingSOS from './components/FloatingSOS';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import SOSPage from './pages/SOSPage';
import AlertsPage from './pages/AlertsPage';
import DevicePage from './pages/DevicePage';
import HikingHistoryPage from './pages/HikingHistoryPage';
import ProfilePage from './pages/ProfilePage';
import MedicalIDPage from './pages/MedicalIDPage';
import SettingsPage from './pages/SettingsPage';

// New Pages
import GlobalStatusBar from './components/GlobalStatusBar';
import TrailsPage from './pages/TrailsPage';
import NightModePage from './pages/NightModePage';
import WarningsPage from './pages/WarningsPage';

function ProtectedRoute({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  const { user, deviceData, clearWarning } = useApp();

  return (
    <div className="app-layout">
      {/* GOAL #5 — Global Emergency Flow from Hardware */}
      {user && deviceData?.sos && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(135deg, rgba(220,38,38,0.98), rgba(153,27,27,0.95))', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'sosPulse 1.5s infinite' }}>
          <AlertTriangle size={80} color="#fff" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '10px', textShadow: '0 4px 20px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>EMERGENCY<br/>DETECTED</h1>
          <p style={{ color: '#fff', fontSize: '1.1rem', textAlign: 'center', marginBottom: '30px', fontWeight: 600 }}>Hardware SOS button was pressed!</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '350px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(239,68,68,0.2)', padding: '10px', borderRadius: '12px' }}>
                <MapPin size={24} color="#fca5a5" />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', margin: '0 0 2px 0' }}>TARGET LOCATION</p>
                <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', margin: 0, fontFamily: 'monospace' }}>{deviceData.lat?.toFixed(5)}<br/>{deviceData.lng?.toFixed(5)}</p>
              </div>
            </div>
          </div>

          <button onClick={clearWarning} style={{ padding: '18px 40px', background: '#fff', color: '#dc2626', border: 'none', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}>
            CLEAR WARNING
          </button>
        </div>
      )}

      {user && <GlobalStatusBar />}
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <LoginPage />
        } />
        <Route path="/" element={
          <ProtectedRoute><TrailsPage /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute><MapPage /></ProtectedRoute>
        } />
        <Route path="/stars" element={
          <ProtectedRoute><NightModePage /></ProtectedRoute>
        } />
        <Route path="/warnings" element={
          <ProtectedRoute><WarningsPage /></ProtectedRoute>
        } />
        <Route path="/sos" element={
          <ProtectedRoute><SOSPage /></ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute><AlertsPage /></ProtectedRoute>
        } />
        <Route path="/device" element={
          <ProtectedRoute><DevicePage /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><HikingHistoryPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/medical" element={
          <ProtectedRoute><MedicalIDPage /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><SettingsPage /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <FloatingSOS />}
      {user && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
