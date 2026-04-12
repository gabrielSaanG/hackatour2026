export type VehicleType = 'plane' | 'bus' | 'car';

export interface Route {
    id: string;
    origin: string;
    country: string;
    lat: number;
    lng: number;
    type: VehicleType;
    frequency: number; // seconds between spawns
}

export interface Vehicle {
    latitude: number;
    longitude: number;
    peso_carros: number;
    velocidade: number;
    rua: string;
}

export interface Stop {
    station: string;
    lat: number;
    lon: number;
    ordem: number;
}

export interface Bus {
    departure_station: string;
    departure_lat: number;
    departure_lon: number;

    arrival_station: string;
    arrival_lat: number;
    arrival_lon: number;

    rota: string;
    dist_km: number;

    stops: Stop[];

    total_onibus: number;
    nivel_fluxo: string;
    percentual_fluxo: number;

    preco_medio: number;
    preco_medio_desconto: number;
    duracao_media_horas: number;
}

export interface AirportInfo {
    iata: string;
    airport?: string; // opcional porque destination não tem nome
    city?: string;    // opcional pelo mesmo motivo
    lat: number;
    lon: number;
}

export interface ArrivalAirport {
    iata: string;
    airport: string;
    city: string;
    lat: number;
    lon: number;
    total_flights: number;
}

export interface FlightRoute {
    origin: AirportInfo;
    destination: AirportInfo;

    flights: number;
    weight: number;
}

export interface FlightData {
    arrival: ArrivalAirport;
    routes: FlightRoute[];
}

export const FOZ_COORDS = { lat: -25.5163, lng: -54.5854 };

export const routes: Route[] = [
    // Aviões internacionais
    { id: 'r1', origin: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, type: 'plane', frequency: 8 },
    { id: 'r2', origin: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, type: 'plane', frequency: 15 },
    { id: 'r3', origin: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, type: 'plane', frequency: 20 },
    { id: 'r4', origin: 'Bogotá', country: 'Colômbia', lat: 4.7110, lng: -74.0721, type: 'plane', frequency: 25 },
    { id: 'r5', origin: 'Miami', country: 'EUA', lat: 25.7617, lng: -80.1918, type: 'plane', frequency: 18 },
    { id: 'r6', origin: 'Ciudad del Este', country: 'Paraguai', lat: -25.5097, lng: -54.6111, type: 'car', frequency: 3 },

    // Aviões nacionais
    { id: 'r7', origin: 'São Paulo', country: 'Brasil', lat: -23.5505, lng: -46.6333, type: 'plane', frequency: 5 },
    { id: 'r8', origin: 'Rio de Janeiro', country: 'Brasil', lat: -22.9068, lng: -43.1729, type: 'plane', frequency: 7 },
    { id: 'r9', origin: 'Brasília', country: 'Brasil', lat: -15.7975, lng: -47.8919, type: 'plane', frequency: 10 },
    { id: 'r10', origin: 'Curitiba', country: 'Brasil', lat: -25.4284, lng: -49.2733, type: 'bus', frequency: 4 },

    // Ônibus
    { id: 'r11', origin: 'Cascavel', country: 'Brasil', lat: -24.9578, lng: -53.4596, type: 'bus', frequency: 3 },
    { id: 'r12', origin: 'Londrina', country: 'Brasil', lat: -23.3045, lng: -51.1696, type: 'bus', frequency: 6 },
    { id: 'r13', origin: 'Maringá', country: 'Brasil', lat: -23.4205, lng: -51.9333, type: 'bus', frequency: 7 },
    { id: 'r14', origin: 'Asunción', country: 'Paraguai', lat: -25.2637, lng: -57.5759, type: 'bus', frequency: 8 },

    // Carros
    { id: 'r15', origin: 'Medianeira', country: 'Brasil', lat: -25.2948, lng: -54.0943, type: 'car', frequency: 2 },
    { id: 'r16', origin: 'Santa Terezinha', country: 'Brasil', lat: -25.4364, lng: -54.3989, type: 'car', frequency: 2 },
    { id: 'r17', origin: 'Puerto Iguazú', country: 'Argentina', lat: -25.5972, lng: -54.5786, type: 'car', frequency: 3 },
];

export const monthlyVisitors = [
    { month: 'Jan', visitors: 185000, nacional: 120000, internacional: 65000 },
    { month: 'Fev', visitors: 210000, nacional: 140000, internacional: 70000 },
    { month: 'Mar', visitors: 160000, nacional: 100000, internacional: 60000 },
    { month: 'Abr', visitors: 145000, nacional: 90000, internacional: 55000 },
    { month: 'Mai', visitors: 130000, nacional: 80000, internacional: 50000 },
    { month: 'Jun', visitors: 155000, nacional: 95000, internacional: 60000 },
    { month: 'Jul', visitors: 220000, nacional: 150000, internacional: 70000 },
    { month: 'Ago', visitors: 170000, nacional: 110000, internacional: 60000 },
    { month: 'Set', visitors: 140000, nacional: 85000, internacional: 55000 },
    { month: 'Out', visitors: 165000, nacional: 105000, internacional: 60000 },
    { month: 'Nov', visitors: 175000, nacional: 115000, internacional: 60000 },
    { month: 'Dez', visitors: 200000, nacional: 130000, internacional: 70000 },
];

export const nationalityData = [
    { country: 'Brasil', visitors: 1320000, percentage: 62, color: 'hsl(var(--success))' },
    { country: 'Argentina', visitors: 380000, percentage: 18, color: 'hsl(var(--primary))' },
    { country: 'Paraguai', visitors: 190000, percentage: 9, color: 'hsl(var(--warning))' },
    { country: 'Chile', visitors: 85000, percentage: 4, color: '#8b5cf6' },
    { country: 'EUA', visitors: 64000, percentage: 3, color: '#ec4899' },
    { country: 'Outros', visitors: 85000, percentage: 4, color: 'hsl(var(--muted-foreground))' },
];

export const transportData = [
    { type: 'Aéreo', count: 890000, icon: '✈️' },
    { type: 'Rodoviário', count: 720000, icon: '🚌' },
    { type: 'Veículo próprio', count: 510000, icon: '🚗' },
];
