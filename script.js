// ================================================
// ДАННЫЕ ТОВАРОВ ПО КАТЕГОРИЯМ
// Добавляй новые карточки в нужный массив
// ================================================

// Имена файлов: r1.png — основное фото, r1s.png — hover
// r — кольца (rings)
let r = [
    { article: "r-001", tags: ["ring"], image: "img_kart/r/r1.png" },
    { article: "r-002", tags: ["ring"], image: "img_kart/r/r2.png" },
    { article: "r-003", tags: ["ring"], image: "img_kart/r/r3.png" },
    { article: "r-004", tags: ["ring"], image: "img_kart/r/r4.png" },
    { article: "r-005", tags: ["ring"], image: "img_kart/r/r5.png" },
    { article: "r-006", tags: ["ring", "brand"], image: "img_kart/r/r6.png" },
    { article: "r-007", tags: ["ring"], image: "img_kart/r/r7.png" },
    { article: "r-008", tags: ["ring"], image: "img_kart/r/r8.png" },
];

// e — серьги (earrings)
let e = [
    { article: "e-001", tags: ["earrings"], image: "img_kart/e/e1.png" },
    { article: "e-002", tags: ["earrings"], image: "img_kart/e/e2.png" },
    { article: "e-003", tags: ["earrings", "brand"], image: "img_kart/e/e3.png" },
    { article: "e-004", tags: ["earrings", "brand"], image: "img_kart/e/e4.png" },
    { article: "e-005", tags: ["earrings", "brand"], image: "img_kart/e/e5.png" },
    { article: "e-006", tags: ["earrings", "brand"], image: "img_kart/e/e6.png" },
];

// p — подвески (pendants)
let p = [
    { article: "P-001", tags: ["pendants"], image: "img_kart/p/p1.png" },
    { article: "p-002", tags: ["pendants"], image: "img_kart/p/p2.png" },
];

// b — браслеты (bracelets)
let b = [
    { article: "b-001", tags: ["bracelets"], image: "img_kart/b/b1.png" },
    { article: "b-002", tags: ["bracelets"], image: "img_kart/b/b2.png" },
    { article: "b-003", tags: ["bracelets"], image: "img_kart/b/b3.png" },
];

// c — цепочки (chains)
let c = [
    { article: "c-001", tags: ["chains"], image: "img_kart/c/c1.png" },
    { article: "c-002", tags: ["chains"], image: "img_kart/c/c2.png" },
];


// общий список (id выдаётся автоматически)
let items = [...r, ...e, ...p, ...b, ...c].map(function (item, index) {
    return Object.assign({}, item, { id: index + 1 });
});

const allTags = ["bracelets", "earrings", "pendants", "chains", "ring", "sets", "random", "brand"];
let activeFilters = new Set();

const SOCIAL = {
    telegram: "tmmunjewelry",
    vk: "https://vk.com/your_page"
};

// текущий выбор в модалке
let currentArticle = "";

function renderAvailableTags() {
    const container = document.getElementById("available-tags");
    container.innerHTML = allTags.map(tag => {
        const isActive = activeFilters.has(tag) ? "active" : "";
        return '<button type="button" onclick="toggleFilter(\'' + tag + '\')" class="tag-filter ' + isActive + '">' + tag + '</button>';
    }).join("");
}

function renderSelectedTags() {
    const container = document.getElementById("selected-tags");
    if (activeFilters.size === 0) {
        container.innerHTML = '<span class="hint">Выберите теги ниже</span>';
        return;
    }
    container.innerHTML = Array.from(activeFilters).map(tag =>
        '<div onclick="removeFilter(\'' + tag + '\')" class="selected-tag"><span>' + tag + '</span><span class="x">✕</span></div>'
    ).join("");
}

function filterItems() {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    const filtered = items.filter(item => {
        if (activeFilters.size === 0) return true;
        return Array.from(activeFilters).every(t => item.tags.includes(t));
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="grid-empty">Ничего не найдено</div>';
        return;
    }

    filtered.forEach(item => {
        const hoverSrc = item.image.replace(".png", "s.png");
        const tagsAttr = item.tags.join(",");
        let tagsHtml = item.tags.map(tag =>
            '<span class="tag" data-tag="' + tag + '">' + tag + '</span>'
        ).join("");

        grid.innerHTML +=
            '<div class="card" data-article="' + item.article + '" data-tags="' + tagsAttr + '">' +
            '<div class="card-image">' +
            '<img src="' + item.image + '" class="main-image" alt="Товар ' + item.id + '" draggable="false">' +
            '<img src="' + hoverSrc + '" class="hover-image" alt="Товар ' + item.id + '" draggable="false">' +
            '</div>' +
            '<div class="card-tags">' + tagsHtml + '</div>' +
            '</div>';
    });

    grid.querySelectorAll(".tag").forEach(el => {
        el.addEventListener("click", function (e) {
            e.stopPropagation();
            addFilterFromCard(el.getAttribute("data-tag"));
        });
    });

    setupCardInteractions();
}

let actionLocked = false;

function setupCardInteractions() {
    document.querySelectorAll(".card").forEach(card => {
        if (card.dataset.ready) return;
        card.dataset.ready = "1";

        card.addEventListener("dblclick", function (e) {
            if (e.target.closest(".tag")) return;
            onCardSelect(card);
        });

        var lastTap = 0;
        card.addEventListener("touchend", function (e) {
            if (e.target.closest(".tag")) return;
            var now = Date.now();
            if (now - lastTap < 350) {
                e.preventDefault();
                onCardSelect(card);
                lastTap = 0;
            } else {
                lastTap = now;
            }
        }, { passive: false });

        card.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    });
}

function onCardSelect(card) {
    if (actionLocked) return;
    actionLocked = true;
    setTimeout(function () { actionLocked = false; }, 600);

    var article = card.getAttribute("data-article") || "";
    currentArticle = article;

    copyOrderText();
    openOrderModal(article);
}

function buildOrderMessage() {
    return "Здравствуйте! Интересует артикул " + (currentArticle || "");
}

function copyOrderText() {
    copyText(buildOrderMessage());
}

function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
    } catch (e) { }
}

function updateSocialLinks() {
    var msg = encodeURIComponent(buildOrderMessage());
    var linkTg = document.getElementById("link-tg");
    var linkVk = document.getElementById("link-vk");
    if (linkTg) linkTg.href = "https://t.me/" + SOCIAL.telegram + "?text=" + msg;
    if (linkVk) linkVk.href = SOCIAL.vk;
}

function openOrderModal(article) {
    var modal = document.getElementById("order-modal");
    if (!modal) return;

    document.getElementById("modal-article").textContent = article || "—";

    updateSocialLinks();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeOrderModal() {
    var modal = document.getElementById("order-modal");
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
}

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

function openHintModal() {
    var modal = document.getElementById("hint-modal");
    if (!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeHintModal() {
    var modal = document.getElementById("hint-modal");
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
}

window.onload = function () {
    renderAvailableTags();
    renderSelectedTags();
    filterItems();

    var discVk = document.getElementById("disclaimer-vk");
    var hintVk = document.getElementById("hint-vk");
    if (discVk) discVk.href = SOCIAL.vk;
    if (hintVk) hintVk.href = SOCIAL.vk;

    var modal = document.getElementById("order-modal");
    var closeBtn = document.getElementById("modal-close-btn");

    if (closeBtn) closeBtn.onclick = closeOrderModal;
    if (modal) {
        modal.onclick = function (e) {
            if (e.target === modal) closeOrderModal();
        };
    }

    // кнопка ЗАКАЗАТЬ → подсказка
    var hintBtn = document.getElementById("order-hint-btn");
    var hintModal = document.getElementById("hint-modal");
    var hintClose = document.getElementById("hint-close-btn");
    var hintOk = document.getElementById("hint-ok-btn");

    if (hintBtn) hintBtn.onclick = openHintModal;
    if (hintClose) hintClose.onclick = closeHintModal;
    if (hintOk) hintOk.onclick = closeHintModal;
    if (hintModal) {
        hintModal.onclick = function (e) {
            if (e.target === hintModal) closeHintModal();
        };
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeOrderModal();
            closeHintModal();
        }
    });
};
