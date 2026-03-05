import { useEffect, useRef, useMemo, useCallback } from 'react';
import { feature } from 'topojson-client';
import type { CityFlow } from '@/lib/store';
import { aggregateByCity } from '@/lib/store';

// Load world land topology (110m simplified — single MultiPolygon)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const topo = require('world-atlas/land-110m.json');
const land = feature(topo, topo.objects.land) as any;

interface FlatMapProps {
  flows: CityFlow[];
  selectedCity?: string | null;
  onCityClick?: (city: string | null) => void;
}

// Equirectangular projection
function lngToX(lng: number, w: number) {
  return ((lng + 180) / 360) * w;
}
function latToY(lat: number, h: number) {
  return ((90 - lat) / 180) * h;
}

export default function FlatMap({ flows, selectedCity, onCityClick }: FlatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const pulseRef = useRef(0);
  const staticRef = useRef<HTMLCanvasElement | null>(null);

  const cities = useMemo(() => aggregateByCity(flows), [flows]);
  const maxAmount = useMemo(
    () => Math.max(...cities.map((c) => c.totalAmount), 1),
    [cities]
  );

  // Draw land polygons to an offscreen canvas, return as ImageData mask
  const buildLandMask = useCallback((w: number, h: number): ImageData | null => {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const ctx = off.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#fff';
    const geom = land.geometry || land.features?.[0]?.geometry;
    if (!geom) return null;

    const polys = geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates];
    for (const poly of polys) {
      for (const ring of poly) {
        ctx.beginPath();
        for (let i = 0; i < ring.length; i++) {
          const x = lngToX(ring[i][0], w);
          const y = latToY(ring[i][1], h);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    return ctx.getImageData(0, 0, w, h);
  }, []);

  // Render the static layer: grid + land dots (only on resize)
  const renderStatic = useCallback(
    (w: number, h: number) => {
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const ctx = off.getContext('2d');
      if (!ctx) return off;

      // Black background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // Grid — minor lines every 30°
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = latToY(lat, h);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let lng = -150; lng <= 180; lng += 30) {
        const x = lngToX(lng, w);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Grid — equator + prime meridian
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 0.5;
      const eqY = latToY(0, h);
      ctx.beginPath();
      ctx.moveTo(0, eqY);
      ctx.lineTo(w, eqY);
      ctx.stroke();
      const pmX = lngToX(0, w);
      ctx.beginPath();
      ctx.moveTo(pmX, 0);
      ctx.lineTo(pmX, h);
      ctx.stroke();

      // Land dot grid
      const mask = buildLandMask(w, h);
      if (mask) {
        const spacing = 5;
        ctx.fillStyle = '#1a1a1a';
        for (let gy = spacing / 2; gy < h; gy += spacing) {
          for (let gx = spacing / 2; gx < w; gx += spacing) {
            const i = (Math.floor(gy) * mask.width + Math.floor(gx)) * 4;
            if (mask.data[i] > 128) {
              ctx.beginPath();
              ctx.arc(gx, gy, 0.7, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      staticRef.current = off;
      return off;
    },
    [buildLandMask]
  );

  // Draw dynamic layer: city dots + pulse
  const draw = useCallback(
    (canvas: HTMLCanvasElement, t: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !staticRef.current) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Blit static layer
      ctx.drawImage(staticRef.current, 0, 0, w, h);

      // City dots
      for (const city of cities) {
        const cx = lngToX(city.lng, w);
        const cy = latToY(city.lat, h);
        const size = Math.max(1.5, (city.totalAmount / maxAmount) * 6);
        const isSelected = city.city === selectedCity;

        // Subtle idle breathing (all dots)
        const breath = 0.6 + Math.sin(t * 0.8 + cx * 0.01) * 0.15;

        if (isSelected) {
          // Pulse ring
          const ringSize = size + 6 + Math.sin(t * 2) * 4;
          ctx.strokeStyle = `rgba(245, 240, 232, ${0.2 + Math.sin(t * 2) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, ringSize, 0, Math.PI * 2);
          ctx.stroke();

          // Glow
          ctx.fillStyle = 'rgba(245, 240, 232, 0.08)';
          ctx.beginPath();
          ctx.arc(cx, cy, size + 4, 0, Math.PI * 2);
          ctx.fill();

          // Dot
          ctx.fillStyle = '#F5F0E8';
          ctx.beginPath();
          ctx.arc(cx, cy, size + 1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(245, 240, 232, ${breath})`;
          ctx.beginPath();
          ctx.arc(cx, cy, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    },
    [cities, maxAmount, selectedCity]
  );

  // Canvas setup + animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      renderStatic(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      pulseRef.current += 0.02;
      draw(canvas, pulseRef.current);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw, renderStatic]);

  // Click handler — find nearest city dot
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onCityClick || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      let closest: string | null = null;
      let minDist = 20;

      for (const city of cities) {
        const cx = lngToX(city.lng, w);
        const cy = latToY(city.lat, h);
        const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = city.city;
        }
      }

      onCityClick(closest);
    },
    [cities, onCityClick]
  );

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#000' }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ cursor: 'crosshair', display: 'block' }}
      />
    </div>
  );
}
