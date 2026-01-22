export interface Coordinates {
  lat: number | null;
  lng: number | null;
}

export function extractCoordinatesFromLocation(location: string): Coordinates {
  if (!location) {
    return { lat: null, lng: null };
  }

  // Try to extract from Google Maps URL
  // Format: https://maps.google.com/?q=40.7128,-74.0060
  // Format: https://www.google.com/maps/@40.7128,-74.0060
  // Format: https://maps.apple.com/?address=...
  const googleMapsRegex = /[?@]([+-]?\d+\.\d+),([+-]?\d+\.\d+)/;
  const googleMapsMatch = location.match(googleMapsRegex);
  if (googleMapsMatch) {
    const lat = parseFloat(googleMapsMatch[1]);
    const lng = parseFloat(googleMapsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // Try to extract lat,lng from simple text like "40.7128,-74.0060"
  const simpleRegex = /([+-]?\d+\.\d+),\s*([+-]?\d+\.\d+)/;
  const simpleMatch = location.match(simpleRegex);
  if (simpleMatch) {
    const lat = parseFloat(simpleMatch[1]);
    const lng = parseFloat(simpleMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return { lat: null, lng: null };
}

export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
