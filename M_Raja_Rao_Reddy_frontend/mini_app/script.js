const initialProducts = [
    { id: 1, name: "Laptop", price: 55000, stock: 5, category: "electronics" },
    { id: 2, name: "Smartphone", price: 25000, stock: 8, category: "electronics" },
    { id: 3, name: "T-Shirt", price: 500, stock: 20, category: "clothing" },
    { id: 4, name: "Jeans", price: 1500, stock: 15, category: "clothing" },
    { id: 5, name: "JavaScript Book", price: 800, stock: 0, category: "books" },
    { id: 6, name: "CSS Guide", price: 600, stock: 3, category: "books" },
    { id: 7, name: "Wireless Headphones", price: 3000, stock: 12, category: "accessories" },
    { id: 8, name: "USB Cable", price: 200, stock: 50, category: "accessories" },
    { id: 9, name: "Tablet", price: 35000, stock: 4, category: "electronics" },
    { id: 10, name: "Jacket", price: 3500, stock: 6, category: "clothing" }
];

// Global state
let allProducts = [];
let filteredProducts = [];
let nextId = 11;

// Get unique categories from products
function getCategories() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    return categories.sort();
}

// Initialize application
function initApp() {
    loadProductsFromStorage();
    showLoadingIndicator();
    simulateApiCall();
}

// Simulate API call with Promise and setTimeout
function simulateApiCall() {
    return new Promise((resolve) => {
        setTimeout(() => {
            hideLoadingIndicator();
            renderInitialUI();
            resolve();
        }, 1500); 
    });
}

// Show loading indicator
function showLoadingIndicator() {
    const loadingDiv = document.getElementById('loadingIndicator');
    const mainContainer = document.getElementById('mainContainer');
    loadingDiv.style.display = 'flex';
    mainContainer.style.display = 'none';
}

// Hide loading indicator and show main content
function hideLoadingIndicator() {
    const loadingDiv = document.getElementById('loadingIndicator');
    const mainContainer = document.getElementById('mainContainer');
    loadingDiv.style.display = 'none';
    mainContainer.style.display = 'block';
}

// Load products from localStorage or use initial data
function loadProductsFromStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        allProducts = JSON.parse(storedProducts);
        // Get the highest ID to avoid duplicates
        nextId = Math.max(...allProducts.map(p => p.id)) + 1;
    } else {
        allProducts = JSON.parse(JSON.stringify(initialProducts));
        saveProductsToStorage();
    }
    filteredProducts = [...allProducts];
}

// Save products to localStorage
function saveProductsToStorage() {
    localStorage.setItem('products', JSON.stringify(allProducts));
}

// Render initial UI after loading
function renderInitialUI() {
    populateCategoryFilters();
    renderProducts();
    updateAnalytics();
    attachEventListeners();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Render products to the grid
function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    const noProductsMsg = document.getElementById('noProductsMessage');
    
    // Clear grid
    productGrid.innerHTML = '';
    
    // Check if products found
    if (filteredProducts.length === 0) {
        noProductsMsg.style.display = 'block';
        return;
    }
    
    noProductsMsg.style.display = 'none';
    
    // Create product cards dynamically
    filteredProducts.forEach(product => {
        const card = createProductCard(product);
        productGrid.appendChild(card);
    });
}

// Create a single product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Determine stock status
    let stockClass = 'stock-high';
    if (product.stock === 0) {
        stockClass = 'stock-out';
    } else if (product.stock < 5) {
        stockClass = 'stock-low';
    }
    
    // Create card content
    card.innerHTML = `
        <h3>${product.name}</h3>
        <div class="product-info">
            <div class="product-detail">
                <strong>Category:</strong>
                <span>${product.category}</span>
            </div>
            <div class="product-detail">
                <strong>Price:</strong>
                <span>Rs. ${product.price.toFixed(2)}</span>
            </div>
            <div class="product-detail">
                <strong>Stock:</strong>
                <span>${product.stock} units</span>
            </div>
        </div>
        <div class="product-stock ${stockClass}">
            ${product.stock === 0 ? 'Out of Stock' : 
              product.stock < 5 ? 'Low Stock' : 
              'In Stock'}
        </div>
        <button class="btn-danger delete-btn" data-id="${product.id}">Delete Product</button>
    `;
    
    // Add delete functionality
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteProduct(product.id));
    
    return card;
}
// Populate category dropdown
function populateCategoryFilters() {
    const categoryFilterSelect = document.getElementById('categoryFilter');
    const productCategorySelect = document.getElementById('productCategory');
    
    const categories = getCategories();
    
    categories.forEach(category => {
        // Add to filter dropdown
        const option1 = document.createElement('option');
        option1.value = category;
        option1.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilterSelect.appendChild(option1);
        
        // Add to add-product form dropdown
        const option2 = document.createElement('option');
        option2.value = category;
        option2.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        productCategorySelect.appendChild(option2);
    });
}

// Update analytics dashboard
function updateAnalytics() {
    const totalProducts = document.getElementById('totalProducts');
    const totalValue = document.getElementById('totalValue');
    const outOfStock = document.getElementById('outOfStock');
    
    // Calculate metrics
    let total = filteredProducts.length;
    let value = 0;
    let outOfStockCount = 0;
    
    filteredProducts.forEach(product => {
        value += product.price * product.stock;
        if (product.stock === 0) {
            outOfStockCount++;
        }
    });
    
    // Update DOM
    totalProducts.textContent = total;
    totalValue.textContent = `Rs. ${value.toLocaleString('en-IN', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    })}`;
    outOfStock.textContent = outOfStockCount;
}

// Apply all filters and search
function applyFilters() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const lowStockFilter = document.getElementById('lowStockFilter').checked;
    
    filteredProducts = allProducts.filter(product => {
        // Search filter - case insensitive
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);
        
        // Category filter
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        // Low stock filter
        const matchesStock = !lowStockFilter || product.stock < 5;
        
        return matchesSearch && matchesCategory && matchesStock;
    });
    
    applySort();
    renderProducts();
    updateAnalytics();
}

// Sort products
function applySort() {
    const sortOption = document.getElementById('sortDropdown').value;
    
    switch (sortOption) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Keep original order
            break;
    }
}

// Clear all filters
function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('lowStockFilter').checked = false;
    document.getElementById('sortDropdown').value = '';
    applyFilters();
}

// Add new product
function addProduct(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('productCategory').value;
    
    // Validation
    if (!name) {
        alert('Product name cannot be empty');
        return;
    }
    
    if (price <= 0) {
        alert('Price must be greater than 0');
        return;
    }
    
    if (stock < 0) {
        alert('Stock cannot be negative');
        return;
    }
    
    if (!category) {
        alert('Please select a category');
        return;
    }
    
    // Create new product
    const newProduct = {
        id: nextId++,
        name: name,
        price: price,
        stock: stock,
        category: category
    };
    
    // Add to products array
    allProducts.push(newProduct);
    
    // Save to storage
    saveProductsToStorage();
    
    // Clear form
    document.getElementById('addProductForm').reset();
    
    // Update UI
    applyFilters();
    
    console.log('Product added successfully:', newProduct);
}

// Delete product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        allProducts = allProducts.filter(p => p.id !== id);
        saveProductsToStorage();
        applyFilters();
    }
}