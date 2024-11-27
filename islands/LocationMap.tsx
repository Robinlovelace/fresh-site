import { useEffect, useRef, useState } from "preact/hooks";

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
}

export default function LocationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

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

      // Get location name from user
      const name = prompt("Enter a name for this location:");
      if (!name) return;

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(name).openPopup();
      setMarkers(prev => [...prev, marker]);

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
      } catch (error) {
        alert('Failed to save location');
        marker.remove();
        setMarkers(prev => prev.filter(m => m !== marker));
      }
    });

    // Load existing locations
    fetch('/api/locations')
      .then(res => res.json())
      .then(locations => {
        locations.forEach((loc: Location) => {
          const marker = L.marker([loc.latitude, loc.longitude])
            .bindPopup(loc.name || 'Unnamed location')
            .addTo(map);
          setMarkers(prev => [...prev, marker]);
        });
      })
      .catch(console.error);

    return () => {
      markers.forEach(marker => marker.remove());
      map.remove();
    };
  }, []);

  return (
    <div class="w-full">
      <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
    </div>
  );
}
