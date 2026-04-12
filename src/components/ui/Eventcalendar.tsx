import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar, X } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
    id: string;
    name: string;
    address: string;
    location: string;          // ex: "Centro de Convenções"
    start_date: string;        // ISO: "2025-07-10"
    end_date: string;          // ISO: "2025-07-12"
    open_date: string;         // data de abertura ao público: "2025-07-10"
    category?: string;         // opcional: "show", "feira", "esporte"…
}

interface EventCalendarProps {
    events: CalendarEvent[];
}

// ─── Paleta de intensidade (heatmap azul) ─────────────────────────────────────

function intensityClass(count: number, max: number): string {
    if (count === 0) return '';
    const ratio = count / max;
    if (ratio <= 0.2)  return 'bg-blue-950/70  text-blue-300  ring-1 ring-blue-800/40';
    if (ratio <= 0.4)  return 'bg-blue-900/80  text-blue-200  ring-1 ring-blue-700/50';
    if (ratio <= 0.6)  return 'bg-blue-800/80  text-blue-100  ring-1 ring-blue-600/60';
    if (ratio <= 0.8)  return 'bg-blue-700/90  text-white     ring-1 ring-blue-500/70';
    return                     'bg-blue-600     text-white     ring-2 ring-blue-400/80 shadow-[0_0_12px_#3b82f680]';
}

// ─── Helpers de data ──────────────────────────────────────────────────────────

function toDate(s: string) {
    // Garante parse local sem fuso
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function isoKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDate(iso: string) {
    const d = toDate(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const MONTHS_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CATEGORY_COLORS: Record<string, string> = {
    show:    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    feira:   'bg-amber-500/20  text-amber-300  border-amber-500/30',
    esporte: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    cultura: 'bg-rose-500/20   text-rose-300   border-rose-500/30',
    default: 'bg-blue-500/20   text-blue-300   border-blue-500/30',
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EventCalendar({ events }: EventCalendarProps) {
    const today = new Date();
    const [year,  setYear]  = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    // Mapa: "YYYY-MM-DD" → eventos que ocorrem naquele dia
    const eventsByDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const ev of events) {
            const start = toDate(ev.start_date);
            const end   = toDate(ev.end_date);
            // itera cada dia do intervalo
            const cur = new Date(start);
            while (cur <= end) {
                const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
                if (!map.has(key)) map.set(key, []);
                map.get(key)!.push(ev);
                cur.setDate(cur.getDate() + 1);
            }
        }
        return map;
    }, [events]);

    const maxPerDay = useMemo(() => {
        let m = 1;
        eventsByDay.forEach(v => { if (v.length > m) m = v.length; });
        return m;
    }, [eventsByDay]);

    // Grade do mês
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, i) =>
        i < firstWeekday ? null : i - firstWeekday + 1
    );
    // Completa a última semana
    while (cells.length % 7 !== 0) cells.push(null);

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
        setSelectedKey(null);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
        setSelectedKey(null);
    };

    const selectedEvents = selectedKey ? (eventsByDay.get(selectedKey) ?? []) : [];

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground tracking-tight">
                            Calendário de Eventos
                        </h2>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            Foz do Iguaçu
                        </p>
                    </div>
                </div>

                {/* Navegação mês */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={prevMonth}
                        className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-mono font-medium text-foreground w-36 text-center">
                        {MONTHS_PT[month]} {year}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* ── Grade do calendário ────────────────────────────────────── */}
                <div className="flex-1 p-4">
                    {/* Dias da semana */}
                    <div className="grid grid-cols-7 mb-1">
                        {WEEKDAYS.map(d => (
                            <div key={d} className="text-center text-[10px] font-mono text-muted-foreground py-1 uppercase tracking-wider">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Células */}
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((day, i) => {
                            if (day === null) {
                                return <div key={`empty-${i}`} className="aspect-square" />;
                            }

                            const key    = isoKey(year, month, day);
                            const evs    = eventsByDay.get(key) ?? [];
                            const count  = evs.length;
                            const isToday = (
                                year  === today.getFullYear() &&
                                month === today.getMonth() &&
                                day   === today.getDate()
                            );
                            const isSelected = selectedKey === key;
                            const heatmap = intensityClass(count, maxPerDay);

                            return (
                                <motion.button
                                    key={key}
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedKey(isSelected ? null : key)}
                                    className={`
                                        aspect-square rounded-md flex flex-col items-center justify-center gap-0.5
                                        text-xs font-mono transition-all duration-150 relative
                                        ${count > 0 ? heatmap + ' cursor-pointer' : 'text-muted-foreground/50 cursor-default'}
                                        ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''}
                                        ${isToday && !count ? 'ring-1 ring-border text-foreground' : ''}
                                    `}
                                >
                                    <span className={isToday ? 'font-bold' : ''}>{day}</span>
                                    {count > 0 && (
                                        <span className="text-[8px] opacity-70 leading-none">
                                            {count} ev{count > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Legenda heatmap */}
                    <div className="flex items-center gap-2 mt-4 justify-end">
                        <span className="text-[10px] font-mono text-muted-foreground">Menos</span>
                        {[0.15, 0.35, 0.55, 0.75, 1].map((r, i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-sm ${intensityClass(r, 1).split(' ')[0]}`}
                            />
                        ))}
                        <span className="text-[10px] font-mono text-muted-foreground">Mais</span>
                    </div>
                </div>

                {/* ── Painel lateral de eventos ──────────────────────────────── */}
                <AnimatePresence>
                    {selectedKey && (
                        <motion.div
                            key="panel"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 'auto', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden border-t lg:border-t-0 lg:border-l border-border"
                        >
                            <div className="w-full lg:w-72 p-4 flex flex-col gap-3 h-full">
                                {/* Título do dia */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                            Eventos
                                        </p>
                                        <p className="text-sm font-display font-semibold text-foreground">
                                            {formatDate(selectedKey)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedKey(null)}
                                        className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Lista de eventos */}
                                <div className="flex flex-col gap-2 overflow-y-auto max-h-80 pr-0.5 scrollbar-thin scrollbar-thumb-border">
                                    <AnimatePresence initial={false}>
                                        {selectedEvents.map((ev, idx) => {
                                            const catClass = CATEGORY_COLORS[ev.category ?? ''] ?? CATEGORY_COLORS.default;
                                            return (
                                                <motion.div
                                                    key={ev.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`rounded-md border p-3 text-xs ${catClass}`}
                                                >
                                                    {/* Nome */}
                                                    <p className="font-semibold leading-snug mb-2">
                                                        {ev.name}
                                                    </p>

                                                    {/* Período */}
                                                    <div className="flex items-start gap-1.5 mb-1 text-[11px] opacity-80">
                                                        <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                                                        <span>
                                                            {formatDate(ev.start_date)}
                                                            {ev.start_date !== ev.end_date && (
                                                                <> → {formatDate(ev.end_date)}</>
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Abertura */}
                                                    {ev.open_date && ev.open_date !== ev.start_date && (
                                                        <div className="flex items-start gap-1.5 mb-1 text-[11px] opacity-70">
                                                            <Calendar className="w-3 h-3 mt-0.5 shrink-0" />
                                                            <span>Aberto a partir de {formatDate(ev.open_date)}</span>
                                                        </div>
                                                    )}

                                                    {/* Local */}
                                                    <div className="flex items-start gap-1.5 text-[11px] opacity-80">
                                                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                                        <div>
                                                            <span className="font-medium">{ev.location}</span>
                                                            <br />
                                                            <span className="opacity-70">{ev.address}</span>
                                                        </div>
                                                    </div>

                                                    {/* Categoria */}
                                                    {ev.category && (
                                                        <span className="inline-block mt-2 text-[9px] font-mono uppercase tracking-widest opacity-60 border rounded-full px-1.5 py-0.5">
                                                            {ev.category}
                                                        </span>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}