interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  createdAt: number;
}

// In-memory storage
const locations: Location[] = [];

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

    locations.push(location);
    return new Response(JSON.stringify(location), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify(locations), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}
