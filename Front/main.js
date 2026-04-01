const productsContainer = document.getElementById('products-container');
const cartCountEl = document.getElementById('cart-count');
const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

let allProducts = [];

// --- ЛОГІКА КОШИКА (LocalStorage) ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const updateCartCount = () => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = `Кошик (${totalItems})`;
};

const addToCart = (productId) => {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast(`Товар "${product.name}" додано в кошик!`);
};

// --- ЛОГІКА СУЧАСНОГО СПОВІЩЕННЯ (TOAST) ---
const showToast = (message) => {
  const toast = document.createElement('div');
  toast.classList.add('toast-notification');
  
  toast.innerHTML = `
    <span class="toast-icon">🛍️</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out'); 
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
};

// --- МОДАЛЬНЕ ВІКНО ---
const openModal = (product) => {
  modalBody.innerHTML = `
    <img src="${product.image_url}" alt="${product.name}">
    <h2>${product.name}</h2>
    <p style="color: var(--text-light); margin-bottom: 10px;">Категорія: ${product.category === 'face' ? 'Обличчя' : 'Волосся'}</p>
    <p>${product.description}</p>
    <h3 style="color: var(--primary-color); margin: 15px 0;">${product.price} грн</h3>
    <button class="btn-buy" id="modal-buy-btn">Додати в кошик</button>
  `;
  
  document.getElementById('modal-buy-btn').addEventListener('click', () => {
    addToCart(product.id);
    closeModal();
  });

  modal.classList.add('active');
};

const closeModal = () => {
  modal.classList.remove('active');
};

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// --- ВІДОБРАЖЕННЯ ТОВАРІВ ---
const renderProducts = (productsList) => {
  productsContainer.innerHTML = '';

  if (productsList.length === 0) {
    productsContainer.innerHTML = '<p class="loading-text">Товари не знайдено</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  productsList.forEach((product, index) => {
    const card = document.createElement('article');
    card.classList.add('product-card');
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <img src="${product.image_url}" alt="${product.name}" class="card-img" style="cursor: pointer;">
      <h3 class="product-title" style="cursor: pointer;">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="product-bottom">
        <span class="product-price">${product.price} грн</span>
        <button class="btn-buy" data-id="${product.id}">Купити</button>
      </div>
    `;

    card.querySelector('.card-img').addEventListener('click', () => openModal(product));
    card.querySelector('.product-title').addEventListener('click', () => openModal(product));
    card.querySelector('.btn-buy').addEventListener('click', () => addToCart(product.id));

    fragment.appendChild(card);
  });

  productsContainer.appendChild(fragment);
};

// --- ФІЛЬТРАЦІЯ ---
const categoryInputs = document.querySelectorAll('input[name="category"]');
const needInputs = document.querySelectorAll('input[type="checkbox"]');
const minPriceInput = document.querySelectorAll('.price-input')[0];
const maxPriceInput = document.querySelectorAll('.price-input')[1];

const filterProducts = () => {
  const selectedCategory = document.querySelector('input[name="category"]:checked').value;
  const selectedNeeds = Array.from(needInputs).filter(i => i.checked).map(i => i.value);
  const minPrice = Number(minPriceInput.value) || 0;
  const maxPrice = Number(maxPriceInput.value) || Infinity;

  const filtered = allProducts.filter(product => {
    const isCategoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const isNeedsMatch = selectedNeeds.length === 0 || selectedNeeds.some(need => product.needs.includes(need));
    const isPriceMatch = product.price >= minPrice && product.price <= maxPrice;
    return isCategoryMatch && isNeedsMatch && isPriceMatch;
  });

  renderProducts(filtered);
};

categoryInputs.forEach(input => input.addEventListener('change', filterProducts));
needInputs.forEach(input => input.addEventListener('change', filterProducts));
minPriceInput.addEventListener('input', filterProducts);
maxPriceInput.addEventListener('input', filterProducts);

// --- ВИПРАВЛЕНЕ ЗАВАНТАЖЕННЯ ---
const loadProducts = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/users/products/');
    if (!response.ok) throw new Error('Помилка HTTP');
    allProducts = await response.json();
    renderProducts(allProducts);
    updateCartCount();
  } catch (error) {
    console.error(error);
  }
};

// --- ЛОГІКА ТЕМНОЇ ТЕМИ ---
const themeToggleBtn = document.getElementById('theme-toggle');

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
  document.body.classList.add('dark-theme');
  themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  if (document.body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
    themeToggleBtn.textContent = '☀️';
  } else {
    localStorage.setItem('theme', 'light');
    themeToggleBtn.textContent = '🌙';
  }
});

loadProducts();

// =========================================
// АВТОРИЗАЦІЯ ТА РЕЄСТРАЦІЯ
// =========================================
const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('auth-modal');
const closeAuthModal = document.getElementById('close-auth-modal');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');

const usernameInput = document.getElementById('auth-username');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');

let isLoginMode = true; 

if (authBtn) {
  authBtn.addEventListener('click', () => {
    if (localStorage.getItem('access_token')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      authBtn.textContent = 'Увійти';
      showToast('Ви успішно вийшли з акаунту');
      return;
    }
    authModal.classList.add('active');
  });
}

if (closeAuthModal) {
  closeAuthModal.addEventListener('click', () => authModal.classList.remove('active'));
}

window.addEventListener('click', (e) => {
  if (e.target === authModal) authModal.classList.remove('active');
});

if (toggleAuthModeBtn) {
  toggleAuthModeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
      authTitle.textContent = 'Вхід';
      emailInput.style.display = 'none';
      emailInput.removeAttribute('required');
      toggleAuthModeBtn.textContent = 'Немає акаунту? Зареєструватися';
    } else {
      authTitle.textContent = 'Реєстрація';
      emailInput.style.display = 'block';
      emailInput.setAttribute('required', 'true');
      toggleAuthModeBtn.textContent = 'Вже є акаунт? Увійти';
    }
  });
}

if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const username = usernameInput.value;
    const password = passwordInput.value;
    const email = emailInput.value;

    const url = isLoginMode 
      ? 'http://127.0.0.1:8000/api/login/' 
      : 'http://127.0.0.1:8000/api/users/register/';

    const bodyData = { username, password };
    if (!isLoginMode) {
      bodyData.email = email;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLoginMode) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          
          authModal.classList.remove('active');
          authBtn.textContent = 'Вийти'; 
          showToast('Успішний вхід!');
          authForm.reset();
        } else {
          showToast('Реєстрація успішна! Тепер увійдіть.');
          toggleAuthModeBtn.click(); 
        }
      } else {
        showToast('Помилка: перевірте введені дані');
        console.error(data);
      }
    } catch (error) {
      showToast('Помилка з\'єднання з сервером');
      console.error(error);
    }
  });
}

if (localStorage.getItem('access_token') && authBtn) {
  authBtn.textContent = 'Вийти';
}