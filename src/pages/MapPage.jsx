import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Compass, Mountain, Box, Square, PlayCircle, FolderOpen, Navigation, Clock, Route, MapPin, StopCircle, Locate, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { haversineDistance, routeDistance, nearestPointOnRoute, calcBearing, distanceRemaining, formatDuration, formatKm, startGPSTracking } from '../utils/geoUtils';

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { deviceData, sensorData, bleStatus, firebaseConnected } = useApp();
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const fileInputRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeMarkersRef = useRef([]);
  const gpsTrackerRef = useRef(null);
  const rotateFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('satellite');
  const [is3D, setIs3D] = useState(true);
  const [downloadingOffline, setDownloadingOffline] = useState(false);

  const [gpxRoute, setGpxRoute] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState(() => {
    const saved = localStorage.getItem('hikex_saved_routes');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSavedList, setShowSavedList] = useState(false);

  // Navigation state
  const [isTrekking, setIsTrekking] = useState(false);
  const [navMode, setNavMode] = useState(false);
  const [navTrail, setNavTrail] = useState(null);
  const [showNavPreview, setShowNavPreview] = useState(false);
  const [useRealGPS, setUseRealGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const [navStats, setNavStats] = useState({
    distRemaining: '0',
    distCovered: '0',
    elapsed: 0,
    speed: '0',
    progress: 0,
    eta: '0',
    currentIdx: 0,
    offRoute: false,
  });

  // User position from deviceData (BLE/Firebase) or fallback
  const [userPosition, setUserPosition] = useState({
    lat: deviceData?.lat || 32.2423,
    lng: deviceData?.lng || 76.3191,
  });

  useEffect(() => {
    localStorage.setItem('hikex_saved_routes', JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  // Live GPS updates from BLE/Firebase (when not in navigation mode)
  useEffect(() => {
    if (!isTrekking && deviceData?.lat && deviceData?.lng) {
      const newPos = { lat: deviceData.lat, lng: deviceData.lng };
      setUserPosition(newPos);
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([newPos.lng, newPos.lat]);
      }
    }
  }, [deviceData?.lat, deviceData?.lng, isTrekking]);

  // Detect incoming trail from TrailsPage
  useEffect(() => {
    if (location.state?.trail) {
      const trail = location.state.trail;
      setNavTrail(trail);
      setNavMode(true);

      // Set initial position to trail start
      if (trail.route && trail.route.length > 0) {
        setUserPosition({ lng: trail.route[0][0], lat: trail.route[0][1] });
      }

      const waitForMap = setInterval(() => {
        if (mapInstance.current && mapInstance.current.isStyleLoaded()) {
          clearInterval(waitForMap);
          loadRouteToMap(trail.route);
          setShowNavPreview(true);
        }
      }, 300);

      return () => clearInterval(waitForMap);
    }
  }, [location.state]);

  // Attempt real GPS
  const enableRealGPS = useCallback(() => {
    if (gpsTrackerRef.current) gpsTrackerRef.current.stop();

    const tracker = startGPSTracking(
      (pos) => {
        setUserPosition({ lat: pos.lat, lng: pos.lng });
        setUseRealGPS(true);
        setGpsError(null);

        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([pos.lng, pos.lat]);
        }
      },
      (err) => {
        console.warn('GPS Error:', err.message);
        setGpsError(err.message);
        setUseRealGPS(false);
      }
    );

    gpsTrackerRef.current = tracker;
  }, []);

  const handleOfflineDownload = () => {
    setDownloadingOffline(true);
    setTimeout(() => {
       setDownloadingOffline(false);
       setMapStyle('default');
       setIs3D(false);
       mapInstance.current?.easeTo({ pitch: 0, duration: 800 });
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(event.target.result, "text/xml");
      const trkpts = xmlDoc.querySelectorAll('trkpt');
      const routePoints = Array.from(trkpts).map(pt => [
        parseFloat(pt.getAttribute('lon')),
        parseFloat(pt.getAttribute('lat'))
      ]);
      if (routePoints.length > 0) {
        const newRoute = { id: Date.now(), name: file.name, points: routePoints };
        setSavedRoutes(prev => [...prev, newRoute]);
        loadRouteToMap(routePoints);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadRouteToMap = useCallback((points) => {
    setGpxRoute(points);
    setShowSavedList(false);
    setIsTrekking(false);
    if (rotateFrameRef.current) cancelAnimationFrame(rotateFrameRef.current);

    const map = mapInstance.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('trail-data');
    if (!source) return;

    source.setData({
      type: 'Feature', properties: {},
      geometry: { type: 'LineString', coordinates: points }
    });

    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];

    // Start marker
    const startEl = document.createElement('div');
    startEl.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:#10b981;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(16,185,129,0.5);font-size:12px;font-weight:bold;color:#fff;">A</div>`;
    routeMarkersRef.current.push(
      new window.maplibregl.Marker({ element: startEl }).setLngLat(points[0]).addTo(map)
    );

    // End marker
    const endEl = document.createElement('div');
    endEl.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(239,68,68,0.5);font-size:12px;font-weight:bold;color:#fff;">B</div>`;
    routeMarkersRef.current.push(
      new window.maplibregl.Marker({ element: endEl }).setLngLat(points[points.length - 1]).addTo(map)
    );

    // Fit bounds
    const bounds = points.reduce(
      (b, c) => b.extend(c),
      new window.maplibregl.LngLatBounds(points[0], points[0])
    );
    map.fitBounds(bounds, { padding: 80, duration: 1500, pitch: is3D ? 50 : 0 });
  }, [is3D]);

  // Start REAL GPS navigation — marker moves only with actual user movement
  const startTrek = useCallback(() => {
    if (!gpxRoute || gpxRoute.length === 0) return;
    setIsTrekking(true);
    setShowNavPreview(false);
    startTimeRef.current = Date.now();
    setGpsError(null);
    if (rotateFrameRef.current) cancelAnimationFrame(rotateFrameRef.current);

    // Stop any existing GPS tracker
    if (gpsTrackerRef.current) gpsTrackerRef.current.stop();

    const totalDist = routeDistance(gpxRoute);
    let lastPosition = null;
    let totalCovered = 0;

    // Start watching real device GPS
    const tracker = startGPSTracking(
      (pos) => {
        const currentPoint = [pos.lng, pos.lat];
        setUserPosition({ lat: pos.lat, lng: pos.lng });

        // Move user marker to REAL position
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat(currentPoint);
        }

        // Find nearest point on route to determine progress
        const snap = nearestPointOnRoute(currentPoint, gpxRoute);
        const progress = Math.min(100, (snap.index / Math.max(1, gpxRoute.length - 1)) * 100);
        const remainDist = distanceRemaining(gpxRoute, snap.index);

        // Calculate distance covered from start
        if (lastPosition) {
          totalCovered += haversineDistance(lastPosition, currentPoint);
        }
        lastPosition = currentPoint;

        // Real speed from GPS (m/s → km/h), fallback to calculated
        const speedKmH = pos.speed != null && pos.speed > 0
          ? (pos.speed * 3.6)
          : (totalCovered > 0.01 ? totalCovered / ((Date.now() - startTimeRef.current) / 3600000) : 0);

        const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
        const etaMin = speedKmH > 0.5 ? (remainDist / speedKmH) * 60 : 0;

        // Off-route detection: > 200m from nearest route point
        const offRoute = snap.distance > 0.2;

        // Camera follows user with bearing toward next route point
        const lookAheadIdx = Math.min(snap.index + 3, gpxRoute.length - 1);
        const bearing = calcBearing(currentPoint, gpxRoute[lookAheadIdx]);

        mapInstance.current?.easeTo({
          center: currentPoint,
          zoom: 16,
          pitch: 65,
          bearing,
          duration: 1000,
        });

        setNavStats({
          distRemaining: remainDist.toFixed(2),
          distCovered: totalCovered.toFixed(2),
          elapsed: Math.floor(elapsedSec),
          speed: speedKmH.toFixed(1),
          progress: progress.toFixed(0),
          eta: etaMin > 0 ? `${Math.floor(etaMin)} min` : '--',
          currentIdx: snap.index,
          offRoute,
        });

        // Auto-complete if within 50m of endpoint
        if (snap.index >= gpxRoute.length - 2 && snap.distance < 0.05) {
          stopTrek();
          setNavStats(prev => ({ ...prev, progress: 100, distRemaining: '0' }));
        }
      },
      (err) => {
        setGpsError(`Location access needed: ${err.message}`);
      }
    );

    gpsTrackerRef.current = tracker;
  }, [gpxRoute]);

  const stopTrek = useCallback(() => {
    if (gpsTrackerRef.current) gpsTrackerRef.current.stop();
    gpsTrackerRef.current = null;
    setIsTrekking(false);
  }, []);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || !window.maplibregl) return;
    if (mapInstance.current) return;

    const defaultRoute = [[76.3191, 32.2423],[76.3200, 32.2438],[76.3210, 32.2453],[76.3220, 32.2468],[76.3230, 32.2483],[76.3240, 32.2498]];

    const map = new window.maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'satellite-tiles': { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 },
          'default-tiles': { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 },
          'terrain-tiles': { type: 'raster', tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'], tileSize: 256 },
          'terrain-source': { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256 },
          'trail-data': { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: defaultRoute } } }
        },
        layers: [
          { id: 'default-layer', type: 'raster', source: 'default-tiles', minzoom: 0, maxzoom: 22, layout: { visibility: 'none' } },
          { id: 'terrain-layer', type: 'raster', source: 'terrain-tiles', minzoom: 0, maxzoom: 22, layout: { visibility: 'none' } },
          { id: 'satellite-layer', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 22, layout: { visibility: 'visible' } },
          { id: 'trail-line-glow', type: 'line', source: 'trail-data', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#2dd4bf', 'line-width': 14, 'line-opacity': 0.3, 'line-blur': 8 } },
          { id: 'trail-line', type: 'line', source: 'trail-data', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#2dd4bf', 'line-width': 5 } }
        ],
        terrain: { source: 'terrain-source', exaggeration: 1.5 }
      },
      center: [userPosition.lng, userPosition.lat],
      zoom: 12, pitch: 65, bearing: -30, maxPitch: 85,
    });

    mapInstance.current = map;

    map.on('load', () => {
      const youEl = document.createElement('div');
      youEl.innerHTML = `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 16px 4px rgba(59,130,246,0.5);"></div>`;
      userMarkerRef.current = new window.maplibregl.Marker({ element: youEl })
        .setLngLat([userPosition.lng, userPosition.lat])
        .addTo(map);

      window.addEventListener('maplibre-toggle-3d', (e) => {
         if (e.detail) {
            map.setTerrain({ source: 'terrain-source', exaggeration: 1.5 });
            map.easeTo({ pitch: 65, duration: 800 });
         } else {
            map.setTerrain(null);
            map.easeTo({ pitch: 0, duration: 800 });
         }
      });
    });

    return () => {
      if (rotateFrameRef.current) cancelAnimationFrame(rotateFrameRef.current);
      if (gpsTrackerRef.current) gpsTrackerRef.current.stop();
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  useEffect(() => {
     if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('maplibre-toggle-3d', { detail: is3D }));
     }
  }, [is3D]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const m = mapInstance.current;
    if (m.isStyleLoaded()) {
       m.setLayoutProperty('satellite-layer', 'visibility', mapStyle === 'satellite' ? 'visible' : 'none');
       m.setLayoutProperty('default-layer', 'visibility', mapStyle === 'default' ? 'visible' : 'none');
       m.setLayoutProperty('terrain-layer', 'visibility', mapStyle === 'terrain' ? 'visible' : 'none');
    }
  }, [mapStyle]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', background: '#000', overflow: 'hidden' }}>

      {/* Top controls (hidden during navigation) */}
      {!isTrekking && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '16px', pointerEvents: 'none' }} className="animate-in stagger-1">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(24,24,27,0.6)', backdropFilter: 'blur(16px)', padding: '12px 20px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', pointerEvents: 'auto' }} onClick={() => navigate(-1)}>
              <ArrowLeft size={20} className="text-white" />
              <h1 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Recon Map</h1>
            </div>
            <div style={{ background: 'rgba(24,24,27,0.6)', backdropFilter: 'blur(16px)', padding: '10px 16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
               <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2dd4bf', fontWeight: 'bold', margin: 0 }}>
                 {useRealGPS ? '📡 LIVE GPS' : '📍 SENSOR'} · LAT {userPosition.lat.toFixed(4)}
               </p>
               <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2dd4bf', fontWeight: 'bold', margin: 0 }}>LNG {userPosition.lng.toFixed(4)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', background: 'rgba(24,24,27,0.6)', backdropFilter: 'blur(16px)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', padding: '3px' }}>
              {['satellite', 'terrain', 'default'].map(s => (
                <button key={s} style={{ padding: '7px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold', background: mapStyle === s ? 'rgba(255,255,255,0.2)' : 'transparent', color: mapStyle === s ? '#fff' : '#a1a1aa', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }} onClick={() => setMapStyle(s)}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(16px)', borderRadius: '100px', border: '1px solid rgba(45,212,191,0.3)', padding: '3px' }}>
               <button style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: is3D ? '#2dd4bf' : 'transparent', color: is3D ? '#000' : '#2dd4bf', border: 'none', cursor: 'pointer' }} onClick={() => setIs3D(true)}><Box size={14} /></button>
              <button style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !is3D ? '#2dd4bf' : 'transparent', color: !is3D ? '#000' : '#2dd4bf', border: 'none', cursor: 'pointer' }} onClick={() => setIs3D(false)}><Square size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Preview Sheet */}
      {showNavPreview && navTrail && !isTrekking && (
        <div className="animate-in" style={{ position: 'absolute', bottom: '80px', left: '16px', right: '16px', zIndex: 2000, background: 'rgba(15,23,42,0.93)', backdropFilter: 'blur(24px)', borderRadius: '24px', padding: '20px', border: '1px solid rgba(45,212,191,0.2)', boxShadow: '0 -8px 32px rgba(0,0,0,0.6)' }}>
          <button onClick={() => { setShowNavPreview(false); setNavMode(false); }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px' }}>✕</button>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', marginBottom: '3px' }}>{navTrail.name}</h3>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} /> {navTrail.location}</p>

          <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
            {[
              { icon: <Route size={13} color="#2dd4bf" />, val: `${navTrail.dist} km`, label: 'Distance', bg: 'rgba(45,212,191,0.12)' },
              { icon: <Clock size={13} color="#fbbf24" />, val: navTrail.duration, label: 'Duration', bg: 'rgba(251,191,36,0.12)' },
              { icon: <Mountain size={13} color="#10b981" />, val: `${navTrail.elevation}m`, label: 'Gain', bg: 'rgba(16,185,129,0.12)' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>{s.val}</p>
                  <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={startTrek}
            style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #10b981, #2dd4bf)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}
          >
            <Navigation size={16} /> Start Navigation
          </button>
        </div>
      )}

      {/* GPX Trek button */}
      {gpxRoute && !isTrekking && !navMode && (
         <div className="animate-in" style={{ position: 'absolute', top: '140px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
            <button onClick={startTrek} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#10b981', border: 'none', borderRadius: '100px', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 8px 20px rgba(16,185,129,0.35)', cursor: 'pointer' }}>
              <PlayCircle size={18} /> Start GPX Trek
            </button>
         </div>
      )}

      {/* LIVE NAVIGATION HUD */}
      {isTrekking && (
        <>
          {/* Top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2000 }}>
            <div style={{ background: 'rgba(16,185,129,0.95)', padding: '14px 20px', paddingTop: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Navigation size={20} color="#fff" />
                <div>
                  <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>{navTrail?.name || 'GPX Route'}</p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>ETA: {navStats.eta} · {navStats.distRemaining} km left</p>
                </div>
              </div>
              <button onClick={stopTrek} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: '100px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <StopCircle size={14} /> End
              </button>
            </div>
            <div style={{ height: '3px', background: 'rgba(0,0,0,0.3)', width: '100%' }}>
              <div style={{ height: '100%', background: '#fff', width: `${navStats.progress}%`, transition: 'width 1s ease', borderRadius: '0 2px 2px 0' }}></div>
            </div>
            {navStats.offRoute && (
              <div style={{ background: 'rgba(244,63,94,0.9)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={14} color="#fff" />
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>You are off-route. Head back to the trail.</span>
              </div>
            )}
          </div>

          {/* Bottom stats */}
          <div style={{ position: 'absolute', bottom: '80px', left: '14px', right: '14px', zIndex: 2000, background: 'rgba(15,23,42,0.93)', backdropFilter: 'blur(24px)', borderRadius: '18px', padding: '14px 16px', border: '1px solid rgba(45,212,191,0.12)', display: 'flex', justifyContent: 'space-around' }}>
            {[
              { val: navStats.speed, unit: 'km/h', color: '#2dd4bf' },
              { val: formatDuration(navStats.elapsed), unit: 'Time', color: '#fbbf24' },
              { val: navStats.distCovered, unit: 'km done', color: '#10b981' },
              { val: `${navStats.progress}%`, unit: 'Progress', color: '#f43f5e' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}></div>}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.15rem', fontWeight: 'bold', color: s.color, margin: 0 }}>{s.val}</p>
                  <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>{s.unit}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </>
      )}

      {/* Floating tools */}
      {!isTrekking && (
        <div style={{ position: 'absolute', left: '20px', bottom: '110px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={handleOfflineDownload} style={{ padding: '10px 14px', background: downloadingOffline ? 'rgba(45,212,191,0.4)' : 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '3px', backdropFilter: 'blur(10px)', cursor: 'pointer', color: '#fff' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.7rem', textTransform: 'uppercase', color: '#10b981' }}>{downloadingOffline ? 'Caching...' : 'Offline Mode'}</span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{downloadingOffline ? 'Downloading tiles' : 'Cache Topo Data'}</span>
          </button>

          <input type="file" ref={fileInputRef} accept=".gpx" onChange={handleFileUpload} style={{ display: 'none' }} />
          <button onClick={() => setShowSavedList(!showSavedList)} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '3px', backdropFilter: 'blur(10px)', cursor: 'pointer', color: '#fff' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.7rem', textTransform: 'uppercase' }}>Import GPX</span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>Load XML Route</span>
          </button>

          {showSavedList && (
             <div style={{ padding: '12px', position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px', width: '200px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <button onClick={() => fileInputRef.current.click()} style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>+ Browse File</button>
               {savedRoutes.map(r => (
                  <div key={r.id} onClick={() => loadRouteToMap(r.points)} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold' }}>
                     <FolderOpen size={12} color="#2dd4bf" /> {r.name}
                  </div>
               ))}
             </div>
          )}
        </div>
      )}

      {/* Map */}
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, zIndex: 1, filter: mapStyle === 'satellite' ? 'none' : 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(80%)' }} />

      {/* Recentre + GPS buttons */}
      {!isTrekking && (
        <div style={{ position: 'absolute', bottom: '180px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.4)' }}
            onClick={enableRealGPS}
          >
            <Locate size={20} color={useRealGPS ? '#3b82f6' : '#888'} />
          </div>
          <div
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.4)' }}
            onClick={() => { mapInstance.current?.easeTo({ center: [userPosition.lng, userPosition.lat], pitch: is3D ? 65 : 0, bearing: -30, duration: 800 }); }}
          >
            <Compass size={20} color="#2dd4bf" />
          </div>
        </div>
      )}

      {/* GPS error toast */}
      {gpsError && (
        <div style={{ position: 'absolute', top: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: 'rgba(244,63,94,0.9)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '320px' }}>
          <AlertTriangle size={16} color="#fff" />
          <span style={{ fontSize: '0.75rem', color: '#fff' }}>GPS: {gpsError}</span>
          <button onClick={() => setGpsError(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', marginLeft: '8px' }}>✕</button>
        </div>
      )}
    </div>
  );
}
