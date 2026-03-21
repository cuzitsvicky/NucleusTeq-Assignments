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