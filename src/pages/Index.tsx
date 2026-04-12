import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Database, BarChart3 } from 'lucide-react';
import LiveMap from '@/components/LiveMap';
import StatsPanel from '@/components/StatsPanel';
import VisitorCharts from '@/components/VisitorCharts';
import ActivityFeed from '@/components/ActivityFeed';
import { useVehicleSimulation } from '@/hooks/useVehicleSimulation';

const Index = () => {
    const { vehicles, stats } = useVehicleSimulation();

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
                                FozInsight
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
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-lg p-4 flex items-start gap-3"
                >
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
                </motion.div>

                {/* Stats */}
                <StatsPanel stats={stats} />

                {/* Map + Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ minHeight: '450px' }}>
                    <div className="lg:col-span-3 h-[450px]">
                        <LiveMap vehicles={vehicles} />
                    </div>
                    <div className="lg:col-span-1">
                        <ActivityFeed vehicles={vehicles} />
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
