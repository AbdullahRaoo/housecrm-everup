import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  isEditable?: boolean;
}

export function PropertyMap({ latitude, longitude, onLocationSelect, isEditable }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Create a Google Maps loader instance
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'] // Add places library for search functionality
    });

    // Load the Google Maps API
    loader.load().then(() => {
      if (mapRef.current) {
        try {
          // Initialize the map
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: 15,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
          });

          // Add a marker
          markerRef.current = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            draggable: isEditable,
            animation: google.maps.Animation.DROP
          });

          // Add search box if editable
          if (isEditable) {
            const input = document.createElement('input');
            input.className = 'controls rounded-md border p-2 m-2 w-64';
            input.type = 'text';
            input.placeholder = 'Search for a location';
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            const searchBox = new google.maps.places.SearchBox(input);

            // Listen for search box events
            searchBox.addListener('places_changed', () => {
              const places = searchBox.getPlaces();
              if (places?.length === 0) return;

              const bounds = new google.maps.LatLngBounds();
              places?.forEach(place => {
                if (!place.geometry || !place.geometry.location) return;

                if (markerRef.current && onLocationSelect) {
                  markerRef.current.setPosition(place.geometry.location);
                  onLocationSelect(
                    place.geometry.location.lat(),
                    place.geometry.location.lng()
                  );
                }

                if (place.geometry.viewport) {
                  bounds.union(place.geometry.viewport);
                } else {
                  bounds.extend(place.geometry.location);
                }
              });
              map.fitBounds(bounds);
            });
          }

          // Add marker drag event listener
          if (isEditable && onLocationSelect && markerRef.current) {
            markerRef.current.addListener('dragend', () => {
              const position = markerRef.current?.getPosition();
              if (position) {
                onLocationSelect(position.lat(), position.lng());
              }
            });

            // Add click event listener to map
            map.addListener('click', (e: google.maps.MapMouseEvent) => {
              const position = e.latLng;
              if (position && markerRef.current) {
                markerRef.current.setPosition(position);
                onLocationSelect(position.lat(), position.lng());
              }
            });
          }
        } catch (error) {
          console.error("Error initializing Google Map:", error);
          setMapError("Failed to initialize map");
        }
      }
    }).catch(error => {
      console.error("Failed to load Google Maps API:", error);
      setMapError("Failed to load map. API key might be invalid or restricted.");
    });
  }, [latitude, longitude, onLocationSelect, isEditable]);

  if (mapError) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938-9L12 3.042 19.938 8.8M4.5 20.25h15a1.5 1.5 0 001.5-1.5V8.8a1.5 1.5 0 00-.563-1.169L12 1.042 3.563 7.631A1.5 1.5 0 003 8.8v9.95a1.5 1.5 0 001.5 1.5z" />
          </svg>
          <p className="mt-2 text-gray-600">{mapError}</p>
          <p className="mt-1 text-sm text-gray-500">You can still continue with the property {isEditable ? 'creation' : 'viewing'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[400px] rounded-lg" />
      {isEditable && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md text-sm">
          <p>Click on map or drag marker to set location</p>
        </div>
      )}
    </div>
  );
}
