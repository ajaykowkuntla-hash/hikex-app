import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Fingerprint, Lock, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name: email.split('@')[0], email: email });
  };

  return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Heavy aesthetic background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.8 }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '80vw', height: '80vw', background: 'radial-gradient(circle, var(--accent-primary-glow) 0%, transparent 60%)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '90vw', height: '90vw', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 60%)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
      </div>

      <div className="page-container" style={{ position: 'relative', zIndex: 10, maxWidth: '400px', display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }} className="animate-in stagger-1">
          <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border-highlight)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <Fingerprint size={40} className="text-[var(--accent-primary)]" />
          </div>
          <h1 className="display-text" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '8px', background: 'linear-gradient(180deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HIKEX
          </h1>
          <p className="text-xs text-muted font-bold tracking-widest uppercase">Sentinel Data Link</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel animate-in stagger-2" style={{ padding: '32px 24px', marginBottom: '24px' }}>
          
          <div className="input-group">
            <span className="input-label">Operator Identification</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              placeholder="user@outpost.net"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: '8px', padding: '12px', marginBottom: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>DEMO MODE: Any credentials accepted.</span>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ padding: '16px' }}>
            <Lock size={18} /> Authenticate
          </button>
        </form>

        <div className="animate-in stagger-3" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted uppercase tracking-widest" style={{ opacity: 0.5 }}>
            Encrypted connection • Node 84
          </p>
        </div>

      </div>
    </div>
  );
}
