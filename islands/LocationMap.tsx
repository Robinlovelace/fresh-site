import { useEffect, useRef } from "preact/hooks";

interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

export default function LocationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const L = (window as any).L;
    const map = L.map(mapRef.current).setView([0, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Handle map clicks
    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng;
      
      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(map);
      markerRef.current = marker;

      // Get location name from user
      const name = prompt("Enter a name for this location:");
      if (!name) return;

      // Save location
      try {
        const response = await fetch('/api/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            name,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save location');
        }

        marker.bindPopup(name).openPopup();
      } catch (error) {
        alert('Failed to save location');
        marker.remove();
      }
    });

    // Load existing locations
    fetch('/api/locations')
      .then(res => res.json())
      .then(locations => {
        locations.forEach((loc: Location) => {
          L.marker([loc.latitude, loc.longitude])
            .bindPopup(loc.name || 'Unnamed location')
            .addTo(map);
        });
      })
      .catch(console.error);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div class="w-full">
      <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
    </div>
  );
}
