/**
 * Social Shuffle Pune — Google Maps Platform URLs API Helpers
 * Implements Google Maps Search, Directions, and Place Navigation conforming to
 * Google Maps URLs Developer Guidelines (https://developers.google.com/maps/documentation/urls/get-started).
 */

/**
 * Returns a standardized Google Maps Search URL for any venue or address.
 */
export function getGoogleMapsSearchUrl(venue: string, address?: string, city: string = 'Pune'): string {
  const parts = [venue.trim()];
  if (address && address.trim()) {
    parts.push(address.trim());
  }
  if (city && city.trim() && !address?.toLowerCase().includes('pune')) {
    parts.push(city.trim());
  }
  const query = parts.join(', ');
  const params = new URLSearchParams({
    api: '1',
    query: query
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

/**
 * Returns a standardized Google Maps Directions URL from user's current location to the venue.
 */
export function getGoogleMapsDirectionsUrl(destinationVenue: string, destinationAddress?: string, city: string = 'Pune'): string {
  const destination = [destinationVenue.trim(), destinationAddress?.trim(), city.trim()]
    .filter(Boolean)
    .join(', ');
  const params = new URLSearchParams({
    api: '1',
    destination: destination,
    travelmode: 'driving'
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Opens Google Maps Navigation in a new tab.
 */
export function openGoogleMaps(venue: string, address?: string, city: string = 'Pune'): void {
  const url = getGoogleMapsSearchUrl(venue, address, city);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
