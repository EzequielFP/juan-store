// JUAN STORE - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando...');
    loadProducts();
    initScrollAnimations();
    initHeaderScroll();
});

function loadProducts() {
    console.log('Cargando products.json...');
    fetch('products.json')
        .then(response => {
            console.log('Respuesta:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Productos cargados:', data.products.length);
            displayShowcase(data.products);
            displayCatalog(data.products);
        })
        .catch(error => {
            console.error('Error loading products:', error);
        });
}

function displayShowcase(products) {
    const showcase = document.getElementById('productsShowcase');
    if (!showcase) {
        console.error('No se encontró productsShowcase');
        return;
    }
    
    const showcaseProducts = products.slice(0, 6);
    console.log('Mostrando', showcaseProducts.length, 'productos en showcase');
    
    showcase.innerHTML = showcaseProducts.map(product => {
        const imgPath = 'images/' + product.image;
        console.log('Imagen:', imgPath);
        return '<div class=\"showcase-card\">' +
            '<img src=\"' + imgPath + '\" alt=\"' + product.name + '\" loading=\"lazy\" onerror=\"this.src=\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg==\'\" />' +
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
    if (!grid) {
        console.error('No se encontró productGrid');
        return;
    }
    
    console.log('Mostrando', products.length, 'productos en catálogo');
    
    grid.innerHTML = products.map((product, index) => {
        const imgPath = 'images/' + product.image;
        const noteHtml = product.note 
            ? '<div class=\"product-note\">' + product.note + '</div>' 
            : '';
        
        return '<div class=\"product-card fade-in stagger-' + ((index % 6) + 1) + '\">' +
            '<img src=\"' + imgPath + '\" alt=\"' + product.name + '\" loading=\"lazy\" onerror=\"this.src=\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg==\'\" />' +
            '<div class=\"product-info\">' +
                '<div class=\"product-brand\">' + product.brand + '</div>' +
                '<div class=\"product-name\">' + product.name + '</div>' +
                '<div class=\"product-price\">' + formatPrice(product.price) + '</div>' +
                '<div class=\"product-sizes\">Tallas: ' + product.sizes + '</div>' +
                noteHtml +
            '</div>' +
        '</div>';
    }).join('');
    
    // Re-init scroll animations
    initScrollAnimations();
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
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

function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Smooth scroll
document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
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
