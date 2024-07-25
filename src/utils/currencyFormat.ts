type LocationData = {
	currency: string;
	country_name: string;
};

type GeoData = {
	location: {
		lat: number;
		lng: number;
	};
};

type PlaceData = {
	results: Array<{
		address_components: Array<{
			long_name: string;
			types: string[];
		}>;
	}>;
};

const getUserLocation = async (): Promise<LocationData | null> => {
	try {
		// Get user's location using Geolocation API
		const geoResponse = await fetch(
			`https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`,
			{ method: 'POST' }
		);
		if (!geoResponse.ok) {
			throw new Error('Failed to get geolocation');
		}
		const geoData: GeoData = await geoResponse.json();

		const { lat, lng } = geoData.location;

		// Get user's place details using Places API
		const placeResponse = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`
		);
		if (!placeResponse.ok) {
			throw new Error('Failed to get place details');
		}
		const placeData: PlaceData = await placeResponse.json();
		let country_name = getCountryName(placeData);

		if (!country_name) {
			country_name = 'United States';
		}

		// Get currency information based on country
		const currencyResponse = await fetch(`https://restcountries.com/v3.1/name/${country_name}`);

		if (!currencyResponse.ok) {
			throw new Error('Failed to get currency information');
		}
		const currencyData = await currencyResponse.json();

		const currency =
			Object.keys(currencyData[0].currencies)[0] || 'USD';

		return {
			currency,
			country_name,
		};
	} catch (error) {
		console.error('Error fetching location data:', error);
		return null;
	}
};

const getCountryName = (placeData: PlaceData): string | null => {
	for (const result of placeData.results) {
		for (const component of result.address_components) {
			if (component.types.includes('country')) {
				return component.long_name;
			}
		}
	}
	return null;
};

const formatAmount = async (amount: number, currency: string): Promise<string> => {
	const formatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency,
		maximumFractionDigits: 2,
	});

	return formatter.format(amount);
};

export { getUserLocation, getCountryName, formatAmount };