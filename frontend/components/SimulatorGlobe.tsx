import { useEffect, useRef, useMemo } from 'react';
import createGlobe from 'cobe';

interface RoyaltyFlow {
  id: string;
  region: string;
  lat: number;
  lng: number;
  amount: number;
  source: string;
  timestamp: number;
}

interface SimulatorGlobeProps {
  flows: RoyaltyFlow[];
}

export default function SimulatorGlobe({ flows }: SimulatorGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phi = useRef(0);

  const markers = useMemo(
    () =>
      flows.slice(-30).map((f) => ({
        location: [f.lat, f.lng] as [number, number],
        size: Math.max(0.03, Math.min(0.1, f.amount * 0.5)),
      })),
    [flows]
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 2.5,
      baseColor: [0.15, 0.15, 0.18],
      markerColor: [0.96, 0.94, 0.91],
      glowColor: [0.06, 0.06, 0.05],
      markers,
      onRender: (state) => {
        phi.current += 0.005;
        state.phi = phi.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [markers]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        cursor: 'default',
        contain: 'layout paint size',
      }}
    />
  );
}
