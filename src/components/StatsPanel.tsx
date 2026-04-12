import { motion } from 'framer-motion';
import { Plane, Bus, Car, Users } from 'lucide-react';

interface StatsPanelProps {
  stats: {
    arrived: number;
    planes: number;
    buses: number;
    cars: number;
  };
}

const statCards = [
  { key: 'arrived' as const, label: 'Chegadas', icon: Users, accent: 'primary' },
  { key: 'planes' as const, label: 'Voos', icon: Plane, accent: 'primary' },
  { key: 'buses' as const, label: 'Ônibus', icon: Bus, accent: 'warning' },
  { key: 'cars' as const, label: 'Veículos', icon: Car, accent: 'success' },
];

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-border rounded-lg p-4 glow-primary"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {card.label}
            </span>
            <card.icon className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-display font-bold text-foreground tabular-nums">
            {stats[card.key].toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">simulação em tempo real</div>
        </motion.div>
      ))}
    </div>
  );
}
