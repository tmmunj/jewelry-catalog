// ================================================
// ДАННЫЕ ТОВАРОВ (добавляй article)
// ================================================
let items = [
    {
        id: 1,
        article: "r-001",
        tags: ["rings", "silver"],
        image: "img_kart/1.png"
    },
    {
        id: 2,
        article: "R-002",
        tags: ["rings", "silver"],
        image: "img_kart/2.png"
    },
    {
        id: 3,
        article: "e-001",
        tags: ["earrings", "silver"],
        image: "img_kart/3.png"
    },
    {
        id: 4,
        article: "P-001",
        tags: ["pendants", "silver"],
        image: "img_kart/4.png"
    },
    {
        id: 5,
        article: "r-002",
        tags: ["rings", "silver"],
        image: "img_kart/5.png"
    },
    {
        id: 6,
        article: "e-002",
        tags: ["earrings", "silver"],
        image: "img_kart/6.png"
    },
    {
        id: 7,
        article: "r-003",
        tags: ["ring", "silver"],
        image: "img_kart/7.png"
    },
    {
        id: 8,
        article: "r-004",
        tags: ["ring", "silver"],
        image: "img_kart/8.png"
    },
    {
        id: 9,
        article: "p-002",
        tags: ["pendants", "silver"],
        image: "img_kart/9.png"
    },
    {
        id: 10,
        article: "r-006",
        tags: ["ring", "silver", "brand"],
        image: "img_kart/10.png"
    },
    {
        id: 11,
        article: "e-003",
        tags: ["earrings", "silver", "brand"],
        image: "img_kart/11.png"
    },
    {
        id: 12,
        article: "e-004",
        tags: ["earrings", "silver", "brand"],
        image: "img_kart/12.png"
    },
];

// ================================================
// ТЕГИ И ЦВЕТА
// ================================================
const allTags = ["gold", "silver", "bracelets", "earrings", "pendants", "chains", "rings", "sets", "random", "brand"];

const tagColors = {
    pendants: "pendant",
    gold: "rings",
    silver: "pendant",
    bracelets: "pendant",
    earrings: "rings",
    chains: "pendant",
    rings: "rings",
    sets: "pendant",
    random: "rings"
};

let activeFilters = new Set();

// ================================================
// РЕНДЕР ТЕГОВ
// ================================================
function renderAvailableTags() {
    const container = document.getElementById('available-tags');
    container.innerHTML = allTags.map(tag => {
        const isActive = activeFilters.has(tag) ? 'active' : '';
        return `
            <button onclick="toggleFilter('${tag}')" class="tag-filter ${isActive}">
                ${tag}
            </button>
        `;
    }).join('');
}

function renderSelectedTags() {
    const container = document.getElementById('selected-tags');
    if (activeFilters.size === 0) {
        container.innerHTML = `<span class="hint">Выберите теги ниже</span>`;
        return;
    }
    container.innerHTML = Array.from(activeFilters).map(tag => `
        <div onclick="removeFilter('${tag}')" class="selected-tag">
            <span>${tag}</span>
            <span class="x">✕</span>
        </div>
    `).join('');
}

// ================================================
// РЕНДЕР КАРТОЧЕК
// ================================================
function filterItems() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    const filtered = items.filter(item => {
        if (activeFilters.size === 0) return true;
        return Array.from(activeFilters).every(t => item.tags.includes(t));
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="grid-empty">Ничего не найдено</div>`;
        return;
    }

    filtered.forEach(item => {
        const hoverSrc = item.image.replace('.png', 'swap.png');

        const cardHTML = `
            <div class="card" data-article="${item.article}">
                <div class="card-image">
                    <img src="${item.image}" class="main-image" alt="Товар ${item.id}">
                    <img src="${hoverSrc}" class="hover-image" alt="Товар ${item.id}">
                </div>
                <div class="card-tags">
                    ${item.tags.map(tag => `
                        <span onclick="event.stopImmediatePropagation(); addFilterFromCard('${tag}')" class="tag">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });

    setupCardInteractions();
}

// ================================================
// ВЗАИМОДЕЙСТВИЕ: ДВОЙНОЙ КЛИК (ПК) + ДОЛГОЕ НАЖАТИЕ (ТЕЛЕФОН)
// ================================================
const LONG_PRESS_MS = 550;
let copyLocked = false;

function setupCardInteractions() {
    document.querySelectorAll('.card').forEach(card => {
        if (card.dataset.ready) return;
        card.dataset.ready = '1';

        // --- ПК: двойной клик ---
        card.addEventListener('dblclick', (e) => {
            if (e.target.closest('.tag')) return;
            copyArticle(card);
        });

        // --- Телефон: долгое нажатие ---
        let timer = null;
        let moved = false;
        let startX = 0;
        let startY = 0;

        const clearTimer = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };

        card.addEventListener('touchstart', (e) => {
            if (e.target.closest('.tag')) return;
            if (e.touches.length !== 1) return;

            moved = false;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            clearTimer();

            timer = setTimeout(() => {
                timer = null;
                if (!moved) copyArticle(card);
            }, LONG_PRESS_MS);
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            if (!timer) return;
            const t = e.touches[0];
            if (Math.abs(t.clientX - startX) > 12 || Math.abs(t.clientY - startY) > 12) {
                moved = true;
                clearTimer();
            }
        }, { passive: true });

        card.addEventListener('touchend', clearTimer, { passive: true });
        card.addEventListener('touchcancel', clearTimer, { passive: true });

        card.addEventListener('contextmenu', (e) => e.preventDefault());
    });
}

// ================================================
// КОПИРОВАНИЕ АРТИКУЛА (с защитой от двойного вызова)
// ================================================
function copyArticle(cardElement) {
    if (copyLocked) return;
    copyLocked = true;
    setTimeout(() => { copyLocked = false; }, 1500);

    const article = cardElement.getAttribute('data-article');
    showToast(`Артикул ${article} скопирован`);

    // копируем без блокировки интерфейса
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(article).catch(() => {
            fallbackCopy(article);
        });
    } else {
        fallbackCopy(article);
    }
}

function fallbackCopy(text) {
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    } catch (e) {}
}

// Toast уведомление
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    toastText.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 2200);
}

// ================================================
// УПРАВЛЕНИЕ ФИЛЬТРАМИ
// ================================================
function toggleFilter(tag) {
    if (activeFilters.has(tag)) activeFilters.delete(tag);
    else activeFilters.add(tag);
    updateUI();
}

function removeFilter(tag) {
    activeFilters.delete(tag);
    updateUI();
}

function addFilterFromCard(tag) {
    activeFilters.add(tag);
    updateUI();
}

function clearAllFilters() {
    activeFilters.clear();
    updateUI();
}

function updateUI() {
    renderAvailableTags();
    renderSelectedTags();
    filterItems();
}

// ================================================
// ЗАПУСК
// ================================================
window.onload = () => {
    renderAvailableTags();
    renderSelectedTags();
    filterItems();
};