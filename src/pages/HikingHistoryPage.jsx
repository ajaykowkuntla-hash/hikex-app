import { useApp } from '../context/AppContext';
import { getHikingHistory } from '../services/demoData';
import { 
  Clock, MapPin, Mountain, Heart, Activity,
  Flame, ChevronRight, History
} from 'lucide-react';

export default function HikingHistoryPage() {
  const hikes = getHikingHistory();

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={24} />
          Hiking History
        </h1>
        <span className="badge badge-demo" style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }}>
          {hikes.length} hikes
        </span>
      </div>

      {/* Summary Stats */}
      <div className="sensor-grid animate-in stagger-1 mb-md">
        <div className="sensor-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>68.5</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total km</div>
        </div>
        <div className="sensor-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>35h</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Time</div>
        </div>
      </div>

      {/* Hike Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {hikes.map((hike, idx) => (
          <div className={`hike-card animate-in stagger-${Math.min(idx + 2, 5)}`} key={hike.id} id={`hike-${hike.id}`}>
            <div className="hike-header">
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{hike.name}</h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} />
                  {hike.route}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(hike.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <span className="badge badge-connected" style={{ fontSize: '0.6875rem' }}>
                {hike.status === 'completed' ? '✓ Completed' : 'In Progress'}
              </span>
            </div>

            <div className="hike-stats">
              <div className="hike-stat">
                <div className="hike-stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Clock size={12} color="var(--accent-blue)" />
                  {hike.duration}
                </div>
                <div className="hike-stat-label">Duration</div>
              </div>
              <div className="hike-stat">
                <div className="hike-stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <MapPin size={12} color="var(--accent-green)" />
                  {hike.distance}
                </div>
                <div className="hike-stat-label">Distance</div>
              </div>
              <div className="hike-stat">
                <div className="hike-stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Mountain size={12} color="var(--accent-orange)" />
                  {hike.elevation}
                </div>
                <div className="hike-stat-label">Elevation</div>
              </div>
            </div>

            {/* Health Stats */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                <Heart size={14} color="var(--accent-red)" />
                <span style={{ color: 'var(--text-secondary)' }}>Avg:</span>
                <span style={{ fontWeight: 600 }}>{hike.avgHeartRate} bpm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                <Activity size={14} color="var(--accent-blue)" />
                <span style={{ color: 'var(--text-secondary)' }}>SpO2:</span>
                <span style={{ fontWeight: 600 }}>{hike.avgSpO2}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                <Flame size={14} color="var(--accent-orange)" />
                <span style={{ fontWeight: 600 }}>{hike.calories} cal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
