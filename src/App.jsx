import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function ProtectedRoute({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  const { user } = useApp();

  return (
    <div className="app-layout">
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <LoginPage />
        } />
        <Route path="/" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute><MapPage /></ProtectedRoute>
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
