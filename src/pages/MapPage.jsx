import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { getTrekkingPath } from '../services/demoData';
import { Navigation, Mountain, Tent, Home as HomeIcon, Flag } from 'lucide-react';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createCustomIcon(color, label) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-size: 12px;
        font-weight: 700;
      ">${label}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
    animation: riskPulse 1.5s infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const { sensorData } = useApp();
  const trekkingPath = getTrekkingPath();
  const pathCoords = trekkingPath.map(p => [p.lat, p.lng]);
  
  const userPosition = sensorData?.gps 
    ? [sensorData.gps.lat, sensorData.gps.lng] 
    : [trekkingPath[0].lat, trekkingPath[0].lng];

  const center = [28.608, 83.945];

  const markerIcons = [
    { color: '#22c55e', label: 'S' },  // Start
    { color: '#3b82f6', label: 'D' },  // Deurali
    { color: '#f59e0b', label: 'C' },  // Camp
    { color: '#8b5cf6', label: 'H' },  // Hut
    { color: '#f97316', label: 'HC' }, // High Camp
    { color: '#ef4444', label: '⛰' },  // Summit
  ];

  // Safety and danger zones
  const safeZones = [
    { center: [28.5983, 83.9311], radius: 200, color: '#22c55e', name: 'Base Camp Safe Zone' },
    { center: [28.6065, 83.9402], radius: 150, color: '#22c55e', name: 'Forest Camp Safe Zone' },
  ];

  const dangerZones = [
    { center: [28.6130, 83.9480], radius: 180, color: '#ef4444', name: 'Avalanche Risk Area' },
    { center: [28.6170, 83.9540], radius: 120, color: '#f59e0b', name: 'Steep Terrain' },
  ];

  return (
    <div className="page-container full-width" style={{ position: 'relative' }}>
      {/* Map Header Overlay */}
      <div className="map-header-overlay">
        <div className="map-info-card">
          <Navigation size={16} color="var(--accent-blue)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Location</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {sensorData?.currentLocation || 'Ghorepani'}
            </div>
          </div>
        </div>
        <div className="map-info-card">
          <Mountain size={16} color="var(--accent-orange)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Elevation</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {sensorData?.elevation || 2860}m
            </div>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: 'calc(100vh - var(--nav-height))', width: '100%' }}
        id="hiking-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Trekking Path */}
        <Polyline
          positions={pathCoords}
          color="#3b82f6"
          weight={4}
          opacity={0.8}
          dashArray="10, 6"
        />

        {/* Path Markers */}
        {trekkingPath.map((point, idx) => (
          <Marker
            key={idx}
            position={[point.lat, point.lng]}
            icon={createCustomIcon(markerIcons[idx].color, markerIcons[idx].label)}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
                <strong>{point.name}</strong><br />
                Elevation: {point.elevation}m
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User Position */}
        <Marker position={userPosition} icon={userIcon}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
              <strong>Your Location</strong><br />
              {sensorData?.gps?.lat.toFixed(4)}, {sensorData?.gps?.lng.toFixed(4)}<br />
              Alt: {sensorData?.gps?.altitude?.toFixed(0)}m
            </div>
          </Popup>
        </Marker>

        {/* Safe Zones */}
        {safeZones.map((zone, idx) => (
          <Circle
            key={`safe-${idx}`}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.15, weight: 2 }}
          >
            <Popup>{zone.name}</Popup>
          </Circle>
        ))}

        {/* Danger Zones */}
        {dangerZones.map((zone, idx) => (
          <Circle
            key={`danger-${idx}`}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.15, weight: 2, dashArray: '5,5' }}
          >
            <Popup>{zone.name}</Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
