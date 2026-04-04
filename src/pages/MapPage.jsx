import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Compass, Mountain, ChevronDown, Layers, Box, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MapPage() {
  const navigate = useNavigate();
  const { sensorData } = useApp();
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [activePoi, setActivePoi] = useState(null);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [is3D, setIs3D] = useState(true);
  const [downloadingOffline, setDownloadingOffline] = useState(false);

  const handleOfflineDownload = () => {
    setDownloadingOffline(true);
    setTimeout(() => {
       setDownloadingOffline(false);
       setMapStyle('default');
       setIs3D(false);
       if (mapInstance.current) {
          mapInstance.current.easeTo({ pitch: 0, duration: 800 });
       }
    }, 2000);
  };

  const lat = sensorData?.gps?.lat || 45.9763;
  const lng = sensorData?.gps?.lng || 7.6586;

  const pois = [
    { name: "Hörnli Hut Basecamp", type: "Camp", emoji: '🏕️', color: 'var(--accent-amber)', pos: [7.6644, 45.9818], details: "Primary overnight staging area.", altitude: "3,260m", depth: "-210m drop" },
    { name: "Schwarzsee Viewpoint", type: "Nature Site", emoji: '🏔️', color: 'var(--accent-emerald)', pos: [7.7118, 45.9863], details: "Scenic ridge overlooking glacial valley.", altitude: "2,583m", depth: "-1,200m vertical drain" },
    { name: "Alpine Medical Shelter", type: "Emergency", emoji: '🏥', color: 'var(--accent-rose)', pos: [7.6499, 45.9702], details: "Stocked with emergency rations & comms.", altitude: "3,900m", depth: "-45° slope" },
    { name: "Stellisee Glacier Runoff", type: "Water", emoji: '💧', color: 'var(--accent-primary)', pos: [7.7946, 46.0044], details: "Reliable fresh glacial water source.", altitude: "2,537m", depth: "Shallow basin" }
  ];

  const trailRoute = [
    [7.6586, 45.9763], // lng, lat
    [7.6610, 45.9780],
    [7.6644, 45.9818], 
    [7.6800, 45.9835],
    [7.6950, 45.9850],
    [7.7118, 45.9863]  
  ];

  useEffect(() => {
    if (!mapContainer.current || !window.maplibregl) return;

    if (mapInstance.current) return;

    const map = new window.maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
          },
          'default-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
          },
          'terrain-tiles': {
            type: 'raster',
            tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
          },
          'terrain-source': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            encoding: 'terrarium',
            tileSize: 256,
          },
          'trail-data': {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: trailRoute
              }
            }
          }
        },
        layers: [
          {
            id: 'default-layer',
            type: 'raster',
            source: 'default-tiles',
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: 'none' }
          },
          {
            id: 'terrain-layer',
            type: 'raster',
            source: 'terrain-tiles',
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: 'none' }
          },
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 22,
            layout: { visibility: 'visible' }
          },
          {
            id: 'trail-line-glow',
            type: 'line',
            source: 'trail-data',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#2dd4bf', 'line-width': 8, 'line-opacity': 0.3, 'line-blur': 4 }
          },
          {
            id: 'trail-line',
            type: 'line',
            source: 'trail-data',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#2dd4bf', 'line-width': 3, 'line-dasharray': [2, 2] }
          }
        ],
        terrain: { source: 'terrain-source', exaggeration: 1.5 }
      },
      center: [7.6800, 45.9800], 
      zoom: 12,
      pitch: 65,
      bearing: -30,
      maxPitch: 85,
    });

    mapInstance.current = map;

    map.on('load', () => {
      pois.forEach(poi => {
        const el = document.createElement('div');
        el.className = 'maplibre-emoji-marker animate-pulse-heavy';
        el.style.fontSize = '20px';
        el.style.background = 'rgba(0,0,0,0.7)';
        el.style.border = `2px solid ${poi.color}`;
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.backdropFilter = 'blur(4px)';
        el.style.boxShadow = `0 4px 15px ${poi.color}`;
        el.style.cursor = 'pointer';
        el.innerHTML = poi.emoji;

        el.addEventListener('click', () => {
          setActivePoi(poi);
          map.flyTo({ center: poi.pos, zoom: 14, pitch: is3D ? 70 : 0, duration: 2000 });
        });

        new window.maplibregl.Marker({ element: el })
          .setLngLat(poi.pos)
          .addTo(map);
      });

      const youEl = document.createElement('div');
      youEl.innerHTML = `<div style="width: 14px; height: 14px; background: #2dd4bf; border-radius: 50%; box-shadow: 0 0 20px 5px rgba(45, 212, 191,0.5);"></div>`;
      new window.maplibregl.Marker({ element: youEl })
        .setLngLat([lng, lat])
        .addTo(map);

      let frame;
      const rotateCamera = (timestamp) => {
        map.rotateTo((timestamp / 200) % 360, { duration: 0 });
        frame = requestAnimationFrame(rotateCamera);
      };
      
      // We only execute rotation if not canceled by user drag
      frame = requestAnimationFrame(rotateCamera);
      map.on('dragstart', () => cancelAnimationFrame(frame));
      map.on('zoomstart', () => cancelAnimationFrame(frame));
      
      // Listen for 3D state change natively
      window.addEventListener('maplibre-toggle-3d', (e) => {
         const enable3D = e.detail;
         if (enable3D) {
            map.setTerrain({ source: 'terrain-source', exaggeration: 1.5 });
            map.easeTo({ pitch: 65, duration: 800 });
            frame = requestAnimationFrame(rotateCamera); // restart spin
         } else {
            cancelAnimationFrame(frame);
            map.setTerrain(null);
            map.easeTo({ pitch: 0, duration: 800 });
         }
      });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Dispatch custom event to MapLibre core since map.on('load') traps variable scoping
  useEffect(() => {
     if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('maplibre-toggle-3d', { detail: is3D }));
     }
  }, [is3D]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    
    if (map.isStyleLoaded()) {
       map.setLayoutProperty('satellite-layer', 'visibility', mapStyle === 'satellite' ? 'visible' : 'none');
       map.setLayoutProperty('default-layer', 'visibility', mapStyle === 'default' ? 'visible' : 'none');
       map.setLayoutProperty('terrain-layer', 'visibility', mapStyle === 'terrain' ? 'visible' : 'none');
    } else {
       map.once('styledata', () => {
         map.setLayoutProperty('satellite-layer', 'visibility', mapStyle === 'satellite' ? 'visible' : 'none');
         map.setLayoutProperty('default-layer', 'visibility', mapStyle === 'default' ? 'visible' : 'none');
         map.setLayoutProperty('terrain-layer', 'visibility', mapStyle === 'terrain' ? 'visible' : 'none');
       });
    }
  }, [mapStyle]);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: '#000', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-in stagger-1 pointer-events-none">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(24, 24, 27, 0.6)', backdropFilter: 'blur(16px)', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', pointerEvents: 'auto' }} onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-white" />
            <h1 className="font-display font-bold text-white mb-0" style={{ fontSize: '1.1rem' }}>Recon Map</h1>
          </div>
          
          <div style={{ background: 'rgba(24, 24, 27, 0.6)', backdropFilter: 'blur(16px)', padding: '12px 20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
             <p className="text-[10px] uppercase tracking-widest text-[#2dd4bf] font-bold">LAT: {lat.toFixed(4)}</p>
             <p className="text-[10px] uppercase tracking-widest text-[#2dd4bf] font-bold">LNG: {lng.toFixed(4)}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', pointerEvents: 'auto' }}>
          {/* Dynamic Layer Switcher */}
          <div style={{ display: 'flex', background: 'rgba(24, 24, 27, 0.6)', backdropFilter: 'blur(16px)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', padding: '4px' }}>
            <button 
              style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', background: mapStyle === 'satellite' ? 'rgba(255,255,255,0.2)' : 'transparent', color: mapStyle === 'satellite' ? '#fff' : '#a1a1aa', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => setMapStyle('satellite')}
            >
              Satellite
            </button>
            <button 
              style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', background: mapStyle === 'terrain' ? 'rgba(255,255,255,0.2)' : 'transparent', color: mapStyle === 'terrain' ? '#fff' : '#a1a1aa', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => setMapStyle('terrain')}
            >
              Terrain
            </button>
            <button 
              style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', background: mapStyle === 'default' ? 'rgba(255,255,255,0.2)' : 'transparent', color: mapStyle === 'default' ? '#fff' : '#a1a1aa', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => setMapStyle('default')}
            >
              Default
            </button>
          </div>
          
          {/* 3D / 2D Extrusion Toggle */}
          <div style={{ display: 'flex', background: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(16px)', borderRadius: '100px', border: '1px solid rgba(45, 212, 191,0.3)', padding: '4px' }}>
             <button 
              style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: is3D ? '#2dd4bf' : 'transparent', color: is3D ? '#000' : '#2dd4bf', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => setIs3D(true)}
              title="3D Terrain Mode"
            >
              <Box size={16} strokeWidth={is3D ? 3 : 2} />
            </button>
            <button 
              style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !is3D ? '#2dd4bf' : 'transparent', color: !is3D ? '#000' : '#2dd4bf', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => setIs3D(false)}
              title="2D Map Mode"
            >
              <Square size={16} strokeWidth={!is3D ? 3 : 2} />
            </button>
          </div>
        </div>

      </div>

      {/* Floating Offline Tools */}
      <div style={{ position: 'absolute', left: '24px', bottom: '110px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={handleOfflineDownload} className="card-clickable" style={{ padding: '12px 16px', background: downloadingOffline ? 'rgba(45, 212, 191, 0.4)' : 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-emerald)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', transition: 'all 0.3s' }}>
          <span className="font-bold text-xs uppercase" style={{ color: 'var(--accent-emerald)' }}>{downloadingOffline ? 'Downloading...' : 'Offline Mode'}</span>
          <span className="text-[10px] text-muted">{downloadingOffline ? 'Caching map tiles...' : 'Cache Topo Data'}</span>
        </button>

        <button onClick={() => alert("Simulating GPX file pick intent. This would overlay the GPX coords on MapLibre.")} className="card-clickable" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px', backdropFilter: 'blur(10px)', color: 'var(--text-primary)' }}>
          <span className="font-bold text-xs uppercase text-white">Upload GPX</span>
          <span className="text-[10px] text-muted">Import Route</span>
        </button>
      </div>

      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, filter: mapStyle === 'satellite' ? 'none' : 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(80%)' }} />

      {activePoi && (
        <div className="animate-in" style={{ position: 'absolute', bottom: '180px', left: '24px', right: '24px', zIndex: 2000, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', border: `1px solid ${activePoi.color}`, borderRadius: '24px', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h3 className="font-display font-bold text-white text-lg">{activePoi.name}</h3>
            <span style={{ fontSize: '24px' }}>{activePoi.emoji}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#10b981' }}>
                 <Mountain size={14} />
                 <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>PEAK</span>
              </div>
              <span className="font-display font-bold text-white">{activePoi.altitude}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#ef4444' }}>
                 <ChevronDown size={14} />
                 <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>DEPTH</span>
              </div>
              <span className="font-display font-bold text-white">{activePoi.depth}</span>
            </div>
          </div>
          
          <p className="text-sm text-secondary leading-relaxed">{activePoi.details}</p>
          
          <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '10px' }} onClick={() => setActivePoi(null)}>✕</button>
        </div>
      )}
      
      <div style={{ position: 'absolute', bottom: '110px', right: '24px', zIndex: 1000, width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }} onClick={() => { mapInstance.current?.easeTo({ center: [7.68, 45.98], pitch: is3D ? 65 : 0, bearing: -30, duration: 800 }); }}>
        <Compass size={24} color="#2dd4bf" className="animate-pulse-heavy" />
      </div>

    </div>
  );
}
