// Unidos Pelo Boavista - Petition App

let promessasData = null;
let cronologiaData = null;

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    updateStickyOffsets();
    window.addEventListener('resize', updateStickyOffsets);
    setupSmoothScroll();
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
        cumprida: { label: 'Cumprida', color: 'text-green-800', bg: 'bg-green-700' },
        parcial: { label: 'Parcial', color: 'text-yellow-700', bg: 'bg-yellow-500' },
        nao_cumprida: { label: 'N\u00e3o cumprida', color: 'text-red-800', bg: 'bg-red-700' },
        oposto: { label: 'Fez o oposto', color: 'text-black', bg: 'bg-black' }
    };
    const marker = (key, extra) => `<span class="inline-block w-2.5 h-2.5 ${statusConfig[key].bg} ${extra || ''}" title="${statusConfig[key].label}"></span>`;

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
            <span class="inline-flex items-center gap-1.5">${marker('cumprida')} ${counts.cumprida} cumpridas</span>
            <span class="inline-flex items-center gap-1.5">${marker('parcial')} ${counts.parcial} parciais</span>
            <span class="inline-flex items-center gap-1.5">${marker('nao_cumprida')} ${counts.nao_cumprida} n\u00e3o cumpridas</span>
            <span class="inline-flex items-center gap-1.5">${marker('oposto')} ${counts.oposto} fez o oposto</span>
        `;
    }

    // Render categories
    const content = document.getElementById('promessas-content');
    if (!content) return;
    content.innerHTML = '';

    promessasData.categorias.forEach(cat => {
        const catDiv = document.createElement('details');
        catDiv.className = 'border border-bfc-line bg-white/60';

        const catCounts = { cumprida: 0, parcial: 0, nao_cumprida: 0, oposto: 0 };
        cat.promessas.forEach(p => catCounts[p.status]++);

        const summary = document.createElement('summary');
        summary.className = 'px-4 py-3.5 cursor-pointer hover:bg-black/5 transition-colors flex items-center justify-between gap-2';
        summary.innerHTML = `
            <span class="font-display font-bold text-base flex-1">
                ${cat.nome}
                <span class="text-neutral-400 text-xs font-sans font-normal ml-1">(${cat.promessas.length})</span>
            </span>
            <span class="flex items-center gap-2.5 text-xs text-neutral-600 flex-shrink-0">
                ${catCounts.cumprida ? `<span class="inline-flex items-center gap-1">${marker('cumprida')}${catCounts.cumprida}</span>` : ''}
                ${catCounts.parcial ? `<span class="inline-flex items-center gap-1">${marker('parcial')}${catCounts.parcial}</span>` : ''}
                ${catCounts.nao_cumprida ? `<span class="inline-flex items-center gap-1">${marker('nao_cumprida')}${catCounts.nao_cumprida}</span>` : ''}
                ${catCounts.oposto ? `<span class="inline-flex items-center gap-1">${marker('oposto')}${catCounts.oposto}</span>` : ''}
            </span>
            <svg class="w-4 h-4 text-neutral-400 chevron flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        `;
        catDiv.appendChild(summary);

        const list = document.createElement('div');
        list.className = 'px-4 pb-4 pt-1 space-y-2.5 border-t border-bfc-line';

        cat.promessas.forEach(p => {
            const cfg = statusConfig[p.status];
            const item = document.createElement('div');
            item.className = 'flex items-start gap-2.5 text-sm';
            item.innerHTML = `
                ${marker(p.status, 'flex-shrink-0 mt-1.5')}
                <div>
                    <span class="${cfg.color}">${p.texto}</span>
                    ${p.nota ? `<p class="text-xs text-neutral-500 mt-0.5">${p.nota}</p>` : ''}
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
    governanca: { color: 'bg-neutral-400', label: 'Governan\u00e7a' },
    financas: { color: 'bg-red-700', label: 'Finan\u00e7as' },
    modalidades: { color: 'bg-orange-600', label: 'Modalidades' },
    estadio: { color: 'bg-bfc-gold', label: 'Est\u00e1dio' },
    sad: { color: 'bg-purple-700', label: 'SAD' },
    positivo: { color: 'bg-green-700', label: 'Positivo' }
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

    const eventos = cronologiaData.eventos.slice().sort((a, b) => b.data.localeCompare(a.data));

    // Data da ultima actualizacao (campo 'atualizado' do JSON; fallback = evento mais recente)
    // + janela de eventos recentes para realce
    if (eventos.length) {
        const newest = new Date(eventos[0].data);
        const updated = cronologiaData.atualizado ? new Date(cronologiaData.atualizado) : newest;
        const badge = document.getElementById('cronologia-updated');
        if (badge) {
            const d = updated.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
            badge.innerHTML = `<span class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-bfc-golddark"><span class="w-2 h-2 bg-bfc-gold"></span>Atualizado a ${d}</span>`;
            badge.classList.remove('hidden');
        }
        // marca como recente tudo nos 40 dias anteriores ao evento mais recente
        const recentCutoff = new Date(newest);
        recentCutoff.setDate(recentCutoff.getDate() - 40);
        eventos.forEach(e => { e._recente = new Date(e.data) >= recentCutoff; });
    }

    renderCronologiaTimeline(content, eventos);
    setupCronologiaFilters(eventos);
}

function renderCronologiaTimeline(container, eventos) {
    container.innerHTML = '';

    const timeline = document.createElement('div');
    timeline.className = 'border-t border-bfc-line';

    eventos.forEach(evento => {
        const cfg = cronologiaTypeConfig[evento.tipo] || cronologiaTypeConfig.governanca;
        const date = new Date(evento.data);
        const dateStr = date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });

        const item = document.createElement('div');
        item.className = 'border-b border-bfc-line py-4' + (evento._recente ? ' border-l-2 border-l-bfc-gold pl-3 sm:pl-4' : '');
        const novoTag = evento._recente
            ? ` <span class="align-middle ml-1.5 text-[9px] font-sans font-bold uppercase tracking-[0.14em] bg-bfc-gold text-bfc-black px-1.5 py-0.5">Novo</span>`
            : '';
        item.innerHTML = `
            <div class="flex items-baseline gap-3">
                <span class="text-[11px] font-bold tracking-[0.08em] text-neutral-500 whitespace-nowrap tabular-nums">${dateStr}</span>
                <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500"><span class="w-2 h-2 ${cfg.color}"></span>${cfg.label}</span>
            </div>
            <div class="font-display font-bold text-lg leading-snug mt-1.5">${evento.titulo}${novoTag}</div>
            <div class="text-sm text-neutral-600 leading-relaxed mt-1">${evento.descricao}</div>
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
    allBtn.className = 'cronologia-filter active px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors';
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
        btn.className = 'cronologia-filter px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-600 hover:border-neutral-500 transition-colors';
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
        btn.classList.add('text-neutral-600');
    });
    activeBtn.classList.add('active');
    activeBtn.classList.remove('text-neutral-600');
}
