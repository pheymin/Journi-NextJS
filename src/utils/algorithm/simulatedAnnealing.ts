type POI = {
    place_id: string;
    name: string;
    location: google.maps.LatLngLiteral;
};

function distance(poi1: POI, poi2: POI): number {
    const R = 6371; // Earth's radius in km
    const dLat = (poi2.location.lat - poi1.location.lat) * Math.PI / 180;
    const dLon = (poi2.location.lng - poi1.location.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(poi1.location.lat * Math.PI / 180) * Math.cos(poi2.location.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateTotalDistance(route: POI[]): number {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
        total += distance(route[i], route[i + 1]);
    }
    return total;
}

function simulatedAnnealing(pois: POI[], initialTemp: number, coolingRate: number): POI[] {
    let currentSolution = [...pois];
    let bestSolution = [...currentSolution];
    let currentEnergy = calculateTotalDistance(currentSolution);
    let bestEnergy = currentEnergy;
    let temperature = initialTemp;

    while (temperature > 1) {
        const newSolution = [...currentSolution];

        // Apply a random neighborhood move
        const moveType = Math.floor(Math.random() * 3);
        switch (moveType) {
            case 0: // Point Relocation
                const [removed] = newSolution.splice(Math.floor(Math.random() * newSolution.length), 1);
                newSolution.splice(Math.floor(Math.random() * (newSolution.length + 1)), 0, removed);
                break;
            case 1: // Point Exchange
                const i = Math.floor(Math.random() * newSolution.length);
                const j = Math.floor(Math.random() * newSolution.length);
                [newSolution[i], newSolution[j]] = [newSolution[j], newSolution[i]];
                break;
            case 2: // Route Interchange
                const k = Math.floor(Math.random() * (newSolution.length - 1)) + 1;
                newSolution.push(...newSolution.splice(0, k));
                break;
        }

        const newEnergy = calculateTotalDistance(newSolution);
        const energyDiff = newEnergy - currentEnergy;

        if (energyDiff < 0 || Math.random() < Math.exp(-energyDiff / temperature)) {
            currentSolution = newSolution;
            currentEnergy = newEnergy;

            if (currentEnergy < bestEnergy) {
                bestSolution = currentSolution;
                bestEnergy = currentEnergy;
            }
        }

        temperature *= coolingRate;
    }

    return bestSolution;
}

export { distance, calculateTotalDistance, simulatedAnnealing };