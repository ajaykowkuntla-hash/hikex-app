import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, Mail, Calendar, Mountain, Clock, MapPin,
  Edit3, Save, ChevronRight, Heart, Shield, LogOut
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, setProfile, logout } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const handleSave = () => {
    setProfile(formData);
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div className="profile-header animate-in">
        <div className="profile-avatar" id="profile-avatar">
          {profile?.name?.[0]?.toUpperCase() || 'H'}
        </div>
        {editing ? (
          <input
            type="text"
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ textAlign: 'center', maxWidth: '250px', margin: '0 auto', fontSize: '1.25rem', fontWeight: 600 }}
          />
        ) : (
          <h1 style={{ marginBottom: '4px' }}>{profile?.name || 'Hiker'}</h1>
        )}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {profile?.email || 'hiker@hikex.com'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '4px' }}>
          Member since {profile?.memberSince || 'March 2026'}
        </p>
        
        <button 
          className={`btn ${editing ? 'btn-primary' : 'btn-outline'}`}
          onClick={editing ? handleSave : () => setEditing(true)}
          style={{ marginTop: '12px', fontSize: '0.8125rem', padding: '8px 20px' }}
          id="profile-edit-btn"
        >
          {editing ? <><Save size={14} /> Save Changes</> : <><Edit3 size={14} /> Edit Profile</>}
        </button>
      </div>

      {/* Stats */}
      <div className="profile-stats animate-in stagger-1">
        <div className="stat-card" id="stat-hikes">
          <div className="stat-value">{profile?.totalHikes || 12}</div>
          <div className="stat-label">Total Hikes</div>
        </div>
        <div className="stat-card" id="stat-time">
          <div className="stat-value">{profile?.totalTime || '48h'}</div>
          <div className="stat-label">Total Time</div>
        </div>
        <div className="stat-card" id="stat-distance">
          <div className="stat-value">{profile?.totalDistance || '92.5'}</div>
          <div className="stat-label">Distance (km)</div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="card mt-lg animate-in stagger-2" style={{ padding: '4px 16px' }}>
        <div className="flex-between" style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} color="var(--accent-blue)" />
            <span style={{ fontSize: '0.9375rem' }}>Full Name</span>
          </div>
          {editing ? (
            <input
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '150px', textAlign: 'right', padding: '6px 10px', fontSize: '0.875rem' }}
            />
          ) : (
            <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{profile?.name}</span>
          )}
        </div>

        <div className="flex-between" style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={18} color="var(--accent-blue)" />
            <span style={{ fontSize: '0.9375rem' }}>Email</span>
          </div>
          {editing ? (
            <input
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '200px', textAlign: 'right', padding: '6px 10px', fontSize: '0.875rem' }}
            />
          ) : (
            <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{profile?.email}</span>
          )}
        </div>

        <div className="flex-between" style={{ padding: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="var(--accent-blue)" />
            <span style={{ fontSize: '0.9375rem' }}>Age</span>
          </div>
          {editing ? (
            <input
              type="number"
              className="input-field"
              value={formData.age || 24}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              style={{ width: '80px', textAlign: 'right', padding: '6px 10px', fontSize: '0.875rem' }}
            />
          ) : (
            <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{profile?.age || 24}</span>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card mt-md animate-in stagger-3" style={{ padding: '4px 16px' }}>
        <div 
          className="flex-between card-clickable" 
          style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}
          onClick={() => navigate('/history')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mountain size={18} color="var(--accent-green)" />
            <span style={{ fontSize: '0.9375rem' }}>Hiking History</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div 
          className="flex-between card-clickable" 
          style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}
          onClick={() => navigate('/medical')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Heart size={18} color="var(--accent-red)" />
            <span style={{ fontSize: '0.9375rem' }}>Medical ID</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div 
          className="flex-between card-clickable" 
          style={{ padding: '14px 0' }}
          onClick={() => navigate('/settings')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.9375rem' }}>Privacy & Settings</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* Logout */}
      <button 
        className="btn btn-outline btn-full mt-lg animate-in stagger-4"
        onClick={handleLogout}
        id="logout-btn"
        style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red-bg)' }}
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
