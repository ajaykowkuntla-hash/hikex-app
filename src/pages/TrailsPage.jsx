import React, { useState, useRef } from 'react';
import { Search, Mic, MapPin, SlidersHorizontal, Activity, Navigation, Star, Siren } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function TrailsPage() {
  const navigate = useNavigate();
  const { profile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Recommended');
  const [showFilters, setShowFilters] = useState(false);

  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);

  const categories = ['Recommended', 'Nearby', 'Beginner', 'High Altitude', 'Saved'];

  const allTrails = [
    { id: 1, name: "Matterhorn Glacier Trail", location: "Zermatt, Switzerland", diff: "Hard", category: "High Altitude", dist: "6.5 km", rating: 4.9, safe: "🔴 Risky", color: "#f43f5e", bg: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1530878902700-5ad4f9e4c318?auto=format&fit=crop&w=600&q=80')" },
    { id: 2, name: "Five Lakes Walk", location: "Zermatt, Switzerland", diff: "Moderate", category: "Recommended", dist: "9.3 km", rating: 4.8, safe: "🟡 Moderate", color: "#f59e0b", bg: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80')" },
    { id: 3, name: "Riffelsee Ridge", location: "Gornergrat, Alps", diff: "Easy", category: "Beginner", dist: "3.2 km", rating: 4.5, safe: "🟢 Safe", color: "#10b981", bg: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80')" },
    { id: 4, name: "Chamonix Base", location: "Chamonix, France", diff: "Easy", category: "Nearby", dist: "2.1 km", rating: 4.2, safe: "🟢 Safe", color: "#10b981", bg: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80')" }
  ];

  const trails = allTrails.filter(t => {
    const matchCat = activeCategory === 'Recommended' || t.category === activeCategory;
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSirenTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    
    if (newCount >= 3) {
      setTapCount(0);
      navigate('/sos');
    } else {
      tapTimeoutRef.current = setTimeout(() => {
         setTapCount(0);
      }, 1000);
    }
  };

  return (
    <div className="page-container full-width" style={{ paddingBottom: '90px' }}>
      
      {/* Header */}
      <header className="animate-in stagger-1" style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
        <div>
          <p className="text-secondary tracking-widest text-xs uppercase font-bold mb-1">Live Intelligence Feed</p>
          <h1 className="display-text text-3xl font-bold tracking-tight text-white">Explore</h1>
        </div>
        <button 
          onClick={() => navigate('/profile')}
          className="card-clickable"
          style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', boxShadow: '0 10px 20px var(--accent-primary-glow)', border: 'none' }}
        >
          {profile?.avatar || 'A'}
        </button>
      </header>

      {/* Smart Search Bar */}
      <div className="animate-in stagger-2" style={{ padding: '0 20px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', display: 'flex', alignItems: 'center', padding: '0 16px', backdropFilter: 'blur(12px)', transition: 'all 0.3s' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search trails..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', padding: '16px 12px', color: '#fff', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '1rem' }}
          />
          <Mic size={18} color="var(--accent-primary)" style={{ cursor: 'pointer' }} />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="card-clickable"
          style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showFilters ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Action Chips */}
      <div className="animate-in stagger-2" style={{ overflowX: 'auto', padding: '0 20px', display: 'flex', gap: '12px', marginBottom: '24px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <button className="card-clickable" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '100px', background: 'rgba(47, 127, 95, 0.15)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.875rem', whiteSpace: 'nowrap' }} onClick={() => navigate('/map')}>
          <MapPin size={16} /> Near Me
        </button>
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{ padding: '10px 16px', borderRadius: '100px', background: activeCategory === cat ? 'rgba(255,255,255,0.1)' : 'transparent', border: activeCategory === cat ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)', color: activeCategory === cat ? '#fff' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', transition: 'all 0.2s', cursor: 'pointer' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Panel (Collapsible) */}
      {showFilters && (
        <div className="animate-in" style={{ margin: '0 20px 24px', padding: '20px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <h3 className="font-display text-white font-bold mb-4">Quick Presets</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {['Beginner Friendly', 'Safe Trails', 'Short Hikes', '< 5km Distance'].map(p => (
              <span key={p} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{p}</span>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={() => setShowFilters(false)}>Apply Filters (12 results)</button>
        </div>
      )}

      {/* Main Feed */}
      <div className="animate-in stagger-3" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {trails.map((trail) => (
          <div key={trail.id} className="card-clickable" style={{ height: '240px', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: trail.bg, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px' }}>
            
            {/* Safety Badge */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px 12px', borderRadius: '100px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: `1px solid ${trail.color}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: trail.color, boxShadow: `0 0 10px ${trail.color}` }}></div>
               <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: trail.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{trail.safe}</span>
            </div>

            <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '6px 12px', borderRadius: '100px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: `1px solid rgba(255,255,255,0.1)`, display: 'flex', alignItems: 'center', gap: '4px' }}>
               <Star size={12} color="#f59e0b" fill="#f59e0b" />
               <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>{trail.rating}</span>
            </div>
            
            <h2 className="font-display text-2xl font-bold text-white mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{trail.name}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', marginBottom: '16px' }}>
              <Navigation size={14} />
              <span className="text-sm font-semibold">{trail.location}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: '8px', fontSize: '0.75rem', color: '#fff', fontWeight: '600' }}>{trail.diff}</div>
              <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: '8px', fontSize: '0.75rem', color: '#fff', fontWeight: '600' }}>{trail.dist}</div>
            </div>

          </div>
        ))}
        
        {trails.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '24px' }}>
            <Activity size={40} color="var(--text-secondary)" className="mx-auto mb-4" />
            <h3 className="text-white font-display font-bold mb-2">No trails found</h3>
            <p className="text-muted text-sm">Try adjusting your filters or area.</p>
          </div>
        )}

      </div>

      {/* Floating Siren Triple-Tap Button */}
      <button 
        onClick={handleSirenTap}
        style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 1000, width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.8), rgba(159, 18, 57, 0.9))', border: '1px solid rgba(244, 63, 94, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', cursor: 'pointer', outline: 'none' }}
        className={tapCount > 0 ? 'animate-pulse-heavy' : ''}
      >
        <Siren size={28} color="#fff" />
        {tapCount > 0 && <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#fff', color: '#f43f5e', fontSize: '10px', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{3 - tapCount}</span>}
      </button>

    </div>
  );
}
