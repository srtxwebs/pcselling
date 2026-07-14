/* ==========================================================================
   REDGEAR — Custom PC Builder Logic (v2)
   Expanded parts catalog + per-option icons + live assembled preview
   ========================================================================== */

function tierColor(i, total) {
  const t = total <= 1 ? 0 : i / (total - 1);
  if (t < 0.34) return '#8a8a91';
  if (t < 0.68) return '#ff5b5b';
  return '#ffb020';
}

/* ---------- Per-category icon renderer (varies slightly by tier) ---------- */
function partIcon(category, i, total) {
  const c = tierColor(i, total);
  switch (category) {
    case 'case':
      return `<svg viewBox="0 0 40 40"><rect x="7" y="4" width="26" height="32" rx="3" fill="#141417" stroke="${c}" stroke-width="1.4"/><circle cx="20" cy="13" r="5" fill="none" stroke="${c}" stroke-width="1.3"/><circle cx="20" cy="27" r="5" fill="none" stroke="${c}" stroke-width="1.3"/><circle cx="20" cy="13" r="1.4" fill="${c}"/><circle cx="20" cy="27" r="1.4" fill="${c}"/></svg>`;
    case 'cpu':
      return `<svg viewBox="0 0 40 40"><rect x="10" y="10" width="20" height="20" rx="2" fill="#141417" stroke="${c}" stroke-width="1.4"/><rect x="15" y="15" width="10" height="10" rx="1" fill="none" stroke="${c}" stroke-width="1.1"/>${[6,12,18,24,30].map(p=>`<line x1="${p}" y1="4" x2="${p}" y2="10" stroke="${c}" stroke-width="1.2"/><line x1="${p}" y1="30" x2="${p}" y2="36" stroke="${c}" stroke-width="1.2"/>`).join('')}</svg>`;
    case 'motherboard':
      return `<svg viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="2" fill="#141417" stroke="${c}" stroke-width="1.4"/><rect x="10" y="10" width="8" height="8" fill="none" stroke="${c}" stroke-width="1.1"/><line x1="22" y1="10" x2="32" y2="10" stroke="${c}" stroke-width="1.4"/><line x1="22" y1="14" x2="32" y2="14" stroke="${c}" stroke-width="1.4"/><line x1="10" y1="24" x2="30" y2="24" stroke="${c}" stroke-width="2"/><line x1="10" y1="29" x2="30" y2="29" stroke="${c}" stroke-width="2"/></svg>`;
    case 'gpu':
      return `<svg viewBox="0 0 40 40"><rect x="4" y="14" width="32" height="14" rx="2" fill="#141417" stroke="${c}" stroke-width="1.4"/><circle cx="13" cy="21" r="4.4" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="25" cy="21" r="4.4" fill="none" stroke="${c}" stroke-width="1.2"/><rect x="4" y="10" width="9" height="4" fill="${c}" opacity="0.85"/></svg>`;
    case 'ram':
      return `<svg viewBox="0 0 40 40">${[8,15,22,29].map((x,idx)=>`<rect x="${x}" y="6" width="5" height="28" rx="1" fill="${idx%2?'#141417':'none'}" stroke="${c}" stroke-width="1.2"/>`).join('')}</svg>`;
    case 'storage':
      return `<svg viewBox="0 0 40 40"><rect x="6" y="10" width="28" height="20" rx="2" fill="#141417" stroke="${c}" stroke-width="1.4"/><circle cx="14" cy="20" r="1.6" fill="${c}"/><line x1="20" y1="20" x2="30" y2="20" stroke="${c}" stroke-width="1.2"/></svg>`;
    case 'cooling':
      return `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" fill="none" stroke="${c}" stroke-width="1.4"/><path d="M20 20 L20 9 A11 11 0 0 1 30 24 Z" fill="${c}" opacity="0.35"/><path d="M20 20 L31 17 A11 11 0 0 1 23 30 Z" fill="${c}" opacity="0.25"/><circle cx="20" cy="20" r="3" fill="${c}"/></svg>`;
    case 'psu':
      return `<svg viewBox="0 0 40 40"><rect x="6" y="12" width="28" height="18" rx="2" fill="#141417" stroke="${c}" stroke-width="1.4"/><circle cx="20" cy="21" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><line x1="6" y1="34" x2="12" y2="38" stroke="${c}" stroke-width="1.4"/></svg>`;
    case 'fans':
      return `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="none" stroke="${c}" stroke-width="1.4"/><path d="M20 20 L20 8 A12 12 0 0 1 31 22 Z" fill="${c}" opacity="0.3"/><path d="M20 20 L9 26 A12 12 0 0 1 15 9 Z" fill="${c}" opacity="0.25"/><circle cx="20" cy="20" r="2.6" fill="${c}"/></svg>`;
    case 'os':
      return `<svg viewBox="0 0 40 40"><rect x="6" y="9" width="28" height="18" rx="2" fill="#141417" stroke="${c}" stroke-width="1.4"/><line x1="6" y1="15" x2="34" y2="15" stroke="${c}" stroke-width="1.1"/><rect x="15" y="27" width="10" height="4" fill="${c}" opacity="0.6"/></svg>`;
    default:
      return `<svg viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" rx="3" fill="none" stroke="${c}" stroke-width="1.4"/></svg>`;
  }
}

const PARTS = [
  {
    key: 'case', title: 'Case',
    options: [
      { id: 'case1', name: 'RedGear Pico Mini-ITX', desc: 'Ultra small form factor, 1 fan', price: 89, meta: { style: 'itx', fans: 1 } },
      { id: 'case2', name: 'RedGear Nova SFF', desc: 'Compact desk build, 1 fan', price: 99, meta: { style: 'itx', fans: 1 } },
      { id: 'case3', name: 'RedGear Phantom Mini-ITX', desc: 'Mesh front panel, 2 fans', price: 109, meta: { style: 'itx', fans: 2 } },
      { id: 'case4', name: 'RedGear Comet ITX RGB', desc: 'Compact with ARGB front, 2 fans', price: 119, meta: { style: 'itx', fans: 2 } },
      { id: 'case5', name: 'RedGear Onyx Silent Edition', desc: 'Sound-dampened panels, 2 fans', price: 149, meta: { style: 'atx', fans: 2 } },
      { id: 'case6', name: 'RedGear Vortex ATX', desc: 'Tempered glass, 3x ARGB fans included', price: 129, meta: { style: 'atx', fans: 3 } },
      { id: 'case7', name: 'RedGear Aero Mesh ATX', desc: 'High-airflow mesh front, 3 fans', price: 139, meta: { style: 'atx', fans: 3 } },
      { id: 'case8', name: 'RedGear Prism RGB ATX', desc: 'Dual-tone tempered glass, 4 fans', price: 159, meta: { style: 'atx', fans: 4 } },
      { id: 'case9', name: 'RedGear Eclipse ATX Pro', desc: 'Premium build quality, 4 fans', price: 179, meta: { style: 'atx', fans: 4 } },
      { id: 'case10', name: 'RedGear Spectre Dual-Chamber', desc: 'Hidden cable compartment, 4 fans', price: 199, meta: { style: 'atx', fans: 4 } },
      { id: 'case11', name: 'RedGear Titan Full Tower', desc: 'Massive airflow, 6-fan support', price: 189, meta: { style: 'tower', fans: 6 } },
      { id: 'case12', name: 'RedGear Colossus XL Tower', desc: 'Extra-wide for custom loops, 6 fans', price: 229, meta: { style: 'tower', fans: 6 } },
      { id: 'case13', name: 'RedGear Behemoth RGB Tower', desc: 'Full RGB ecosystem, 7 fans', price: 259, meta: { style: 'tower', fans: 7 } },
      { id: 'case14', name: 'RedGear Apex Showcase Tower', desc: 'Panoramic glass, 6 fans', price: 249, meta: { style: 'tower', fans: 6 } },
      { id: 'case15', name: 'RedGear Monolith Server Tower', desc: 'Workstation-grade airflow, 8 fans', price: 299, meta: { style: 'tower', fans: 8 } },
      { id: 'case16', name: 'RedGear Infinity Mirror Tower', desc: 'Infinity-mirror front panel, 7 fans', price: 279, meta: { style: 'tower', fans: 7 } },
    ]
  },
  {
    key: 'cpu', title: 'Processor (CPU)',
    options: [
      { id: 'cpu1', name: 'Intel Core i3-14100', desc: '4 cores, up to 4.7GHz, entry-level', price: 139 },
      { id: 'cpu2', name: 'AMD Ryzen 5 5600', desc: '6 cores, up to 4.4GHz, AM4 value', price: 129 },
      { id: 'cpu3', name: 'Intel Core i5-13400F', desc: '10 cores, up to 4.6GHz', price: 189 },
      { id: 'cpu4', name: 'AMD Ryzen 5 7500F', desc: '6 cores, up to 5.0GHz', price: 159 },
      { id: 'cpu5', name: 'AMD Ryzen 5 7600X', desc: '6 cores, up to 5.3GHz, great value', price: 249 },
      { id: 'cpu6', name: 'Intel Core i5-14600K', desc: '14 cores, up to 5.3GHz', price: 319 },
      { id: 'cpu7', name: 'Intel Core i5-14600KF', desc: '14 cores, up to 5.3GHz, no iGPU', price: 299 },
      { id: 'cpu8', name: 'AMD Ryzen 7 5800X3D', desc: '8 cores, 3D V-Cache, AM4', price: 299 },
      { id: 'cpu9', name: 'AMD Ryzen 7 7700X', desc: '8 cores, up to 5.4GHz', price: 349 },
      { id: 'cpu10', name: 'Intel Core i7-14700K', desc: '20 cores, up to 5.6GHz', price: 419 },
      { id: 'cpu11', name: 'Intel Core i7-14700KF', desc: '20 cores, up to 5.6GHz, no iGPU', price: 399 },
      { id: 'cpu12', name: 'AMD Ryzen 7 7800X3D', desc: '8 cores, 3D V-Cache gaming beast', price: 449 },
      { id: 'cpu13', name: 'AMD Ryzen 9 7900X', desc: '12 cores, up to 5.6GHz', price: 429 },
      { id: 'cpu14', name: 'Intel Core i9-14900K', desc: '24 cores, up to 6.0GHz', price: 589 },
      { id: 'cpu15', name: 'AMD Ryzen 9 7950X', desc: '16 cores, up to 5.7GHz', price: 599 },
      { id: 'cpu16', name: 'Intel Core i9-14900KS', desc: '24 cores, up to 6.2GHz, flagship', price: 699 },
    ]
  },
  {
    key: 'motherboard', title: 'Motherboard',
    options: [
      { id: 'mobo1', name: 'RedGear H610 Basic', desc: 'LGA1700, DDR4, entry level', price: 99 },
      { id: 'mobo2', name: 'RedGear A620 Value', desc: 'AM5, DDR5, budget board', price: 109 },
      { id: 'mobo3', name: 'RedGear B760 Pulse', desc: 'LGA1700, DDR5, PCIe 4.0', price: 149 },
      { id: 'mobo4', name: 'RedGear B650 Strike', desc: 'AM5, DDR5, PCIe 4.0', price: 159 },
      { id: 'mobo5', name: 'RedGear B760 Vanguard', desc: 'LGA1700, DDR5, Wi-Fi 6', price: 179 },
      { id: 'mobo6', name: 'RedGear ITX-Mini B650', desc: 'AM5, DDR5, compact ITX', price: 199 },
      { id: 'mobo7', name: 'RedGear ITX-Mini B760', desc: 'LGA1700, DDR5, compact ITX', price: 189 },
      { id: 'mobo8', name: 'RedGear B650E Raider', desc: 'AM5, DDR5, PCIe 5.0', price: 189 },
      { id: 'mobo9', name: 'RedGear Z790 Vanguard', desc: 'LGA1700, DDR5, PCIe 5.0', price: 219 },
      { id: 'mobo10', name: 'RedGear X670 Vanguard', desc: 'AM5, DDR5, PCIe 5.0', price: 259 },
      { id: 'mobo11', name: 'RedGear X670E Apex', desc: 'AM5, DDR5, PCIe 5.0, Wi-Fi 6E', price: 329 },
      { id: 'mobo12', name: 'RedGear Z790 Apex Encore', desc: 'LGA1700, extreme overclocking', price: 349 },
      { id: 'mobo13', name: 'RedGear X870E Nova', desc: 'AM5, DDR5, next-gen PCIe 5.0', price: 359 },
      { id: 'mobo14', name: 'RedGear TRX50 Workstation', desc: 'Threadripper, quad-channel DDR5', price: 499 },
      { id: 'mobo15', name: 'RedGear WRX90 Pro', desc: 'Threadripper Pro, 8-channel DDR5', price: 799 },
    ]
  },
  {
    key: 'gpu', title: 'Graphics Card (GPU)',
    options: [
      { id: 'gpu1', name: 'GTX 1660 Super 6GB', desc: 'Budget 1080p gaming', price: 189 },
      { id: 'gpu2', name: 'RTX 3050 8GB', desc: 'Entry ray tracing at 1080p', price: 229 },
      { id: 'gpu3', name: 'RX 6600 8GB', desc: 'Solid 1080p performance', price: 199 },
      { id: 'gpu4', name: 'RX 7600 8GB', desc: 'Efficient 1080p/1440p', price: 269 },
      { id: 'gpu5', name: 'RTX 4060 8GB', desc: 'Smooth 1080p/1440p gaming', price: 299 },
      { id: 'gpu6', name: 'RTX 4060 Ti 8GB', desc: 'Strong 1440p performance', price: 399 },
      { id: 'gpu7', name: 'RX 7700 XT 12GB', desc: 'Great 1440p value', price: 449 },
      { id: 'gpu8', name: 'RTX 4070 12GB', desc: 'Excellent 1440p ray tracing', price: 549 },
      { id: 'gpu9', name: 'RX 7800 XT 16GB', desc: 'Excellent 1440p value', price: 499 },
      { id: 'gpu10', name: 'RTX 4070 Super 12GB', desc: 'Great 1440p+ ray tracing', price: 599 },
      { id: 'gpu11', name: 'RTX 4070 Ti Super 16GB', desc: 'High-end 1440p/4K', price: 799 },
      { id: 'gpu12', name: 'RX 7900 XT 20GB', desc: 'High-end 4K performance', price: 749 },
      { id: 'gpu13', name: 'RTX 4080 Super 16GB', desc: 'Elite 4K gaming performance', price: 999 },
      { id: 'gpu14', name: 'RX 7900 XTX 24GB', desc: 'AMD flagship, 4K ready', price: 949 },
      { id: 'gpu15', name: 'RTX 4090 24GB', desc: 'Uncompromising flagship power', price: 1599 },
    ]
  },
  {
    key: 'ram', title: 'Memory (RAM)',
    options: [
      { id: 'ram1', name: '8GB DDR4-3200', desc: '1x8GB, budget single channel', price: 29 },
      { id: 'ram2', name: '16GB DDR4-3200', desc: '2x8GB, solid entry kit', price: 49 },
      { id: 'ram3', name: '16GB DDR5-5200', desc: '2x8GB, budget DDR5', price: 59 },
      { id: 'ram4', name: '16GB DDR5-6000', desc: '2x8GB, RGB heatspreaders', price: 69 },
      { id: 'ram5', name: '32GB DDR4-3600', desc: '2x16GB, tuned timings', price: 89 },
      { id: 'ram6', name: '32GB DDR5-6000', desc: '2x16GB, RGB heatspreaders', price: 119 },
      { id: 'ram7', name: '32GB DDR5-6400', desc: '2x16GB, tighter timings', price: 149 },
      { id: 'ram8', name: '32GB DDR5-7200', desc: '2x16GB, high-frequency kit', price: 179 },
      { id: 'ram9', name: '48GB DDR5-6000', desc: '2x24GB, latest-gen sweet spot', price: 169 },
      { id: 'ram10', name: '64GB DDR4-3200', desc: '2x32GB, workstation capacity', price: 179 },
      { id: 'ram11', name: '64GB DDR5-6000', desc: '2x32GB, for heavy multitasking', price: 229 },
      { id: 'ram12', name: '64GB DDR5-6400', desc: '2x32GB, high-speed workstation', price: 259 },
      { id: 'ram13', name: '96GB DDR5-6000', desc: '2x48GB, content creation build', price: 349 },
      { id: 'ram14', name: '128GB DDR5-5600', desc: '4x32GB, max-capacity workstation', price: 499 },
      { id: 'ram15', name: '128GB DDR5-6000', desc: '4x32GB, extreme multitasking', price: 549 },
    ]
  },
  {
    key: 'storage', title: 'Storage',
    options: [
      { id: 'sto1', name: '500GB SATA SSD', desc: 'Reliable budget boot drive', price: 34 },
      { id: 'sto2', name: '1TB SATA SSD', desc: 'Affordable everyday storage', price: 54 },
      { id: 'sto3', name: '500GB NVMe SSD (Gen3)', desc: 'Fast budget NVMe', price: 39 },
      { id: 'sto4', name: '1TB NVMe SSD (Gen3)', desc: 'Up to 3500MB/s', price: 59 },
      { id: 'sto5', name: '500GB NVMe SSD (Gen4)', desc: 'Gen4, up to 6500MB/s', price: 49 },
      { id: 'sto6', name: '1TB NVMe SSD (Gen4)', desc: 'Gen4, up to 7000MB/s', price: 79 },
      { id: 'sto7', name: '2TB NVMe SSD (Gen4)', desc: 'Gen4, up to 7000MB/s', price: 139 },
      { id: 'sto8', name: '4TB NVMe SSD (Gen4)', desc: 'Gen4, high capacity', price: 279 },
      { id: 'sto9', name: '1TB NVMe SSD (Gen5)', desc: 'Up to 12000MB/s', price: 149 },
      { id: 'sto10', name: '2TB NVMe SSD (Gen5)', desc: 'Up to 12000MB/s', price: 249 },
      { id: 'sto11', name: '1TB HDD 7200RPM', desc: 'Extra mass storage', price: 39 },
      { id: 'sto12', name: '2TB HDD 7200RPM', desc: 'Extra mass storage', price: 59 },
      { id: 'sto13', name: '4TB HDD 7200RPM', desc: 'Bulk archive storage', price: 99 },
      { id: 'sto14', name: '1TB NVMe + 2TB HDD', desc: 'Speed plus mass storage', price: 129 },
      { id: 'sto15', name: '2TB NVMe + 4TB HDD', desc: 'Max speed plus max capacity', price: 259 },
    ]
  },
  {
    key: 'cooling', title: 'Cooling',
    options: [
      { id: 'cool1', name: 'Stock Cooler', desc: 'Included cooler, budget builds', price: 0, meta: { type: 'stock' } },
      { id: 'cool2', name: 'Low-Profile Air Cooler', desc: 'Slim, ideal for ITX cases', price: 29, meta: { type: 'air-lp' } },
      { id: 'cool3', name: 'Air Cooler — Tower 92mm', desc: 'Compact tower cooler', price: 35, meta: { type: 'air' } },
      { id: 'cool4', name: 'Air Cooler — Tower 120mm', desc: 'Quiet, reliable, budget-friendly', price: 39, meta: { type: 'air' } },
      { id: 'cool5', name: 'Dual-Tower Air 140mm', desc: 'High-end air, near-AIO performance', price: 79, meta: { type: 'air' } },
      { id: 'cool6', name: '120mm AIO Liquid Cooler', desc: 'Compact liquid cooling', price: 79, meta: { type: 'aio120' } },
      { id: 'cool7', name: '240mm AIO Liquid Cooler', desc: 'ARGB pump, strong thermals', price: 99, meta: { type: 'aio240' } },
      { id: 'cool8', name: '280mm AIO Liquid Cooler', desc: 'Extra radiator surface area', price: 129, meta: { type: 'aio280' } },
      { id: 'cool9', name: '360mm AIO Liquid Cooler', desc: 'Max cooling for overclocking', price: 159, meta: { type: 'aio360' } },
      { id: 'cool10', name: '420mm AIO Liquid Cooler', desc: 'Extreme cooling, full tower only', price: 199, meta: { type: 'aio420' } },
      { id: 'cool11', name: 'Passive Fanless Cooler', desc: 'Silent, no moving parts', price: 89, meta: { type: 'passive' } },
      { id: 'cool12', name: 'High-Static-Pressure Air', desc: 'Optimized for restrictive cases', price: 59, meta: { type: 'air' } },
      { id: 'cool13', name: 'Custom Soft-Tube Loop', desc: 'Custom liquid loop, flexible tubing', price: 249, meta: { type: 'custom' } },
      { id: 'cool14', name: 'Custom Hardline Loop', desc: 'Full custom loop, showpiece build', price: 349, meta: { type: 'custom' } },
      { id: 'cool15', name: 'Dual-Loop Extreme Custom', desc: 'CPU + GPU on separate loops', price: 549, meta: { type: 'custom' } },
    ]
  },
  {
    key: 'fans', title: 'Extra Case Fans',
    options: [
      { id: 'fan0', name: 'None — Stock fans only', desc: 'Use fans included with the case', price: 0, meta: { extra: 0 } },
      { id: 'fan1', name: '+2 Quiet Fans', desc: '120mm, noise-optimized', price: 25, meta: { extra: 2 } },
      { id: 'fan2', name: '+3 ARGB Fans', desc: '120mm, synced RGB lighting', price: 45, meta: { extra: 3 } },
      { id: 'fan3', name: '+3 High-Static-Pressure Fans', desc: 'For radiators & filters', price: 55, meta: { extra: 3 } },
      { id: 'fan4', name: '+6 ARGB Fans', desc: 'Max airflow, full RGB loadout', price: 85, meta: { extra: 6 } },
      { id: 'fan5', name: '+6 High-Airflow Fans', desc: '140mm, maximum throughput', price: 95, meta: { extra: 6 } },
      { id: 'fan6', name: '+9 ARGB Fans', desc: 'Showcase build, full lighting', price: 129, meta: { extra: 9 } },
    ]
  },
  {
    key: 'psu', title: 'Power Supply (PSU)',
    options: [
      { id: 'psu1', name: '450W 80+ Bronze', desc: 'Entry-level, non-modular', price: 44 },
      { id: 'psu2', name: '550W 80+ Bronze', desc: 'Budget-friendly, reliable', price: 54 },
      { id: 'psu3', name: 'SFX 550W 80+ Gold', desc: 'Compact, for ITX builds', price: 89 },
      { id: 'psu4', name: '650W 80+ Bronze', desc: 'Semi-modular, solid value', price: 59 },
      { id: 'psu5', name: '650W 80+ Gold', desc: 'Fully modular, quiet fan', price: 79 },
      { id: 'psu6', name: '750W 80+ Gold', desc: 'Fully modular, headroom to grow', price: 94 },
      { id: 'psu7', name: 'SFX-L 750W 80+ Gold', desc: 'Compact high-wattage, ITX', price: 129 },
      { id: 'psu8', name: '750W 80+ Platinum', desc: 'Premium efficiency', price: 139 },
      { id: 'psu9', name: '850W 80+ Gold', desc: 'Fully modular, headroom for upgrades', price: 109 },
      { id: 'psu10', name: '850W 80+ Platinum', desc: 'High efficiency, whisper quiet', price: 159 },
      { id: 'psu11', name: '1000W 80+ Gold', desc: 'For high-end multi-drive setups', price: 149 },
      { id: 'psu12', name: '1000W 80+ Platinum', desc: 'For high-end multi-GPU setups', price: 169 },
      { id: 'psu13', name: '1200W 80+ Platinum', desc: 'Extreme headroom', price: 219 },
      { id: 'psu14', name: '1200W 80+ Titanium', desc: 'Extreme headroom, whisper quiet', price: 249 },
      { id: 'psu15', name: '1600W 80+ Titanium', desc: 'Extreme workstation / multi-GPU', price: 379 },
    ]
  },
  {
    key: 'os', title: 'Operating System',
    options: [
      { id: 'os1', name: 'No OS', desc: 'Install your own license', price: 0 },
      { id: 'os2', name: 'Ubuntu Linux', desc: 'Free, open-source, pre-installed', price: 0 },
      { id: 'os3', name: 'Windows 11 Home', desc: 'Licensed, pre-installed & activated', price: 99 },
      { id: 'os4', name: 'Windows 11 Pro', desc: 'Licensed, pre-installed, BitLocker & RDP', price: 149 },
      { id: 'os5', name: 'Windows 11 Pro for Workstations', desc: 'Optimized for high-core-count CPUs', price: 199 },
    ]
  },
];

const state = {};
const fmt = (n) => `$${Number(n).toLocaleString('en-US')}`;

/* ---------- Build the step accordion ---------- */
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
          ${part.options.map((opt, i) => `
            <div class="option" data-part="${part.key}" data-opt="${opt.id}">
              <div class="option-info">
                <div class="option-icon">${partIcon(part.key, i, part.options.length)}</div>
                <div>
                  <div class="option-name">${opt.name}</div>
                  <div class="option-desc">${opt.desc}</div>
                </div>
              </div>
              <div class="option-right">
                <div class="option-price">${opt.price ? '+' + fmt(opt.price) : 'Included'}</div>
                <div class="option-radio"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });

  const firstCard = document.querySelector('.part-card');
  if (firstCard) {
    firstCard.classList.add('open');
    const firstBody = firstCard.querySelector('.part-card-body');
    firstBody.style.maxHeight = firstBody.scrollHeight + 'px';
  }

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
      const numEl = card.querySelector('.part-num');
      if (numEl) numEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:14px;height:14px;"><path d="M20 6L9 17l-5-5"/></svg>';
      document.getElementById(`sel-${partKey}`).textContent = `${chosen.name}${chosen.price ? ' — ' + fmt(chosen.price) : ' — Included'}`;

      const body = card.querySelector('.part-card-body');
      if (card.classList.contains('open')) body.style.maxHeight = body.scrollHeight + 'px';

      updateSummary();
      renderPreview();

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
        }, 300);
      }
    }
  });
}

/* ---------- Summary sidebar ---------- */
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

/* ---------- Live assembled preview ---------- */
function renderPreview() {
  const mount = document.getElementById('buildPreview');
  const label = document.getElementById('previewLabel');
  if (!mount) return;

  const anySelected = Object.keys(state).length > 0;
  if (!anySelected) {
    mount.innerHTML = `
      <div class="preview-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
        <p>Pick parts and watch your rig come together</p>
      </div>`;
    if (label) label.textContent = 'No parts selected yet';
    return;
  }

  const caseOpt = state.case;
  const style = caseOpt?.meta?.style || 'atx';
  const includedFans = caseOpt?.meta?.fans ?? 2;
  const extraFans = state.fans?.meta?.extra ?? 0;
  const totalFans = Math.min(includedFans + extraFans, 9);

  const gpuIdx = state.gpu ? PARTS.find(p=>p.key==='gpu').options.findIndex(o=>o.id===state.gpu.id) : -1;
  const gpuTotal = PARTS.find(p=>p.key==='gpu').options.length;
  const gpuLen = state.gpu ? 60 + (gpuIdx / (gpuTotal - 1)) * 50 : 0;
  const gpuColor = state.gpu ? tierColor(gpuIdx, gpuTotal) : '#2a2a2e';

  const ramIdx = state.ram ? PARTS.find(p=>p.key==='ram').options.findIndex(o=>o.id===state.ram.id) : -1;
  const ramTotal = PARTS.find(p=>p.key==='ram').options.length;
  const ramSticks = state.ram ? 1 + Math.round((ramIdx / (ramTotal - 1)) * 2) : 0;

  const coolType = state.cooling?.meta?.type || null;

  const dims = style === 'itx'
    ? { w: 150, h: 230 }
    : style === 'tower'
    ? { w: 190, h: 290 }
    : { w: 170, h: 260 };

  const sideW = Math.round(dims.w * 0.42);
  const skew = Math.round(dims.w * 0.09);
  const topY = 24;
  const frontX = 14;
  const sideFanCount = Math.min(caseOpt ? Math.max(Math.round(totalFans * 0.5), 1) : 0, 3);

  /* 7-blade fan defs (local) */
  const bladeAngles = [0, 51.4, 102.9, 154.3, 205.7, 257.1, 308.6];
  const bladeSm = bladeAngles.map(a => `<path d="M0 0 L0 -13 A13 13 0 0 1 5.7 -11.8 Z" fill="#2a0810" opacity="0.55" transform="rotate(${a})"/>`).join('');
  const bladeLg = bladeAngles.map(a => `<path d="M0 0 L0 -22 A22 22 0 0 1 9.7 -20 Z" fill="#2a0810" opacity="0.58" transform="rotate(${a})"/>`).join('');

  /* side panel fans */
  let sideFanSvg = '';
  if (sideFanCount > 0) {
    const spacing = dims.h / (sideFanCount + 1);
    for (let i = 0; i < sideFanCount; i++) {
      const fy = topY + spacing * (i + 1) - skew * 0.4;
      const fx = frontX + dims.w + sideW * 0.5;
      const r = Math.min(sideW * 0.42, spacing * 0.42);
      const dur = (6.5 + i).toFixed(1);
      sideFanSvg += `
        <ellipse cx="${fx}" cy="${fy}" rx="${r*0.85}" ry="${r}" fill="url(#pvFanGlow)" class="pulse-glow"/>
        <ellipse cx="${fx}" cy="${fy}" rx="${r*0.85}" ry="${r}" fill="none" stroke="#ff5b5b" stroke-width="1"/>
        <g transform="translate(${fx} ${fy}) scale(0.8,1)" filter="url(#pvMotionBlur)" style="animation: spin ${dur}s linear infinite ${i%2?'reverse':''}; transform-origin:${fx}px ${fy}px;">${bladeLg}</g>
        <circle cx="${fx}" cy="${fy}" r="3.5" fill="#0a0a0c"/>
      `;
    }
  }

  /* top fan row (visible through glass) */
  let topFanSvg = '';
  if (caseOpt) {
    const n = 3, rowY = topY + 22, rowSpacing = (dims.w - 40) / (n + 1);
    for (let i = 0; i < n; i++) {
      const fx = frontX + 20 + rowSpacing * (i + 1);
      topFanSvg += `
        <circle cx="${fx}" cy="${rowY}" r="12" fill="url(#pvFanGlow)" class="pulse-glow"/>
        <circle cx="${fx}" cy="${rowY}" r="12" fill="none" stroke="#ff5b5b" stroke-width="0.8"/>
        <g transform="translate(${fx} ${rowY}) scale(0.5)" filter="url(#pvMotionBlur)" style="animation: spin ${(6+i).toFixed(1)}s linear infinite ${i%2?'reverse':''}; transform-origin:${fx}px ${rowY}px;">${bladeSm}</g>
      `;
    }
  }

  /* big front intake fan */
  const bigFanSvg = caseOpt ? `
    <circle cx="${frontX + dims.w*0.28}" cy="${topY + dims.h*0.5}" r="${dims.w*0.24}" fill="url(#pvFanGlowBig)" class="pulse-glow"/>
    <circle cx="${frontX + dims.w*0.28}" cy="${topY + dims.h*0.5}" r="${dims.w*0.24}" fill="none" stroke="#ff6a6a" stroke-width="1.2"/>
    <g transform="translate(${frontX + dims.w*0.28} ${topY + dims.h*0.5})" filter="url(#pvMotionBlur)" style="animation: spin 5.5s linear infinite; transform-origin:${frontX + dims.w*0.28}px ${topY + dims.h*0.5}px;">${bladeLg}</g>
    <circle cx="${frontX + dims.w*0.28}" cy="${topY + dims.h*0.5}" r="5" fill="#0a0a0c"/>
  ` : '';

  /* motherboard + cooler */
  const moboX = frontX + dims.w*0.5, moboY = topY + dims.h*0.3, moboW = dims.w*0.42, moboH = dims.h*0.42;
  const moboSvg = state.motherboard ? `<rect x="${moboX}" y="${moboY}" width="${moboW}" height="${moboH}" rx="3" fill="#131316" stroke="#2a2a2e"/>` : '';

  let coolerSvg = '';
  const pumpCx = moboX + moboW*0.32, pumpCy = moboY + moboH*0.4;
  if (coolType === 'stock') {
    coolerSvg = `<rect x="${pumpCx-6}" y="${pumpCy-6}" width="12" height="12" rx="2" fill="#1a1a1e" stroke="#5a5a60" stroke-width="1"/>`;
  } else if (coolType === 'air-lp') {
    coolerSvg = `<rect x="${pumpCx-12}" y="${pumpCy-4}" width="24" height="8" rx="2" fill="#1a1a1e" stroke="#ff5b5b" stroke-width="1"/>`;
  } else if (coolType === 'passive') {
    coolerSvg = Array.from({length:4}).map((_,i)=>`<rect x="${pumpCx-10+i*6}" y="${pumpCy-14}" width="3.5" height="28" fill="#2a2a2e" stroke="#6a6a6e" stroke-width="0.6"/>`).join('');
  } else if (coolType === 'air') {
    coolerSvg = `<rect x="${pumpCx-7}" y="${pumpCy-16}" width="14" height="32" rx="2" fill="#1a1a1e" stroke="#ff2530" stroke-width="1"/><circle cx="${pumpCx}" cy="${pumpCy}" r="5" fill="#ff2530" opacity="0.7" class="pulse-glow"/>`;
  } else if (coolType && coolType.startsWith('aio')) {
    coolerSvg = `<circle cx="${pumpCx}" cy="${pumpCy}" r="13" fill="#0d0d10" stroke="#ff2530" stroke-width="1.3"/><circle cx="${pumpCx}" cy="${pumpCy}" r="4" fill="#ff2530" class="pulse-glow"/>
      <rect x="${frontX+30}" y="${topY-2}" width="${dims.w-60}" height="9" rx="2" fill="#141417" stroke="#ff2530" stroke-width="1"/>`;
  } else if (coolType === 'custom') {
    coolerSvg = `<path d="M${pumpCx-14} ${pumpCy-14} L${pumpCx+14} ${pumpCy-14} L${pumpCx+14} ${pumpCy+14} L${pumpCx-14} ${pumpCy+14} Z" fill="none" stroke="#ff5b5b" stroke-width="1.6" opacity="0.85"/><circle cx="${pumpCx-14}" cy="${pumpCy-14}" r="2.5" fill="#ff2530"/><circle cx="${pumpCx+14}" cy="${pumpCy+14}" r="2.5" fill="#ff2530"/>`;
  }

  /* RAM */
  let ramSvg = '';
  const ramX = moboX + moboW + 6;
  for (let i = 0; i < 3; i++) {
    const active = i < ramSticks;
    ramSvg += `<rect x="${ramX + i*7}" y="${moboY+4}" width="5" height="${moboH*0.55}" fill="${active ? '#ff2530' : 'none'}" stroke="${active ? '#ff2530' : '#2a2a2e'}" stroke-width="0.8" opacity="${active ? 0.9 - i*0.12 : 1}"/>${active ? `<rect class="pulse-glow" x="${ramX + i*7}" y="${moboY+4}" width="5" height="3" fill="#ff8a2b"/>` : ''}`;
  }

  /* GPU */
  const gpuY = topY + dims.h*0.72;
  const gpuSvg = state.gpu ? `
    <rect x="${moboX-2}" y="${gpuY}" width="${gpuLen}" height="${dims.h*0.15}" rx="3" fill="#0a0a0c" stroke="${gpuColor}" stroke-width="1.1"/>
    <text x="${moboX+2}" y="${gpuY + dims.h*0.15 - 4}" font-family="Arial, sans-serif" font-size="5.5" fill="${gpuColor}" letter-spacing="0.6">REDGEAR RTX</text>
    <g transform="translate(${moboX + gpuLen*0.78} ${gpuY + dims.h*0.075})" style="animation: spin 3.2s linear infinite; transform-origin:${moboX + gpuLen*0.78}px ${gpuY + dims.h*0.075}px;"><circle r="7" fill="${gpuColor}" opacity="0.5"/></g>
    <rect x="${moboX-2}" y="${gpuY + dims.h*0.15 - 2}" width="${gpuLen}" height="2" fill="${gpuColor}" class="pulse-glow"/>
  ` : `<rect x="${moboX-2}" y="${gpuY}" width="${dims.w*0.4}" height="${dims.h*0.15}" rx="3" fill="none" stroke="#2a2a2e" stroke-dasharray="3 3" stroke-width="1"/>`;

  /* cables */
  const cableSvg = state.psu ? `
    <path d="M${moboX+moboW-4} ${gpuY} Q ${moboX+moboW+10} ${gpuY-20} ${pumpCx+10} ${pumpCy+8}" stroke="#3a0509" stroke-width="4" fill="none" opacity="0.5"/>
    <path d="M${moboX+moboW-4} ${gpuY} Q ${moboX+moboW+10} ${gpuY-20} ${pumpCx+10} ${pumpCy+8}" stroke="#ff2530" stroke-width="1.6" fill="none" opacity="0.7" class="pulse-glow"/>
  ` : '';

  /* PSU shroud */
  const psuSvg = state.psu ? `<rect x="${frontX+8}" y="${topY+dims.h-24}" width="${dims.w-16}" height="18" rx="2" fill="#0d0d10" stroke="#2a2a2e" stroke-width="1"/>` : '';

  /* bottom logo */
  const logoSvg = caseOpt ? `
    <rect x="${frontX}" y="${topY+dims.h}" width="${dims.w}" height="16" fill="#0c0c0e"/>
    <path d="M${frontX+8} ${topY+dims.h+5} L${frontX+16} ${topY+dims.h+5} L${frontX+13} ${topY+dims.h+12} L${frontX+11} ${topY+dims.h+12} Z" fill="#e0141f" opacity="0.9" class="pulse-glow"/>
    <text x="${frontX+20}" y="${topY+dims.h+11}" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#e5e5e8" letter-spacing="0.5">REDGEAR</text>
  ` : '';

  const vbW = frontX*2 + dims.w + sideW;
  const vbH = dims.h + 60;
  const capX = frontX + dims.w;

  const svg = `
    <svg viewBox="0 -20 ${vbW} ${vbH + 20}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pvFanGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#ffb0a8"/>
          <stop offset="22%" stop-color="#ff4545"/>
          <stop offset="65%" stop-color="#7c0a12"/>
          <stop offset="100%" stop-color="#0d0304"/>
        </radialGradient>
        <radialGradient id="pvFanGlowBig" cx="42%" cy="36%" r="62%">
          <stop offset="0%" stop-color="#ffc4bd"/>
          <stop offset="20%" stop-color="#ff6a6a"/>
          <stop offset="58%" stop-color="#a01019"/>
          <stop offset="100%" stop-color="#0d0304"/>
        </radialGradient>
        <linearGradient id="pvCaseGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1c1c20"/>
          <stop offset="100%" stop-color="#050506"/>
        </linearGradient>
        <linearGradient id="pvMeshGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#19191c"/>
          <stop offset="100%" stop-color="#08080a"/>
        </linearGradient>
        <linearGradient id="pvTopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38383e"/>
          <stop offset="100%" stop-color="#18181c"/>
        </linearGradient>
        <linearGradient id="pvRgb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff2530"/>
          <stop offset="50%" stop-color="#ff8a2b"/>
          <stop offset="100%" stop-color="#ff2530"/>
        </linearGradient>
        <linearGradient id="pvSweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="50%" stop-color="#fff" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <pattern id="pvMesh" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.4" cy="1.4" r="0.8" fill="#000" opacity="0.55"/></pattern>
        <clipPath id="pvGlassClip"><rect x="${frontX+10}" y="${topY+10}" width="${dims.w-20}" height="${dims.h-20}" rx="5"/></clipPath>
        <filter id="pvBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
        <filter id="pvMotionBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
      </defs>

      <ellipse class="ambient-breathe" cx="${frontX + dims.w/2 + sideW/2}" cy="${topY + dims.h/2}" rx="${dims.w*0.75}" ry="${dims.h*0.6}" fill="#e0141f" opacity="0.16" filter="url(#pvBlur)"/>
      <ellipse cx="${frontX + dims.w/2 + sideW/2}" cy="${topY + dims.h + 22}" rx="${dims.w*0.6}" ry="8" fill="#000" opacity="0.55" filter="url(#pvBlur)"/>

      ${caseOpt ? `<polygon points="${frontX},${topY} ${capX},${topY} ${capX+sideW},${topY-skew} ${frontX+sideW},${topY-skew}" fill="url(#pvTopGrad)" stroke="#2a2a2e" stroke-width="0.8"/>` : ''}
      ${caseOpt ? `<polygon points="${capX},${topY} ${capX+sideW},${topY-skew} ${capX+sideW},${topY+dims.h-skew} ${capX},${topY+dims.h}" fill="url(#pvMeshGrad)" stroke="#2a2a2e" stroke-width="1"/>
      <polygon points="${capX},${topY} ${capX+sideW},${topY-skew} ${capX+sideW},${topY+dims.h-skew} ${capX},${topY+dims.h}" fill="url(#pvMesh)" opacity="0.5"/>` : ''}
      ${sideFanSvg}
      ${caseOpt ? `<rect class="rgb-cycle" x="${capX+sideW-4}" y="${topY-skew}" width="3" height="${dims.h}" fill="url(#pvRgb)" style="animation-delay:-1.2s"/>` : ''}

      ${caseOpt ? `
      <rect x="${frontX}" y="${topY}" width="${dims.w}" height="${dims.h}" rx="8" fill="url(#pvCaseGrad)" stroke="#ff2530" stroke-width="1.3" opacity="0.97"/>
      <rect x="${frontX}" y="${topY}" width="${dims.w}" height="3" rx="1.5" fill="#4a4a52" opacity="0.5"/>
      <rect class="rgb-cycle" x="${frontX}" y="${topY}" width="3" height="${dims.h}" fill="url(#pvRgb)"/>
      <rect x="${frontX+10}" y="${topY+10}" width="${dims.w-20}" height="${dims.h-20}" rx="5" fill="#0a0a0c" stroke="#2a2a2e" stroke-width="0.8"/>
      <g clip-path="url(#pvGlassClip)"><rect class="glass-sweep" x="${frontX-20}" y="${topY-10}" width="${dims.w*0.3}" height="${dims.h+40}" fill="url(#pvSweep)" transform="skewX(-18)"/></g>
      ` : ''}

      ${topFanSvg}
      ${bigFanSvg}
      ${moboSvg}
      ${coolerSvg}
      ${ramSvg}
      ${gpuSvg}
      ${cableSvg}
      ${psuSvg}
      ${logoSvg}
    </svg>
  `;
  mount.innerHTML = svg;

  const parts = [];
  if (caseOpt) parts.push(caseOpt.name.replace('RedGear ',''));
  if (state.cpu) parts.push(state.cpu.name.split(' ').slice(-1)[0]);
  if (state.gpu) parts.push(state.gpu.name.split(' ').slice(0,2).join(' '));
  if (label) label.textContent = parts.length ? parts.join(' · ') : 'Building your rig…';
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildUI();
  updateSummary();
  renderPreview();

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
      document.querySelectorAll('.part-card.done').forEach((c, idx) => {
        c.classList.remove('done');
        const numEl = c.querySelector('.part-num');
        if (numEl) numEl.textContent = PARTS.findIndex(p => `card-${p.key}` === c.id) + 1;
      });
      document.querySelectorAll('[id^="sel-"]').forEach(el => el.textContent = 'Not selected yet');
      updateSummary();
      renderPreview();
    });
  }
});
