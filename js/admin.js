const AUTH_KEY = 'achar-admin-auth';
const ADMIN_PASS = 'achar2026';

const loginView = document.getElementById('login-view');
const adminView = document.getElementById('admin-view');
const productForm = document.getElementById('product-form');
const formStatus = document.getElementById('form-status');

let pendingImageData = '';

function isAuthed() { return sessionStorage.getItem(AUTH_KEY) === '1'; }
function showAdmin() { loginView.classList.add('hidden'); adminView.classList.remove('hidden'); refresh(); }
function showLogin() { sessionStorage.removeItem(AUTH_KEY); adminView.classList.add('hidden'); loginView.classList.remove('hidden'); }

document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  if (document.getElementById('admin-password').value === ADMIN_PASS) {
    sessionStorage.setItem(AUTH_KEY, '1');
    showAdmin();
  } else alert('Incorrect password.');
});
document.getElementById('logout-btn').addEventListener('click', showLogin);
if (isAuthed()) showAdmin();

document.getElementById('p-image-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    showFormStatus('Image must be under 3 MB. Use a URL or smaller file.', false);
    e.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    compressImage(reader.result).then(compressed => {
      pendingImageData = compressed;
      document.getElementById('p-image-url').value = '';
      showPreview(pendingImageData);
      showFormStatus('Image ready.', true);
    });
  };
  reader.readAsDataURL(file);
});

document.getElementById('p-image-url').addEventListener('input', e => {
  pendingImageData = '';
  document.getElementById('p-image-file').value = '';
  const url = e.target.value.trim();
  if (url) showPreview(url);
  else hidePreview();
});

function compressImage(dataUrl, maxWidth = 480) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function showPreview(src) {
  document.getElementById('image-preview').src = src;
  document.getElementById('image-preview-wrap').classList.remove('hidden');
}

function hidePreview() {
  document.getElementById('image-preview-wrap').classList.add('hidden');
}

function showFormStatus(msg, ok) {
  formStatus.textContent = msg;
  formStatus.className = 'form-status ' + (ok ? 'ok' : 'err');
  formStatus.classList.remove('hidden');
}

function hideFormStatus() {
  formStatus.classList.add('hidden');
}

function sizesFromForm() {
  return [
    { label: '250g', price: +document.getElementById('p-s0').value },
    { label: '500g', price: +document.getElementById('p-s1').value },
    { label: '1kg', price: +document.getElementById('p-s2').value },
  ];
}

function fillSizes(sizes) {
  document.getElementById('p-s0').value = sizes[0]?.price ?? '';
  document.getElementById('p-s1').value = sizes[1]?.price ?? '';
  document.getElementById('p-s2').value = sizes[2]?.price ?? '';
}

function refresh() {
  const products = PickleStore.getProducts(true);
  const orders = PickleStore.loadOrders();
  document.getElementById('stat-products').textContent = products.filter(p => p.active !== false).length;
  document.getElementById('stat-low').textContent = products.filter(p => p.stock <= 5 && p.active !== false).length;
  document.getElementById('stat-orders').textContent = orders.length;

  document.getElementById('products-table').innerHTML = products.map(p => `
    <tr>
      <td>${p.image ? '🖼' : p.emoji} ${esc(p.name)}</td>
      <td>${p.sizes.map(s => `${s.label}: ₹${s.price}`).join(', ')}</td>
      <td>${p.stock}</td>
      <td>${p.active === false ? '<span class="badge badge-off">Hidden</span>' : (p.stock <= 5 ? '<span class="badge badge-low">Low</span>' : '<span class="badge badge-done">Active</span>')}</td>
      <td><button class="btn-outline btn-sm" data-edit="${p.id}">Edit</button> <button class="btn-danger btn-sm" data-del="${p.id}">Delete</button></td>
    </tr>`).join('');

  document.getElementById('orders-table').innerHTML = orders.map(o => `
    <tr>
      <td>${new Date(o.created).toLocaleDateString()}</td>
      <td>${esc(o.name)} · ${esc(o.phone)}</td>
      <td>₹${o.total}</td>
      <td><span class="badge ${o.status === 'done' ? 'badge-done' : 'badge-new'}">${o.status}</span></td>
      <td>${o.status !== 'done' ? `<button class="btn-outline btn-sm" data-done="${o.id}">Mark done</button>` : ''}</td>
    </tr>`).join('') || '<tr><td colspan="5">No orders</td></tr>';

  bindActions();
}

function bindActions() {
  document.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editProduct(+b.dataset.edit)));
  document.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    if (confirm('Delete?')) { PickleStore.remove(+b.dataset.del); resetForm(); refresh(); }
  }));
  document.querySelectorAll('[data-done]').forEach(b => b.addEventListener('click', () => {
    PickleStore.updateOrderStatus(+b.dataset.done, 'done'); refresh();
  }));
}

function editProduct(id) {
  const p = PickleStore.getById(id);
  hideFormStatus();
  pendingImageData = '';
  document.getElementById('form-title').textContent = 'Edit pickle';
  document.getElementById('product-id').value = p.id;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-emoji').value = p.emoji;
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('p-active').value = String(p.active !== false);
  document.getElementById('p-desc').value = p.desc;
  document.getElementById('p-image-url').value = p.image?.startsWith('data:') ? '' : (p.image || '');
  document.getElementById('p-image-file').value = '';
  if (p.image) showPreview(p.image);
  else hidePreview();
  if (p.image?.startsWith('data:')) pendingImageData = p.image;
  fillSizes(p.sizes);
  document.getElementById('cancel-edit').classList.remove('hidden');
}

function resetForm() {
  productForm.reset();
  pendingImageData = '';
  document.getElementById('product-id').value = '';
  document.getElementById('form-title').textContent = 'Add pickle';
  document.getElementById('cancel-edit').classList.add('hidden');
  hidePreview();
  hideFormStatus();
}

document.getElementById('cancel-edit').addEventListener('click', resetForm);

productForm.addEventListener('submit', e => {
  e.preventDefault();
  hideFormStatus();

  const name = document.getElementById('p-name').value.trim();
  if (!name) {
    showFormStatus('Pickle name is required.', false);
    return;
  }

  const idVal = document.getElementById('product-id').value;
  const urlImage = document.getElementById('p-image-url').value.trim();
  const image = pendingImageData || urlImage || '';

  const product = {
    id: idVal ? +idVal : PickleStore.nextId(),
    name,
    emoji: document.getElementById('p-emoji').value.trim() || '🥒',
    desc: document.getElementById('p-desc').value.trim(),
    stock: +document.getElementById('p-stock').value,
    active: document.getElementById('p-active').value === 'true',
    sizes: sizesFromForm(),
    image,
  };

  const saveBtn = document.getElementById('save-product-btn');
  saveBtn.disabled = true;

  try {
    PickleStore.upsert(product);
    showFormStatus(`"${product.name}" saved successfully.`, true);
    resetForm();
    refresh();
  } catch (err) {
    if (image && (err.message?.includes('Storage') || err.name === 'QuotaExceededError')) {
      if (confirm('Could not save with image (storage limit). Save without image?')) {
        product.image = '';
        try {
          PickleStore.upsert(product);
          showFormStatus(`"${product.name}" saved without image.`, true);
          resetForm();
          refresh();
        } catch (err2) {
          showFormStatus(err2.message || 'Could not save product.', false);
        }
      } else {
        showFormStatus(err.message || 'Could not save product.', false);
      }
    } else {
      showFormStatus(err.message || 'Could not save product.', false);
    }
  } finally {
    saveBtn.disabled = false;
  }
});

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
