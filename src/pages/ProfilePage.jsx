import { ArrowLeft, Activity, Edit3, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="page-container">
      <header className="mb-6 flex justify-between items-center animate-in stagger-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowLeft size={24} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => navigate(-1)} />
          <h1 className="display-text text-2xl font-bold tracking-tight">Dossier</h1>
        </div>
        {!isEditing ? (
          <button className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '12px' }} onClick={() => setIsEditing(true)}>
             <Edit3 size={16} /> Edit
          </button>
        ) : (
          <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '12px' }} onClick={handleSave}>
             Save
          </button>
        )}
      </header>

      <div className="glass-panel text-center animate-in stagger-2" style={{ marginBottom: '24px', padding: '32px 24px' }}>
        <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 16px' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px var(--accent-primary-glow)' }}>
            <span className="font-display font-black text-4xl text-white">{formData.avatar}</span>
          </div>
          {isEditing && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Edit3 size={14} />
            </div>
          )}
        </div>
        
        {isEditing ? (
          <input 
            className="input-field" 
            style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, background: 'rgba(0,0,0,0.3)', marginBottom: '8px' }} 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        ) : (
          <h2 className="font-display font-bold text-3xl mb-1">{formData.name}</h2>
        )}
        <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4">{formData.memberSince || 'Active Operative'} • Lvl 9</p>
        
        <div style={{ display: 'flex', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', gap: '8px' }}>
           <div style={{ flex: 1 }}>
              <div className="font-display font-bold text-xl text-white">8.4k</div>
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold">Reputation</div>
           </div>
           <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
           <div style={{ flex: 1 }}>
              <div className="font-display font-bold text-xl text-[var(--accent-primary)]">{formData?.totalHikes || '12'}</div>
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold">Expeditions</div>
           </div>
           <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
           <div style={{ flex: 1 }}>
              <div className="font-display font-bold text-xl text-[var(--accent-emerald)]">{formData?.totalDistance || '92k'}</div>
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold">Dist (km)</div>
           </div>
        </div>
      </div>

      <div className="animate-in stagger-4">
        <h3 className="text-xs text-muted font-semibold uppercase tracking-widest mb-3 pl-1">Configuration</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="glass-panel card-clickable" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => navigate('/settings')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={20} className="text-muted" />
              </div>
              <div>
                <p className="font-bold text-white">System Settings</p>
                <p className="text-xs text-muted">Theme, Audio, Account</p>
              </div>
            </div>
          </div>
          
          <div className="glass-panel card-clickable" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => navigate('/medical')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-rose-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} color="var(--accent-rose)" />
              </div>
              <div>
                <p className="font-bold text-white">Medical Identification</p>
                <p className="text-xs text-muted">Vitals payload configuration</p>
              </div>
            </div>
          </div>
          
          <div className="glass-panel card-clickable" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => navigate('/device')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(47, 127, 95, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} color="var(--accent-primary)" />
              </div>
              <div>
                <p className="font-bold text-white">ESP32 Hardware Core</p>
                <p className="text-xs text-muted">Connectivity & Live Logs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
