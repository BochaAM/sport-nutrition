// Основной скрипт для всего сайта
console.log('Интеллектуальная система подбора спортивного питания загружена');

// ========== ОБЩИЕ ФУНКЦИИ ==========

// Форматирование цены
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '₽';
}

// Добавление в корзину
function addToCart(productId, productName) {
    console.log(`Добавление товара ${productId} в корзину`);
    
    // Создаем уведомление
    showNotification(`"${productName}" добавлен в корзину!`, 'success');
    
    // В реальном проекте здесь была бы логика корзины
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({
        id: productId,
        name: productName,
        date: new Date().toISOString()
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Обновляем счетчик корзины если есть
    updateCartCount();
}

// Обновление счетчика корзины
function updateCartCount() {
    const cartCounter = document.getElementById('cartCounter');
    if (cartCounter) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartCounter.textContent = cart.length;
        cartCounter.style.display = cart.length > 0 ? 'inline-block' : 'none';
    }
}

// ========== АНИМАЦИИ КНОПОК ==========

// Ripple эффект для кнопок
function initButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Ripple эффект при клике
        button.addEventListener('mousedown', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
                z-index: 0;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
        
        // Анимация при наведении
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
            this.style.boxShadow = '0 10px 25px rgba(52, 152, 219, 0.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Добавляем стили для ripple эффекта
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== АНИМАЦИИ СТРАНИЦ ==========

// Плавное появление элементов
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Наблюдаем за всеми элементами с классом .animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ========== УВЕДОМЛЕНИЯ ==========

// Показ уведомлений
function showNotification(message, type = 'info') {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.custom-notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
        <div class="notification-content ${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Показываем
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Скрываем через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== ТЕМА (СВЕТЛАЯ/ТЕМНАЯ) ==========

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
    
    // Обработчик переключения
    themeToggle.addEventListener('change', function() {
        const theme = this.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        showNotification(`Тема изменена на ${theme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    });
}

// ========== ФИЛЬТРАЦИЯ И СОРТИРОВКА ==========

// Быстрая сортировка товаров
function quickSortProducts(products, sortBy) {
    if (products.length <= 1) return products;
    
    const pivot = products[0];
    const left = [];
    const right = [];
    
    for (let i = 1; i < products.length; i++) {
        const comparison = compareProducts(products[i], pivot, sortBy);
        if (comparison < 0) {
            left.push(products[i]);
        } else {
            right.push(products[i]);
        }
    }
    
    return [...quickSortProducts(left, sortBy), pivot, ...quickSortProducts(right, sortBy)];
}

// Сравнение товаров для сортировки
function compareProducts(a, b, sortBy) {
    switch(sortBy) {
        case 'price-low':
            return a.price - b.price;
        case 'price-high':
            return b.price - a.price;
        case 'name':
            return a.name.localeCompare(b.name);
        default:
            return 0;
    }
}

// ========== ПОИСК ==========

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const name = product.querySelector('.product-name').textContent.toLowerCase();
            const description = product.querySelector('.product-description').textContent.toLowerCase();
            const category = product.querySelector('.product-category').textContent.toLowerCase();
            
            const isVisible = name.includes(searchTerm) || 
                            description.includes(searchTerm) || 
                            category.includes(searchTerm) ||
                            searchTerm.length === 0;
            
            product.style.display = isVisible ? 'block' : 'none';
            product.style.animation = isVisible ? 'fadeIn 0.5s ease' : 'none';
        });
        
        // Показываем сообщение если ничего не найдено
        const visibleProducts = Array.from(products).filter(p => p.style.display !== 'none');
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = visibleProducts.length === 0 ? 'block' : 'none';
        }
    });
}

// ========== СЛАЙДЕР ИЗОБРАЖЕНИЙ ==========

function initImageSlider() {
    const sliders = document.querySelectorAll('.image-slider');
    
    sliders.forEach(slider => {
        const images = slider.querySelectorAll('img');
        let currentIndex = 0;
        
        if (images.length <= 1) return;
        
        // Создаем кнопки навигации
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.className = 'slider-btn prev';
        
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.className = 'slider-btn next';
        
        // Создаем индикаторы
        const indicators = document.createElement('div');
        indicators.className = 'slider-indicators';
        
        images.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(indicator);
        });
        
        slider.appendChild(prevBtn);
        slider.appendChild(nextBtn);
        slider.appendChild(indicators);
        
        // Функции навигации
        function showSlide(index) {
            images.forEach((img, i) => {
                img.style.display = i === index ? 'block' : 'none';
            });
            
            // Обновляем индикаторы
            indicators.querySelectorAll('.indicator').forEach((ind, i) => {
                ind.classList.toggle('active', i === index);
            });
            
            currentIndex = index;
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % images.length;
            showSlide(currentIndex);
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showSlide(currentIndex);
        }
        
        function goToSlide(index) {
            showSlide(index);
        }
        
        // Автопереключение
        let slideInterval = setInterval(nextSlide, 5000);
        
        // Обработчики событий
        prevBtn.addEventListener('click', () => {
            prevSlide();
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        nextBtn.addEventListener('click', () => {
            nextSlide();
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        // Останавливаем автопереключение при наведении
        slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slider.addEventListener('mouseleave', () => slideInterval = setInterval(nextSlide, 5000));
        
        // Показываем первый слайд
        showSlide(0);
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ГЛАВНОЙ СТРАНИЦЫ ==========

function initHomePage() {
    console.log('Инициализация главной страницы');
    
    // Запускаем анимации кнопок
    initButtonAnimations();
    
    // Запускаем анимации при скролле
    initScrollAnimations();
    
    // Инициализируем переключение темы
    initThemeToggle();
    
    // Инициализируем поиск
    initSearch();
    
    // Запускаем слайдеры
    initImageSlider();
    
    // Обновляем счетчик корзины
    updateCartCount();
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        showNotification('Добро пожаловать в систему подбора спортивного питания!', 'info');
    }, 1000);
}

// ========== ИНИЦИАЛИЗАЦИЯ КВИЗА ==========

function initQuizPage() {
    console.log('Инициализация страницы квиза');
    initButtonAnimations();
    initScrollAnimations();
}

// ========== ИНИЦИАЛИЗАЦИЯ РЕЗУЛЬТАТОВ ==========

function initResultsPage() {
    console.log('Инициализация страницы результатов');
    initButtonAnimations();
    initScrollAnimations();
    initSearch();
    updateCartCount();
}

// ========== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    // Определяем текущую страницу
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    console.log(`Текущая страница: ${page}`);
    
    // Инициализируем соответствующую страницу
    if (page === 'index.html' || page === '' || page.includes('github.io')) {
        initHomePage();
    } else if (page === 'quiz.html') {
        initQuizPage();
    } else if (page === 'results.html') {
        initResultsPage();
    }
    
    // Общие стили для уведомлений
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .custom-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            transform: translateX(150%);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .custom-notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            background: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            border-left: 4px solid #3498db;
        }
        
        .notification-content.success {
            border-left-color: #2ecc71;
        }
        
        .notification-content.error {
            border-left-color: #e74c3c;
        }
        
        .notification-content.info {
            border-left-color: #3498db;
        }
        
        .notification-content i {
            font-size: 20px;
        }
        
        .notification-content.success i {
            color: #2ecc71;
        }
        
        .notification-content.error i {
            color: #e74c3c;
        }
        
        .notification-content.info i {
            color: #3498db;
        }
        
        /* Анимация появления */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Стили для слайдера */
        .image-slider {
            position: relative;
            overflow: hidden;
        }
        
        .slider-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(52, 152, 219, 0.8);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .slider-btn.prev {
            left: 10px;
        }
        
        .slider-btn.next {
            right: 10px;
        }
        
        .slider-indicators {
            position: absolute;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
        }
        
        .indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            border: none;
            cursor: pointer;
            padding: 0;
        }
        
        .indicator.active {
            background: white;
            transform: scale(1.2);
        }
        
        /* Тёмная тема */
        [data-theme="dark"] {
            --bg-color: #1a1a2e;
            --text-color: #ffffff;
            --card-bg: #16213e;
        }
        
        [data-theme="dark"] .container {
            background: var(--card-bg);
            color: var(--text-color);
        }
    `;
    
    document.head.appendChild(notificationStyles);
});

// Экспорт функций для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatPrice,
        addToCart,
        showNotification,
        quickSortProducts,
        compareProducts
    };
}
