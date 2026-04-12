import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { monthlyVisitors, nationalityData, transportData } from '@/data/routes';

export default function VisitorCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Monthly visitors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="lg:col-span-2 bg-card border border-border rounded-lg p-5"
      >
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Visitantes por mês (estimativa anual)
        </h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyVisitors}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 11 }} tickFormatter={v => `${(v / 1000)}k`} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 15%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(195, 100%, 95%)',
                  fontSize: 12,
                }}
                formatter={(value: number) => [value.toLocaleString('pt-BR'), '']}
              />
              <Bar dataKey="nacional" stackId="a" fill="hsl(185, 80%, 50%)" radius={[0, 0, 0, 0]} name="Nacional" />
              <Bar dataKey="internacional" stackId="a" fill="hsl(35, 90%, 55%)" radius={[4, 4, 0, 0]} name="Internacional" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Nationality breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-lg p-5"
      >
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Nacionalidade dos visitantes
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nationalityData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                dataKey="visitors"
                nameKey="country"
              >
                {nationalityData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 15%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(195, 100%, 95%)',
                  fontSize: 12,
                }}
                formatter={(value: number) => [value.toLocaleString('pt-BR'), 'visitantes']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {nationalityData.map(n => (
            <div key={n.country} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
              <span className="text-[10px] text-muted-foreground">{n.country} {n.percentage}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Transport mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="lg:col-span-3 bg-card border border-border rounded-lg p-5"
      >
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Modal de transporte (estimativa anual)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {transportData.map(t => (
            <div key={t.type} className="text-center">
              <div className="text-3xl mb-1">{t.icon}</div>
              <div className="text-lg font-display font-bold text-foreground">
                {(t.count / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-muted-foreground">{t.type}</div>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${(t.count / 890000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
