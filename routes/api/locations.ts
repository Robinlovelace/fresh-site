/// <reference lib="deno.unstable" />

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  createdAt: number;
}

// Initialize Deno KV
const kv = await Deno.openKv();

export async function handler(req: Request): Promise<Response> {
  if (req.method === "POST") {
    const body = await req.json();
    const location: Location = {
      id: crypto.randomUUID(),
      latitude: body.latitude,
      longitude: body.longitude,
      name: body.name,
      createdAt: Date.now(),
    };

    // Store in KV
    await kv.set(["locations", location.id], location);
    
    return new Response(JSON.stringify(location), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    const locations: Location[] = [];
    
    // Retrieve all locations
    const iter = kv.list({ prefix: ["locations"] });
    for await (const entry of iter) {
      locations.push(entry.value as Location);
    }

    return new Response(JSON.stringify(locations), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}
