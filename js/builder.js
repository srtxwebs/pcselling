const PARTS = [
  {
    key: 'case',
    title: 'Case',
    options: [
      { id: 'case1', name: 'RedGear Vortex ATX', desc: 'Tempered glass, 3x ARGB fans included', price: 129 },
      { id: 'case2', name: 'RedGear Phantom Mini-ITX', desc: 'Compact build, mesh front panel', price: 99 },
      { id: 'case3', name: 'RedGear Titan Full Tower', desc: 'Massive airflow, 6-fan support', price: 189 },
    ]
  },
  {
    key: 'cpu',
    title: 'Processor (CPU)',
    options: [
      { id: 'cpu1', name: 'Intel Core i5-14600K', desc: '14 cores, up to 5.3GHz', price: 319 },
      { id: 'cpu2', name: 'Intel Core i7-14700K', desc: '20 cores, up to 5.6GHz', price: 419 },
      { id: 'cpu3', name: 'AMD Ryzen 7 7800X3D', desc: '8 cores, 3D V-Cache gaming beast', price: 449 },
      { id: 'cpu4', name: 'AMD Ryzen 9 7950X', desc: '16 cores, up to 5.7GHz', price: 599 },
    ]
  },
  {
    key: 'gpu',
    title: 'Graphics Card (GPU)',
    options: [
      { id: 'gpu1', name: 'RTX 4070 Super 12GB', desc: 'Great 1440p ray tracing', price: 599 },
      { id: 'gpu2', name: 'RTX 4080 Super 16GB', desc: 'Elite 4K gaming performance', price: 999 },
      { id: 'gpu3', name: 'RTX 4090 24GB', desc: 'Uncompromising flagship power', price: 1599 },
      { id: 'gpu4', name: 'RX 7800 XT 16GB', desc: 'Excellent 1440p value', price: 499 },
    ]
  },
  {
    key: 'ram',
    title: 'Memory (RAM)',
    options: [
      { id: 'ram1', name: '16GB DDR5-6000', desc: '2x8GB, RGB heatspreaders', price: 69 },
      { id: 'ram2', name: '32GB DDR5-6000', desc: '2x16GB, RGB heatspreaders', price: 119 },
      { id: 'ram3', name: '64GB DDR5-6000', desc: '2x32GB, for heavy multitasking', price: 229 },
    ]
  },
  {
    key: 'storage',
    title: 'Storage',
    options: [
      { id: 'sto1', name: '1TB NVMe SSD', desc: 'Gen4, up to 7000MB/s', price: 79 },
      { id: 'sto2', name: '2TB NVMe SSD', desc: 'Gen4, up to 7000MB/s', price: 139 },
      { id: 'sto3', name: '2TB NVMe + 2TB HDD', desc: 'Speed plus mass storage', price: 199 },
    ]
  },
  {
    key: 'cooling',
    title: 'Cooling',
    options: [
      { id: 'cool1', name: 'Air Cooler — Tower 120mm', desc: 'Quiet, reliable, budget-friendly', price: 39 },
      { id: 'cool2', name: '240mm AIO Liquid Cooler', desc: 'ARGB pump, strong thermals', price: 99 },
      { id: 'cool3', name: '360mm AIO Liquid Cooler', desc: 'Max cooling for overclocking', price: 159 },
    ]
  },
  {
    key: 'psu',
    title: 'Power Supply (PSU)',
    options: [
      { id: 'psu1', name: '650W 80+ Gold', desc: 'Fully modular, quiet fan', price: 79 },
      { id: 'psu2', name: '850W 80+ Gold', desc: 'Fully modular, headroom for upgrades', price: 109 },
      { id: 'psu3', name: '1000W 80+ Platinum', desc: 'For high-end multi-GPU setups', price: 169 },
    ]
  },
];

const state = {};

const fmt = (n) => `$${n.toLocaleString('en-US')}`;

function buildUI() {
  const wrap = document.getElementById('builderSteps');
  if (!wrap) return;

  PARTS.forEach((part, idx) => {
    const card = document.createElement('div');
    card.className = 'part-card';
    card.id = `card-${part.key}`;

    card.innerHTML = `
      <div class="part-card-head" data-toggle="${part.key}">
        <div class="part-card-head-left">
          <div class="part-num">${idx + 1}</div>
          <div>
            <div class="part-card-title">${part.title}</div>
            <div class="part-card-selected" id="sel-${part.key}">Not selected yet</div>
          </div>
        </div>
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="part-card-body">
        <div class="option-list">
          ${part.options.map(opt => `
            <div class="option" data-part="${part.key}" data-opt="${opt.id}">
              <div class="option-info">
                <div class="option-radio"></div>
                <div>
                  <div class="option-name">${opt.name}</div>
                  <div class="option-desc">${opt.desc}</div>
                </div>
              </div>
              <div class="option-price">+${fmt(opt.price)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });

  document.querySelector('.part-card')?.classList.add('open');

  wrap.addEventListener('click', (e) => {
    const head = e.target.closest('[data-toggle]');
    if (head) {
      const card = head.closest('.part-card');
      const wasOpen = card.classList.contains('open');
      document.querySelectorAll('.part-card.open').forEach(c => {
        c.classList.remove('open');
        c.querySelector('.part-card-body').style.maxHeight = null;
      });
      if (!wasOpen) {
        card.classList.add('open');
        const body = card.querySelector('.part-card-body');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
      return;
    }

    const opt = e.target.closest('.option');
    if (opt) {
      const partKey = opt.dataset.part;
      const optId = opt.dataset.opt;
      const part = PARTS.find(p => p.key === partKey);
      const chosen = part.options.find(o => o.id === optId);

      state[partKey] = chosen;

      const card = document.getElementById(`card-${partKey}`);
      card.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      card.classList.add('done');
      document.getElementById(`sel-${partKey}`).textContent = `${chosen.name} — ${fmt(chosen.price)}`;

      const body = card.querySelector('.part-card-body');
      if (card.classList.contains('open')) body.style.maxHeight = body.scrollHeight + 'px';

      updateSummary();

      const idx = PARTS.findIndex(p => p.key === partKey);
      const next = PARTS[idx + 1];
      if (next && !state[next.key]) {
        setTimeout(() => {
          document.querySelectorAll('.part-card.open').forEach(c => {
            c.classList.remove('open');
            c.querySelector('.part-card-body').style.maxHeight = null;
          });
          const nextCard = document.getElementById(`card-${next.key}`);
          nextCard.classList.add('open');
          const nb = nextCard.querySelector('.part-card-body');
          nb.style.maxHeight = nb.scrollHeight + 'px';
          nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 350);
      }
    }
  });
}

function updateSummary() {
  const linesWrap = document.getElementById('summaryLines');
  const totalEl = document.getElementById('summaryTotal');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const cta = document.getElementById('summaryCta');
  if (!linesWrap) return;

  let total = 0;
  let filled = 0;

  linesWrap.innerHTML = PARTS.map(part => {
    const chosen = state[part.key];
    if (chosen) { total += chosen.price; filled++; }
    return `
      <div class="summary-line ${chosen ? '' : 'empty'}">
        <span>${part.title}</span>
        <span class="val">${chosen ? chosen.name : '—'}</span>
      </div>
    `;
  }).join('');

  totalEl.textContent = fmt(total);
  const pct = Math.round((filled / PARTS.length) * 100);
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `${filled} of ${PARTS.length} parts selected`;

  if (filled === PARTS.length) {
    cta.classList.remove('disabled');
    cta.removeAttribute('disabled');
  } else {
    cta.classList.add('disabled');
    cta.setAttribute('disabled', 'true');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildUI();
  updateSummary();

  const cta = document.getElementById('summaryCta');
  if (cta) {
    cta.addEventListener('click', () => {
      if (cta.classList.contains('disabled')) return;
      const total = PARTS.reduce((sum, p) => sum + (state[p.key]?.price || 0), 0);
      const build = {
        name: 'Custom Build',
        price: total,
        parts: Object.fromEntries(Object.entries(state).map(([k, v]) => [k, v.name]))
      };
      if (window.RedGearCart) window.RedGearCart.add(build);
      if (window.showToast) showToast(`Custom build added — ${fmt(total)}`);
    });
  }

  const resetBtn = document.getElementById('resetBuild');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      Object.keys(state).forEach(k => delete state[k]);
      document.querySelectorAll('.option.selected').forEach(o => o.classList.remove('selected'));
      document.querySelectorAll('.part-card.done').forEach(c => c.classList.remove('done'));
      document.querySelectorAll('[id^="sel-"]').forEach(el => el.textContent = 'Not selected yet');
      updateSummary();
    });
  }
});
