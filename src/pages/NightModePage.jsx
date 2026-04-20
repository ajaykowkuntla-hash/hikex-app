import React, { useEffect, useRef, useState } from 'react';
import { Compass, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NightModePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    let mountedRef = { current: true };
    const intervalId = setInterval(() => {
      setHeading(h => (h + 0.1) % 360);
    }, 50);

    // Request AR Camera Feed
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (!mountedRef.current) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera access denied or unavailable:", err);
        });
    }

    const canvas = canvasRef.current;
    let handleResize = null;
    
    // Only set up canvas if available
    if (canvas) {
      const ctx = canvas.getContext('2d');
      
      const drawStars = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const starsCount = Math.floor((canvas.width * canvas.height) / 1000);
        
        for (let i = 0; i < starsCount; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = Math.random() * 1.5;
          const opacity = Math.random();
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
          
          if (Math.random() > 0.95) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "white";
            ctx.beginPath();
            ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167, 243, 208, 0.8)`;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        const cx = canvas.width / 2;
        const cy = canvas.height / 3;
        
        const orionPoints = [
          { x: cx - 40, y: cy - 60 },
          { x: cx + 50, y: cy - 40 },
          { x: cx, y: cy },
          { x: cx - 20, y: cy + 10 },
          { x: cx - 40, y: cy + 20 },
          { x: cx + 30, y: cy + 80 },
          { x: cx - 60, y: cy + 60 },
        ];

        ctx.strokeStyle = "rgba(45, 212, 191, 0.3)";
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(orionPoints[0].x, orionPoints[0].y);
        ctx.lineTo(orionPoints[2].x, orionPoints[2].y);
        ctx.lineTo(orionPoints[1].x, orionPoints[1].y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(orionPoints[5].x, orionPoints[5].y);
        ctx.lineTo(orionPoints[4].x, orionPoints[4].y);
        ctx.lineTo(orionPoints[6].x, orionPoints[6].y);
        ctx.stroke();

        orionPoints.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#2dd4bf";
          ctx.fill();
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#2dd4bf";
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      };

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawStars();
      };

      handleResize = resizeCanvas;
      window.addEventListener('resize', handleResize);
      handleResize();
    }

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
      if (handleResize) {
         window.removeEventListener('resize', handleResize);
      }
      if (videoRef.current && videoRef.current.srcObject) {
         videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: 'radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 100%)', overflow: 'hidden' }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1, filter: 'opacity(0.8) brightness(0.6)' }} 
      />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      
      <div style={{ position: 'absolute', top: '40px', left: '20px', right: '20px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="card-clickable" onClick={() => navigate(-1)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', color: '#fff' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-teal)', boxShadow: '0 0 10px var(--accent-teal)' }}></span>
          <span className="text-white font-bold text-xs uppercase tracking-widest">Star Gazer Active</span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '20%', width: '100%', textAlign: 'center', zIndex: 5, pointerEvents: 'none' }}>
        <h1 className="font-display font-medium text-white" style={{ fontSize: '4rem', opacity: 0.1, letterSpacing: '0.2em' }}>ORION</h1>
      </div>

      {/* Interactive Overlay Box */}
      <div className="animate-in stagger-3" style={{ position: 'absolute', bottom: '110px', left: '20px', right: '20px', zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.75)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="font-display font-bold text-white text-xl">Orion Constellation</h3>
            <Info size={20} color="var(--accent-teal)" />
          </div>
          <p className="text-sm text-secondary mb-4">Visible locally at 45.98° N. Includes Betelgeuse and Rigel, prominent during winter nights in the Alps.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-xs text-muted uppercase font-bold mb-1">RA</div>
              <div className="text-white font-display font-bold">5h 36m</div>
            </div>
            <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-xs text-muted uppercase font-bold mb-1">Dec</div>
              <div className="text-white font-display font-bold">+5° 5'</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Compass Ring */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
        <div style={{ width: '90vw', height: '90vw', borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.2)', position: 'relative', transform: `rotate(${-heading}deg)` }}>
          <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', color: 'var(--accent-rose)', fontWeight: 'bold' }}>N</div>
          <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', color: '#fff' }}>S</div>
          <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', color: '#fff' }}>E</div>
          <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', color: '#fff' }}>W</div>
        </div>
      </div>
      
    </div>
  );
}
