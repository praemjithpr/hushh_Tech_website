/**
 * Location Service
 * Isolated API calls for location detection and dropdown data
 */

import config from '../../resources/config/config';
import {
  LocationData,
  Country,
  State,
  City,
  GeocodeApiResponse,
  LocationsApiResponse,
  LocationDetectionResult,
  Coordinates,
  COUNTRY_CODE_TO_NAME,
  COUNTRY_NAME_TO_CODE,
} from './types';

// API Endpoints
const LOCATIONS_API = `${config.SUPABASE_URL}/functions/v1/get-locations`;
const GEOCODE_API = `${config.SUPABASE_URL}/functions/v1/hushh-location-geocode`;

/**
 * LocationService - Centralized service for all location-related API calls
 */
export class LocationService {
  private abortController: AbortController | null = null;

  /**
   * Cancel any pending requests
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Get current GPS coordinates from browser
   */
  async getGpsCoordinates(options?: PositionOptions): Promise<Coordinates> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not available');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === 1) {
            reject(new Error('Location permission denied'));
          } else if (error.code === 2) {
            reject(new Error('Location unavailable'));
          } else {
            reject(new Error('Location timeout'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
          ...options,
        }
      );
    });
  }

  /**
   * Call geocode API to convert GPS coordinates to address
   */
  async geocodeCoordinates(coords: Coordinates): Promise<LocationData> {
    this.abortController = new AbortController();

    const response = await fetch(GEOCODE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(coords),
      signal: this.abortController.signal,
    });

    const result: GeocodeApiResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Geocoding failed');
    }

    return result.data;
  }

  /**
   * Detect location using GPS and geocoding
   * Main function for Step 6 location detection
   */
  async detectLocation(): Promise<LocationDetectionResult> {
    try {
      // Get GPS coordinates
      const coords = await this.getGpsCoordinates();
      console.log(`[LocationService] GPS coordinates: ${coords.latitude}, ${coords.longitude}`);

      // Geocode coordinates to address
      const locationData = await this.geocodeCoordinates(coords);
      console.log('[LocationService] Location detected:', locationData);

      return {
        source: 'detected',
        data: locationData,
      };
    } catch (error) {
      const message = (error as Error).message;
      
      if (message === 'Location permission denied') {
        console.log('[LocationService] Location permission denied');
        return { source: 'denied', data: null, error: message };
      }
      
      if ((error as Error).name === 'AbortError') {
        console.log('[LocationService] Request cancelled');
        return { source: 'failed', data: null, error: 'Request cancelled' };
      }

      console.error('[LocationService] Detection failed:', error);
      return { source: 'failed', data: null, error: message };
    }
  }

  /**
   * Fetch all countries for dropdown
   */
  async fetchCountries(): Promise<Country[]> {
    try {
      const response = await fetch(`${LOCATIONS_API}?type=countries`);
      const result: LocationsApiResponse<Country> = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      console.error('[LocationService] Failed to fetch countries:', error);
      throw error;
    }
  }

  /**
   * Fetch states for a specific country
   */
  async fetchStates(countryCode: string): Promise<State[]> {
    if (!countryCode) {
      return [];
    }

    try {
      const response = await fetch(`${LOCATIONS_API}?type=states&country=${countryCode}`);
      const result: LocationsApiResponse<State> = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      console.error('[LocationService] Failed to fetch states:', error);
      throw error;
    }
  }

  /**
   * Fetch cities for a specific state in a country
   */
  async fetchCities(countryCode: string, stateCode: string): Promise<City[]> {
    if (!countryCode || !stateCode) {
      return [];
    }

    try {
      const response = await fetch(`${LOCATIONS_API}?type=cities&country=${countryCode}&state=${stateCode}`);
      const result: LocationsApiResponse<City> = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error) {
      console.error('[LocationService] Failed to fetch cities:', error);
      throw error;
    }
  }

  /**
   * Save GPS location data to onboarding_data table
   */
  async saveLocationToOnboarding(userId: string, locationData: LocationData): Promise<void> {
    if (!config.supabaseClient) {
      throw new Error('Supabase client not configured');
    }

    const countryName = COUNTRY_CODE_TO_NAME[locationData.countryCode] || locationData.country;

    const { error } = await config.supabaseClient
      .from('onboarding_data')
      .update({
        gps_location_data: locationData,
        gps_detected_country: countryName,
        gps_detected_state: locationData.state,
        gps_detected_city: locationData.city,
        gps_detected_postal_code: locationData.postalCode,
        gps_detected_phone_dial_code: locationData.phoneDialCode,
        gps_detected_timezone: locationData.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('[LocationService] Failed to save location:', error);
      throw error;
    }

    console.log('[LocationService] Location saved to onboarding_data');
  }

  /**
   * Get cached GPS location data from onboarding_data
   */
  async getCachedLocation(userId: string): Promise<LocationData | null> {
    if (!config.supabaseClient) {
      return null;
    }

    const { data, error } = await config.supabaseClient
      .from('onboarding_data')
      .select('gps_location_data')
      .eq('user_id', userId)
      .single();

    if (error || !data?.gps_location_data) {
      return null;
    }

    return data.gps_location_data as LocationData;
  }

  /**
   * Check if location is already cached
   */
  async hasLocationCached(userId: string): Promise<boolean> {
    const cached = await this.getCachedLocation(userId);
    return cached !== null;
  }

  /**
   * Map country name to ISO code
   */
  mapCountryToIsoCode(countryName: string): string {
    return COUNTRY_NAME_TO_CODE[countryName] || countryName;
  }

  /**
   * Map ISO code to country name
   */
  mapIsoCodeToCountry(isoCode: string): string {
    return COUNTRY_CODE_TO_NAME[isoCode] || isoCode;
  }

  /**
   * Find matching state in list (by code or name)
   */
  findMatchingState(states: State[], gpsState: string, gpsStateCode?: string): State | null {
    // First try exact isoCode match
    if (gpsStateCode) {
      const byCode = states.find(s => s.isoCode === gpsStateCode);
      if (byCode) return byCode;
    }

    // Then try name match
    const byName = states.find(s => 
      s.name.toLowerCase() === gpsState.toLowerCase() ||
      s.isoCode.toLowerCase() === gpsState.toLowerCase()
    );
    if (byName) return byName;

    // Partial match as fallback
    const partial = states.find(s => 
      s.name.toLowerCase().includes(gpsState.toLowerCase()) ||
      gpsState.toLowerCase().includes(s.name.toLowerCase())
    );
    return partial || null;
  }

  /**
   * Find matching city in list
   */
  findMatchingCity(cities: City[], gpsCity: string): City | null {
    // Exact match first
    const exact = cities.find(c => c.name.toLowerCase() === gpsCity.toLowerCase());
    if (exact) return exact;

    // Partial match
    const partial = cities.find(c => 
      c.name.toLowerCase().includes(gpsCity.toLowerCase()) ||
      gpsCity.toLowerCase().includes(c.name.toLowerCase())
    );
    return partial || null;
  }

  /**
   * Parse formatted address into address lines
   */
  parseFormattedAddress(formattedAddress: string, locationData: LocationData): { line1: string; line2: string } {
    let streetPart = formattedAddress;
    
    // Remove country, postal code, state, city from end
    if (locationData.country && streetPart.endsWith(locationData.country)) {
      streetPart = streetPart.slice(0, -locationData.country.length).replace(/,\s*$/, '');
    }
    if (locationData.postalCode) {
      streetPart = streetPart.replace(new RegExp(`\\s*${locationData.postalCode}\\s*,?`), '');
    }
    if (locationData.state) {
      streetPart = streetPart.replace(new RegExp(`,?\\s*${locationData.state}\\s*$`), '');
    }
    if (locationData.city) {
      streetPart = streetPart.replace(new RegExp(`,?\\s*${locationData.city}\\s*$`), '');
    }
    
    streetPart = streetPart.replace(/,\s*$/, '').trim();
    const parts = streetPart.split(',').map(p => p.trim()).filter(p => p);
    
    return {
      line1: parts[0] || '',
      line2: parts.slice(1).join(', '),
    };
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Export types
export * from './types';
