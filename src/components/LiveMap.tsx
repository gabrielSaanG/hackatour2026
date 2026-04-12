import {useEffect, useMemo, useState} from "react";
import { DeckGL } from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import type { Position } from "@deck.gl/core";
import Map from "react-map-gl/maplibre";

import {ArrivalAirport, Bus, FlightData, FOZ_COORDS, Vehicle} from "@/data/routes";
import {ArcLayer, PathLayer} from "deck.gl";

const vehicleColors: Record<string, [number, number, number]> = {
    plane: [0, 212, 255],
    bus: [245, 158, 11],
    car: [34, 197, 94],
};

interface LiveMapProps {
    vehicles: Vehicle[];
    buses: Bus[];
    flights: FlightData[];
}

export default function LiveMap({ vehicles, buses, flights }: LiveMapProps) {
    const toPos = (lon: number, lat: number): Position => [lon, lat];
    const busLayer = new PathLayer<Bus>({
        id: "bus-paths",
        data: buses,

        // 🗺️ caminho completo (origem → paradas → destino)
        getPath: (d): Position[] => [
            toPos(d.departure_lon, d.departure_lat),
            ...(d.stops ?? []).map(s => toPos(s.lon, s.lat)),
            toPos(d.arrival_lon, d.arrival_lat)
        ],

        // 🎨 cor baseada no fluxo
        getColor: (d) =>
            d.nivel_fluxo === "alto"
                ? [255, 0, 0]
                : d.nivel_fluxo === "medio"
                    ? [255, 165, 0]
                    : [0, 200, 0],

        // 📏 espessura baseada no número de ônibus
        getWidth: (d) => d.total_onibus * 2,

        widthMinPixels: 2,
        widthMaxPixels: 10,

        // 🖱️ interação
        pickable: true,

        // ✨ suaviza linhas
        jointRounded: true,
        capRounded: true,
    });
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 0.01);
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const interpolatePath = (path: Position[], progress: number): Position => {
        if (path.length < 2) return path[0];

        const totalSegments = path.length - 1;
        const scaled = progress * totalSegments;

        const index = Math.floor(scaled);
        const t = scaled - index;

        const start = path[index];
        const end = path[index + 1] ?? start;

        return [
            start[0] + (end[0] - start[0]) * t,
            start[1] + (end[1] - start[1]) * t
        ];
    };

    const animatedBuses = useMemo(() => {
        return buses.map((route) => {
            const path: Position[] = [
                [route.departure_lon, route.departure_lat],
                ...(route.stops ?? []).map(s => [s.lon, s.lat]),
                [route.arrival_lon, route.arrival_lat]
            ];

            return {
                ...route,
                path,
                progress: Math.random() // posição inicial aleatória
            };
        });
    }, [buses]);

    const movingBuses = useMemo(() => {
        return animatedBuses.map(b => ({
            ...b,
            progress: (b.progress + tick) % 1,
            position: interpolatePath(b.path, (b.progress + tick) % 1)
        }));
    }, [animatedBuses, tick]);

    const busPoints = new ScatterplotLayer({
        id: "moving-buses",
        data: movingBuses,

        getPosition: d => d.position,
        getFillColor: [0, 212, 255],
        getRadius: 4000,

        radiusMinPixels: 3,
        pickable: true,
    });

    const flightLayer = new ArcLayer({
        id: 'flight-arcs',
        data: flights.routes,

        getSourcePosition: d => [d.origin.lon, d.origin.lat],
        getTargetPosition: d => [d.destination.lon, d.destination.lat],

        getWidth: d => Math.max(1, d.weight * 0.02),

        getSourceColor: [0, 128, 255],
        getTargetColor: [255, 0, 80]
    });

    const layers = useMemo(() => {
        return [
            // 📍 Veículos
            new ScatterplotLayer<Vehicle>({
                id: "scatterplotlayer",
                data: vehicles,
                getPosition: (d) => [d.longitude, d.latitude],
                getRadius: 15,
                stroked: false,
                filled: true,
                getFillColor: [255, 200, 0]
            }),
            busLayer,
            busPoints,
            flightLayer
        ];
    }, [vehicles, busLayer, busPoints]);

    // @ts-ignore
    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
            <DeckGL
                initialViewState={{
                    longitude: FOZ_COORDS.lng,
                    latitude: FOZ_COORDS.lat,
                    zoom: 4,
                }}
                controller={true}
                layers={layers}
                getTooltip={({ object }) =>
                    object && `
                    ${object.departure_station} → Foz
                    🚌 ${object.total_onibus} ônibus
                    💰 R$ ${object.preco_medio}
                    ⏱️ ${object.duracao_media_horas}h
                    `
                }
            >
                <Map
                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                />
            </DeckGL>

            {/* UI mantida igual */}
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

            {/* AO VIVO */}
            <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 surface-elevated border border-border rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-xs font-mono text-foreground">AO VIVO</span>
            </div>
        </div>
    );
}