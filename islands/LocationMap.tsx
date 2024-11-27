import { useEffect, useRef, useState } from "preact/hooks";

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
}

interface LatLng {
  lat: number;
  lng: number;
}

export default function LocationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [locationCount, setLocationCount] = useState(0);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = L.map(mapRef.current).setView([0, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    map.on('click', async ({ latlng }: { latlng: LatLng }) => {
      const name = prompt("Enter a name for this location:");
      if (!name) return;

      try {
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            latitude: latlng.lat, 
            longitude: latlng.lng, 
            name 
          }),
        });
        if (!res.ok) throw new Error('Failed to save location');
        
        L.marker([latlng.lat, latlng.lng])
          .bindPopup(name)
          .addTo(map)
          .openPopup();
          
        setLocationCount(prev => prev + 1);
      } catch (error) {
        alert('Failed to save location');
      }
    });

    fetch('/api/locations')
      .then(res => res.json())
      .then(locations => {
        setLocationCount(locations.length);
        locations.forEach((loc: Location) => {
          L.marker([loc.latitude, loc.longitude])
            .bindPopup(loc.name || 'Unnamed location')
            .addTo(map);
        });
      })
      .catch(console.error);

    return () => map.remove();
  }, []);

  return (
    <div class="w-full">
      <div class="text-lg font-semibold mb-4">
        Number of locations: {locationCount}
      </div>
      <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
    </div>
  );
}
