// Unidos Pelo Boavista - Petition App

let promessasData = null;
let cronologiaData = null;
let counterData = { current: 0, goal: 250 };

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    updateStickyOffsets();
    window.addEventListener('resize', updateStickyOffsets);
    setupSmoothScroll();
    await loadCounter();
    await loadPromessas();
    await loadCronologia();
}

// Sticky header offset
function updateStickyOffsets() {
    const header = document.querySelector('header');
    if (header) {
        document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
    }
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Counter
async function loadCounter() {
    try {
        const res = await fetch('data/counter.json');
        if (res.ok) {
            counterData = await res.json();
        }
    } catch (e) {
        console.error('Counter load error:', e);
    }
    updateCounterUI();
}

function updateCounterUI() {
    const pct = Math.min((counterData.current / counterData.goal) * 100, 100);

    // Update all counter elements
    document.querySelectorAll('[id^="sig-count-"]').forEach(el => {
        el.textContent = counterData.current;
    });
    document.querySelectorAll('[id^="sig-goal-"]').forEach(el => {
        el.textContent = counterData.goal;
    });
    document.querySelectorAll('[id^="progress-"]').forEach(el => {
        el.style.width = pct + '%';
    });
}

// Promessas
async function loadPromessas() {
    try {
        const res = await fetch('data/promessas.json');
        if (res.ok) {
            promessasData = await res.json();
            renderPromessas();
        }
    } catch (e) {
        console.error('Error loading promessas:', e);
    }
}

function renderPromessas() {
    if (!promessasData) return;

    const statusConfig = {
        cumprida: { icon: '\u2705', label: 'Cumprida', color: 'text-green-600', bg: 'bg-green-500' },
        parcial: { icon: '\uD83D\uDFE1', label: 'Parcial', color: 'text-yellow-600', bg: 'bg-yellow-500' },
        nao_cumprida: { icon: '\u274C', label: 'N\u00e3o cumprida', color: 'text-red-600', bg: 'bg-red-500' },
        oposto: { icon: '\uD83D\uDC80', label: 'Fez o oposto', color: 'text-gray-900', bg: 'bg-gray-900' }
    };

    // Count totals
    let counts = { cumprida: 0, parcial: 0, nao_cumprida: 0, oposto: 0 };
    let total = 0;
    promessasData.categorias.forEach(cat => {
        cat.promessas.forEach(p => {
            counts[p.status]++;
            total++;
        });
    });

    // Score text
    const scoreEl = document.getElementById('promessas-score');
    if (scoreEl) {
        scoreEl.textContent = `${counts.cumprida} de ${total} cumpridas`;
    }

    // Progress bar
    const bar = document.getElementById('promessas-bar');
    if (bar) {
        bar.innerHTML = '';
        const segments = [
            { key: 'cumprida', count: counts.cumprida },
            { key: 'parcial', count: counts.parcial },
            { key: 'nao_cumprida', count: counts.nao_cumprida },
            { key: 'oposto', count: counts.oposto }
        ];
        segments.forEach(seg => {
            if (seg.count === 0) return;
            const div = document.createElement('div');
            const pct = (seg.count / total) * 100;
            div.style.width = pct + '%';
            div.className = statusConfig[seg.key].bg;
            div.title = `${statusConfig[seg.key].label}: ${seg.count}`;
            bar.appendChild(div);
        });
    }

    // Bar legend
    const legend = document.getElementById('promessas-bar-legend');
    if (legend) {
        legend.innerHTML = `
            <span>${statusConfig.cumprida.icon} ${counts.cumprida} cumpridas</span>
            <span>${statusConfig.parcial.icon} ${counts.parcial} parciais</span>
            <span>${statusConfig.nao_cumprida.icon} ${counts.nao_cumprida} n\u00e3o cumpridas</span>
            <span>${statusConfig.oposto.icon} ${counts.oposto} fez o oposto</span>
        `;
    }

    // Render categories
    const content = document.getElementById('promessas-content');
    if (!content) return;
    content.innerHTML = '';

    promessasData.categorias.forEach(cat => {
        const catDiv = document.createElement('details');
        catDiv.className = 'bg-white rounded-lg border border-gray-200 overflow-hidden';

        const catCounts = { cumprida: 0, parcial: 0, nao_cumprida: 0, oposto: 0 };
        cat.promessas.forEach(p => catCounts[p.status]++);

        const summary = document.createElement('summary');
        summary.className = 'px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between gap-2';
        summary.innerHTML = `
            <span class="font-medium text-sm flex-1">
                <span class="mr-1">${cat.icon}</span> ${cat.nome}
                <span class="text-gray-400 text-xs ml-1">(${cat.promessas.length})</span>
            </span>
            <span class="flex gap-1 text-xs flex-shrink-0">
                ${catCounts.cumprida ? `<span class="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">${catCounts.cumprida} \u2705</span>` : ''}
                ${catCounts.parcial ? `<span class="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">${catCounts.parcial} \uD83D\uDFE1</span>` : ''}
                ${catCounts.nao_cumprida ? `<span class="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">${catCounts.nao_cumprida} \u274C</span>` : ''}
                ${catCounts.oposto ? `<span class="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">${catCounts.oposto} \uD83D\uDC80</span>` : ''}
            </span>
            <svg class="w-4 h-4 text-gray-400 chevron flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        `;
        catDiv.appendChild(summary);

        const list = document.createElement('div');
        list.className = 'px-4 pb-3 space-y-2';

        cat.promessas.forEach(p => {
            const cfg = statusConfig[p.status];
            const item = document.createElement('div');
            item.className = 'flex items-start gap-2 text-sm';
            item.innerHTML = `
                <span class="text-base flex-shrink-0 mt-0.5" title="${cfg.label}">${cfg.icon}</span>
                <div>
                    <span class="${cfg.color}">${p.texto}</span>
                    ${p.nota ? `<p class="text-xs text-gray-400 mt-0.5">${p.nota}</p>` : ''}
                </div>
            `;
            list.appendChild(item);
        });

        catDiv.appendChild(list);
        content.appendChild(catDiv);
    });

    // Open first category by default
    const first = content.querySelector('details');
    if (first) first.open = true;
}

// Cronologia
const cronologiaTypeConfig = {
    governanca: { color: 'bg-gray-400', label: 'Governan\u00e7a' },
    financas: { color: 'bg-red-500', label: 'Finan\u00e7as' },
    modalidades: { color: 'bg-orange-500', label: 'Modalidades' },
    estadio: { color: 'bg-yellow-500', label: 'Est\u00e1dio' },
    sad: { color: 'bg-purple-500', label: 'SAD' },
    positivo: { color: 'bg-green-500', label: 'Positivo' }
};

async function loadCronologia() {
    try {
        const res = await fetch('data/cronologia.json');
        if (res.ok) {
            cronologiaData = await res.json();
            renderCronologia();
        }
    } catch (e) {
        console.error('Error loading cronologia:', e);
    }
}

function renderCronologia() {
    if (!cronologiaData || !cronologiaData.eventos) return;

    const content = document.getElementById('cronologia-content');
    if (!content) return;

    const eventos = cronologiaData.eventos.sort((a, b) => a.data.localeCompare(b.data));

    renderCronologiaTimeline(content, eventos);
    setupCronologiaFilters(eventos);
}

function renderCronologiaTimeline(container, eventos) {
    container.innerHTML = '';

    const timeline = document.createElement('div');
    timeline.className = 'relative pl-6 border-l-2 border-gray-200 space-y-4';

    eventos.forEach(evento => {
        const cfg = cronologiaTypeConfig[evento.tipo] || cronologiaTypeConfig.governanca;
        const date = new Date(evento.data);
        const dateStr = date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });

        const item = document.createElement('div');
        item.className = 'relative';
        item.innerHTML = `
            <div class="absolute -left-[25px] top-1 w-3 h-3 rounded-full ${cfg.color} border-2 border-white"></div>
            <div class="text-xs text-gray-400">${dateStr}</div>
            <div class="text-sm font-semibold text-gray-800">${evento.titulo}</div>
            <div class="text-xs text-gray-500 mt-0.5">${evento.descricao}</div>
        `;
        timeline.appendChild(item);
    });

    container.appendChild(timeline);
}

function setupCronologiaFilters(eventos) {
    const filtersContainer = document.getElementById('cronologia-filters');
    if (!filtersContainer) return;

    const types = [...new Set(eventos.map(e => e.tipo))];

    filtersContainer.innerHTML = '';

    // "Todos" pill
    const allBtn = document.createElement('button');
    allBtn.className = 'cronologia-filter active px-3 py-1 text-xs font-medium rounded-full border border-gray-300 transition-colors';
    allBtn.textContent = 'Todos';
    allBtn.addEventListener('click', () => {
        setActiveFilter(filtersContainer, allBtn);
        renderCronologiaTimeline(document.getElementById('cronologia-content'), eventos);
    });
    filtersContainer.appendChild(allBtn);

    // Per-type pills
    types.forEach(type => {
        const cfg = cronologiaTypeConfig[type] || cronologiaTypeConfig.governanca;
        const btn = document.createElement('button');
        btn.className = 'cronologia-filter px-3 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors';
        btn.textContent = cfg.label;
        btn.addEventListener('click', () => {
            setActiveFilter(filtersContainer, btn);
            const filtered = eventos.filter(e => e.tipo === type);
            renderCronologiaTimeline(document.getElementById('cronologia-content'), filtered);
        });
        filtersContainer.appendChild(btn);
    });
}

function setActiveFilter(container, activeBtn) {
    container.querySelectorAll('.cronologia-filter').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('text-gray-600');
    });
    activeBtn.classList.add('active');
    activeBtn.classList.remove('text-gray-600');
}
