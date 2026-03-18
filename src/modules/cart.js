export const Cart = {
  get() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  },
  
  add(product) {
    let cart = this.get();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || 'https://picsum.photos/seed/3d/200',
        quantity: 1
      });
    }
    this.save(cart);
  },
  
  updateQuantity(productId, delta) {
    let cart = this.get();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
      }
    }
    this.save(cart);
  },
  
  remove(productId) {
    const cart = this.get().filter(item => item.id !== productId);
    this.save(cart);
  },
  
  clear() {
    localStorage.removeItem('cart');
    this.notify();
  },
  
  save(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.notify();
  },
  
  getTotal() {
    return this.get().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  notify() {
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }
};
