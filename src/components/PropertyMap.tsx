import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Create a Google Maps loader instance
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '', // Use Vite env variable
      version: 'weekly',
      libraries: ['places'] // Add places library for search functionality
    });

    // Load the Google Maps API
    loader.load().then(() => {
      if (mapRef.current) {
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
      }
    });
  }, [latitude, longitude, onLocationSelect, isEditable]);

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
