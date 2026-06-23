// JUAN STORE - Main JavaScript
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
    initCarousel();
    initHeroTitle();
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
    showcase.innerHTML = showcaseProducts.map((product, i) => {
        const imgPath = 'images/' + product.image;
        return '<div class="tilt-container"><div class="showcase-card tilt-card" data-id="' + product.id + '" style="animation-delay:' + (0.05 + i * 0.07) + 's">' +
            '<img src="' + imgPath + '" alt="' + product.name + '" loading="lazy" onclick="openLightbox(' + product.id + ')">' +
            '<div class="card-glow"></div>' +
            '<div class="card-info">' +
                '<div class="card-brand">' + product.brand + '</div>' +
                '<div class="card-name">' + product.name + '</div>' +
                '<div class="card-price">' + formatPrice(product.price) + '</div>' +
            '</div>' +
        '</div></div>';
    }).join('');
    setTimeout(initTilt, 100);
}

function displayCatalog(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = products.map((product, index) => {
        const imgPath = 'images/' + product.image;
        const noteHtml = product.note ? '<div class=\"product-note\">' + product.note + '</div>' : '';
        return '<div class=\"product-card tilt-card\" data-id=\"' + product.id + '\" style=\"animation-delay:' + (0.03 * (index % 8)) + 's\">' +
            '<img src=\"' + imgPath + '\" alt=\"' + product.name + '\" loading=\"lazy\" onclick=\"openLightbox(' + product.id + ')\">' +
            '<div class=\"card-glow\"></div>' +
            '<div class=\"product-info\">' +
                '<div class=\"product-brand\">' + product.brand + '</div>' +
                '<div class=\"product-name\">' + product.name + '</div>' +
                '<div class=\"product-price\">' + formatPrice(product.price) + '</div>' +
                '<div class=\"product-sizes\">Tallas: ' + product.sizes + '</div>' +
                noteHtml +
                '<button class=\"add-to-cart\" onclick=\"event.stopPropagation(); addToCartWithFly(this, ' + product.id + ')\" style=\"margin-top:0.8rem;width:100%;padding:0.6rem;background:var(--black);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;position:relative;overflow:hidden;\"><i class=\"fas fa-cart-plus\"></i> Agregar al carrito</button>' +
            '</div>' +
        '</div>';
    }).join('');
    setTimeout(initTilt, 100);
    initScrollAnimations();
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

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

const WHATSAPP_NUMBER = '573247432471';

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

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank');
    showToast('Abriendo WhatsApp...', 'success');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<i class=\"fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '\"></i><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('exit'); setTimeout(() => toast.remove(), 500); }, 3000);
}

function initScrollAnimations() {
    const observerOptions = { threshold: 0.08, rootMargin: '0px 0px -40px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-in').forEach(el => {
        if (!el.classList.contains('visible')) observer.observe(el);
    });
    document.querySelectorAll('section').forEach(el => {
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

function initCarousel() {
    const carousel = document.getElementById('heroBgCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    if (!carousel || !dotsContainer) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let carouselInterval;
    
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    
    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = index;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }
    
    function startCarousel() {
        carouselInterval = setInterval(nextSlide, 7000);
    }
    
    function stopCarousel() {
        clearInterval(carouselInterval);
    }
    
    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);
    
    startCarousel();
}

document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// =============================================
//   3D TILT EFFECT ON CARDS
// =============================================
function initTilt() {
    const cards = document.querySelectorAll('.showcase-card, .product-card');
    cards.forEach(card => {
        let timeout;
        card.addEventListener('mousemove', function(e) {
            if (timeout) cancelAnimationFrame(timeout);
            timeout = requestAnimationFrame(() => {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                const glow = this.querySelector('.card-glow');
                if (glow) {
                    const px = (x / rect.width) * 100;
                    const py = (y / rect.height) * 100;
                    glow.style.setProperty('--mx', px + '%');
                    glow.style.setProperty('--my', py + '%');
                }
                if (!this.classList.contains('in-tilt')) {
                    this.classList.add('in-tilt');
                    this.style.transition = 'none';
                }
                this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px) scale(1.02)';
            });
        });
        card.addEventListener('mouseleave', function() {
            if (timeout) cancelAnimationFrame(timeout);
            this.classList.remove('in-tilt');
            this.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.6s ease';
            this.style.transform = '';
        });
    });
}

// =============================================
//   MAGNETIC BUTTONS
// =============================================
function initMagnetic() {
    const magnets = document.querySelectorAll('.btn-checkout, .btn-download, .header-whatsapp, .whatsapp-float');
    magnets.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            this.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// =============================================
//   FLY TO CART ANIMATION
// =============================================
function flyToCart(element) {
    const cartBtn = document.getElementById('cartBtn');
    if (!cartBtn) return;
    const startRect = element.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();
    const flyer = element.cloneNode(true);
    flyer.className = 'fly-item';
    flyer.style.position = 'fixed';
    flyer.style.zIndex = '3000';
    flyer.style.pointerEvents = 'none';
    flyer.style.width = startRect.width + 'px';
    flyer.style.height = startRect.height + 'px';
    flyer.style.top = startRect.top + 'px';
    flyer.style.left = startRect.left + 'px';
    flyer.style.objectFit = 'cover';
    flyer.style.borderRadius = '8px';
    document.body.appendChild(flyer);
    const dx = endRect.left + endRect.width / 2 - startRect.left - startRect.width / 2;
    const dy = endRect.top + endRect.height / 2 - startRect.top - startRect.height / 2;
    flyer.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: 'translate(' + (dx * 0.5) + 'px, ' + (dy * 0.5) + 'px) scale(0.5)', opacity: 0.8, offset: 0.5 },
        { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.1)', opacity: 0 }
    ], { duration: 800, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }).onfinish = function() {
        flyer.remove();
    };
}

// =============================================
//   ANIMATED COUNTER
// =============================================
function animateCounter(element, target) {
    if (!element) return;
    const current = parseInt(element.textContent) || 0;
    const start = 0;
    const duration = 400;
    const startTime = performance.now();
    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(start + (target - start) * eased);
        element.textContent = value + ' producto' + (value !== 1 ? 's' : '');
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// Override updateResultsCount with animation
function updateResultsCount() {
    const el = document.getElementById('resultsCount');
    if (el) animateCounter(el, filteredProducts.length);
}

// =============================================
//   PARALLAX HERO ON SCROLL
// =============================================
function initParallax() {
    const hero = document.querySelector('.hero-bg-carousel');
    const overlay = document.querySelector('.carousel-overlay');
    if (!hero) return;
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                const scrollY = window.scrollY;
                const maxScroll = window.innerHeight;
                if (scrollY <= maxScroll) {
                    const progress = scrollY / maxScroll;
                    hero.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
                    if (overlay) overlay.style.opacity = 1 - progress * 0.3;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

function addToCartWithFly(btn, productId) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.marginLeft = -(size / 2) + 'px';
    ripple.style.marginTop = -(size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function() { ripple.remove(); }, 600);
    const img = btn.closest('.product-card, .showcase-card')?.querySelector('img');
    if (img) flyToCart(img);
    addToCart(productId);
}

function initEffects() {
    initMagnetic();
    initParallax();
}

// =============================================
//   HERO TITLE LETTER ANIMATION
// =============================================
function initHeroTitle() {
    const title = document.getElementById('heroTitle');
    if (!title) return;
    const text = title.textContent;
    const letters = [];
    let disintegrating = false;
    let reassembleTimer;

    title.textContent = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const span = document.createElement('span');
        span.className = 'letter' + (char === ' ' ? ' space' : '');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = (0.07 * i) + 's';
        span.dataset.index = i;
        title.appendChild(span);
        letters.push(span);
    }

    const totalDuration = text.length * 0.07 * 1000 + 1200;

    function addFloatAnimation() {
        letters.forEach((letter, i) => {
            if (letter.classList.contains('space')) return;
            letter.classList.add('float');
        });
    }

    setTimeout(addFloatAnimation, totalDuration);

    function disintegrate() {
        if (disintegrating) return;
        disintegrating = true;
        clearTimeout(reassembleTimer);
        letters.forEach((letter, i) => {
            if (letter.classList.contains('space')) return;
            letter.classList.remove('float');
            const angle = (i / letters.length) * 360;
            const rot = 60 + Math.random() * 180;
            const z = -80 - Math.random() * 150;
            const y = 30 + Math.random() * 80;
            const x = (Math.random() - 0.5) * 120;
            letter.style.setProperty('--rot', rot + 'deg');
            letter.style.setProperty('--z', z + 'px');
            letter.style.setProperty('--y', y + 'px');
            letter.style.setProperty('--x', x + 'px');
            letter.style.animation = 'none';
            void letter.offsetWidth;
            letter.style.animation = 'disintegrate 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards';
            letter.style.animationDelay = (i * 0.025) + 's';
        });
        addSparkles();
    }

    function addSparkles() {
        const rect = title.getBoundingClientRect();
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('span');
            sparkle.className = 'letter sparkle';
            sparkle.style.cssText = 'position:fixed;width:6px;height:6px;background:rgba(255,255,255,0.9);border-radius:50%;pointer-events:none;z-index:10;box-shadow:0 0 10px rgba(255,255,255,0.6);animation:sparkleFlash ' + (0.4 + Math.random() * 0.6) + 's ease-out forwards;';
            sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
            document.body.appendChild(sparkle);
            setTimeout(function() { sparkle.remove(); }, 1500);
        }
    }

    function reassemble() {
        disintegrating = false;
        letters.forEach((letter, i) => {
            if (letter.classList.contains('space')) return;
            letter.style.animation = 'none';
            void letter.offsetWidth;
            letter.style.animation = 'reassemble 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
            letter.style.animationDelay = (i * 0.04) + 's';
        });
        const reassembleDuration = letters.length * 0.04 * 1000 + 1000;
        setTimeout(function() {
            letters.forEach(function(l) {
                if (!l.classList.contains('space')) l.classList.add('float');
            });
        }, reassembleDuration);
    }

    title.addEventListener('mouseenter', function() {
        clearTimeout(reassembleTimer);
        disintegrate();
    });

    title.addEventListener('mouseleave', function() {
        reassembleTimer = setTimeout(reassemble, 200);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initEffects, 500);
});
