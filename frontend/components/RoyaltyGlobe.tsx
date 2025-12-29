import { useEffect, useState, useMemo, useRef } from 'react';
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RoyaltyFlow {
  region: string;
  amount: number;
  lat: number;
  lng: number;
  source: string;
  timestamp: number;
}

interface RoyaltyGlobeProps {
  flows: RoyaltyFlow[];
  viewMode: 'globe' | 'flat';
}

// Color scale based on amount
const getColor = (amount: number, maxAmount: number): string => {
  const ratio = amount / maxAmount;
  if (ratio > 0.8) return '#FFD700'; // Gold
  if (ratio > 0.6) return '#8B5CF6'; // Purple
  if (ratio > 0.4) return '#3B82F6'; // Blue
  if (ratio > 0.2) return '#10B981'; // Green
  return '#6B7280'; // Gray
};

const getRadius = (amount: number, maxAmount: number): number => {
  const ratio = amount / maxAmount;
  return 10 + ratio * 30;
};

export default function RoyaltyGlobe({ flows, viewMode }: RoyaltyGlobeProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: viewMode === 'globe' ? 1.5 : 2,
    pitch: viewMode === 'globe' ? 45 : 0,
    bearing: 0,
  });

  // Auto-rotate for globe view
  useEffect(() => {
    if (viewMode !== 'globe') return;

    const interval = setInterval(() => {
      setViewState((prev) => ({
        ...prev,
        bearing: (prev.bearing + 0.1) % 360,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [viewMode]);

  // Update view when mode changes
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      pitch: viewMode === 'globe' ? 45 : 0,
      zoom: viewMode === 'globe' ? 1.5 : 2,
    }));
  }, [viewMode]);

  const maxAmount = useMemo(() => Math.max(...flows.map((f) => f.amount)), [flows]);

  // Generate GeoJSON for arcs (flows from center to each point)
  const arcData = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: flows.map((flow) => ({
        type: 'Feature' as const,
        properties: {
          amount: flow.amount,
          source: flow.source,
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [-98, 39], // Center point (roughly US center for demo)
            [flow.lng, flow.lat],
          ],
        },
      })),
    };
  }, [flows]);

  // Generate GeoJSON for points
  const pointData = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: flows.map((flow) => ({
        type: 'Feature' as const,
        properties: {
          amount: flow.amount,
          region: flow.region,
          color: getColor(flow.amount, maxAmount),
          radius: getRadius(flow.amount, maxAmount),
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [flow.lng, flow.lat],
        },
      })),
    };
  }, [flows, maxAmount]);

  // Check if we have a valid Mapbox token
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // If no token, show placeholder
  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-imperium-darker flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="relative w-64 h-64 mx-auto mb-6">
            {/* Animated placeholder globe */}
            <div className="absolute inset-0 rounded-full border-2 border-imperium-gold/30 animate-pulse" />
            <div className="absolute inset-4 rounded-full border border-imperium-gold/20" />
            <div className="absolute inset-8 rounded-full border border-imperium-gold/10" />

            {/* Fake data points */}
            {flows.slice(0, 6).map((flow, i) => (
              <div
                key={flow.region}
                className="absolute w-3 h-3 rounded-full bg-imperium-gold animate-pulse"
                style={{
                  top: `${30 + Math.sin(i * 1.2) * 25}%`,
                  left: `${30 + Math.cos(i * 1.2) * 25}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          <h3 className="text-xl font-bold mb-2">Configure Mapbox</h3>
          <p className="text-white/60 text-sm mb-4">
            Add your Mapbox access token to <code className="text-imperium-gold">NEXT_PUBLIC_MAPBOX_TOKEN</code>
            in your environment variables to enable the interactive globe.
          </p>

          {/* Preview Stats */}
          <div className="glass rounded-lg p-4 text-left">
            <p className="text-xs text-white/40 mb-2">Preview Data:</p>
            {flows.slice(0, 5).map((flow) => (
              <div key={flow.region} className="flex justify-between text-sm py-1">
                <span>{flow.region}</span>
                <span className="text-imperium-gold">${flow.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={mapboxToken}
      projection={viewMode === 'globe' ? 'globe' : 'mercator'}
      fog={{
        color: '#0A0A0F',
        'high-color': '#1a1a2e',
        'horizon-blend': 0.02,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Arc lines showing flow */}
      <Source id="arcs" type="geojson" data={arcData}>
        <Layer
          id="arc-layer"
          type="line"
          paint={{
            'line-color': '#FFD70040',
            'line-width': 1,
            'line-dasharray': [2, 2],
          }}
        />
      </Source>

      {/* Data points */}
      <Source id="points" type="geojson" data={pointData}>
        <Layer
          id="point-glow"
          type="circle"
          paint={{
            'circle-radius': ['get', 'radius'],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.3,
            'circle-blur': 1,
          }}
        />
        <Layer
          id="point-core"
          type="circle"
          paint={{
            'circle-radius': ['/', ['get', 'radius'], 3],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.8,
          }}
        />
      </Source>

      {/* Custom markers with labels */}
      {flows.slice(0, 10).map((flow) => (
        <Marker
          key={flow.region}
          longitude={flow.lng}
          latitude={flow.lat}
          anchor="bottom"
        >
          <div className="text-center pointer-events-none">
            <div
              className="w-3 h-3 rounded-full mx-auto mb-1 animate-pulse"
              style={{ backgroundColor: getColor(flow.amount, maxAmount) }}
            />
            <div className="glass px-2 py-1 rounded text-xs whitespace-nowrap">
              <span className="font-bold">{flow.region}</span>
              <span className="text-imperium-gold ml-2">
                ${flow.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </Marker>
      ))}
    </Map>
  );
}
