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
  document.getElementById('delivery-form').classList.remove('visually-hidden');
  
  const fragment = document.createDocumentFragment();
  let totalPrice = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.quantity; // Рахуємо суму

    const itemEl = document.createElement('div');
    itemEl.classList.add('cart-item');

    // ВИПРАВЛЕНО: замінив item.image на item.image_url
    itemEl.innerHTML = `
      <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
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



// ВІДПРАВКА ЗАМОВЛЕННЯ НА СЕРВЕР

// Знаходимо кнопку оформлення замовлення (переконайся, що в HTML у неї є id="checkout-btn")
const checkoutBtn = document.getElementById('checkout-btn');

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', async () => {
    const cart = getCart();
    
    if (cart.length === 0) {
      alert('Ваш кошик порожній!');
      return;
    }

    // Беремо токен авторизації
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Будь ласка, увійдіть в акаунт, щоб зробити замовлення!');
      return;
    }

    // Формуємо дані для бекенду
    let totalSum = 0;
    const itemsForBackend = cart.map(item => {
      totalSum += item.price * item.quantity;
      return {
        product: item.id,
        quantity: item.quantity,
        price: item.price
      };
    });

    // Збираємо дані з форми
    const lastName = document.getElementById('order-lastname').value.trim();
    const firstName = document.getElementById('order-firstname').value.trim();
    const middleName = document.getElementById('order-middlename').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const city = document.getElementById('order-city').value.trim();
    const novaPoshta = document.getElementById('order-np').value.trim();
    const emailInputEl = document.getElementById('order-email');
    const emailValue = emailInputEl.value.trim();
    const emailErrorBlock = document.getElementById('email-error-msg');

    // 1. Спочатку ховаємо помилку і повертаємо звичайну рамку (якщо клієнт пробує ще раз)
    if (emailErrorBlock) emailErrorBlock.style.display = 'none';
    emailInputEl.style.borderColor = ''; // скидаємо колір рамки

    // 2. Робимо перевірку
    if (!emailValue.endsWith('@gmail.com')) {
      // Показуємо наш красивий текст
      emailErrorBlock.style.display = 'block';
      
      // Фарбуємо рамку поля в червоний колір
      emailInputEl.style.borderColor = '#e63946';
      
      // Автоматично ставимо курсор у це поле, щоб клієнту було зручно виправляти
      emailInputEl.focus(); 
      
      return; // Зупиняємо відправку замовлення
    }

    const orderData = {
      total_price: totalSum,
      last_name: lastName,
      first_name: firstName,
      middle_name: middleName,
      phone: phone,
      city: city,
      nova_poshta: novaPoshta,
      items: itemsForBackend
    };

    // Відправляємо POST-запит
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(orderData)
      });

    if (response.ok) {
        // Очищаємо кошик в пам'яті
        localStorage.removeItem('cart'); 
        
        // Ховаємо блок з підсумковою сумою і кнопкою
        cartFooter.classList.add('visually-hidden'); 
        
        // ОСЬ ЦЯ НОВА МАГІЯ: Ховаємо форму доставки!
        document.getElementById('delivery-form').classList.add('visually-hidden');

        // Малюємо красиве повідомлення
        cartItemsContainer.innerHTML = `
          <div style="text-align: center; padding: 50px 20px; animation: fadeIn 0.5s ease;">
            <div style="font-size: 70px; margin-bottom: 20px;">✨📦✨</div>
            <h2 style="color: #d4a373; margin-bottom: 15px;">Дякуємо за замовлення!</h2>
            <p style="font-size: 1.1rem; color: #666; margin-bottom: 30px; line-height: 1.5;">
              Ваше замовлення успішно оформлено.<br>
              Ми вже готуємо ваші баночки до відправки і скоро зв'яжемося з вами!
            </p>
            <a href="index.html" class="btn-buy" style="text-decoration: none; display: inline-block;">Повернутися до покупок</a>
          </div>
        `;
      }
    } catch (error) {
      console.error('Помилка підключення:', error);
      alert('Немає зв\'язку з сервером.');
    }
  });
}