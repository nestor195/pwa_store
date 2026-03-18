import { getProducts, createOrder, createProduct } from './api/db.js';
import { Cart } from './modules/cart.js';
import { login, logout, observeAuth, isAdmin } from './api/auth.js';

const appContainer = document.getElementById('app');
let currentUser = null;

export const initUI = () => {
  observeAuth((user) => {
    currentUser = user;
    renderNavbar();
    renderHome();
  });

  window.addEventListener('cart-updated', () => {
    if (window.location.hash === '#cart') renderCartPage();
    renderNavbar();
  });

  // Simple router
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '#cart') renderCartPage();
    else if (hash === '#admin') renderAdminPage();
    else if (hash.startsWith('#product/')) renderProductPage(hash.split('/')[1]);
    else renderHome();
  });
};

const renderNavbar = () => {
  const cartCount = Cart.get().reduce((sum, item) => sum + item.quantity, 0);
  const nav = document.getElementById('navbar');
  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex-shrink-0 flex items-center cursor-pointer" onclick="window.location.hash=''">
          <span class="text-2xl font-bold text-indigo-600">3DPrint</span>
        </div>
        <div class="flex items-center space-x-4">
          <button onclick="window.location.hash='#cart'" class="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            ${cartCount > 0 ? `<span class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">${cartCount}</span>` : ''}
          </button>
          ${currentUser ? `
            <div class="flex items-center space-x-2">
              ${isAdmin(currentUser) ? `<button onclick="window.location.hash='#admin'" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 mr-4">Admin Panel</button>` : ''}
              <img src="${currentUser.photoURL}" class="h-8 w-8 rounded-full border border-gray-200">
              <button id="logout-btn" class="text-sm font-medium text-gray-700 hover:text-red-600">Salir</button>
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
};

const renderHome = async () => {
  appContainer.innerHTML = `
    <div class="py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Catálogo 3D</h1>
        <p class="mt-2 text-gray-600">Explora nuestras creaciones únicas impresas en 3D.</p>
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
  const p = await getProducts().then(prods => prods.find(x => x.id === id)); // Simple find for demo
  
  if (!p) {
    renderHome();
    return;
  }

  appContainer.innerHTML = `
    <div class="py-8">
      <button onclick="window.location.hash=''" class="mb-6 flex items-center text-indigo-600 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Volver al catálogo
      </button>
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden lg:flex">
        <div class="lg:w-1/2">
          <img src="${p.images?.[0] || 'https://picsum.photos/seed/'+p.id+'/800/600'}" class="w-full h-96 object-cover" alt="${p.name}">
        </div>
        <div class="p-8 lg:w-1/2 flex flex-col justify-between">
          <div>
            <p class="text-sm font-bold text-indigo-600 uppercase tracking-widest">${p.category}</p>
            <h1 class="text-4xl font-extrabold text-gray-900 mt-2">${p.name}</h1>
            <p class="text-3xl font-bold text-gray-900 mt-4">$${p.price}</p>
            <div class="mt-6 prose prose-indigo text-gray-600">
              <p>${p.description || 'Una pieza única fabricada con precisión mediante impresión 3D de alta calidad.'}</p>
            </div>
          </div>
          <button id="add-btn" class="mt-8 w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `;

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

const renderAdminPage = () => {
  if (!isAdmin(currentUser)) {
    window.location.hash = '';
    return;
  }

  appContainer.innerHTML = `
    <div class="py-8 max-w-2xl mx-auto">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-8">Panel de Administración</h1>
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Agregar Nuevo Producto</h2>
        <form id="add-product-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" id="prod-name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input type="text" id="prod-category" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL de la Imagen (Opcional)</label>
            <input type="url" id="prod-image" placeholder="https://..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
            Crear Producto
          </button>
        </form>
      </div>
    </div>
  `;

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
      images: [document.getElementById('prod-image').value || 'https://picsum.photos/seed/' + Date.now() + '/400/300'],
      active: true
    };

    try {
      await createProduct(newProduct);
      alert('Producto creado exitosamente!');
      window.location.hash = ''; // Go back to home to see the new product
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Hubo un error al crear el producto.');
      btn.disabled = false;
      btn.textContent = 'Crear Producto';
    }
  });
};

// Expose Cart to window for inline onclicks
window.Cart = Cart;
