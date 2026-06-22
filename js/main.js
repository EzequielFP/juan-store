// JUAN STORE - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    initScrollAnimations();
});

function loadProducts() {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            displayProducts(data.products);
        })
        .catch(error => {
            console.error('Error loading products:', error);
            document.getElementById('productGrid').innerHTML = 
                '<p style="text-align: center; color: #ff3e3e; padding: 3rem;">Error al cargar los productos. Por favor, intenta mas tarde.</p>';
        });
}

function displayProducts(products) {
    const grid = document.getElementById('productGrid');
    
    if (!grid) return;
    
    grid.innerHTML = products.map((product, index) => {
        const noteHtml = product.note 
            ? '<div class="product-note"><i class="fas fa-exclamation-circle"></i> ' + product.note + '</div>' 
            : '';
        
        return '<div class="product-card fade-in stagger-' + ((index % 6) + 1) + '" data-id="' + product.id + '">' +
            '<div class="product-image-container">' +
                '<img src="images/' + product.image + '" alt="' + product.name + '" class="product-image" loading="lazy">' +
                '<div class="product-overlay">' +
                    '<span><i class="fas fa-eye"></i> Ver detalles</span>' +
                '</div>' +
            '</div>' +
            '<div class="product-info">' +
                '<div class="product-brand"><i class="fas fa-tag"></i> ' + product.brand + '</div>' +
                '<h3 class="product-name">' + product.name + '</h3>' +
                '<div class="product-price">' + formatPrice(product.price) + '</div>' +
                '<div class="product-sizes"><i class="fas fa-ruler"></i> Tallas: ' + product.sizes + '</div>' +
                noteHtml +
            '</div>' +
        '</div>';
    }).join('');
    
    // Re-initialize scroll animations for new elements
    initScrollAnimations();
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        if (!el.classList.contains('visible')) {
            observer.observe(el);
        }
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
