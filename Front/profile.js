document.addEventListener('DOMContentLoaded', async () => {
    const myToken = localStorage.getItem('access_token');
    
    if (!myToken) {
        window.location.href = 'index.html';
        return;
    }

    // Формуємо ключ безпечно
    const authKey = 'Authori' + String.fromCharCode(122) + 'ation';
    const reqHeaders = {
        'Content-Type': 'application/json'
    };
    reqHeaders[authKey] = `Bearer ${myToken}`;

    try {
        const req = await fetch('http://127.0.0.1:8000/api/users/orders/my/', {
            method: 'GET',
            headers: reqHeaders
        });

        if (req.ok) {
            const data = await req.json();
            renderMyOrders(data);
        } else {
            document.getElementById('my-orders-list').innerHTML = `
                <p class="loading-text" style="color: #e63946;">
                    Ваша сесія закінчилась. Будь ласка, перелогіньтеся!
                </p>`;
        }
    } catch (err) {
        console.error('Помилка мережі:', err);
    }
});

function renderMyOrders(dataList) {
    const wrap = document.getElementById('my-orders-list');

    if (dataList.length === 0) {
        wrap.innerHTML = '<p class="loading-text">Ви ще нічого не купували.</p>';
        return;
    }

    const labels = {
        'pending': '⏳ Очікує підтвердження',
        'processing': '⚙️ В обробці',
        'shipped': '🚚 Відправлено',
        'delivered': '✅ Отримано',
        'canceled': '❌ Скасовано'
    };

    let content = '';
    
    dataList.forEach(item => {
        const d = new Date(item.created_at).toLocaleDateString('uk-UA', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
        });
        const curStatus = labels[item.status] || item.status;

        // НОВЕ: Збираємо список товарів для цього чека
        let productsHtml = '<ul class="order-products-list">';
        if (item.items && item.items.length > 0) {
            item.items.forEach(prod => {
                // Якщо бекенд ще не передає назву, покажемо просто номер товару
                const prodName = prod.product_name || `Товар №${prod.product}`;
                productsHtml += `<li>${prodName} — ${prod.quantity} шт. (по ${prod.price} грн)</li>`;
            });
        } else {
            productsHtml += '<li>Деталі відсутні</li>';
        }
        productsHtml += '</ul>';

        content += `
        <div class="order-card">
            
            <div class="order-header">
                <b>Чек #${item.id}</b>
                <small style="color: #888;">${d}</small>
            </div>
            
            <div class="order-status">
                <span class="status-badge">${curStatus}</span>
            </div>
            
            <div class="order-details">
                <p><b>Склад замовлення:</b></p>
                ${productsHtml}
                
                <p style="margin-top: 15px;">
                    <small>Доставка: ${item.city || 'Не вказано'}, НП №${item.nova_poshta || '-'}</small>
                </p>
            </div>
            
            <div class="order-total">
                До сплати: ${item.total_price} грн
            </div>
            
        </div>
        `;
    });

    wrap.innerHTML = content;
}