const DEFAULT_PHONE = '6261158338';
const DEFAULT_ADDRESS = 'Badodiya Khan, Sanwer–Indore–Ujjain Road (M.P.) – 453551';
const DEFAULT_PASSWORD = 'SBC@2026';

// Cloudflare KV is used when a KV binding named SBC_DATA is added to the project.
// Until then, a small in-memory fallback keeps the site usable for testing.
const memory = globalThis.__SBC_MEMORY__ || (globalThis.__SBC_MEMORY__ = new Map());

const headers = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
  'cache-control': 'no-store'
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers });
const id = () => crypto.randomUUID();

function store(env) {
  return env.SBC_DATA || null;
}
async function put(env, key, value) {
  const kv = store(env);
  if (kv) return kv.put(key, JSON.stringify(value));
  memory.set(key, value);
}
async function get(env, key) {
  const kv = store(env);
  if (kv) {
    const v = await kv.get(key, 'json');
    return v ?? null;
  }
  return memory.get(key) ?? null;
}
async function del(env, key) {
  const kv = store(env);
  if (kv) return kv.delete(key);
  memory.delete(key);
}
async function list(env, prefix) {
  const kv = store(env);
  if (kv) {
    const out = [];
    let cursor;
    do {
      const r = await kv.list({ prefix, cursor, limit: 1000 });
      for (const k of r.keys) out.push(await kv.get(k.name, 'json'));
      cursor = r.list_complete ? undefined : r.cursor;
    } while (cursor);
    return out.filter(Boolean);
  }
  return [...memory.entries()].filter(([k]) => k.startsWith(prefix)).map(([,v]) => v).filter(Boolean);
}
function authorized(request, env) {
  const h = request.headers.get('Authorization') || '';
  if (!h.startsWith('Basic ')) return false;
  try {
    const raw = atob(h.slice(6));
    const password = raw.slice(raw.indexOf(':') + 1);
    const expected = env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
    return password === expected;
  } catch { return false; }
}
function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...headers, 'www-authenticate': 'Basic realm="Shree Bala Ji Collection Admin"' }
  });
}
async function body(request) {
  try { return await request.json(); } catch { return {}; }
}
function normalizeProduct(b) {
  return {
    id: id(), name: String(b.name || '').trim(), price: Number(b.price || 0),
    stock: Math.max(0, Number(b.stock || 0)), category: String(b.category || 'Sarees'),
    fabric: String(b.fabric || ''), color: String(b.color || ''), size: String(b.size || ''),
    delivery: String(b.delivery || ''), rating: Math.max(0, Math.min(5, Number(b.rating ?? 5))),
    sold: Math.max(0, Number(b.sold ?? 0)), description: String(b.description || ''),
    image: String(b.image || ''), createdAt: new Date().toISOString()
  };
}

async function api(request, env, path) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  if (path === '/api/store/products' && request.method === 'GET') {
    return json(200, await list(env, 'product:'));
  }
  if (path === '/api/store/products' && request.method === 'POST') {
    if (!authorized(request, env)) return unauthorized();
    const b = await body(request);
    if (!b.name || !Number.isFinite(Number(b.price))) return json(400, { error: 'name and price required' });
    const product = normalizeProduct(b);
    await put(env, `product:${product.id}`, product);
    return json(201, product);
  }
  if (path.startsWith('/api/store/products/') && request.method === 'PUT') {
    if (!authorized(request, env)) return unauthorized();
    const productId = path.split('/').pop();
    const existing = await get(env, `product:${productId}`);
    if (!existing) return json(404, { error: 'Product not found' });
    const b = await body(request);
    if (!b.name || !Number.isFinite(Number(b.price))) return json(400, { error: 'name and price required' });
    const product = normalizeProduct(b);
    product.id = productId;
    product.createdAt = existing.createdAt || product.createdAt;
    await put(env, `product:${productId}`, product);
    return json(200, product);
  }
  if (path.startsWith('/api/store/products/') && request.method === 'DELETE') {
    if (!authorized(request, env)) return unauthorized();
    await del(env, `product:${path.split('/').pop()}`);
    return json(200, { ok: true });
  }

  if (path === '/api/store/orders' && request.method === 'GET') {
    if (!authorized(request, env)) return unauthorized();
    const orders = await list(env, 'order:');
    orders.sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return json(200, orders);
  }
  if (path === '/api/store/orders' && request.method === 'POST') {
    const b = await body(request);
    if (!b.customer?.name || !b.customer?.phone || !b.customer?.address || !Array.isArray(b.items) || !b.items.length)
      return json(400, { error: 'Customer details and items are required' });
    const items = []; let total = 0;
    for (const it of b.items) {
      const qty = Math.floor(Number(it.qty));
      if (!it.id || qty < 1) return json(400, { error: 'Invalid item' });
      const prod = await get(env, `product:${it.id}`);
      if (!prod || Number(prod.stock) < qty) return json(400, { error: `Product unavailable: ${it.id}` });
      items.push({ id: prod.id, name: prod.name, price: Number(prod.price), qty });
      total += Number(prod.price) * qty;
    }
    for (const it of b.items) {
      const prod = await get(env, `product:${it.id}`);
      if (prod) { prod.stock = Math.max(0, Number(prod.stock) - Math.floor(Number(it.qty))); await put(env, `product:${prod.id}`, prod); }
    }
    const online = b.paymentMethod === 'online';
    const order = {
      id: 'SBC-' + Date.now().toString().slice(-8),
      customer: { name: String(b.customer.name), phone: String(b.customer.phone), address: String(b.customer.address), pincode: String(b.customer.pincode || '') },
      items, total, paymentMethod: online ? 'online' : 'cod',
      paymentStatus: online ? 'Pending' : 'Cash on Delivery', status: 'Pending', createdAt: new Date().toISOString()
    };
    await put(env, `order:${order.id}`, order);
    return json(201, { order });
  }
  if (path.startsWith('/api/store/orders/') && request.method === 'PATCH') {
    if (!authorized(request, env)) return unauthorized();
    const oid = path.split('/').pop(); const order = await get(env, `order:${oid}`);
    if (!order) return json(404, { error: 'Not found' });
    const patch = await body(request);
    if (patch.status) order.status = String(patch.status);
    if (patch.paymentStatus) order.paymentStatus = String(patch.paymentStatus);
    await put(env, `order:${oid}`, order);
    return json(200, order);
  }

  if (path === '/api/store/settings' && request.method === 'GET') {
    const s = await get(env, 'settings:main');
    return json(200, {
      phone: String(s?.phone || DEFAULT_PHONE).replace(/\D/g, '').slice(-10) || DEFAULT_PHONE,
      address: String(s?.address || DEFAULT_ADDRESS), upiId: String(s?.upiId || '')
    });
  }
  if (path === '/api/store/settings' && request.method === 'POST') {
    if (!authorized(request, env)) return unauthorized();
    const b = await body(request);
    const s = {
      phone: String(b.phone || DEFAULT_PHONE).replace(/\D/g, '').slice(-10) || DEFAULT_PHONE,
      address: String(b.address || DEFAULT_ADDRESS), upiId: String(b.upiId || '')
    };
    await put(env, 'settings:main', s); return json(200, s);
  }
  return json(404, { error: 'Not found' });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/store/')) return api(request, env, url.pathname);
    return env.ASSETS.fetch(request);
  }
};
