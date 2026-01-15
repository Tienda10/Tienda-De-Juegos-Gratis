// Generar Recomendados Aleatorios
const recommendedGrid = document.getElementById('recommended-grid');
const allCards = Array.from(document.querySelectorAll('.game-card'));

// Barajar y tomar 3 juegos al azar
const shuffled = allCards.sort(() => 0.5 - Math.random());
const selected = shuffled.slice(0, 3);

selected.forEach(card => {
    // Clonamos la tarjeta para ponerla en recomendados
    const clone = card.cloneNode(true);
    recommendedGrid.appendChild(clone);
});

// Lógica del Buscador
const searchInput = document.getElementById('search-input');
const recommendedSection = document.getElementById('recommended-section');
const heroSection = document.querySelector('.hero');
const noResultsMsg = document.getElementById('no-results');
const searchSuggestions = document.getElementById('search-suggestions');
const searchClear = document.getElementById('search-clear');
const gameCards = document.querySelectorAll('.game-card');

// Función de filtrado reutilizable
function filterGames(term) {
    let visibleCount = 0;
    let matches = [];

    // Ocultar sección de recomendados y hero si hay búsqueda
    if (term.length > 0) {
        recommendedSection.style.display = 'none';
        heroSection.style.display = 'none';
    } else {
        recommendedSection.style.display = 'block';
        heroSection.style.display = 'block';
    }

    gameCards.forEach(card => {
        const title = card.querySelector('.game-title').textContent.toLowerCase();
        const desc = card.querySelector('.game-desc').textContent.toLowerCase();

        // Si el título o la descripción contienen el término, mostramos la tarjeta
        if (title.includes(term) || desc.includes(term)) {
            card.style.display = 'flex';
            visibleCount++;
            // Guardar coincidencia para sugerencias (solo si coincide título)
            if (title.includes(term)) {
                matches.push({ title: card.querySelector('.game-title').textContent, img: card.querySelector('.game-image').src });
            }
        } else {
            card.style.display = 'none';
        }
    });

    // Mostrar mensaje si no hay resultados y hay texto en el buscador
    if (visibleCount === 0 && term.length > 0) {
        noResultsMsg.style.display = 'block';
    } else {
        noResultsMsg.style.display = 'none';
    }
    return matches;
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const matches = filterGames(term);

    // Mostrar/Ocultar botón de borrar
    searchClear.style.display = term.length > 0 ? 'block' : 'none';

    // --- Lógica de Sugerencias ---
    searchSuggestions.innerHTML = '';
    if (term.length > 0 && matches.length > 0) {
        // Limitar a 5 sugerencias
        matches.slice(0, 5).forEach(match => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <img src="${match.img}" class="suggestion-thumb" alt="${match.title}">
                <span>${match.title}</span>
            `;
            div.addEventListener('click', () => {
                searchInput.value = match.title;
                searchSuggestions.style.display = 'none';
                filterGames(match.title.toLowerCase()); // Filtrar sin mostrar sugerencias
            });
            searchSuggestions.appendChild(div);
        });
        searchSuggestions.style.display = 'block';
    } else {
        searchSuggestions.style.display = 'none';
    }
});

// Botón Borrar Búsqueda
searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    searchSuggestions.style.display = 'none';
    filterGames(''); // Resetear grid
    searchInput.focus();
});

// Ocultar sugerencias al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
        searchSuggestions.style.display = 'none';
    }
});

// Lógica del Menú Hamburguesa
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Lógica de Compartir
document.addEventListener('click', async (e) => {
    if (e.target.closest('.share-btn')) {
        const btn = e.target.closest('.share-btn');
        const title = btn.dataset.title;
        const text = `¡Descarga ${title} gratis en Gaming Station!`;
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch (err) {
                console.log('Error al compartir:', err);
            }
        } else {
            // Fallback para PC
            try {
                await navigator.clipboard.writeText(`${text} ${url}`);
                alert('✅ Enlace copiado al portapapeles. ¡Compártelo con tus amigos!');
            } catch (err) {
                console.error('Error al copiar:', err);
            }
        }
    }
});

// Lógica del Modal (Tarjeta de Información)
const modal = document.getElementById('game-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalDownload = document.getElementById('modal-download');
const closeModal = document.querySelector('.close-modal');

// Delegación de eventos para abrir modal (funciona con elementos clonados)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('download-btn')) {
        const btn = e.target;
        const card = btn.closest('.game-card');
        const img = card.querySelector('.game-image').src;
        const title = card.querySelector('.game-title').textContent;
        const desc = card.querySelector('.game-desc').textContent;
        const link = btn.dataset.link;

        modalImg.src = img;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalDownload.href = link;

        modal.style.display = 'flex';
    }
});

// Cerrar modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

// --- Lógica para ocultar el logo al hacer scroll ---
const logo = document.querySelector('.logo');
const sidebar = document.querySelector('.sidebar');
let lastScrollTop = 0;
let ticking = false; // Para optimizar rendimiento

function handleScroll(scrollTop) {
    // No ocultar si el menú está abierto en móvil
    const nav = document.getElementById('nav-links');
    if (nav && nav.classList.contains('active')) return;

    // Detectar si estamos al final de la página (Zona Segura)
    // Esto evita el parpadeo por "rebote" al llegar al fondo
    const mainContent = document.querySelector('.main-content');
    const isAtBottom = mainContent.scrollHeight - mainContent.scrollTop <= mainContent.clientHeight + 50;
    const isMobileAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;

    // Si estamos al final, forzamos mostrar (o no hacer nada) para evitar glitches
    if (isAtBottom || isMobileAtBottom) {
        logo.classList.remove('hidden');
        sidebar.classList.remove('hidden-mobile');
        return;
    }

    // Lógica normal de scroll
    if (scrollTop > lastScrollTop && scrollTop > 80) { // Aumenté un poco el umbral a 80px
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active'); // Cerrar menú automáticamente al bajar
        }
        logo.classList.add('hidden'); // Ocultar al bajar
        sidebar.classList.add('hidden-mobile');
    } else {
        logo.classList.remove('hidden'); // Mostrar al subir
        sidebar.classList.remove('hidden-mobile');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

// Escuchar scroll en ambos contenedores (PC y Móvil)
// Usamos requestAnimationFrame para que sea ultra suave y no parpadee
document.querySelector('.main-content').addEventListener('scroll', (e) => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll(e.target.scrollTop);
            ticking = false;
        });
        ticking = true;
    }
});

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll(window.scrollY);
            ticking = false;
        });
        ticking = true;
    }
});

// --- Lógica del Menú de Categorías ---
const categoryLinks = document.querySelectorAll('.nav-link');
const mainGamesGrids = document.querySelectorAll('.main-content > .games-grid'); // Seleccionar todas las grillas principales
const mainTitle = document.getElementById('catalog-title'); // Título específico del catálogo
const pcTitle = document.getElementById('pc-section-title'); // Título de la sección PC

categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 1. Gestionar clase active visual
        categoryLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // 2. Cerrar menú móvil si está abierto
        const navLinks = document.getElementById('nav-links');
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }

        // 3. Obtener filtro y aplicar lógica
        const filter = link.getAttribute('data-filter');
        
        if (filter === 'all') {
            // Mostrar todo (Hero, Recomendados, Todas las cards)
            document.querySelector('.hero').style.display = 'block';
            document.getElementById('recommended-section').style.display = 'block';
            mainGamesGrids.forEach(grid => {
                grid.querySelectorAll('.game-card').forEach(card => card.style.display = 'flex');
            });
            mainTitle.textContent = '📱 Juegos para Móvil';
            if (pcTitle) pcTitle.style.display = 'flex';
        } else {
            // Ocultar Hero y Recomendados para enfocar en la categoría
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('recommended-section').style.display = 'none';
            
            // Filtrar cartas
            mainGamesGrids.forEach(grid => {
                grid.querySelectorAll('.game-card').forEach(card => {
                    const desc = card.querySelector('.game-desc').textContent.toLowerCase();
                    const badge = card.querySelector('.platform-badge');
                    const isPC = badge && badge.textContent.trim() === 'PC';

                    // Truco: Incluir conducción en deportes
                    const isSports = filter === 'deportes' && (desc.includes('conducción') || desc.includes('carreras'));
                    
                    if (filter === 'pc') {
                        // Mostrar solo si tiene el badge de PC
                        card.style.display = isPC ? 'flex' : 'none';
                    } else if (desc.includes(filter) || isSports) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
            
            // Actualizar título
            const text = link.textContent.trim();
            mainTitle.textContent = text;

            // Ocultar el título estático de PC si estamos en la vista exclusiva de PC (para no duplicar)
            if (pcTitle) {
                pcTitle.style.display = filter === 'pc' ? 'none' : 'flex';
            }
        }
        
        // Resetear scroll hacia arriba
        document.querySelector('.main-content').scrollTop = 0;
        window.scrollTo(0,0);
    });
});

// --- Contador de Juegos de PC ---
function updatePCCount() {
    const pcBadges = document.querySelectorAll('.platform-badge');
    let count = 0;
    pcBadges.forEach(badge => {
        if (badge.textContent.trim() === 'PC') count++;
    });
    const countElement = document.getElementById('pc-game-count');
    if (countElement) countElement.textContent = count;
}
updatePCCount(); // Ejecutar al inicio

// --- Lógica del Anuncio de Bienvenida ---
const overlay = document.getElementById('welcome-overlay');

function dismissOverlay() {
    if (!overlay || overlay.classList.contains('hide-overlay')) return;
    
    overlay.classList.add('hide-overlay');
    setTimeout(() => { 
        overlay.style.display = 'none'; 
    }, 800);
}

// 1. Evento de carga normal (espera a imágenes/video)
window.addEventListener('load', () => {
    setTimeout(dismissOverlay, 3500);
});

// 2. Fallback de seguridad: Si algo falla o tarda mucho, forzar cierre a los 6 segundos
setTimeout(dismissOverlay, 6000);

// 3. Permitir cerrar con click inmediatamente (Solución al bloqueo)
if (overlay) {
    overlay.addEventListener('click', dismissOverlay);
}