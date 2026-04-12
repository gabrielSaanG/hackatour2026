import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { FOZ_COORDS, Vehicle } from '@/data/routes';
import 'leaflet/dist/leaflet.css';

const vehicleColors: Record<string, string> = {
  plane: '#00d4ff',
  bus: '#f59e0b',
  car: '#22c55e',
};

function VehicleMarkers({ vehicles }: { vehicles: Vehicle[] }) {
  const map = useMap();
  const prevCount = useRef(0);

  useEffect(() => {
    if (vehicles.length !== prevCount.current) {
      prevCount.current = vehicles.length;
    }
  }, [vehicles.length]);

  return (
    <>
      {/* Foz marker */}
      <CircleMarker
        center={[FOZ_COORDS.lat, FOZ_COORDS.lng]}
        radius={8}
        pathOptions={{
          color: '#00d4ff',
          fillColor: '#00d4ff',
          fillOpacity: 0.8,
          weight: 2,
        }}
      >
        <Popup>
          <span style={{ color: '#000', fontWeight: 'bold' }}>Foz do Iguaçu</span>
        </Popup>
      </CircleMarker>
      
      {/* Foz pulse ring */}
      <CircleMarker
        center={[FOZ_COORDS.lat, FOZ_COORDS.lng]}
        radius={16}
        pathOptions={{
          color: '#00d4ff',
          fillColor: '#00d4ff',
          fillOpacity: 0.15,
          weight: 1,
        }}
      />

      {/* Vehicle dots */}
      {vehicles.map(v => (
        <CircleMarker
          key={v.id}
          center={[v.lat, v.lng]}
          radius={v.type === 'plane' ? 4 : 3}
          pathOptions={{
            color: vehicleColors[v.type],
            fillColor: vehicleColors[v.type],
            fillOpacity: 0.9,
            weight: 1,
          }}
        >
          <Popup>
            <div style={{ color: '#000' }}>
              <strong>{v.type === 'plane' ? '✈️' : v.type === 'bus' ? '🚌' : '🚗'} {v.origin}</strong>
              <br />
              {v.country}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

interface LiveMapProps {
  vehicles: Vehicle[];
}

export default function LiveMap({ vehicles }: LiveMapProps) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border glow-primary">
      <MapContainer
        center={[FOZ_COORDS.lat, FOZ_COORDS.lng]}
        zoom={4}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: 'hsl(220, 20%, 5%)' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <VehicleMarkers vehicles={vehicles} />
      </MapContainer>

      {/* Overlay legend */}
      <div className="absolute bottom-4 left-4 surface-elevated border border-border rounded-lg p-3 z-[1000] backdrop-blur-sm">
        <div className="text-xs font-mono text-muted-foreground mb-2">LEGENDA</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00d4ff' }} />
            <span className="text-xs text-foreground">Aviões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <span className="text-xs text-foreground">Ônibus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-xs text-foreground">Carros</span>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 surface-elevated border border-border rounded-full px-3 py-1.5">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs font-mono text-foreground">AO VIVO</span>
      </div>
    </div>
  );
}
