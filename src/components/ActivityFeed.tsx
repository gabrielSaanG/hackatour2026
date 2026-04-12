import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle } from '@/data/routes';

interface ActivityFeedProps {
  vehicles: Vehicle[];
}

interface ArrivalEvent {
  id: string;
  origin: string;
  country: string;
  type: string;
  time: string;
}

const typeEmoji: Record<string, string> = {
  plane: '✈️',
  bus: '🚌',
  car: '🚗',
};

export default function ActivityFeed({ vehicles }: ActivityFeedProps) {
  const [events, setEvents] = useState<ArrivalEvent[]>([]);
  const prevCountRef = { current: vehicles.length };

  useEffect(() => {
    // Track newly removed vehicles as "arrived"
    const interval = setInterval(() => {
      if (vehicles.length > 0) {
        const v = vehicles[Math.floor(Math.random() * vehicles.length)];
        if (v && v.progress > 0.7) {
          const now = new Date();
          const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          setEvents(prev => [{
            id: `e-${Date.now()}-${Math.random()}`,
            origin: v.origin,
            country: v.country,
            type: v.type,
            time,
          }, ...prev].slice(0, 8));
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [vehicles]);

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full">
      <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
        Feed de Atividades
      </h3>
      <div className="space-y-1.5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {events.map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-xs py-1.5 border-b border-border/50 last:border-0"
            >
              <span className="font-mono text-muted-foreground w-14 shrink-0">{event.time}</span>
              <span>{typeEmoji[event.type]}</span>
              <span className="text-foreground truncate">{event.origin}</span>
              <span className="text-muted-foreground">→ Foz</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4">
            Aguardando chegadas...
          </div>
        )}
      </div>
    </div>
  );
}
