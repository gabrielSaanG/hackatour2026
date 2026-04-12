import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bus, FlightData, Vehicle } from '@/data/routes';

interface ActivityFeedProps {
  vehicles: Vehicle[];
  buses: Bus[];
  flights: FlightData;
}

interface ArrivalEvent {
  id: string;
  origin: string;
  destination: string;
  type: 'plane' | 'bus' | 'car';
  detail: string;       // passageiros, assentos, peso — o que fizer sentido
  time: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function nowStr() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(n => n.toString().padStart(2, '0'))
      .join(':');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const TYPE_META = {
  plane: { emoji: '✈️', color: 'text-sky-400',     bgColor: 'bg-sky-400/10',     borderColor: 'border-sky-400/20'  },
  bus:   { emoji: '🚌', color: 'text-amber-400',   bgColor: 'bg-amber-400/10',   borderColor: 'border-amber-400/20'},
  car:   { emoji: '🚗', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/20'},
} as const;

// ─── componente ──────────────────────────────────────────────────────────────

export default function ActivityFeed({ vehicles, buses, flights }: ActivityFeedProps) {
  const [events, setEvents] = useState<ArrivalEvent[]>([]);

  // Guarda snapshots estáveis para não re-criar o intervalo a cada render
  const busesRef  = useRef(buses);
  const flightsRef = useRef(flights);
  const vehiclesRef = useRef(vehicles);
  useEffect(() => { busesRef.current = buses; },    [buses]);
  useEffect(() => { flightsRef.current = flights; }, [flights]);
  useEffect(() => { vehiclesRef.current = vehicles; }, [vehicles]);

  useEffect(() => {
    // Emite um evento inicial imediatamente para não começar vazio
    emitEvent();

    const id = setInterval(emitEvent, 6000);
    return () => clearInterval(id);

    function emitEvent() {
      // Sorteia aleatoriamente entre as três fontes
      const source = pick(['plane', 'plane', 'bus', 'bus', 'car'] as const);

      let event: ArrivalEvent | null = null;

      if (source === 'plane') {
        const routes = flightsRef.current?.routes;
        if (!routes?.length) return;
        const r = pick(routes) as any;
        event = {
          id: `e-${Date.now()}-${Math.random()}`,
          type: 'plane',
          origin: r.origin?.city ?? r.origin?.name ?? 'Origem',
          destination: r.destination?.city ?? r.destination?.name ?? 'Foz do Iguaçu',
          detail: r.weight != null
              ? `${Math.round(r.weight)} passageiros`
              : 'voo comercial',
          time: nowStr(),
        };
      }

      if (source === 'bus') {
        const routes = busesRef.current;
        if (!routes?.length) return;
        const r = pick(routes) as any;
        event = {
          id: `e-${Date.now()}-${Math.random()}`,
          type: 'bus',
          origin: r.departure_station ?? r.departure_city ?? 'Origem',
          destination: 'Foz do Iguaçu',
          detail: [
            r.total_onibus != null && `${r.total_onibus} ônibus`,
            r.preco_medio  != null && `R$ ${r.preco_medio}`,
          ].filter(Boolean).join(' · ') || 'rota rodoviária',
          time: nowStr(),
        };
      }

      if (source === 'car') {
        const vs = vehiclesRef.current;
        if (!vs?.length) return;
        const v = pick(vs) as any;
        event = {
          id: `e-${Date.now()}-${Math.random()}`,
          type: 'car',
          origin: v.origin ?? v.city ?? 'Região',
          destination: 'Foz do Iguaçu',
          detail: v.country ?? 'veículo particular',
          time: nowStr(),
        };
      }

      if (!event) return;
      setEvents(prev => [event!, ...prev].slice(0, 10));
    }
  }, []); // intervalo criado uma vez; dados chegam via refs

  return (
      <div className="bg-card border border-border rounded-lg p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Feed de Chegadas
          </h3>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AO VIVO
                </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <AnimatePresence mode="popLayout" initial={false}>
            {events.map(event => {
              const meta = TYPE_META[event.type];
              return (
                  <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: -12, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`
                                    rounded-md border px-2.5 py-2 text-xs
                                    ${meta.bgColor} ${meta.borderColor}
                                `}
                  >
                    <div className="flex items-center gap-2">
                      {/* timestamp */}
                      <span className="font-mono text-muted-foreground text-[10px] shrink-0 w-14">
                                        {event.time}
                                    </span>

                      {/* emoji */}
                      <span className="text-sm leading-none shrink-0">{meta.emoji}</span>

                      {/* rota */}
                      <span className={`font-medium truncate ${meta.color}`}>
                                        {event.origin}
                                    </span>
                      <span className="text-muted-foreground shrink-0">→</span>
                      <span className="text-foreground truncate">
                                        {event.destination}
                                    </span>
                    </div>

                    {/* detalhe */}
                    <div className="mt-0.5 pl-16 text-[10px] text-muted-foreground truncate">
                      {event.detail}
                    </div>
                  </motion.div>
              );
            })}
          </AnimatePresence>

          {events.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-8">
                Aguardando chegadas…
              </div>
          )}
        </div>
      </div>
  );
}