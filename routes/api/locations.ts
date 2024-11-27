/// <reference lib="deno.unstable" />

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  userName?: string;
  sound?: string;
  createdAt: number;
}

const kv = await Deno.openKv();

export async function handler(req: Request): Promise<Response> {
  if (req.method === "POST") {
    const location: Location = {
      id: crypto.randomUUID(),
      ...await req.json(),
      createdAt: Date.now(),
    };
    await kv.set(["locations", location.id], location);
    return Response.json(location);
  }

  if (req.method === "GET") {
    const locations = [];
    for await (const entry of kv.list({ prefix: ["locations"] })) {
      locations.push(entry.value);
    }
    return Response.json(locations);
  }

  return new Response("Method not allowed", { status: 405 });
}
