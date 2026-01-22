export interface City {
  name: string;
  lat: number;
  lng: number;
  country?: string;
}

export const SUPPORTED_CITIES: City[] = [
  { name: 'New York', lat: 40.7128, lng: -74.0060, country: 'USA' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'USA' },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298, country: 'USA' },
  { name: 'Houston', lat: 29.7604, lng: -95.3698, country: 'USA' },
  { name: 'Phoenix', lat: 33.4484, lng: -112.0742, country: 'USA' },
  { name: 'Philadelphia', lat: 39.9526, lng: -75.1652, country: 'USA' },
  { name: 'San Antonio', lat: 29.4241, lng: -98.4936, country: 'USA' },
  { name: 'San Diego', lat: 32.7157, lng: -117.1611, country: 'USA' },
  { name: 'Dallas', lat: 32.7767, lng: -96.7970, country: 'USA' },
  { name: 'San Jose', lat: 37.3382, lng: -121.8863, country: 'USA' },
  { name: 'Austin', lat: 30.2672, lng: -97.7431, country: 'USA' },
  { name: 'Denver', lat: 39.7392, lng: -104.9903, country: 'USA' },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321, country: 'USA' },
  { name: 'Boston', lat: 42.3601, lng: -71.0589, country: 'USA' },
  { name: 'Miami', lat: 25.7617, lng: -80.1918, country: 'USA' },
  { name: 'Portland', lat: 45.5152, lng: -122.6784, country: 'USA' },
  { name: 'Atlanta', lat: 33.7490, lng: -84.3880, country: 'USA' },
  { name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'Canada' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { name: 'Barcelona', lat: 41.3874, lng: 2.1686, country: 'Spain' },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'Spain' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
  { name: 'Milan', lat: 45.4642, lng: 9.1900, country: 'Italy' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, country: 'Italy' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631, country: 'Australia' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India' },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'Argentina' }
];

export function getCityByName(name: string): City | undefined {
  return SUPPORTED_CITIES.find(city => city.name.toLowerCase() === name.toLowerCase());
}

export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase();
  return SUPPORTED_CITIES.filter(city =>
    city.name.toLowerCase().includes(lowerQuery)
  );
}
