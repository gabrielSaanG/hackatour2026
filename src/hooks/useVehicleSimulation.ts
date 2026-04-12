import { useState, useEffect, useCallback, useRef } from 'react';
import { routes, FOZ_COORDS, Vehicle, Route } from '@/data/routes';

let vehicleCounter = 0;

function createVehicle(route: Route): Vehicle {
    vehicleCounter++;
    return {
        id: `v-${vehicleCounter}`,
        routeId: route.id,
        type: route.type,
        lat: route.lat,
        lng: route.lng,
        targetLat: FOZ_COORDS.lat,
        targetLng: FOZ_COORDS.lng,
        progress: 0,
        origin: route.origin,
        country: route.country,
    };
}

export function useVehicleSimulation() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [stats, setStats] = useState({ arrived: 0, planes: 0, buses: 0, cars: 0 });
    const timersRef = useRef<number[]>([]);

    const spawnVehicle = useCallback((route: Route) => {
        setVehicles(prev => [...prev, createVehicle(route)]);
    }, []);

    // Spawn vehicles on intervals
    useEffect(() => {
        routes.forEach(route => {
            // Spawn one immediately
            spawnVehicle(route);
            const timer = window.setInterval(() => spawnVehicle(route), route.frequency * 1000);
            timersRef.current.push(timer);
        });

        return () => {
            timersRef.current.forEach(clearInterval);
            timersRef.current = [];
        };
    }, [spawnVehicle]);

    // Animate vehicles
    useEffect(() => {
        const interval = window.setInterval(() => {
            setVehicles(prev => {
                const arrived: Vehicle[] = [];
                const active = prev.map(v => {
                    const speed = v.type === 'plane' ? 0.012 : v.type === 'bus' ? 0.008 : 0.015;
                    const newProgress = v.progress + speed;
                    if (newProgress >= 1) {
                        arrived.push(v);
                        return null;
                    }
                    const lat = v.lat + (v.targetLat - v.lat) * newProgress;
                    const lng = v.lng + (v.targetLng - v.lng) * newProgress;
                    return { ...v, progress: newProgress, lat, lng };
                }).filter(Boolean) as Vehicle[];

                if (arrived.length > 0) {
                    setStats(s => ({
                        arrived: s.arrived + arrived.length,
                        planes: s.planes + arrived.filter(v => v.type === 'plane').length,
                        buses: s.buses + arrived.filter(v => v.type === 'bus').length,
                        cars: s.cars + arrived.filter(v => v.type === 'car').length,
                    }));
                }

                return active;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return { vehicles, stats };
}
