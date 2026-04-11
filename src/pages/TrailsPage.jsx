import React, { useState, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, Activity, Navigation, Star, Siren, Clock, TrendingUp, Route, Play, Mountain, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TRAIL_DATABASE from '../data/trailsData';

export default function TrailsPage() {
  const navigate = useNavigate();
  const { profile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTrail, setActiveTrail] = useState(null);

  const categories = [
    { label: 'Safe Trails', filter: 'safe', icon: '🛡️' },
    { label: 'Short < 10km', filter: 'short', icon: '📏' },
    { label: 'Beginner', filter: 'easy', icon: '🌱' },
    { label: 'India', filter: 'india', icon: '🇮🇳' },
    { label: 'Alps', filter: 'alps', icon: '🏔️' },
    { label: 'Nepal', filter: 'nepal', icon: '🇳🇵' },
  ];

  const trails = useMemo(() => {
    let results = [...TRAIL_DATABASE];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.diff.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q) ||
        (t.bestSeason && t.bestSeason.toLowerCase().includes(q))
      );
    }

    if (activeCategory === 'safe') {
      results = results.filter(t => t.safeMode === 3);
    } else if (activeCategory === 'short') {
      results = results.filter(t => t.dist <= 10.0);
    } else if (activeCategory === 'easy') {
      results = results.filter(t => t.diff === 'Easy');
    } else if (activeCategory === 'india') {
      results = results.filter(t => t.region === 'india');
    } else if (activeCategory === 'alps') {
      results = results.filter(t => t.region === 'alps');
    } else if (activeCategory === 'nepal') {
      results = results.filter(t => t.region === 'nepal');
    }

    if (!activeCategory && !searchQuery) {
      results.sort((a, b) => {
        if (b.safeMode !== a.safeMode) return b.safeMode - a.safeMode;
        return a.dist - b.dist;
      });
    }

    return results;
  }, [activeCategory, searchQuery]);

  const handleStartNavigation = (trail) => {
    setActiveTrail(null);
    navigate('/map', { state: { trail } });
  };

  return (
    <div className="page-container full-width" style={{ paddingBottom: '90px' }}>

      {/* Header */}
      <header className="animate-in stagger-1" style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
        <div>
          <p className="text-secondary tracking-widest text-xs uppercase font-bold mb-1">Live Intelligence Feed</p>
          <h1 className="display-text text-3xl font-bold tracking-tight text-white">Explore</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/sos')}
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'radial-gradient(circle, #f43f5e 0%, #9f1239 100%)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', animation: 'sosPulse 2s infinite' }}
          >
            <Siren size={18} color="#fff" style={{ marginBottom: '1px' }} />
            <span style={{ fontSize: '8px', fontWeight: '900', color: '#fff', letterSpacing: '0.5px' }}>SOS</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="card-clickable"
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff', boxShadow: '0 10px 20px var(--accent-primary-glow)', border: 'none' }}
          >
            {profile?.avatar || 'A'}
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="animate-in stagger-2" style={{ padding: '0 20px', marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', display: 'flex', alignItems: 'center', padding: '0 16px', backdropFilter: 'blur(12px)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search trails, locations, countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', padding: '16px 12px', color: '#fff', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>✕</button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="card-clickable"
          style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showFilters ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Result count */}
      {searchQuery && (
        <div style={{ padding: '0 20px', marginBottom: '12px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Found <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{trails.length}</span> result{trails.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        </div>
      )}

      {/* Category Chips */}
      <div className="animate-in stagger-2" style={{ overflowX: 'auto', padding: '0 20px', display: 'flex', gap: '8px', marginBottom: '24px', scrollbarWidth: 'none' }}>
        <button onClick={() => navigate('/map')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '100px', background: 'var(--accent-primary)', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', border: 'none', flexShrink: 0, cursor: 'pointer' }}>
          <MapPin size={14} /> Near Me
        </button>
        {categories.map((cat) => (
          <button
            key={cat.filter}
            onClick={() => setActiveCategory(activeCategory === cat.filter ? '' : cat.filter)}
            style={{ padding: '10px 16px', borderRadius: '100px', background: activeCategory === cat.filter ? 'rgba(255,255,255,0.12)' : 'transparent', border: activeCategory === cat.filter ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)', color: activeCategory === cat.filter ? '#fff' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'all 0.2s', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="animate-in" style={{ margin: '0 20px 24px', padding: '20px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <h3 className="font-display text-white font-bold mb-4">Advanced Tuning</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Expert Only', 'Snow Trek', 'Family Safe', 'Hot Springs', 'UNESCO Site', 'Multi-Day'].map(p => (
              <span key={p} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Trail Cards */}
      <div className="animate-in stagger-3" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {!searchQuery && !activeCategory && (
           <h2 className="font-display font-bold text-lg text-white" style={{ marginBottom: '-8px' }}>Suggested for You</h2>
        )}

        {trails.map((trail) => (
          <div
            key={trail.id}
            className="card-clickable"
            onClick={() => setActiveTrail(trail)}
            style={{ height: '260px', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: trail.bg, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
               e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.8)';
               e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'none';
               e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
               e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            {/* Safety Badge */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '5px 10px', borderRadius: '100px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: `1px solid ${trail.color}40`, display: 'flex', alignItems: 'center', gap: '5px' }}>
               <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: trail.color, boxShadow: `0 0 8px ${trail.color}` }}></div>
               <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: trail.color }}>{trail.safe}</span>
            </div>

            {/* Rating */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '5px 10px', borderRadius: '100px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <Star size={11} color="#f59e0b" fill="#f59e0b" />
               <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{trail.rating}</span>
            </div>

            <h2 className="font-display text-xl font-bold text-white mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{trail.name}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc', marginBottom: '10px' }}>
              <Navigation size={11} />
              <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>{trail.location}</span>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <div style={{ padding: '4px 9px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '6px', fontSize: '0.68rem', color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}><Route size={9} /> {trail.dist} km</div>
              <div style={{ padding: '4px 9px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '6px', fontSize: '0.68rem', color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={9} /> {trail.duration}</div>
              <div style={{ padding: '4px 9px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '6px', fontSize: '0.68rem', color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}><TrendingUp size={9} /> {trail.elevation}m ↑</div>
              <div style={{ padding: '4px 9px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', borderRadius: '6px', fontSize: '0.68rem', color: '#fff', fontWeight: '600' }}>{trail.diff}</div>
            </div>
          </div>
        ))}

        {trails.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '24px' }}>
            <Activity size={40} color="var(--text-secondary)" className="mx-auto mb-4" />
            <h3 className="text-white font-display font-bold mb-2">No trails found</h3>
            <p className="text-muted text-sm">Try "India", "Triund", "Easy", "Switzerland", or "Nepal".</p>
          </div>
        )}
      </div>

      {/* Trail Detail Modal */}
      {activeTrail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setActiveTrail(null); }}>
          <div className="animate-in stagger-1" style={{ width: '100%', maxWidth: '430px', background: 'var(--bg-surface)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: '110px', borderTop: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -20px 40px rgba(0,0,0,0.8)', maxHeight: '85vh', overflowY: 'auto' }}>

            <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)', margin: '0 auto 20px' }}></div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                   <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '0.65rem', color: '#fff', fontWeight: 'bold' }}>{activeTrail.diff}</span>
                   <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '0.65rem', color: '#fff', fontWeight: 'bold' }}>{activeTrail.dist} km</span>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '0.65rem', color: '#f59e0b', fontWeight: 'bold' }}><Star size={9} fill="#f59e0b" /> {activeTrail.rating}</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white">{activeTrail.name}</h2>
              </div>
              <button onClick={() => setActiveTrail(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>✕</button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '16px' }}><Navigation size={12}/> {activeTrail.location}</p>

            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '20px' }}>{activeTrail.description}</p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '14px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <Route size={16} color="#2dd4bf" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{activeTrail.dist} km</p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance</p>
              </div>
              <div style={{ padding: '14px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <Clock size={16} color="#fbbf24" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{activeTrail.duration}</p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</p>
              </div>
              <div style={{ padding: '14px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <TrendingUp size={16} color="#10b981" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{activeTrail.elevation}m</p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Elevation</p>
              </div>
            </div>

            {/* Elevation Range + Season */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Mountain size={12} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Elevation Range</span>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{activeTrail.startElevation}m → {activeTrail.peakElevation}m</p>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Calendar size={12} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Season</span>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{activeTrail.bestSeason}</p>
              </div>
            </div>

            {/* Safety */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', border: `1px solid ${activeTrail.color}22` }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${activeTrail.color}15`, border: `1px solid ${activeTrail.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeTrail.color, boxShadow: `0 0 8px ${activeTrail.color}` }}></div>
              </div>
              <div>
                 <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: activeTrail.color }}>Safety Assessment</p>
                 <p style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.85rem' }}>{activeTrail.safe}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleStartNavigation(activeTrail)}
                style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #2dd4bf)', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', boxShadow: '0 8px 24px rgba(16,185,129,0.35)', cursor: 'pointer' }}
              >
                <Play size={18} fill="#fff" /> Start Navigation
              </button>
              <button
                onClick={() => { setActiveTrail(null); navigate('/map', { state: { trail: activeTrail, viewOnly: true } }); }}
                style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
              >
                <MapPin size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
