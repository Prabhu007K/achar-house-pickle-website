let cart = JSON.parse(localStorage.getItem('pickle-cart') || '[]');

function cartKey(id, size) { return `${id}-${size}`; }

function getPickles() { return PickleStore.getProducts(); }

function renderProductImage(p) {
  if (p.image) {
    return `<div class="pickle-top pickle-top-photo">
      <img src="${escAttr(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <span class="pickle-top-fallback">${p.emoji}</span>
    </div>`;
  }
  return `<div class="pickle-top">${p.emoji}</div>`;
}

function renderProducts() {
  const pickles = getPickles();
  document.getElementById('product-grid').innerHTML = pickles.length ? pickles.map(p => {
    const out = (p.stock ?? 0) <= 0;
    return `
    <article class="pickle-card" data-id="${p.id}">
      ${renderProductImage(p)}
      <div class="pickle-body">
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="size-options">
          ${p.sizes.map((s, i) => `
            <label class="size-option">
              <input type="radio" name="size-${p.id}" value="${s.label}" data-price="${s.price}" ${i === 1 ? 'checked' : ''}>
              ${s.label} — ₹${s.price}
            </label>`).join('')}
        </div>
        <button class="add-btn" data-id="${p.id}" ${out ? 'disabled' : ''}>${out ? 'Out of stock' : 'Add to cart'}</button>
      </div>
    </article>`;
  }).join('') : '<p style="text-align:center;color:#78716c">No products available.</p>';

  document.querySelectorAll('.add-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      const card = btn.closest('.pickle-card');
      const selected = card.querySelector('input[type=radio]:checked');
      const size = selected.value;
      const price = +selected.dataset.price;
      const pickle = PickleStore.getById(id);
      if ((pickle.stock ?? 0) <= 0) return alert('Out of stock.');
      const key = cartKey(id, size);
      const existing = cart.find(c => c.key === key);
      if (existing) existing.qty++;
      else cart.push({ key, id, name: pickle.name, emoji: pickle.emoji, size, price, qty: 1 });
      persist();
    });
  });
}

function persist() {
  localStorage.setItem('pickle-cart', JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cart-count').textContent = count;
  let total = 0;
  document.getElementById('cart-list').innerHTML = cart.length
    ? cart.map(c => {
        const sub = c.price * c.qty;
        total += sub;
        return `<li class="cart-item"><span>${c.emoji} ${esc(c.name)} (${c.size}) ×${c.qty}</span><strong>₹${sub}</strong></li>`;
      }).join('')
    : '<li style="text-align:center;color:#78716c;padding:2rem">Cart is empty</li>';
  document.getElementById('cart-total').textContent = total;
}

const panel = document.getElementById('cart-panel');
const overlay = document.getElementById('overlay');
const open = () => { panel.classList.add('open'); overlay.classList.add('show'); };
const close = () => { panel.classList.remove('open'); overlay.classList.remove('show'); };

document.getElementById('cart-toggle').addEventListener('click', open);
document.getElementById('cart-close').addEventListener('click', close);
overlay.addEventListener('click', close);

const checkoutDialog = document.getElementById('checkout-dialog');
document.getElementById('checkout-open').addEventListener('click', () => {
  if (!cart.length) return alert('Add items first.');
  checkoutDialog.showModal();
});
document.getElementById('checkout-cancel').addEventListener('click', () => checkoutDialog.close());

document.getElementById('checkout-form').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const items = cart.map(c => `${c.name} (${c.size}) ×${c.qty}`).join(', ');
  cart.forEach(c => PickleStore.reduceStock(c.id, c.qty));
  PickleStore.saveOrder({ name: fd.get('name'), phone: fd.get('phone'), address: fd.get('address'), items, total });
  document.getElementById('done-msg').textContent =
    `Hi ${fd.get('name')}, your order of ₹${total} will be delivered soon.`;
  cart = [];
  persist();
  checkoutDialog.close();
  close();
  document.getElementById('done-dialog').showModal();
  e.target.reset();
  renderProducts();
});

document.getElementById('done-close').addEventListener('click', () => document.getElementById('done-dialog').close());

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function escAttr(s) { return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

renderProducts();
updateCart();
