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
    currentPage = 1; // Reset to first page
    renderProductsWithPagination(); // Use pagination render
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

// Attach event listeners
function attachEventListeners() {
    // Search input - real-time filtering
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    
    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    
    // Low stock filter
    document.getElementById('lowStockFilter').addEventListener('change', applyFilters);
    
    // Sort dropdown
    document.getElementById('sortDropdown').addEventListener('change', applyFilters);
    
    // Clear filters button
    document.getElementById('clearFiltersBtn').addEventListener('click', clearAllFilters);
    
    // Add product form
    document.getElementById('addProductForm').addEventListener('submit', addProduct);
}
// Pagination variables
const productsPerPage = 6;
let currentPage = 1;

// Render products with pagination
function renderProductsWithPagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);
    
    const productGrid = document.getElementById('productGrid');
    const noProductsMsg = document.getElementById('noProductsMessage');
    
    productGrid.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        noProductsMsg.style.display = 'block';
        renderPaginationControls(totalPages);
        return;
    }
    
    noProductsMsg.style.display = 'none';
    
    productsToDisplay.forEach(product => {
        const card = createProductCard(product);
        productGrid.appendChild(card);
    });
    
    renderPaginationControls(totalPages);
}

// Render pagination buttons
function renderPaginationControls(totalPages) {
    let paginationDiv = document.getElementById('pagination');
    
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination';
        paginationDiv.className = 'pagination';
        document.querySelector('.products-section').appendChild(paginationDiv);
    }
    
    paginationDiv.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProductsWithPagination();
            window.scrollTo(0, 0);
        }
    });
    paginationDiv.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderProductsWithPagination();
            window.scrollTo(0, 0);
        });
        paginationDiv.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProductsWithPagination();
            window.scrollTo(0, 0);
        }
    });
    paginationDiv.appendChild(nextBtn);
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    let stockClass = 'stock-high';
    if (product.stock === 0) {
        stockClass = 'stock-out';
    } else if (product.stock < 5) {
        stockClass = 'stock-low';
    }
    
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
        <div class="product-actions">
            <button class="btn-primary edit-btn" data-id="${product.id}">Edit</button>
            <button class="btn-danger delete-btn" data-id="${product.id}">Delete</button>
        </div>
    `;
    
    // Add event listeners
    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => editProduct(product.id));
    
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteProduct(product.id));
    
    return card;
}

// Edit product function
function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    // Populate form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category;
    
    // Change button text to "Update Product"
    const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
    submitBtn.textContent = 'Update Product';
    submitBtn.dataset.editId = id;
    
    // Scroll to form
    document.querySelector('.add-product-section').scrollIntoView({ behavior: 'smooth' });
}

// Modify addProduct to handle updates
function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('productCategory').value;
    
    // Validation
    if (!name || price <= 0 || stock < 0 || !category) {
        alert('Please fill all fields correctly');
        return;
    }
    
    const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
    const editId = submitBtn.dataset.editId;
    
    if (editId) {
        // Update existing product
        const product = allProducts.find(p => p.id === parseInt(editId));
        if (product) {
            product.name = name;
            product.price = price;
            product.stock = stock;
            product.category = category;
        }
        
        // Reset edit mode
        submitBtn.textContent = 'Add Product';
        delete submitBtn.dataset.editId;
    } else {
        // Create new product
        const newProduct = {
            id: nextId++,
            name: name,
            price: price,
            stock: stock,
            category: category
        };
        allProducts.push(newProduct);
    }
    
    saveProductsToStorage();
    document.getElementById('addProductForm').reset();
    applyFilters();
}