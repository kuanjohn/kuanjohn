/**
 * John Kuan portfolio — edge worker
 * Serves static assets + optional visitor tracking (KV).
 * Future: /api/chat, D1, Workers AI — keep routes here.
 */

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

const rateMap = new Map();

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...SECURITY_HEADERS,
      ...extra,
    },
  });
}

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 30;
  const entry = rateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  return entry.count > max;
}

async function handleVisit(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (rateLimited(ip)) {
    return json({ ok: false, error: "Too many requests" }, 429, corsHeaders(request));
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400, corsHeaders(request));
  }

  // Honeypot — bots fill hidden fields
  if (body.website || body.company_url) {
    return json({ ok: true, persisted: false }, 200, corsHeaders(request));
  }

  const id = String(body.id || crypto.randomUUID()).slice(0, 64);
  const name = body.name ? String(body.name).trim().slice(0, 80) : "";
  const email = body.email ? String(body.email).trim().toLowerCase().slice(0, 120) : "";
  const now = new Date().toISOString();

  if (!env.VISITORS) {
    return json({ ok: true, persisted: false, id }, 200, corsHeaders(request));
  }

  const key = email ? `email:${email}` : `anon:${id}`;
  const existing = await env.VISITORS.get(key, "json");
  const record = {
    id: existing?.id || id,
    name: name || existing?.name || "",
    email: email || existing?.email || "",
    firstSeen: existing?.firstSeen || now,
    lastSeen: now,
    visits: (existing?.visits || 0) + 1,
  };
  await env.VISITORS.put(key, JSON.stringify(record));

  return json({ ok: true, persisted: true, id: record.id, visits: record.visits }, 200, corsHeaders(request));
}

function withHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    headers.set(k, v);
  }
  // Cache static assets aggressively; HTML shorter
  const ct = headers.get("Content-Type") || "";
  if (ct.includes("text/html")) {
    headers.set("Cache-Control", "public, max-age=300, must-revalidate");
  } else if (ct.includes("javascript") || ct.includes("css") || ct.includes("image") || ct.includes("font")) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/visit") {
      return handleVisit(request, env);
    }

    // Future: /api/contact, /api/chat, Workers AI

    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      return withHeaders(assetResponse);
    }

    return json({ ok: false, error: "Assets binding missing" }, 500);
  },
};
