import LocationMap from "../islands/LocationMap.tsx";

export default function Home() {
  return (
    <div class="p-4 mx-auto max-w-screen-lg">
      <h1 class="text-4xl font-bold mb-4">Location Mapper</h1>
      <p class="mb-4">Click anywhere on the map to add a location marker.</p>
      <div class="border rounded-lg overflow-hidden shadow-lg">
        <LocationMap />
      </div>
    </div>
  );
}
