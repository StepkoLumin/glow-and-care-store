// Знаходимо елементи на сторінці cart.html
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalEl = document.getElementById('cart-total');
const cartFooter = document.getElementById('cart-footer');

// --- ЛОГІКА КОШИКА ---

// Функція отримання кошика з LocalStorage (копія з main.js для модульності)
const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];

// Функція збереження кошика в LocalStorage
const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// Функція оновлення кількості товару
const changeQuantity = (productId, delta) => {
  let cart = getCart();
  const productIndex = cart.findIndex(item => item.id === productId);

  if (productIndex !== -1) {
    cart[productIndex].quantity += delta;
    
    // Якщо кількість стала 0, видаляємо товар
    if (cart[productIndex].quantity <= 0) {
      cart.splice(productIndex, 1);
    }
    
    saveCart(cart);
    renderCart(); // Перемальовуємо кошик
  }
};

// Функція видалення товару
const removeFromCart = (productId) => {
  let cart = getCart();
  const filteredCart = cart.filter(item => item.id !== productId);
  saveCart(filteredCart);
  renderCart(); // Перемальовуємо кошик
};

// Функція відмальовки кошика
const renderCart = () => {
  const cart = getCart();
  cartItemsContainer.innerHTML = ''; // Очищаємо контейнер
  
  // Якщо кошик порожній
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p>Ваш кошик порожній.</p>
        <div style="margin-top: 20px;">
          <a href="index.html" class="btn-secondary">Перейти до покупок</a>
        </div>
      </div>
    `;
    cartFooter.classList.add('visually-hidden'); // Ховаємо підсумок
    return;
  }

  // Показуємо підсумок
  cartFooter.classList.remove('visually-hidden');

  const fragment = document.createDocumentFragment();
  let totalPrice = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.quantity; // Рахуємо суму

    const itemEl = document.createElement('div');
    itemEl.classList.add('cart-item');

    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${item.price} грн</div>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn minus">-</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn plus">+</button>
      </div>
      <div class="cart-item-total">
        ${item.price * item.quantity} грн
      </div>
      <button class="btn-remove">Видалити</button>
    `;

    // Додаємо події на кнопки (+, -, Видалити)
    itemEl.querySelector('.minus').addEventListener('click', () => changeQuantity(item.id, -1));
    itemEl.querySelector('.plus').addEventListener('click', () => changeQuantity(item.id, 1));
    itemEl.querySelector('.btn-remove').addEventListener('click', () => removeFromCart(item.id));

    fragment.appendChild(itemEl);
  });

  cartItemsContainer.appendChild(fragment);
  cartTotalEl.textContent = totalPrice; // Оновлюємо загальну суму
};

// Запускаємо відмальовку при завантаженні сторінки
renderCart();