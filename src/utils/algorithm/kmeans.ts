import { kmeans, InitializationMethod, Options } from 'ml-kmeans';

type POI = {
    place_id: string;
    name: string;
    location: google.maps.LatLngLiteral;
};

interface KMeansResult {
    clusters: number[];
    centroids: number[][];
    iterations: number;
    converged: boolean;
}

function clusterPOIs(pois: POI[], numClusters: number): POI[][] {
    // Convert POIs to a format suitable for ml-kmeans
    const points = pois.map(poi => [poi.location.lat, poi.location.lng]);

    // Perform K-means clustering with options
    const options: Options = {
        maxIterations: 100,
        tolerance: 1e-6,
        initialization: 'kmeans++' as InitializationMethod,
    };

    const result: KMeansResult = kmeans(points, numClusters, options);

    // Group POIs by their assigned clusters
    const clusters: POI[][] = Array.from({ length: numClusters }, () => []);
    result.clusters.forEach((clusterIndex, i) => {
        clusters[clusterIndex].push(pois[i]);
    });

    return clusters;
}

export { clusterPOIs };