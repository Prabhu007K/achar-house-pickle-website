const PickleStore = (() => {
  const CATALOG_KEY = 'achar-catalog-v2';
  const ORDERS_KEY = 'achar-orders-v1';

  const DEFAULT = [
    { id: 1, name: "Mango Pickle", emoji: "🥭", desc: "Classic Andhra-style avakaya with mustard & fenugreek", stock: 30, active: true,
      sizes: [{ label: "250g", price: 120 }, { label: "500g", price: 220 }, { label: "1kg", price: 400 }] },
    { id: 2, name: "Lemon Pickle", emoji: "🍋", desc: "Tangy nimbu achaar with green chillies", stock: 25, active: true,
      sizes: [{ label: "250g", price: 100 }, { label: "500g", price: 180 }, { label: "1kg", price: 340 }] },
    { id: 3, name: "Garlic Pickle", emoji: "🧄", desc: "Bold lasan achaar for spice lovers", stock: 20, active: true,
      sizes: [{ label: "250g", price: 140 }, { label: "500g", price: 260 }, { label: "1kg", price: 480 }] },
    { id: 4, name: "Gongura Pickle", emoji: "🌿", desc: "Tangy sorrel leaves — a Telugu favourite", stock: 18, active: true,
      sizes: [{ label: "250g", price: 130 }, { label: "500g", price: 240 }, { label: "1kg", price: 450 }] },
    { id: 5, name: "Mixed Veg Pickle", emoji: "🥕", desc: "Carrot, cauliflower, lime & chilli blend", stock: 22, active: true,
      sizes: [{ label: "250g", price: 110 }, { label: "500g", price: 200 }, { label: "1kg", price: 370 }] },
    { id: 6, name: "Chilli Pickle", emoji: "🌶️", desc: "Fiery green chilli pickle with tamarind", stock: 28, active: true,
      sizes: [{ label: "250g", price: 95 }, { label: "500g", price: 175 }, { label: "1kg", price: 320 }] },
    { id: 7, name: "Chicken Pickle", emoji: "🍗", desc: "Spicy boneless chicken achaar with Andhra masala", stock: 16, active: true,
      sizes: [{ label: "250g", price: 180 }, { label: "500g", price: 340 }, { label: "1kg", price: 620 }] },
    { id: 8, name: "Fish Pickle", emoji: "🐟", desc: "Tender fish pieces in tangy chilli & mustard oil", stock: 14, active: true,
      sizes: [{ label: "250g", price: 200 }, { label: "500g", price: 380 }, { label: "1kg", price: 700 }] },
    { id: 9, name: "Prawn Pickle", emoji: "🦐", desc: "Juicy prawns pickled with garlic, curry leaves & spice", stock: 12, active: true,
      sizes: [{ label: "250g", price: 220 }, { label: "500g", price: 420 }, { label: "1kg", price: 780 }] },
  ];

  function normalize(p) {
    return { image: '', ...p };
  }

  function load() {
    try {
      const raw = localStorage.getItem(CATALOG_KEY);
      if (raw) return JSON.parse(raw).map(normalize);
    } catch { /* defaults */ }
    save(DEFAULT);
    return DEFAULT.map(normalize);
  }

  function save(items) {
    try {
      localStorage.setItem(CATALOG_KEY, JSON.stringify(items));
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        throw new Error('Storage full — try a smaller image or use an image URL instead.');
      }
      throw err;
    }
  }

  function getProducts(includeHidden = false) {
    const list = load();
    return includeHidden ? list : list.filter(p => p.active !== false);
  }

  function getById(id) { return load().find(p => p.id === id); }

  function upsert(product) {
    const list = load();
    const normalized = normalize(product);
    const idx = list.findIndex(p => p.id === normalized.id);
    if (idx >= 0) list[idx] = normalized;
    else list.push(normalized);
    save(list);
  }

  function remove(id) { save(load().filter(p => p.id !== id)); }

  function nextId() {
    const list = load();
    return list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
  }

  function reduceStock(id, qty) {
    const list = load();
    const p = list.find(x => x.id === id);
    if (p) p.stock = Math.max(0, (p.stock ?? 0) - qty);
    save(list);
  }

  function loadOrders() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveOrder(order) {
    const orders = loadOrders();
    orders.unshift({ ...order, id: Date.now(), status: 'new', created: new Date().toISOString() });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 50)));
  }

  function updateOrderStatus(id, status) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(loadOrders().map(o => o.id === id ? { ...o, status } : o)));
  }

  return { load, save, getProducts, getById, upsert, remove, nextId, reduceStock, loadOrders, saveOrder, updateOrderStatus, DEFAULT };
})();
