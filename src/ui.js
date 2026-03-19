import { getProducts, getProduct, createOrder, createProduct, updateProduct, getOrders, getAllOrders, updateOrderStatus } from './api/db.js';
import { Cart } from './modules/cart.js';
import { login, logout, observeAuth, isAdmin } from './api/auth.js';

const appContainer = document.getElementById('app');
let currentUser = null;

export const initUI = () => {
  const navigate = () => {
    const hash = window.location.hash;
    if (hash === '#cart') renderCartPage();
    else if (hash === '#admin') renderAdminPage();
    else if (hash === '#orders') renderOrdersPage();
    else if (hash.startsWith('#admin/edit/')) renderEditProductPage(hash.split('#admin/edit/')[1]);
    else if (hash.startsWith('#product/')) renderProductPage(hash.split('/')[1]);
    else renderHome();
  };

  observeAuth((user) => {
    currentUser = user;
    renderNavbar();
    navigate();
  });

  window.addEventListener('cart-updated', () => {
    if (window.location.hash === '#cart') renderCartPage();
    renderNavbar();
  });

  // Simple router
  window.addEventListener('hashchange', navigate);

  // Expose navigate for same-hash re-navigation
  window._navigate = navigate;
};

const renderNavbar = () => {
  const cartCount = Cart.get().reduce((sum, item) => sum + item.quantity, 0);
  const nav = document.getElementById('navbar');
  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex-shrink-0 flex items-center cursor-pointer" onclick="window.location.hash=''">
          <img src="logo.png" class="h-8 w-8 mr-2" alt="Logo">
          <span class="text-2xl font-bold text-indigo-600">4DPrint</span>
        </div>
        <div class="flex items-center space-x-4">
          <button onclick="window.location.hash='#cart'" class="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            ${cartCount > 0 ? `<span class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-600 rounded-full leading-none">${cartCount > 99 ? '+99' : cartCount}</span>` : ''}
          </button>
          ${currentUser ? `
            <div class="flex items-center space-x-2">
              ${isAdmin(currentUser) ? `<button onclick="window.location.hash='#admin'" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 mr-2">Admin Panel</button>` : ''}
              <div class="relative" id="user-menu-container">
                <button id="user-menu-btn" class="flex items-center focus:outline-none">
                  <img src="${currentUser.photoURL}" class="h-9 w-9 rounded-full border-2 border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer" alt="Avatar">
                </button>
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-semibold text-gray-900 truncate">${currentUser.displayName || ''}</p>
                    <p class="text-xs text-gray-500 truncate">${currentUser.email || ''}</p>
                  </div>
                  <button onclick="window.location.hash='#orders'" class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2 border-b border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Mis compras</span>
                  </button>
                  <button id="logout-btn" class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar sesi\u00f3n</span>
                  </button>
                </div>
              </div>
            </div>
          ` : `
            <button id="login-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Entrar</button>
          `}
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-btn')?.addEventListener('click', login);
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // Toggle dropdown on avatar click
  const menuBtn = document.getElementById('user-menu-btn');
  const dropdown = document.getElementById('user-dropdown');
  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    document.addEventListener('click', () => {
      if (!dropdown.classList.contains('hidden')) {
        dropdown.classList.add('hidden');
      }
    });
  }
};

const renderHome = async () => {
  appContainer.innerHTML = `
    <div class="py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Catálogo 4D</h1>
        <p class="mt-2 text-gray-600">Explora nuestras creaciones únicas impresas en 4D.</p>
      </header>
      <div id="product-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="col-span-full flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    </div>
  `;

  const products = await getProducts();
  const list = document.getElementById('product-list');
  
  if (products.length === 0) {
    list.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">No hay productos disponibles en este momento.</p>`;
    return;
  }

  list.innerHTML = products.map(p => `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onclick="window.location.hash='#product/${p.id}'">
      <img src="${p.images?.[0] || 'https://picsum.photos/seed/'+p.id+'/400/300'}" class="w-full h-48 object-cover" alt="${p.name}">
      <div class="p-6">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-gray-900">${p.name}</h3>
            <p class="text-sm text-indigo-600 font-medium">${p.category}</p>
          </div>
          <span class="text-xl font-bold text-gray-900">$${p.price}</span>
        </div>
        <button onclick="event.stopPropagation(); window.dispatchEvent(new CustomEvent('add-to-cart', {detail: ${JSON.stringify(p).replace(/"/g, '&quot;')}}))" class="mt-4 w-full bg-gray-50 text-indigo-600 font-semibold py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
          Agregar al carrito
        </button>
      </div>
    </div>
  `).join('');

  window.addEventListener('add-to-cart', (e) => {
    Cart.add(e.detail);
  }, { once: true });
};

const renderProductPage = async (id) => {
  appContainer.innerHTML = `<div class="flex justify-center py-24"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>`;
  const p = await getProducts().then(prods => prods.find(x => x.id === id));
  
  if (!p) {
    renderHome();
    return;
  }

  const images = p.images?.length ? p.images : ['https://picsum.photos/seed/'+p.id+'/800/600'];

  appContainer.innerHTML = `
    <div class="py-8">
      <button onclick="window.location.hash=''" class="mb-6 flex items-center text-indigo-600 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Volver al cat\u00e1logo
      </button>
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden lg:flex">
        <div class="lg:w-1/2">
          <img id="main-product-img" src="${images[0]}" class="w-full h-96 object-cover" alt="${p.name}">
          ${images.length > 1 ? `
            <div class="flex gap-2 p-4 overflow-x-auto">
              ${images.map((img, i) => `
                <img src="${img}" data-index="${i}" class="product-thumb h-16 w-16 rounded-lg object-cover cursor-pointer border-2 ${i === 0 ? 'border-indigo-500' : 'border-transparent'} hover:border-indigo-300 transition-colors flex-shrink-0" alt="Imagen ${i+1}">
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="p-8 lg:w-1/2 flex flex-col justify-between">
          <div>
            <p class="text-sm font-bold text-indigo-600 uppercase tracking-widest">${p.category}</p>
            <h1 class="text-4xl font-extrabold text-gray-900 mt-2">${p.name}</h1>
            <p class="text-3xl font-bold text-gray-900 mt-4">$${p.price}</p>
            <div class="mt-6 prose prose-indigo text-gray-600">
              <p>${p.description || 'Una pieza única fabricada con precisión mediante impresión 4D de alta calidad.'}</p>
            </div>
          </div>
          <button id="add-btn" class="mt-8 w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `;

  // Image gallery thumbnail clicks
  document.querySelectorAll('.product-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.getElementById('main-product-img').src = thumb.src;
      document.querySelectorAll('.product-thumb').forEach(t => t.classList.replace('border-indigo-500', 'border-transparent'));
      thumb.classList.replace('border-transparent', 'border-indigo-500');
    });
  });

  document.getElementById('add-btn').onclick = () => Cart.add(p);
};

const renderCartPage = () => {
  const items = Cart.get();
  const total = Cart.getTotal();

  appContainer.innerHTML = `
    <div class="py-8">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-8">Tu Carrito</h1>
      ${items.length === 0 ? `
        <div class="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
          <p class="text-gray-500 text-lg">Tu carrito está vacío.</p>
          <button onclick="window.location.hash=''" class="mt-4 text-indigo-600 font-bold hover:underline">Ir a comprar</button>
        </div>
      ` : `
        <div class="lg:grid lg:grid-cols-12 lg:gap-12">
          <div class="lg:col-span-8 space-y-4">
            ${items.map(item => `
              <div class="bg-white p-4 rounded-2xl border border-gray-100 flex items-center">
                <img src="${item.image}" class="h-20 w-20 rounded-xl object-cover">
                <div class="ml-4 flex-1">
                  <h3 class="font-bold text-gray-900">${item.name}</h3>
                  <p class="text-indigo-600 font-medium">$${item.price}</p>
                </div>
                <div class="flex items-center space-x-3">
                  <button onclick="window.Cart.updateQuantity('${item.id}', -1)" class="p-1 rounded-full hover:bg-gray-100">-</button>
                  <span class="font-bold">${item.quantity}</span>
                  <button onclick="window.Cart.updateQuantity('${item.id}', 1)" class="p-1 rounded-full hover:bg-gray-100">+</button>
                </div>
                <button onclick="window.Cart.remove('${item.id}')" class="ml-6 text-gray-400 hover:text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            `).join('')}
          </div>
          <div class="lg:col-span-4 mt-8 lg:mt-0">
            <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
              <div class="flex justify-between text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>$${total}</span>
              </div>
              <div class="flex justify-between text-gray-600 mb-6">
                <span>Envío</span>
                <span class="text-green-600 font-medium">Gratis</span>
              </div>
              <div class="border-t pt-4 flex justify-between items-end mb-8">
                <span class="text-gray-900 font-medium">Total</span>
                <span class="text-3xl font-extrabold text-indigo-600">$${total}</span>
              </div>
              <button id="checkout-btn" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all">
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      `}
    </div>
  `;

  document.getElementById('checkout-btn')?.addEventListener('click', handleCheckout);
};

const handleCheckout = async () => {
  if (!currentUser) {
    alert('Por favor, inicia sesión para finalizar tu pedido.');
    login();
    return;
  }

  const items = Cart.get();
  const total = Cart.getTotal();

  try {
    await createOrder({
      userId: currentUser.uid,
      items,
      total
    });
    Cart.clear();
    alert('¡Pedido realizado con éxito!');
    window.location.hash = '';
  } catch (error) {
    console.error('Error al crear pedido:', error);
    alert('Hubo un error al procesar tu pedido. Intenta de nuevo.');
  }
};

const renderAdminPage = async () => {
  if (!isAdmin(currentUser)) {
    window.location.hash = '';
    return;
  }

  appContainer.innerHTML = `
    <div class="py-8 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Panel de Administración</h1>
      </div>

      <!-- Create new product form (collapsible) -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 mb-10">
        <button id="toggle-create-form" type="button" class="w-full p-8 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-3xl transition-colors">
          <h2 class="text-xl font-bold text-gray-900">Agregar Nuevo Producto</h2>
          <svg id="toggle-chevron" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div id="create-form-body" class="hidden px-8 pb-8">
          <form id="add-product-form" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" id="prod-name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripci\u00f3n</label>
              <textarea id="prod-desc" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input type="number" id="prod-price" required min="0" step="0.01" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" id="prod-stock" required min="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categor\u00eda</label>
              <input type="text" id="prod-category" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Im\u00e1genes (URLs)</label>
              <div id="prod-images-container">
                <div class="flex gap-2 mb-2">
                  <input type="url" name="prod-image" placeholder="https://..." class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
              <button type="button" id="add-image-btn" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                Agregar otra imagen
              </button>
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              Crear Producto
            </button>
          </form>
        </div>
      </div>

      <!-- Existing products list -->
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Productos Existentes</h2>
        <div id="admin-product-list">
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>

      <!-- Orders list -->
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Gesti\u00f3n de Pedidos</h2>
        <div id="admin-order-list">
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Toggle collapsible create form
  document.getElementById('toggle-create-form').addEventListener('click', () => {
    const body = document.getElementById('create-form-body');
    const chevron = document.getElementById('toggle-chevron');
    body.classList.toggle('hidden');
    chevron.style.transform = body.classList.contains('hidden') ? '' : 'rotate(180deg)';
  });

  // Add image input for create form
  document.getElementById('add-image-btn').addEventListener('click', () => {
    const container = document.getElementById('prod-images-container');
    const row = document.createElement('div');
    row.className = 'flex gap-2 mb-2';
    row.innerHTML = `
      <input type="url" name="prod-image" placeholder="https://..." class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
      <button type="button" class="text-gray-400 hover:text-red-500 px-2" title="Quitar">&times;</button>
    `;
    row.querySelector('button').addEventListener('click', () => row.remove());
    container.appendChild(row);
  });

  // Handle create form
  document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    const newProduct = {
      name: document.getElementById('prod-name').value,
      description: document.getElementById('prod-desc').value,
      price: parseFloat(document.getElementById('prod-price').value),
      stock: parseInt(document.getElementById('prod-stock').value, 10),
      category: document.getElementById('prod-category').value,
      images: (() => { const imgs = [...document.querySelectorAll('[name="prod-image"]')].map(i => i.value).filter(v => v); return imgs.length ? imgs : ['https://picsum.photos/seed/' + Date.now() + '/400/300']; })(),
      active: true
    };

    try {
      await createProduct(newProduct);
      alert('Producto creado exitosamente!');
      renderAdminPage(); // Refresh the admin page to show the new product
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Hubo un error al crear el producto.');
      btn.disabled = false;
      btn.textContent = 'Crear Producto';
    }
  });

  // Load existing products and orders
  const [products, orders] = await Promise.all([getProducts(), getAllOrders()]);
  
  const productListContainer = document.getElementById('admin-product-list');
  const orderListContainer = document.getElementById('admin-order-list');

  // Render Products
  if (!products || products.length === 0) {
    productListContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No hay productos a\u00fan.</p>';
  } else {
    productListContainer.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="pb-3 text-sm font-semibold text-gray-500">Imagen</th>
              <th class="pb-3 text-sm font-semibold text-gray-500">Nombre</th>
              <th class="pb-3 text-sm font-semibold text-gray-500">Categor\u00eda</th>
              <th class="pb-3 text-sm font-semibold text-gray-500">Precio</th>
              <th class="pb-3 text-sm font-semibold text-gray-500">Stock</th>
              <th class="pb-3 text-sm font-semibold text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-3 pr-4">
                  <img src="${p.images?.[0] || 'https://picsum.photos/seed/'+p.id+'/400/300'}" class="h-12 w-12 rounded-lg object-cover" alt="${p.name}">
                </td>
                <td class="py-3 pr-4 font-medium text-gray-900">${p.name}</td>
                <td class="py-3 pr-4 text-sm text-indigo-600">${p.category}</td>
                <td class="py-3 pr-4 font-bold text-gray-900">$${p.price}</td>
                <td class="py-3 pr-4 text-sm text-gray-600">${p.stock ?? '\u2014'}</td>
                <td class="py-3">
                  <button onclick="window.location.hash='#admin/edit/${p.id}'" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                    Editar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Render Orders
  if (!orders || orders.length === 0) {
    orderListContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No hay pedidos a\u00fan.</p>';
  } else {
    orderListContainer.innerHTML = `
      <div class="space-y-4">
        ${orders.map(order => {
          const statuses = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];
          return `
            <div class="border border-gray-100 rounded-2xl p-4 md:flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div class="mb-4 md:mb-0">
                <div class="flex items-center gap-3 mb-1">
                  <span class="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">ID: ${order.id.slice(0,8)}...</span>
                  <span class="text-sm font-medium text-gray-500">${new Date(order.createdAt?.toDate?.() || Date.now()).toLocaleString()}</span>
                </div>
                <div class="text-gray-900 text-sm mb-2">
                  <span class="font-medium text-gray-500 mr-1">Usuario:</span> ${order.userId}
                </div>
                <div class="font-medium text-gray-900 line-clamp-2 text-sm max-w-lg">
                  ${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                </div>
                <div class="mt-2 text-indigo-600 font-bold">$${order.total}</div>
              </div>
              <div class="flex items-center bg-gray-100 rounded-lg p-1">
                <select onchange="window._updateOrderStatus('${order.id}', this.value)" class="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer ${
                  order.status?.toLowerCase() === 'entregado' ? 'text-green-600' : 
                  order.status?.toLowerCase() === 'cancelado' ? 'text-red-600' : 'text-indigo-600'
                }">
                  ${statuses.map(s => `<option value="${s.toLowerCase()}" ${order.status?.toLowerCase() === s.toLowerCase() ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};

const renderEditProductPage = async (id) => {
  if (!isAdmin(currentUser)) {
    window.location.hash = '';
    return;
  }

  appContainer.innerHTML = `<div class="flex justify-center py-24"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>`;
  const p = await getProduct(id);

  if (!p) {
    alert('Producto no encontrado.');
    window.location.hash = '#admin';
    return;
  }

  appContainer.innerHTML = `
    <div class="py-8 max-w-2xl mx-auto">
      <button onclick="window.location.hash='#admin'" class="mb-6 flex items-center text-indigo-600 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Volver al panel
      </button>
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Editar Producto</h2>
        <form id="edit-product-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" id="edit-name" required value="${p.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea id="edit-desc" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">${p.description || ''}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
              <input type="number" id="edit-price" required min="0" step="0.01" value="${p.price}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" id="edit-stock" required min="0" value="${p.stock || 0}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input type="text" id="edit-category" required value="${p.category}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Im\u00e1genes (URLs)</label>
            <div id="edit-images-container">
              ${(p.images || ['']).map(img => `
                <div class="flex gap-2 mb-2">
                  <input type="url" name="edit-image" value="${img}" placeholder="https://..." class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                  <button type="button" class="remove-edit-img text-gray-400 hover:text-red-500 px-2" title="Quitar">&times;</button>
                </div>
              `).join('')}
            </div>
            <button type="button" id="add-edit-image-btn" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              Agregar otra imagen
            </button>
          </div>
          <div class="flex items-center space-x-3">
            <input type="checkbox" id="edit-active" ${p.active ? 'checked' : ''} class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
            <label for="edit-active" class="text-sm font-medium text-gray-700">Producto activo (visible en el catálogo)</label>
          </div>
          <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  `;
  // Add image input for edit form
  document.getElementById('add-edit-image-btn').addEventListener('click', () => {
    const container = document.getElementById('edit-images-container');
    const row = document.createElement('div');
    row.className = 'flex gap-2 mb-2';
    row.innerHTML = `
      <input type="url" name="edit-image" placeholder="https://..." class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
      <button type="button" class="remove-edit-img text-gray-400 hover:text-red-500 px-2" title="Quitar">&times;</button>
    `;
    row.querySelector('button').addEventListener('click', () => row.remove());
    container.appendChild(row);
  });

  // Remove image buttons for existing rows
  document.querySelectorAll('.remove-edit-img').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.flex').remove());
  });

  document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    const updatedData = {
      name: document.getElementById('edit-name').value,
      description: document.getElementById('edit-desc').value,
      price: parseFloat(document.getElementById('edit-price').value),
      stock: parseInt(document.getElementById('edit-stock').value, 10),
      category: document.getElementById('edit-category').value,
      images: [...document.querySelectorAll('[name="edit-image"]')].map(i => i.value).filter(v => v),
      active: document.getElementById('edit-active').checked
    };

    try {
      await updateProduct(id, updatedData);
      alert('Producto actualizado exitosamente!');
      window.location.hash = '#admin';
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Hubo un error al actualizar el producto.');
      btn.disabled = false;
      btn.textContent = 'Guardar Cambios';
    }
  });
};

const renderOrdersPage = async () => {
  if (!currentUser) {
    window.location.hash = '';
    return;
  }

  appContainer.innerHTML = `<div class="flex justify-center py-24"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>`;
  const orders = await getOrders(currentUser.uid);

  appContainer.innerHTML = `
    <div class="py-8 max-w-4xl mx-auto">
      <button onclick="window.location.hash=''" class="mb-6 flex items-center text-indigo-600 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Volver
      </button>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Mis Compras</h1>
      </div>
      ${!orders || orders.length === 0 ? `
        <div class="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p class="text-gray-500 text-lg">A\u00fan no has realizado ning\u00fan pedido.</p>
          <button onclick="window.location.hash=''" class="mt-4 text-indigo-600 font-bold hover:underline">Ir al cat\u00e1logo</button>
        </div>
      ` : `
        <div class="space-y-6">
          ${orders.map(order => `
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p class="text-sm text-gray-500 mb-1">Pedido del ${new Date(order.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</p>
                <div class="font-medium text-gray-900 mb-2">
                  ${order.items.map(item => `<span class="inline-block bg-gray-50 px-2 py-1 rounded text-sm border border-gray-100 mr-2 mb-2">${item.quantity}x ${item.name}</span>`).join('')}
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  ${order.status || 'Pendiente'}
                </span>
              </div>
              <div class="mt-4 md:mt-0 text-left md:text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                <p class="text-sm text-gray-500 mb-1">Total</p>
                <p class="text-2xl font-bold text-indigo-600">$${order.total}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
};

// Expose Cart to window for inline onclicks
window.Cart = Cart;

// Expose admin helper functions
window._updateOrderStatus = async (orderId, newStatus) => {
  try {
    await updateOrderStatus(orderId, newStatus);
    // Visual feedback handled by select box itself immediately
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium animate-pulse';
    toast.textContent = 'Estado actualizado';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  } catch (error) {
    console.error('Failed to update status:', error);
    alert('Error al actualizar el estado del pedido.');
  }
};
