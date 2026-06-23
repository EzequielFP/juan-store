// JUAN STORE - Main JavaScript (CORREGIDO FILTROS + WHATSAPP)
let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentLightboxIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    initScrollAnimations();
    initHeaderScroll();
    initLightbox();
    initCart();
    initFilters();
});

function loadProducts() {
    console.log('Cargando productos...');
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            allProducts = data.products;
            filteredProducts = [...allProducts];
            console.log('Productos cargados:', allProducts.length);
            displayShowcase(allProducts);
            displayCatalog(allProducts);
            populateFilters(allProducts);
            populateBrands(allProducts);
            updateResultsCount();
        })
        .catch(error => console.error('Error loading products:', error));
}

function displayShowcase(products) {
    const showcase = document.getElementById('productsShowcase');
    if (!showcase) return;
    const showcaseProducts = products.slice(0, 6);
    showcase.innerHTML = showcaseProducts.map(product => {
        const imgPath = 'images/' + product.image;
        return '<div class=\"showcase-card\" data-id=\"' + product.id + '\">' +
            '<img src=\"' + imgPath + '\" alt=\"' + product.name + '\" loading=\"lazy\" onclick=\"openLightbox(' + product.id + ')\">' +
            '<div class=\"card-info\">' +
                '<div class=\"card-brand\">' + product.brand + '</div>' +
                '<div class=\"card-name\">' + product.name + '</div>' +
                '<div class=\"card-price\">' + formatPrice(product.price) + '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function displayCatalog(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = products.map((product, index) => {
        const imgPath = 'images/' + product.image;
        const noteHtml = product.note ? '<div class=\"product-note\">' + product.note + '</div>' : '';
        return '<div class=\"product-card fade-in stagger-' + ((index % 6) + 1) + '\" data-id=\"' + product.id + '\">' +
            '<img src=\"' + imgPath + '\" alt=\"' + product.name + '\" loading=\"lazy\" onclick=\"openLightbox(' + product.id + ')\">' +
            '<div class=\"product-info\">' +
                '<div class=\"product-brand\">' + product.brand + '</div>' +
                '<div class=\"product-name\">' + product.name + '</div>' +
                '<div class=\"product-price\">' + formatPrice(product.price) + '</div>' +
                '<div class=\"product-sizes\">Tallas: ' + product.sizes + '</div>' +
                noteHtml +
                '<button class=\"add-to-cart\" onclick=\"event.stopPropagation(); addToCart(' + product.id + ')\" style=\"margin-top:0.8rem;width:100%;padding:0.6rem;background:var(--black);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;\"><i class=\"fas fa-cart-plus\"></i> Agregar al carrito</button>' +
            '</div>' +
        '</div>';
    }).join('');
    initScrollAnimations();
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

// ============= FILTROS =============
function populateFilters(products) {
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
    const brandSelect = document.getElementById('filterBrand');
    if (brandSelect) {
        brands.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            brandSelect.appendChild(opt);
        });
    }
    const sizes = new Set();
    products.forEach(p => {
        if (p.sizes) {
            const nums = p.sizes.match(/\d+/g);
            if (nums) nums.forEach(n => sizes.add(n));
        }
    });
    const sizeSelect = document.getElementById('filterSize');
    if (sizeSelect) {
        [...sizes].sort((a,b) => parseInt(a) - parseInt(b)).forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = 'Euro ' + s;
            sizeSelect.appendChild(opt);
        });
    }
    ['filterBrand','filterCategory','filterPrice','filterSize'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyFilters);
    });
    document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
}

function applyFilters() {
    const brand = document.getElementById('filterBrand')?.value || '';
    const category = document.getElementById('filterCategory')?.value || '';
    const priceRange = document.getElementById('filterPrice')?.value || '';
    const size = document.getElementById('filterSize')?.value || '';

    filteredProducts = allProducts.filter(p => {
        if (brand && p.brand !== brand) return false;
        if (category && p.category !== category) return false;
        if (priceRange) {
            const parts = priceRange.split('-');
            const min = parseInt(parts[0]) || 0;
            const max = parseInt(parts[1]) || Infinity;
            if (p.price < min || p.price > max) return false;
        }
        if (size) {
            const nums = (p.sizes || '').match(/\d+/g);
            if (!nums || !nums.includes(size)) return false;
        }
        return true;
    });

    displayCatalog(filteredProducts);
    updateResultsCount();
}

function clearFilters() {
    ['filterBrand','filterCategory','filterPrice','filterSize'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    filteredProducts = [...allProducts];
    displayCatalog(filteredProducts);
    updateResultsCount();
}

function updateResultsCount() {
    const el = document.getElementById('resultsCount');
    if (el) el.textContent = filteredProducts.length + ' producto' + (filteredProducts.length !== 1 ? 's' : '');
}

function populateBrands(products) {
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
    const grid = document.getElementById('brandsGrid');
    if (grid) grid.innerHTML = brands.map(b => '<span>' + b + '</span>').join('');
}

// ============= LIGHTBOX =============
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', () => navigateLightbox(-1));
    nextBtn?.addEventListener('click', () => navigateLightbox(1));
    lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

function openLightbox(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    currentLightboxIndex = allProducts.findIndex(p => p.id === productId);
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const info = document.getElementById('lightboxInfo');
    img.src = 'images/' + product.image;
    img.alt = product.name;
    info.innerHTML = '<h4>' + product.name + '</h4><p>' + product.brand + ' | ' + formatPrice(product.price) + ' | Tallas: ' + product.sizes + (product.note ? ' | ' + product.note : '') + '</p>';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox')?.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(dir) {
    currentLightboxIndex = (currentLightboxIndex + dir + allProducts.length) % allProducts.length;
    openLightbox(allProducts[currentLightboxIndex].id);
}

// ============= CARRITO =============
function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCart');

    cartBtn?.addEventListener('click', openCart);
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
    checkoutBtn?.addEventListener('click', checkoutWhatsApp);
    clearCartBtn?.addEventListener('click', clearCart);

    const saved = localStorage.getItem('victoria79_cart');
    if (saved) cart = JSON.parse(saved);
    updateCartUI();
}

function openCart() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image, ref: product.ref, sizes: product.sizes, qty: 1 });
    }
    saveCart();
    updateCartUI();
    showToast('Agregado al carrito: ' + product.name, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(productId);
    else { saveCart(); updateCartUI(); }
}

function saveCart() {
    localStorage.setItem('victoria79_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartItemsCount = document.getElementById('cartItemsCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (cartCount) cartCount.textContent = totalItems;
    if (cartItemsCount) cartItemsCount.textContent = '(' + totalItems + ')';
    if (cartTotal) cartTotal.textContent = formatPrice(totalPrice);
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class=\"cart-empty\"><i class=\"fas fa-shopping-bag\" style=\"font-size:3rem;margin-bottom:1rem;color:var(--gray-300)\"></i><p>Tu carrito esta vacio</p></div>';
        } else {
            cartItems.innerHTML = cart.map(item => {
                const imgPath = 'images/' + item.image;
                return '<div class=\"cart-item\">' +
                    '<img src=\"' + imgPath + '\" alt=\"' + item.name + '\">' +
                    '<div class=\"cart-item-info\">' +
                        '<div class=\"cart-item-name\">' + item.name + '</div>' +
                        '<div class=\"cart-item-price\">' + formatPrice(item.price) + ' c/u</div>' +
                        '<div class=\"cart-item-qty\">' +
                            '<button class=\"qty-btn\" onclick=\"updateQty(' + item.id + ', -1)\">-</button>' +
                            '<span>' + item.qty + '</span>' +
                            '<button class=\"qty-btn\" onclick=\"updateQty(' + item.id + ', 1)\">+</button>' +
                            '<button class=\"cart-item-remove\" onclick=\"removeFromCart(' + item.id + ')\"><i class=\"fas fa-trash\"></i></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    showToast('Carrito vaciado', 'success');
}

function checkoutWhatsApp() {
    if (cart.length === 0) return;
    
    let message = 'Hola Victoria 79! Quiero hacer este pedido:\n\n';
    let total = 0;
    
    cart.forEach((item, i) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += (i+1) + '. ' + item.name + ' (' + item.brand + ')\n';
        message += '   Ref: ' + (item.ref || 'N/A') + ' | Tallas: ' + item.sizes + '\n';
        message += '   Cantidad: ' + item.qty + ' x ' + formatPrice(item.price) + ' = ' + formatPrice(subtotal) + '\n\n';
    });
    
    message += 'TOTAL: ' + formatPrice(total) + '\n\n';
    message += 'Datos de envio:\n';
    message += 'Nombre:\n';
    message += 'Direccion:\n';
    message += 'Ciudad:\n';
    message += 'Telefono:\n';

    window.open('https://wa.me/573184170976?text=' + encodeURIComponent(message), '_blank');
    showToast('Abriendo WhatsApp...', 'success');
}

// ============= TOAST =============
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<i class=\"fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '\"></i><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'slideIn 0.3s ease reverse'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ============= SCROLL ANIMATIONS =============
function initScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-in').forEach(el => {
        if (!el.classList.contains('visible')) observer.observe(el);
    });
}

function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
}

// ============= SMOOTH SCROLL =============
document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
