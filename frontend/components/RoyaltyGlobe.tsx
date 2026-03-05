import { useEffect, useRef, useMemo } from 'react';
import createGlobe from 'cobe';
import type { CityFlow } from '@/lib/store';
import { aggregateByCity } from '@/lib/store';

interface RoyaltyGlobeProps {
  flows: CityFlow[];
  selectedCity?: string | null;
  onCityClick?: (city: string | null) => void;
}

/** Normalize an angle difference to [-PI, PI] for shortest rotation path */
function normalizeDelta(d: number): number {
  return ((d % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
}

export default function RoyaltyGlobe({
  flows,
  selectedCity,
  onCityClick,
}: RoyaltyGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.25);
  const focusRef = useRef<{ phi: number; theta: number } | null>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);

  const cityAggregates = useMemo(() => aggregateByCity(flows), [flows]);
  const maxAmount = useMemo(
    () => Math.max(...cityAggregates.map((c) => c.totalAmount), 1),
    [cityAggregates]
  );

  const markers = useMemo(
    () =>
      cityAggregates.map((c) => ({
        location: [c.lat, c.lng] as [number, number],
        size: Math.max(0.03, (c.totalAmount / maxAmount) * 0.12),
      })),
    [cityAggregates, maxAmount]
  );

  // When selectedCity changes, set focus target
  useEffect(() => {
    if (!selectedCity) {
      focusRef.current = null;
      return;
    }
    const city = cityAggregates.find((c) => c.city === selectedCity);
    if (!city) return;

    // cobe: phi = longitude in radians, theta = latitude in radians
    focusRef.current = {
      phi: (city.lng * Math.PI) / 180,
      theta: (city.lat * Math.PI) / 180,
    };
  }, [selectedCity, cityAggregates]);

  // Create and manage the globe
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

    globeRef.current = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 2.5,
      baseColor: [0.15, 0.15, 0.18],
      markerColor: [0.96, 0.94, 0.91],
      glowColor: [0.06, 0.06, 0.05],
      markers,
      onRender: (state) => {
        const target = focusRef.current;

        if (target && !pointerInteracting.current) {
          // Shortest-path rotation toward target
          const dPhi = normalizeDelta(target.phi - phiRef.current);
          const dTheta = target.theta - thetaRef.current;

          phiRef.current += dPhi * 0.08;
          thetaRef.current += dTheta * 0.08;

          if (Math.abs(dPhi) < 0.005 && Math.abs(dTheta) < 0.005) {
            focusRef.current = null;
          }
        } else if (!pointerInteracting.current && !target) {
          phiRef.current += 0.003;
        }

        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globeRef.current?.destroy();
      globeRef.current = null;
      window.removeEventListener('resize', onResize);
    };
  }, [markers]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current =
            e.clientX - pointerInteractionMovement.current;
          focusRef.current = null;
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
        }}
        onPointerMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            phiRef.current += delta / 200;
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          aspectRatio: '1',
          cursor: 'grab',
          contain: 'layout paint size',
        }}
      />
    </div>
  );
}
