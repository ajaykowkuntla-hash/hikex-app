import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, Info, AlertCircle, Bell,
  Filter
} from 'lucide-react';

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const typeIcons = {
  warning: AlertTriangle,
  info: Info,
  critical: AlertCircle,
};

export default function AlertsPage() {
  const { alerts } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filter);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical' },
    { key: 'warning', label: 'Warning' },
    { key: 'info', label: 'Info' },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={24} />
          Alerts
        </h1>
        <span className="badge badge-demo" style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }}>
          {alerts.length} total
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs animate-in stagger-1">
        {filters.map(f => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
            id={`filter-${f.key}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((alert, idx) => {
          const Icon = typeIcons[alert.type] || Info;
          return (
            <div 
              className={`alert-item animate-in stagger-${Math.min(idx + 1, 5)}`} 
              key={alert.id}
              id={`alert-${alert.id}`}
            >
              <div className={`alert-icon ${alert.type}`}>
                <Icon size={18} />
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{timeAgo(alert.timestamp)}</div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
            <Bell size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No {filter === 'all' ? '' : filter} alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}
