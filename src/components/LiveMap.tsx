import { useEffect, useMemo, useRef, useState } from "react";
import { DeckGL } from "@deck.gl/react";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import type { Position } from "@deck.gl/core";
import Map from "react-map-gl/maplibre";

import { ArrivalAirport, Bus, FlightData, FOZ_COORDS, Vehicle } from "@/data/routes";
import { ArcLayer, PathLayer } from "deck.gl";

// ─── SVG icon atlas inline (ônibus + avião) ───────────────────────────────────
// Renderiza num canvas 128×64 com dois ícones de 64×64 cada
function buildIconAtlas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    // ── ícone de ônibus (posição 0,0 64×64) ──────────────────────────────────
    const drawBus = (ox: number) => {
        ctx.save();
        ctx.translate(ox, 0);

        // corpo
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.roundRect(8, 14, 48, 34, 5);
        ctx.fill();

        // para-choque dianteiro
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(8, 42, 48, 4);

        // janelas
        ctx.fillStyle = "#0f172a";
        const wins = [12, 26, 40];
        wins.forEach(x => {
            ctx.beginPath();
            ctx.roundRect(x, 18, 10, 8, 2);
            ctx.fill();
        });

        // roda
        ctx.fillStyle = "#1e293b";
        [16, 38].forEach(x => {
            ctx.beginPath();
            ctx.arc(x, 48, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#94a3b8";
            ctx.beginPath();
            ctx.arc(x, 48, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1e293b";
        });

        // linha do teto
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(8, 12, 48, 4);

        ctx.restore();
    };

    // ── ícone de avião (posição 64,0 64×64) ──────────────────────────────────
    const drawPlane = (ox: number) => {
        ctx.save();
        ctx.translate(ox + 32, 32);
        ctx.rotate(-Math.PI / 4); // 45° para noroeste → parece voar para destino

        ctx.fillStyle = "#38bdf8";

        // fuselagem
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // asas
        ctx.beginPath();
        ctx.moveTo(-18, 4);
        ctx.lineTo(18, 4);
        ctx.lineTo(8, -4);
        ctx.lineTo(-8, -4);
        ctx.closePath();
        ctx.fill();

        // cauda
        ctx.beginPath();
        ctx.moveTo(-8, 14);
        ctx.lineTo(8, 14);
        ctx.lineTo(4, 20);
        ctx.lineTo(-4, 20);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    };

    drawBus(0);
    drawPlane(64);

    return canvas;
}

const ICON_MAPPING = {
    bus: { x: 0, y: 0, width: 64, height: 64, mask: false },
    plane: { x: 64, y: 0, width: 64, height: 64, mask: false },
};

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface LayerVisibility {
    flights: boolean;
    buses: boolean;
    vehicles: boolean;
}

interface LiveMapProps {
    vehicles: Vehicle[];
    buses: Bus[];
    flights: FlightData[];
    visibility: LayerVisibility;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toPos = (lon: number, lat: number): Position => [lon, lat];

function interpolatePath(path: Position[], progress: number): Position {
    if (path.length < 2) return path[0];
    const totalSegments = path.length - 1;
    const scaled = progress * totalSegments;
    const index = Math.min(Math.floor(scaled), totalSegments - 1);
    const t = scaled - index;
    const start = path[index];
    const end = path[index + 1] ?? start;
    return [
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
    ];
}

/** Ângulo em graus entre dois pontos (para rotacionar ícones) */
function bearing(from: Position, to: Position): number {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    return (Math.atan2(dx, dy) * 180) / Math.PI;
}

/**
 * Replica a curva parabólica do ArcLayer (getHeight=0.4).
 * Retorna [lon, lat, altitudeMeters] para o IconLayer seguir o arco em 3D.
 */
function interpolateArc(
    src: [number, number],
    tgt: [number, number],
    t: number,
    height = 0.4,
): [number, number, number] {
    const lon = src[0] + (tgt[0] - src[0]) * t;
    const lat = src[1] + (tgt[1] - src[1]) * t;
    const dx = tgt[0] - src[0];
    const dy = tgt[1] - src[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const arc = Math.sin(t * Math.PI); // parábola 0→1→0
    const altitudeMeters = arc * dist * 111_000 * height;
    return [lon, lat, altitudeMeters];
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function LiveMap({ vehicles, buses, flights, visibility }: LiveMapProps) {
    const [tick, setTick] = useState(0);
    const iconAtlasRef = useRef<HTMLCanvasElement | null>(null);

    // gera o atlas uma vez
    if (!iconAtlasRef.current) {
        iconAtlasRef.current = buildIconAtlas();
    }

    // velocidade reduzida: 0.002 por tick (era implícito mais rápido antes)
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 0.0004), 50);
        return () => clearInterval(id);
    }, []);

    // ── dados base dos ônibus com path e progresso inicial aleatório ──────────
    const animatedBuses = useMemo(() =>
        buses.map(route => ({
            ...route,
            path: [
                toPos(route.departure_lon, route.departure_lat),
                ...(route.stops ?? []).map(s => toPos(s.lon, s.lat)),
                toPos(route.arrival_lon, route.arrival_lat),
            ] as Position[],
            initialProgress: Math.random(),
        })), [buses]);

    // ── posições animadas ─────────────────────────────────────────────────────
    const movingBuses = useMemo(() =>
        animatedBuses.map(b => {
            const progress = (b.initialProgress + tick) % 1;
            const position = interpolatePath(b.path, progress);

            // calcula ângulo para apontar o ícone na direção do movimento
            const nextProgress = Math.min(progress + 0.01, 1);
            const nextPos = interpolatePath(b.path, nextProgress);
            const angle = bearing(position, nextPos);

            return { ...b, position, angle };
        }), [animatedBuses, tick]);

    // ── dados dos aviões animados seguindo o arco em 3D ─────────────────────
    const animatedFlights = useMemo(() => {
        if (!flights?.routes) return [];
        return flights.routes.map((r: any) => ({
            ...r,
            src: [r.origin.lon, r.origin.lat] as [number, number],
            tgt: [r.destination.lon, r.destination.lat] as [number, number],
            initialProgress: Math.random(),
        }));
    }, [flights]);

    const movingPlanes = useMemo(() =>
        animatedFlights.map(f => {
            const progress = (f.initialProgress + tick * 0.5) % 1;
            // posição 3D sobre o arco
            const position = interpolateArc(f.src, f.tgt, progress);
            // direção: próximo ponto no arco
            const nextT = Math.min(progress + 0.01, 1);
            const nextPos = interpolateArc(f.src, f.tgt, nextT);
            const angle = bearing(
                [position[0], position[1]],
                [nextPos[0], nextPos[1]],
            );
            return { ...f, position, angle };
        }), [animatedFlights, tick]);

    // ── layers ────────────────────────────────────────────────────────────────
    const layers = useMemo(() => {
        const busPathLayer = new PathLayer<typeof animatedBuses[0]>({
            id: "bus-paths",
            data: animatedBuses,
            getPath: d => d.path,
            getColor: d =>
                d.nivel_fluxo === "alto"
                    ? [255, 80, 80, 180]
                    : d.nivel_fluxo === "medio"
                        ? [255, 165, 0, 180]
                        : [0, 200, 120, 180],
            getWidth: d => Math.max(2, d.total_onibus * 1.5),
            widthMinPixels: 1.5,
            widthMaxPixels: 8,
            jointRounded: true,
            capRounded: true,
            getDashArray: [6, 4],   // pontilhado para diferenciar
            dashJustified: true,
            extensions: [],
            pickable: true,
        });

        const busIconLayer = new IconLayer({
            id: "moving-buses",
            data: movingBuses,
            iconAtlas: iconAtlasRef.current!,
            iconMapping: ICON_MAPPING,
            getIcon: () => "bus",
            getPosition: d => d.position,
            getSize: 36,
            getAngle: d => -d.angle,   // deck.gl usa sentido horário
            sizeMinPixels: 20,
            sizeMaxPixels: 48,
            pickable: true,
            getTooltip: (d: any) =>
                `${d.departure_station} → Foz\n🚌 ${d.total_onibus} ônibus\n💰 R$ ${d.preco_medio}\n⏱️ ${d.duracao_media_horas}h`,
        });

        const flightArcLayer = new ArcLayer({
            id: "flight-arcs",
            data: flights?.routes ?? [],
            getSourcePosition: (d: any) => [d.origin.lon, d.origin.lat],
            getTargetPosition: (d: any) => [d.destination.lon, d.destination.lat],
            getWidth: (d: any) => Math.max(1.5, (d.weight ?? 10) * 0.025),
            widthMinPixels: 1,
            getSourceColor: [56, 189, 248, 200],   // sky-400
            getTargetColor: [244, 63, 94, 200],    // rose-500
            getHeight: 0.4,
            getTilt: 10,
        });

        const planeIconLayer = new IconLayer({
            id: "moving-planes",
            data: movingPlanes,
            iconAtlas: iconAtlasRef.current!,
            iconMapping: ICON_MAPPING,
            getIcon: () => "plane",
            // position já carrega [lon, lat, altMeters] — deck.gl usa o z como elevação
            getPosition: d => d.position as [number, number, number],
            getSize: 32,
            getAngle: d => -d.angle,
            sizeMinPixels: 18,
            sizeMaxPixels: 44,
            billboard: true,   // vira de frente p/ a câmera em qualquer pitch
            pickable: true,
            parameters: { depthTest: false }, // renderiza acima do mapa
        });

        const vehicleLayer = new ScatterplotLayer<Vehicle>({
            id: "scatterplotlayer",
            data: vehicles,
            getPosition: d => [d.longitude, d.latitude],
            getRadius: 15,
            stroked: false,
            filled: true,
            getFillColor: [255, 200, 0],
        });

        const active = [];
        if (visibility.buses)    active.push(busPathLayer, busIconLayer);
        if (visibility.flights)  active.push(flightArcLayer, planeIconLayer);
        if (visibility.vehicles) active.push(vehicleLayer);
        return active;
    }, [movingBuses, movingPlanes, animatedBuses, flights, vehicles, visibility]);

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
                getTooltip={({ object }: any) =>
                    object?.departure_station
                        ? {
                            html: `
                              <div style="font-family:monospace;font-size:12px;line-height:1.6">
                                <strong>${object.departure_station} → Foz</strong><br/>
                                🚌 ${object.total_onibus} ônibus<br/>
                                💰 R$ ${object.preco_medio}<br/>
                                ⏱️ ${object.duracao_media_horas}h
                              </div>`,
                            style: {
                                backgroundColor: "#0f172a",
                                color: "#e2e8f0",
                                border: "1px solid #334155",
                                borderRadius: "6px",
                                padding: "8px 12px",
                            },
                        }
                        : null
                }
            >
                <Map mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
            </DeckGL>

            {/* Legenda */}
            <div className="absolute bottom-4 left-4 surface-elevated border border-border rounded-lg p-3 z-[1000] backdrop-blur-sm">
                <div className="text-xs font-mono text-muted-foreground mb-2">LEGENDA</div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-base leading-none">✈️</span>
                        <span className="text-xs text-foreground">Aviões</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-base leading-none">🚌</span>
                        <span className="text-xs text-foreground">Ônibus</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                        <span className="text-xs text-foreground">Carros</span>
                    </div>
                    <div className="mt-1 pt-1 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">Fluxo de ônibus</div>
                        <div className="flex flex-col gap-0.5">
                            {[
                                { label: "Alto", color: "#ff5050" },
                                { label: "Médio", color: "#ffa500" },
                                { label: "Baixo", color: "#00c878" },
                            ].map(({ label, color }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className="w-5 h-0.5 rounded" style={{ backgroundColor: color }} />
                                    <span className="text-xs text-foreground">{label}</span>
                                </div>
                            ))}
                        </div>
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