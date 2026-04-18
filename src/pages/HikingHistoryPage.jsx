import { ArrowLeft, Clock, MapPin, Mountain, Heart, Activity, Flame, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHikingHistory } from '../services/demoData';

export default function HikingHistoryPage() {
  const navigate = useNavigate();
  const hikes = getHikingHistory();

  const totalKm = hikes.reduce((sum, h) => sum + parseFloat(h.distance), 0).toFixed(1);
  const totalMins = hikes.reduce((sum, h) => {
    const match = h.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const [h_, m_] = match.slice(1).map(Number);
      return sum + h_ * 60 + m_;
    }
    return sum;
  }, 0);
  const totalHours = Math.floor(totalMins / 60);
  const remMins = totalMins % 60;
  const totalTime = remMins > 0 ? `${totalHours}h ${remMins}m` : `${totalHours}h`;

  return (
    <div className="page-container">
      <header className="mb-6 flex justify-between items-center animate-in stagger-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowLeft size={24} className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => navigate(-1)} />
          <h1 className="display-text text-2xl font-bold tracking-tight" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={24} /> Hiking History
          </h1>
        </div>
        <div style={{ padding: '6px 12px', background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-full)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {hikes.length} Records
        </div>
      </header>

      {/* Summary Stats */}
      <div className="sensor-grid animate-in stagger-2" style={{ marginBottom: '24px' }}>
        <div className="sensor-card text-center" style={{ padding: '24px 16px' }}>
          <div className="font-display font-bold text-3xl mb-1 text-[var(--accent-primary)]">{totalKm}</div>
          <div className="text-xs text-muted uppercase tracking-widest font-semibold">Total km</div>
        </div>
        <div className="sensor-card text-center" style={{ padding: '24px 16px' }}>
          <div className="font-display font-bold text-3xl mb-1 text-[var(--accent-emerald)]">{totalTime}</div>
          <div className="text-xs text-muted uppercase tracking-widest font-semibold">Total Time</div>
        </div>
      </div>

      {/* Hike Records */}
      <div className="animate-in stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {hikes.map((hike, idx) => (
          <div key={hike.id} className="glass-panel" style={{ padding: '20px', animationDelay: `${(idx + 1) * 100}ms` }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 className="font-display font-bold text-lg text-white">{hike.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                  <MapPin size={14} /> {hike.route}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                  {new Date(hike.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div style={{ padding: '4px 8px', background: hike.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: `1px solid ${hike.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, borderRadius: '6px', color: hike.status === 'completed' ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontSize: '0.625rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {hike.status === 'completed' ? 'Completed' : 'In Progress'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.875rem' }}>
                  <Clock size={16} /> {hike.duration}
                </div>
                <div className="text-[10px] text-muted tracking-widest uppercase font-bold">Duration</div>
              </div>
              <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.875rem' }}>
                  <MapPin size={16} /> {hike.distance}
                </div>
                <div className="text-[10px] text-muted tracking-widest uppercase font-bold">Distance</div>
              </div>
              <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-amber)', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.875rem' }}>
                  <Mountain size={16} /> {hike.elevation}
                </div>
                <div className="text-[10px] text-muted tracking-widest uppercase font-bold">Elevation</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                <Heart size={14} color="var(--accent-rose)" /> <span style={{ color: 'var(--text-secondary)' }}>AVG:</span> <span className="text-white">{hike.avgHeartRate} BPM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                <Activity size={14} color="var(--accent-primary)" /> <span style={{ color: 'var(--text-secondary)' }}>SPO2:</span> <span className="text-white">{hike.avgSpO2}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                <Flame size={14} color="var(--accent-amber)" /> <span className="text-white">{hike.calories} CAL</span>
              </div>
            </div>

          </div>
        ))}
      </div>
      
    </div>
  );
}
