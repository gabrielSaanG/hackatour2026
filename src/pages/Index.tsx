import { useState } from 'react';
import { MapPin, TrendingUp, Database, BarChart3, Plane, Bus, Car } from 'lucide-react';
import LiveMap from '@/components/LiveMap';
import StatsPanel from '@/components/StatsPanel';
import VisitorCharts from '@/components/VisitorCharts';
import ActivityFeed from '@/components/ActivityFeed';
import { useVehicleSimulation } from '@/hooks/useVehicleSimulation';
import vehiclesMap from "../json/dados_transito_foz.json";
import busMap from "../json/dados_onibus_foz.json";
import { Bus as BusType } from "@/data/routes.ts";
import flightsMap from "../json/kepler.gl.json";
import events from "../json/eventos_2026_unificados.json";
import EventCalendar from "@/components/ui/Eventcalendar.tsx";

interface LayerVisibility {
    flights: boolean;
    buses: boolean;
    vehicles: boolean;
}

const LAYER_CONFIG: {
    key: keyof LayerVisibility;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    activeColor: string;
    activeBg: string;
    activeBorder: string;
    dot: string;
}[] = [
    {
        key: 'flights',
        label: 'Voos',
        sublabel: 'Rotas aéreas',
        icon: Plane,
        activeColor: 'text-sky-400',
        activeBg: 'bg-sky-400/10',
        activeBorder: 'border-sky-400/40',
        dot: '#38bdf8',
    },
    {
        key: 'buses',
        label: 'Ônibus',
        sublabel: 'Rotas rodoviárias',
        icon: Bus,
        activeColor: 'text-amber-400',
        activeBg: 'bg-amber-400/10',
        activeBorder: 'border-amber-400/40',
        dot: '#facc15',
    },
    {
        key: 'vehicles',
        label: 'Veículos',
        sublabel: 'Tráfego local',
        icon: Car,
        activeColor: 'text-emerald-400',
        activeBg: 'bg-emerald-400/10',
        activeBorder: 'border-emerald-400/40',
        dot: '#22c55e',
    },
];

const Index = () => {
    const { vehicles, stats } = useVehicleSimulation();
    const buses: BusType[] = busMap.routes;

    const [visibility, setVisibility] = useState<LayerVisibility>({
        flights: true,
        buses: true,
        vehicles: true,
    });

    const toggle = (key: keyof LayerVisibility) =>
        setVisibility(v => ({ ...v, [key]: !v[key] }));

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">
                                VisionTour
                            </h1>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                Inteligência Turística em Tempo Real
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        {[
                            { icon: TrendingUp, label: 'Previsões' },
                            { icon: Database, label: 'Dados' },
                            { icon: BarChart3, label: 'Relatórios' },
                        ].map(item => (
                            <button
                                key={item.label}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <item.icon className="w-3.5 h-3.5" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-4">
                {/* Hero description */}
                <div className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
                    <div className="w-1 h-12 bg-primary rounded-full shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-foreground leading-relaxed">
                            Centralização de dados turísticos de <strong className="text-primary">Foz do Iguaçu</strong> —
                            aviação, tráfego rodoviário e fluxo de visitantes reunidos em um único painel.
                            Dados que permitem prever sobrecarga e preparar a cidade para receber turistas.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Simulação demonstrativa com rotas reais de origem dos visitantes
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <StatsPanel stats={stats} />

                {/* Map + Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ minHeight: '450px' }}>
                    <div className="lg:col-span-3 flex flex-col gap-2">
                        {/* Layer toggles */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-1">
                                Camadas
                            </span>
                            {LAYER_CONFIG.map(({ key, label, sublabel, icon: Icon, activeColor, activeBg, activeBorder, dot }) => {
                                const on = visibility[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggle(key)}
                                        className={`
                                            flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium
                                            transition-all duration-200 select-none
                                            ${on
                                            ? `${activeBg} ${activeBorder} ${activeColor}`
                                            : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                                        }
                                        `}
                                    >
                                        {/* status dot */}
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${on ? 'opacity-100' : 'opacity-0'}`}
                                            style={{ backgroundColor: dot }}
                                        />
                                        <Icon className="w-3 h-3" />
                                        <span>{label}</span>
                                        {/* sublabel hidden on small screens */}
                                        <span className={`hidden sm:inline text-[10px] font-normal opacity-70`}>
                                            {sublabel}
                                        </span>
                                        {/* on/off pill */}
                                        <span className={`
                                            ml-0.5 text-[9px] font-mono uppercase px-1 py-0.5 rounded
                                            ${on ? 'bg-current/10' : 'bg-muted'}
                                        `}>
                                            {on ? 'ON' : 'OFF'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Map */}
                        <div className="h-[450px]">
                            <LiveMap
                                vehicles={vehiclesMap}
                                buses={buses}
                                flights={flightsMap}
                                visibility={visibility}
                            />
                        </div>
                        <div>
                            <EventCalendar events={events} />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <ActivityFeed vehicles={vehicles} buses={buses} flights={flightsMap} />
                    </div>
                </div>

                {/* Charts */}
                <VisitorCharts />

                {/* Footer */}
                <div className="text-center py-6 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        FozInsight — Protótipo de centralização de dados turísticos para Foz do Iguaçu
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Dados simulados para demonstração • Projeto de validação
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Index;