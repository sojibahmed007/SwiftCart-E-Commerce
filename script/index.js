/**
 * SwiftCart E-Commerce - Main Application Logic
 * Modern, robust, feature-packed client-side store
 */

// --- Global Application State ---
const state = {
    products: typeof INITIAL_PRODUCTS !== 'undefined' ? [...INITIAL_PRODUCTS] : [],
    filteredProducts: [],
    categories: [],
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'default',
    cart: JSON.parse(localStorage.getItem('swiftcart_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('swiftcart_wishlist') || '[]'),
    promoCode: localStorage.getItem('swiftcart_promo') || null,
    discountPercent: localStorage.getItem('swiftcart_discount') ? Number(localStorage.getItem('swiftcart_discount')) : 0,
    activeView: 'home', // 'home' | 'products' | 'about' | 'contact'
    currentProductDetails: null,
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initApp();
    setupEventListeners();
    setupModernDialogDismissal();
    startFlashSaleCountdown();
});

async function initApp() {
    renderCart();
    renderWishlistBadge();
    
    // Initial render with fallback data (instant 0ms render)
    extractCategories();
    renderCategories();
    applyFiltersAndSort();
    renderTrendingProducts();

    // Fetch fresh data from API asynchronously
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (response.ok) {
            const freshProducts = await response.json();
            if (Array.isArray(freshProducts) && freshProducts.length > 0) {
                state.products = freshProducts;
                extractCategories();
                renderCategories();
                applyFiltersAndSort();
                renderTrendingProducts();
            }
        }
    } catch (err) {
        console.warn('API network error, continuing with cached/fallback products:', err);
    }
}

// --- Theme Management (Light / Dark) ---
function initTheme() {
    const savedTheme = localStorage.getItem('swiftcart_theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('swiftcart_theme', theme);
    
    const themeIcons = document.querySelectorAll('.theme-toggle-icon');
    themeIcons.forEach(icon => {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info', newTheme === 'dark' ? 'fa-moon' : 'fa-sun');
}

// --- View Router & Navigation ---
function switchView(viewName) {
    state.activeView = viewName;
    
    const views = {
        home: document.getElementById('homeView'),
        products: document.getElementById('productsView'),
        about: document.getElementById('aboutView'),
        contact: document.getElementById('contactView')
    };

    Object.keys(views).forEach(key => {
        if (views[key]) {
            if (key === viewName) {
                views[key].classList.remove('hidden');
                views[key].classList.add('animate-fade-in');
            } else {
                views[key].classList.add('hidden');
            }
        }
    });

    // Update Nav Link Active States
    document.querySelectorAll('.nav-link').forEach(link => {
        const targetView = link.getAttribute('data-view');
        if (targetView === viewName) {
            link.classList.add('text-primary', 'font-bold', 'border-b-2', 'border-primary');
            link.classList.remove('text-gray-600', 'dark:text-gray-300');
        } else {
            link.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-primary');
            link.classList.add('text-gray-600', 'dark:text-gray-300');
        }
    });

    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobileMenuDropdown');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Categories Extraction & Rendering ---
function extractCategories() {
    const set = new Set();
    state.products.forEach(p => {
        if (p.category) set.add(p.category);
    });
    state.categories = Array.from(set);
}

function renderCategories() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    container.innerHTML = '';

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = `category-pill px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
        state.activeCategory === 'all'
            ? 'active bg-primary text-white border-primary shadow-md'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-primary/50'
    }`;
    allBtn.innerHTML = `<i class="fa-solid fa-shapes mr-1.5"></i> All Items (${state.products.length})`;
    allBtn.onclick = () => selectCategory('all');
    container.appendChild(allBtn);

    // Dynamic categories
    const categoryIcons = {
        "men's clothing": "fa-shirt",
        "women's clothing": "fa-person-dress",
        "jewelery": "fa-gem",
        "electronics": "fa-laptop"
    };

    state.categories.forEach(category => {
        const count = state.products.filter(p => p.category === category).length;
        const iconClass = categoryIcons[category.toLowerCase()] || 'fa-tag';
        const formattedName = category.charAt(0).toUpperCase() + category.slice(1);

        const btn = document.createElement('button');
        btn.className = `category-pill px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border capitalize ${
            state.activeCategory === category
                ? 'active bg-primary text-white border-primary shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-primary/50'
        }`;
        btn.innerHTML = `<i class="fa-solid ${iconClass} mr-1.5"></i> ${formattedName} (${count})`;
        btn.onclick = () => selectCategory(category);
        container.appendChild(btn);
    });
}

function selectCategory(category) {
    state.activeCategory = category;
    renderCategories();
    applyFiltersAndSort();
}

// --- Filtering & Sorting ---
function applyFiltersAndSort() {
    let result = [...state.products];

    // Filter by Category
    if (state.activeCategory !== 'all') {
        result = result.filter(p => p.category === state.activeCategory);
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        result = result.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }

    // Sort Products
    switch (state.sortBy) {
        case 'price-low':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
            break;
        case 'name':
            result.sort((a, b) => a.title.localeCompare(b.title));
            break;
        default:
            // Default: preserve original order
            break;
    }

    state.filteredProducts = result;
    renderProductGrid();

    // Update result count
    const countEl = document.getElementById('productResultsCount');
    if (countEl) {
        countEl.textContent = `Showing ${result.length} ${result.length === 1 ? 'product' : 'products'}`;
    }
}

// --- Render Product Grid (Shop View) ---
function renderProductGrid() {
    const container = document.getElementById('productContainer');
    if (!container) return;

    if (state.filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-16 text-center">
                <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 text-3xl">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No matching products found</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
                    We couldn't find anything matching "${state.searchQuery || state.activeCategory}". Try clearing your filters or searching for something else.
                </p>
                <button onclick="resetFilters()" class="btn btn-primary btn-sm rounded-full px-6">
                    <i class="fa-solid fa-rotate-left mr-2"></i> Reset Filters
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = state.filteredProducts.map(product => createProductCardHtml(product)).join('');
}

function resetFilters() {
    state.activeCategory = 'all';
    state.searchQuery = '';
    state.sortBy = 'default';
    
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(i => i.value = '');
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';

    renderCategories();
    applyFiltersAndSort();
}

// --- Product Card Component HTML ---
function createProductCardHtml(product) {
    const isWishlisted = state.wishlist.includes(product.id);
    const ratingRate = product.rating?.rate || 4.5;
    const ratingCount = product.rating?.count || 100;
    // Generate an artificial MSRP (20% higher) to show nice discount strike-through
    const msrp = (product.price * 1.25).toFixed(2);

    return `
        <div class="product-card card bg-base-100 dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300">
            <!-- Card Image Area -->
            <div class="relative bg-white p-6 h-64 flex items-center justify-center overflow-hidden border-b border-gray-50 dark:border-gray-700">
                <!-- Badges -->
                <div class="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span class="badge badge-sm font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 border-none px-2.5 py-1 rounded-full text-xs">
                        Save 20%
                    </span>
                    ${ratingRate >= 4.5 ? `
                        <span class="badge badge-sm font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 border-none px-2.5 py-1 rounded-full text-xs">
                            Top Rated
                        </span>
                    ` : ''}
                </div>

                <!-- Wishlist Toggle Button -->
                <button 
                    onclick="toggleWishlist(${product.id})" 
                    aria-label="Save to Wishlist"
                    class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm hover:shadow flex items-center justify-center text-gray-400 hover:text-red-500 transition-all duration-200">
                    <i class="${isWishlisted ? 'fa-solid fa-heart text-red-500 scale-110' : 'fa-regular fa-heart'} text-base"></i>
                </button>

                <!-- Product Image -->
                <img 
                    src="${product.image}" 
                    alt="${escapeHtml(product.title)}"
                    loading="lazy"
                    class="object-contain h-48 w-full group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal" 
                />
            </div>

            <!-- Card Content Body -->
            <div class="card-body p-5 flex flex-col justify-between flex-grow">
                <div>
                    <!-- Category & Rating Row -->
                    <div class="flex justify-between items-center mb-2.5">
                        <span class="text-xs uppercase tracking-wider font-semibold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 rounded-full">
                            ${escapeHtml(product.category)}
                        </span>
                        <div class="flex items-center gap-1.5 text-xs text-amber-500 font-semibold" title="${ratingRate} out of 5 stars">
                            <i class="fa-solid fa-star text-amber-400 text-xs"></i>
                            <span class="text-gray-700 dark:text-gray-300">${ratingRate}</span>
                            <span class="text-gray-400 font-normal">(${ratingCount})</span>
                        </div>
                    </div>

                    <!-- Title -->
                    <h3 class="card-title text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-2 hover:text-primary transition-colors cursor-pointer mb-2"
                        onclick="openProductDetails(${product.id})">
                        ${escapeHtml(product.title)}
                    </h3>

                    <!-- Price Block -->
                    <div class="flex items-baseline gap-2 mb-4">
                        <span class="text-2xl font-extrabold text-gray-900 dark:text-white">
                            $${product.price.toFixed(2)}
                        </span>
                        <span class="text-xs text-gray-400 line-through">
                            $${msrp}
                        </span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="grid grid-cols-2 gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        onclick="openProductDetails(${product.id})"
                        class="btn btn-outline btn-sm rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                        <i class="fa-regular fa-eye mr-1.5"></i> Details
                    </button>
                    <button 
                        onclick="addToCart(${product.id}, 1, true)"
                        class="btn btn-primary btn-sm rounded-xl text-white font-medium shadow hover:shadow-md transition-all">
                        <i class="fa-solid fa-cart-plus mr-1.5"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- Render Trending Products on Home Page ---
function renderTrendingProducts() {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    // Pick top 3 rated products
    const trending = [...state.products]
        .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
        .slice(0, 3);

    container.innerHTML = trending.map(p => createProductCardHtml(p)).join('');
}

// --- Product Details Dialog Modal ---
function openProductDetails(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    state.currentProductDetails = product;
    const dialog = document.getElementById('productDetailModal');
    const container = document.getElementById('productDetailContent');
    if (!dialog || !container) return;

    const isWishlisted = state.wishlist.includes(product.id);
    const msrp = (product.price * 1.25).toFixed(2);

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <!-- Image Showcase -->
            <div class="relative bg-white dark:bg-gray-800 rounded-2xl p-8 flex items-center justify-center border border-gray-100 dark:border-gray-700 h-80 md:h-96">
                <span class="absolute top-4 left-4 badge badge-primary text-xs uppercase font-bold tracking-wide">
                    ${escapeHtml(product.category)}
                </span>
                <img 
                    src="${product.image}" 
                    alt="${escapeHtml(product.title)}"
                    class="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-300"
                />
            </div>

            <!-- Details Content -->
            <div class="flex flex-col justify-between">
                <div>
                    <!-- Rating and Status -->
                    <div class="flex items-center justify-between gap-4 mb-3">
                        <div class="flex items-center gap-1.5 text-amber-500 text-sm font-semibold">
                            <i class="fa-solid fa-star text-amber-400"></i>
                            <span class="text-gray-800 dark:text-gray-200">${product.rating?.rate || 4.5}</span>
                            <span class="text-gray-400 font-normal">(${product.rating?.count || 120} reviews)</span>
                        </div>
                        <span class="badge badge-success badge-sm text-white font-medium flex items-center gap-1">
                            <i class="fa-solid fa-check text-[10px]"></i> In Stock
                        </span>
                    </div>

                    <!-- Title -->
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
                        ${escapeHtml(product.title)}
                    </h2>

                    <!-- Price -->
                    <div class="flex items-baseline gap-3 mb-4">
                        <span class="text-3xl font-extrabold text-primary">
                            $${product.price.toFixed(2)}
                        </span>
                        <span class="text-base text-gray-400 line-through">
                            $${msrp}
                        </span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Save $${(msrp - product.price).toFixed(2)} (20%)
                        </span>
                    </div>

                    <!-- Description -->
                    <div class="mb-6">
                        <h4 class="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">Description</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-h-36 overflow-y-auto pr-2">
                            ${escapeHtml(product.description)}
                        </p>
                    </div>

                    <!-- Trust Perks -->
                    <div class="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 dark:border-gray-700 mb-6 text-xs text-gray-600 dark:text-gray-400">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-truck-fast text-primary text-sm"></i>
                            <span>Free Shipping over $50</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-shield-check text-primary text-sm"></i>
                            <span>30-Day Easy Returns</span>
                        </div>
                    </div>
                </div>

                <!-- Quantity & Actions -->
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity:</label>
                        <div class="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                            <button 
                                type="button" 
                                onclick="adjustModalQuantity(-1)"
                                class="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                <i class="fa-solid fa-minus text-xs"></i>
                            </button>
                            <span id="modalQuantityDisplay" class="w-10 text-center font-bold text-sm text-gray-800 dark:text-white">1</span>
                            <button 
                                type="button" 
                                onclick="adjustModalQuantity(1)"
                                class="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                <i class="fa-solid fa-plus text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <button 
                            type="button" 
                            onclick="addModalProductToCart()"
                            class="btn btn-primary flex-1 rounded-xl text-white font-semibold shadow hover:shadow-lg transition">
                            <i class="fa-solid fa-cart-arrow-down mr-2"></i> Add to Cart
                        </button>
                        <button 
                            type="button" 
                            onclick="toggleWishlist(${product.id})"
                            aria-label="Wishlist"
                            class="btn btn-outline rounded-xl border-gray-300 dark:border-gray-600 px-4 text-gray-700 dark:text-gray-200 hover:text-red-500">
                            <i class="${isWishlisted ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'} text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    dialog.showModal();
}

let modalQuantity = 1;
function adjustModalQuantity(delta) {
    modalQuantity = Math.max(1, Math.min(20, modalQuantity + delta));
    const el = document.getElementById('modalQuantityDisplay');
    if (el) el.textContent = modalQuantity;
}

function addModalProductToCart() {
    if (!state.currentProductDetails) return;
    addToCart(state.currentProductDetails.id, modalQuantity, true);
    modalQuantity = 1;
    const dialog = document.getElementById('productDetailModal');
    if (dialog) dialog.close();
}

// --- Modern Web Guidance: Dialog Light-Dismiss Fallback ---
function setupModernDialogDismissal() {
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
        // Fallback for browsers without native closedby support
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            dialog.addEventListener('click', (event) => {
                if (event.target !== dialog) return;
                const rect = dialog.getBoundingClientRect();
                const isDialogContent = (
                    rect.top <= event.clientY &&
                    event.clientY <= rect.top + rect.height &&
                    rect.left <= event.clientX &&
                    event.clientX <= rect.left + rect.width
                );
                if (isDialogContent) return;
                dialog.close();
            });
        }
    });
}

// --- Cart Operations ---
function addToCart(productId, quantity = 1, showToastNotification = true) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = state.cart.findIndex(item => item.product.id === productId);
    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += quantity;
    } else {
        state.cart.push({ product, quantity });
    }

    saveCart();
    renderCart();
    animateCartIcon();

    if (showToastNotification) {
        showToast(`Added "${truncateString(product.title, 25)}" to Cart!`, 'success', 'fa-cart-shopping');
    }
}

function updateCartQuantity(productId, delta) {
    const index = state.cart.findIndex(item => item.product.id === productId);
    if (index === -1) return;

    const newQty = state.cart[index].quantity + delta;
    if (newQty <= 0) {
        removeFromCart(productId);
    } else {
        state.cart[index].quantity = newQty;
        saveCart();
        renderCart();
    }
}

function removeFromCart(productId) {
    const index = state.cart.findIndex(item => item.product.id === productId);
    if (index > -1) {
        const title = state.cart[index].product.title;
        state.cart.splice(index, 1);
        saveCart();
        renderCart();
        showToast(`Removed "${truncateString(title, 20)}" from cart`, 'info', 'fa-trash');
    }
}

function clearCart() {
    if (state.cart.length === 0) return;
    if (confirm('Are you sure you want to clear your shopping cart?')) {
        state.cart = [];
        state.promoCode = null;
        state.discountPercent = 0;
        localStorage.removeItem('swiftcart_promo');
        localStorage.removeItem('swiftcart_discount');
        saveCart();
        renderCart();
        showToast('Cart cleared', 'info', 'fa-broom');
    }
}

function saveCart() {
    localStorage.setItem('swiftcart_cart', JSON.stringify(state.cart));
}

function renderCart() {
    const cartCountBadges = document.querySelectorAll('.cart-badge');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountBadges.forEach(badge => {
        badge.textContent = totalItems;
        if (totalItems > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });

    const itemsContainer = document.getElementById('cartItemsContainer');
    const emptyCartView = document.getElementById('emptyCartView');
    const cartFooter = document.getElementById('cartDrawerFooter');
    
    if (!itemsContainer || !emptyCartView || !cartFooter) return;

    if (state.cart.length === 0) {
        itemsContainer.innerHTML = '';
        emptyCartView.classList.remove('hidden');
        cartFooter.classList.add('hidden');
        return;
    }

    emptyCartView.classList.add('hidden');
    cartFooter.classList.remove('hidden');

    // Calculate financials
    const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const discountAmount = (subtotal * (state.discountPercent / 100));
    const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 5.00;
    const finalTotal = Math.max(0, subtotal - discountAmount + shipping);

    // Render items list
    itemsContainer.innerHTML = state.cart.map(item => `
        <div class="flex items-center gap-4 py-3.5 border-b border-gray-100 dark:border-gray-700/60 last:border-none">
            <div class="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl p-2 flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                <img src="${item.product.image}" alt="${escapeHtml(item.product.title)}" class="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal">
            </div>
            <div class="flex-grow min-w-0">
                <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">
                    ${escapeHtml(item.product.title)}
                </h4>
                <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>$${item.product.price.toFixed(2)} each</span>
                </div>
                <!-- Stepper -->
                <div class="flex items-center gap-3">
                    <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <button onclick="updateCartQuantity(${item.product.id}, -1)" class="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <i class="fa-solid fa-minus text-[10px]"></i>
                        </button>
                        <span class="w-7 text-center text-xs font-bold text-gray-800 dark:text-white">${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.product.id}, 1)" class="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <i class="fa-solid fa-plus text-[10px]"></i>
                        </button>
                    </div>
                    <button onclick="removeFromCart(${item.product.id})" class="text-xs text-red-500 hover:text-red-700 transition p-1">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
            <div class="text-right flex-shrink-0">
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                    $${(item.product.price * item.quantity).toFixed(2)}
                </span>
            </div>
        </div>
    `).join('');

    // Update Totals
    const subtotalEl = document.getElementById('cartSubtotal');
    const shippingEl = document.getElementById('cartShipping');
    const discountEl = document.getElementById('cartDiscount');
    const discountRow = document.getElementById('cartDiscountRow');
    const totalEl = document.getElementById('cartTotal');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${finalTotal.toFixed(2)}`;

    if (discountRow && discountEl) {
        if (state.discountPercent > 0) {
            discountRow.classList.remove('hidden');
            discountEl.textContent = `-$${discountAmount.toFixed(2)} (${state.discountPercent}%)`;
        } else {
            discountRow.classList.add('hidden');
        }
    }
}

function animateCartIcon() {
    const icons = document.querySelectorAll('.cart-btn');
    icons.forEach(btn => {
        btn.classList.add('cart-bump');
        setTimeout(() => btn.classList.remove('cart-bump'), 400);
    });
}

function openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            const panel = drawer.querySelector('.drawer-panel');
            if (panel) panel.classList.remove('translate-x-full');
        }, 10);
    }
}

function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
        const panel = drawer.querySelector('.drawer-panel');
        if (panel) panel.classList.add('translate-x-full');
        setTimeout(() => drawer.classList.add('hidden'), 250);
    }
}

// --- Promo Code Application ---
function applyPromoCode() {
    const input = document.getElementById('promoCodeInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        showToast('Please enter a coupon code', 'warning', 'fa-tag');
        return;
    }

    if (code === 'SWIFT20') {
        state.promoCode = 'SWIFT20';
        state.discountPercent = 20;
        localStorage.setItem('swiftcart_promo', 'SWIFT20');
        localStorage.setItem('swiftcart_discount', '20');
        renderCart();
        showToast('🎉 20% discount coupon applied successfully!', 'success', 'fa-percent');
    } else if (code === 'FREESHIP') {
        state.promoCode = 'FREESHIP';
        state.discountPercent = 10;
        localStorage.setItem('swiftcart_promo', 'FREESHIP');
        localStorage.setItem('swiftcart_discount', '10');
        renderCart();
        showToast('🎉 Extra 10% Off & Free shipping coupon applied!', 'success', 'fa-truck');
    } else {
        showToast('Invalid coupon code. Try "SWIFT20"', 'error', 'fa-circle-xmark');
    }
}

// --- Wishlist Management ---
function toggleWishlist(productId) {
    const index = state.wishlist.indexOf(productId);
    const product = state.products.find(p => p.id === productId);
    const title = product ? product.title : 'Product';

    if (index > -1) {
        state.wishlist.splice(index, 1);
        showToast(`Removed "${truncateString(title, 20)}" from Wishlist`, 'info', 'fa-heart');
    } else {
        state.wishlist.push(productId);
        showToast(`Saved "${truncateString(title, 20)}" to Wishlist!`, 'success', 'fa-heart');
    }

    localStorage.setItem('swiftcart_wishlist', JSON.stringify(state.wishlist));
    renderWishlistBadge();
    applyFiltersAndSort();
    renderTrendingProducts();
    renderWishlistModal();
}

function renderWishlistBadge() {
    const badges = document.querySelectorAll('.wishlist-badge');
    badges.forEach(badge => {
        badge.textContent = state.wishlist.length;
        if (state.wishlist.length > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

function openWishlistModal() {
    renderWishlistModal();
    const dialog = document.getElementById('wishlistModal');
    if (dialog) dialog.showModal();
}

function renderWishlistModal() {
    const container = document.getElementById('wishlistItemsContainer');
    if (!container) return;

    if (state.wishlist.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center">
                <div class="w-16 h-16 mx-auto mb-3 bg-red-50 dark:bg-red-950/40 text-red-400 rounded-full flex items-center justify-center text-2xl">
                    <i class="fa-regular fa-heart"></i>
                </div>
                <h4 class="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Your wishlist is empty</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-4">Tap the heart icon on any product to save your favorites for later.</p>
                <button onclick="document.getElementById('wishlistModal').close(); switchView('products');" class="btn btn-primary btn-sm rounded-full px-5">
                    Explore Shop
                </button>
            </div>
        `;
        return;
    }

    const items = state.products.filter(p => state.wishlist.includes(p.id));

    container.innerHTML = items.map(product => `
        <div class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-none">
            <div class="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl p-2 flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                <img src="${product.image}" alt="${escapeHtml(product.title)}" class="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal">
            </div>
            <div class="flex-grow min-w-0">
                <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">${escapeHtml(product.title)}</h4>
                <div class="text-sm font-bold text-primary">$${product.price.toFixed(2)}</div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="addToCart(${product.id}, 1, true); toggleWishlist(${product.id});" class="btn btn-primary btn-xs rounded-lg text-white">
                    <i class="fa-solid fa-cart-plus mr-1"></i> Move to Cart
                </button>
                <button onclick="toggleWishlist(${product.id})" class="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// --- Checkout Modal & Processing ---
function openCheckoutModal() {
    if (state.cart.length === 0) {
        showToast('Your cart is empty!', 'warning', 'fa-cart-shopping');
        return;
    }

    closeCartDrawer();

    const dialog = document.getElementById('checkoutModal');
    const summaryContainer = document.getElementById('checkoutSummaryContainer');
    const orderTotalEl = document.getElementById('checkoutOrderTotal');

    // Calculate totals
    const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const discountAmount = (subtotal * (state.discountPercent / 100));
    const shipping = subtotal >= 50 ? 0 : 5.00;
    const finalTotal = Math.max(0, subtotal - discountAmount + shipping);

    if (summaryContainer) {
        summaryContainer.innerHTML = state.cart.map(item => `
            <div class="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300 py-1">
                <span class="line-clamp-1 max-w-[200px]">${item.quantity}x ${escapeHtml(item.product.title)}</span>
                <span class="font-semibold">$${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }

    if (orderTotalEl) {
        orderTotalEl.textContent = `$${finalTotal.toFixed(2)}`;
    }

    // Reset confirmation state
    document.getElementById('checkoutFormStep').classList.remove('hidden');
    document.getElementById('checkoutSuccessStep').classList.add('hidden');

    if (dialog) dialog.showModal();
}

function processCheckoutOrder(event) {
    event.preventDefault();
    const btn = document.getElementById('placeOrderBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="loading loading-spinner loading-xs mr-2"></span> Processing Payment...`;
    }

    setTimeout(() => {
        // Create an order ID
        const orderId = 'SWIFT-' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('confirmedOrderId').textContent = orderId;
        
        // Show success screen
        document.getElementById('checkoutFormStep').classList.add('hidden');
        document.getElementById('checkoutSuccessStep').classList.remove('hidden');

        // Clear cart
        state.cart = [];
        state.promoCode = null;
        state.discountPercent = 0;
        localStorage.removeItem('swiftcart_promo');
        localStorage.removeItem('swiftcart_discount');
        saveCart();
        renderCart();

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-lock mr-2"></i> Pay & Complete Order`;
        }
    }, 1200);
}

// --- Flash Sale Countdown Timer ---
function startFlashSaleCountdown() {
    const hoursEl = document.getElementById('timerHours');
    const minsEl = document.getElementById('timerMinutes');
    const secsEl = document.getElementById('timerSeconds');

    if (!hoursEl || !minsEl || !secsEl) return;

    // Set end time 14 hours from now
    let durationSeconds = 14 * 3600 + 45 * 60;

    setInterval(() => {
        durationSeconds = Math.max(0, durationSeconds - 1);
        const h = Math.floor(durationSeconds / 3600);
        const m = Math.floor((durationSeconds % 3600) / 60);
        const s = durationSeconds % 60;

        hoursEl.textContent = String(h).padStart(2, '0');
        minsEl.textContent = String(m).padStart(2, '0');
        secsEl.textContent = String(s).padStart(2, '0');
    }, 1000);
}

// --- Toast Notifications ---
function showToast(message, type = 'info', iconClass = 'fa-circle-info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const colors = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-rose-600 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-indigo-600 text-white'
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl ${colors[type] || colors.info} text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0`;
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} text-base flex-shrink-0"></i>
        <span class="flex-grow">${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100 ml-2 transition">
            <i class="fa-solid fa-xmark text-xs"></i>
        </button>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    }, 10);

    // Auto remove after 3.2s
    setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-view');
            if (view) switchView(view);
        });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenuDropdown');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Search input handlers
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            // Mirror to other search inputs if any
            searchInputs.forEach(other => {
                if (other !== input) other.value = e.target.value;
            });
            // If user is searching and not on products page, switch to products view
            if (state.activeView !== 'products' && state.searchQuery.trim().length > 1) {
                switchView('products');
            }
            applyFiltersAndSort();
        });
    });

    // Clear search
    const clearSearchButtons = document.querySelectorAll('.clear-search-btn');
    clearSearchButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            searchInputs.forEach(i => i.value = '');
            state.searchQuery = '';
            applyFiltersAndSort();
        });
    });

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            applyFiltersAndSort();
        });
    }

    // Contact form submit
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thank you! Your message has been sent.', 'success', 'fa-paper-plane');
            contactForm.reset();
        });
    }

    // Newsletter forms
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input && input.value) {
                showToast(`Subscribed! 15% discount code sent to ${input.value}`, 'success', 'fa-envelope-circle-check');
                input.value = '';
            }
        });
    });
}

// --- Utilities ---
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function truncateString(str, max = 24) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '...' : str;
}
