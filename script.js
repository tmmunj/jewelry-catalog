// ================================================
// ДАННЫЕ ТОВАРОВ ПО КАТЕГОРИЯМ
// Добавляй новые карточки в нужный массив
// ================================================

// r — кольца (rings)
let r = [
    { article: "r-001", tags: ["ring"], image: "img_kart/r/r-001.png" },
    { article: "r-002", tags: ["ring"], image: "img_kart/r/r-002.png" },
    { article: "r-003", tags: ["ring"], image: "img_kart/r/r-003.png" },
    { article: "r-004", tags: ["ring"], image: "img_kart/r/r-004.png" },
    { article: "r-005", tags: ["ring"], image: "img_kart/r/r-005.png" },
    { article: "r-006", tags: ["ring", "brand"], image: "img_kart/r/r-006.png" },
    { article: "r-007", tags: ["ring"], image: "img_kart/r/r-007.png" },
    { article: "r-008", tags: ["ring"], image: "img_kart/r/r-008.png" },
];

// e — серьги (earrings)
let e = [
    { article: "e-001", tags: ["earrings"], image: "img_kart/e/e-001.png" },
    { article: "e-002", tags: ["earrings"], image: "img_kart/e/e-002.png" },
    { article: "e-003", tags: ["earrings", "brand"], image: "img_kart/e/e-003.png" },
    { article: "e-004", tags: ["earrings", "brand"], image: "img_kart/e/e-004.png" },
    { article: "e-005", tags: ["earrings", "brand"], image: "img_kart/e/e-005.png" },
    { article: "e-006", tags: ["earrings", "brand"], image: "img_kart/e/e-006.png" },
];

// p — подвески (pendants)
let p = [
    { article: "P-001", tags: ["pendants"], image: "img_kart/p/P-001.png" },
    { article: "p-002", tags: ["pendants"], image: "img_kart/p/p-002.png" },
];

// b — браслеты (bracelets)
let b = [
    // { article: "b-001", tags: ["bracelets"], image: "img_kart/b/b-001.png" },
];

// c — цепочки (chains)
let c = [
    { article: "c-001", tags: ["chains"], image: "img_kart/c/c-001.png" },
    { article: "c-002", tags: ["chains"], image: "img_kart/c/c-002.png" },
];


// общий список (id выдаётся автоматически)
let items = [...r, ...e, ...p, ...b, ...c].map(function (item, index) {
    return Object.assign({}, item, { id: index + 1 });
});

const allTags = ["bracelets", "earrings", "pendants", "chains", "ring", "sets", "random", "brand"];
let activeFilters = new Set();

const SOCIAL = {
    telegram: "tmmunjewelry",
    vk: "https://vk.com/your_page",
    instagram: "your_instagram"
};

// Formspree: замените на свой ID с https://formspree.io
// Пример: если endpoint https://formspree.io/f/xyzabcde → укажите "xyzabcde"
const FORMSPREE_ID = "xjybzwap";

// текущий выбор в модалке
let currentArticle = "";
let currentIsRing = false;
let selectedRingSize = null;

function isRingItem(tags, article) {
    if (tags && tags.some(function (t) {
        var x = (t || "").toLowerCase();
        return x === "ring" || x === "rings";
    })) return true;
    // запасной вариант: артикул начинается с r (r-001, R-001, r001…)
    var a = (article || "").toLowerCase().replace(/^\s+/, "");
    return a.charAt(0) === "r";
}

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
        const hoverSrc = item.image.replace(".png", "swap.png");
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
    var tags = (card.getAttribute("data-tags") || "").split(",").filter(Boolean);
    var ring = isRingItem(tags, article);

    currentArticle = article;
    currentIsRing = ring;
    selectedRingSize = null;

    copyOrderText();
    openOrderModal(article, ring);
}

function buildOrderMessage() {
    var text = "Здравствуйте! Хочу заказать артикул " + (currentArticle || "");
    if (currentIsRing && selectedRingSize) {
        text += ", размер " + selectedRingSize;
    }
    return text;
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
    var linkIg = document.getElementById("link-ig");
    if (linkTg) linkTg.href = "https://t.me/" + SOCIAL.telegram + "?text=" + msg;
    if (linkVk) linkVk.href = SOCIAL.vk;
    if (linkIg) linkIg.href = "https://instagram.com/" + SOCIAL.instagram;
}

function openOrderModal(article, isRing) {
    var modal = document.getElementById("order-modal");
    if (!modal) return;

    document.getElementById("modal-article").textContent = article || "—";

    var formArticle = document.getElementById("form-article");
    var formSize = document.getElementById("form-size");
    if (formArticle) formArticle.value = article || "";
    if (formSize) formSize.value = "";

    var form = document.getElementById("order-form");
    if (form) form.reset();
    if (formArticle) formArticle.value = article || "";

    var status = document.getElementById("form-status");
    if (status) {
        status.hidden = true;
        status.textContent = "";
        status.className = "form-status";
    }
    var submitBtn = document.getElementById("form-submit-btn");
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить заявку";
    }

    var sizeBlock = document.getElementById("ring-size-block");
    if (sizeBlock) {
        if (isRing) {
            sizeBlock.hidden = false;
            sizeBlock.style.display = "block";
            sizeBlock.querySelectorAll(".size-btn").forEach(function (btn) {
                btn.classList.remove("active");
            });
        } else {
            sizeBlock.hidden = true;
            sizeBlock.style.display = "none";
        }
    }

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

function setupRingSizeButtons() {
    var options = document.getElementById("ring-size-options");
    if (!options) return;

    options.addEventListener("click", function (e) {
        var btn = e.target.closest(".size-btn");
        if (!btn) return;

        options.querySelectorAll(".size-btn").forEach(function (b) {
            b.classList.remove("active");
        });
        btn.classList.add("active");
        selectedRingSize = btn.getAttribute("data-size");

        var formSize = document.getElementById("form-size");
        if (formSize) formSize.value = selectedRingSize || "";

        copyOrderText();
        updateSocialLinks();
    });
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

function setupOrderForm() {
    var form = document.getElementById("order-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!FORMSPREE_ID || FORMSPREE_ID === "YOUR_FORMSPREE_ID") {
            alert("Сначала укажите FORMSPREE_ID в script.js\nИнструкция: formspree.io → New Form → скопируйте ID");
            return;
        }

        var submitBtn = document.getElementById("form-submit-btn");
        var status = document.getElementById("form-status");

        // актуальные артикул и размер
        var formArticle = document.getElementById("form-article");
        var formSize = document.getElementById("form-size");
        if (formArticle) formArticle.value = currentArticle || "";
        if (formSize) formSize.value = selectedRingSize || "";

        if (currentIsRing && !selectedRingSize) {
            if (status) {
                status.hidden = false;
                status.className = "form-status error";
                status.textContent = "Выберите размер кольца";
            }
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка...";
        if (status) {
            status.hidden = true;
            status.textContent = "";
        }

        var data = new FormData(form);

        fetch("https://formspree.io/f/" + FORMSPREE_ID, {
            method: "POST",
            body: data,
            headers: { "Accept": "application/json" }
        })
            .then(function (res) {
                if (!res.ok) throw new Error("fail");
                submitBtn.textContent = "Отправлено";
                if (status) {
                    status.hidden = false;
                    status.className = "form-status ok";
                    status.textContent = "Заявка отправлена! Мы свяжемся с вами.";
                }
                setTimeout(function () {
                    closeOrderModal();
                }, 1800);
            })
            .catch(function () {
                submitBtn.disabled = false;
                submitBtn.textContent = "Отправить заявку";
                if (status) {
                    status.hidden = false;
                    status.className = "form-status error";
                    status.textContent = "Не удалось отправить. Напишите в соцсети ниже.";
                }
            });
    });
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
    setupRingSizeButtons();
    setupOrderForm();

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
