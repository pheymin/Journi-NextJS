import { distance, calculateTotalDistance, simulatedAnnealing } from './simulatedAnnealing';
import { clusterPOIs } from './kmeans';

type POI = {
    place_id: string;
    name: string;
    location: google.maps.LatLngLiteral;
};

type OptimizedRoute = {
    pois: POI[];
    totalDistance: number;
    estimatedDuration: number;
};

type OptimizationResult = {
    [x: string]: any;
    routes: {
        initial: OptimizedRoute;
        optimized: OptimizedRoute;
    }[];
    initial: {
        totalDistance: number;
        totalDuration: number;
    };
    optimized: {
        totalDistance: number;
        totalDuration: number;
    };
};

export function optimizeRoutes(pois: POI[], numDays: number): OptimizationResult {
    const clusters = clusterPOIs(pois, numDays);

    const routes = clusters.map(cluster => {
        const initialDistance = calculateTotalDistance(cluster);
        const initialDuration = initialDistance / 50; // Assuming 50 km/h average speed

        const optimizedPOIs = simulatedAnnealing(cluster, 1000, 0.995);
        const optimizedDistance = calculateTotalDistance(optimizedPOIs);
        const optimizedDuration = optimizedDistance / 50;

        return {
            initial: {
                pois: cluster,
                totalDistance: initialDistance,
                estimatedDuration: initialDuration
            },
            optimized: {
                pois: optimizedPOIs,
                totalDistance: optimizedDistance,
                estimatedDuration: optimizedDuration
            }
        };
    });

    const totalInitialDistance = routes.reduce((sum, route) => sum + route.initial.totalDistance, 0);
    const totalInitialDuration = routes.reduce((sum, route) => sum + route.initial.estimatedDuration, 0);
    const totalOptimizedDistance = routes.reduce((sum, route) => sum + route.optimized.totalDistance, 0);
    const totalOptimizedDuration = routes.reduce((sum, route) => sum + route.optimized.estimatedDuration, 0);

    return {
        routes,
        initial: {
            totalDistance: totalInitialDistance,
            totalDuration: totalInitialDuration
        },
        optimized: {
            totalDistance: totalOptimizedDistance,
            totalDuration: totalOptimizedDuration
        }
    };
}