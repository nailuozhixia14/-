/* ===== 塔罗秘境 · 游戏流程 ===== */
'use strict';

(() => {
  let deck = shuffleArray(TAROT_DECK);
  let mode = 'single';
  const drawn = [];

  const slots = document.getElementById('slots');
  const deckBtn = document.getElementById('deckBtn');
  const deckStack = document.getElementById('deckStack');
  const deckCount = document.getElementById('deckCount');
  const hint = document.getElementById('hint');
  const reading = document.getElementById('reading');
  const drawBtn = document.getElementById('drawBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const resetBtn = document.getElementById('resetBtn');
  const modeGroup = document.getElementById('modeGroup');

  const THREE_LABELS = ['过去', '现在', '未来'];
  const CELTIC_LABELS = ['现状', '挑战', '过去', '未来', '显意识', '潜意识', '建议', '环境', '希望与恐惧', '结果'];
  const MODE_COUNT = { single: 1, three: 3, celtic: 10 };
  const MODE_LABELS = { single: [], three: THREE_LABELS, celtic: CELTIC_LABELS };

  function updateDeckUI() {
    deckCount.textContent = String(deck.length);
    deckBtn.classList.toggle('disabled', deck.length === 0);
    drawBtn.disabled = deck.length === 0;
    deckStack.style.display = deck.length ? '' : 'none';
  }

  function clearSpread() {
    drawn.length = 0;
    slots.innerHTML = '';
    slots.classList.remove('celtic');
    reading.hidden = true;
    reading.innerHTML = '';
  }

  function setMode(next) {
    mode = next;
    clearSpread();
    updateDeckUI();
    modeGroup.querySelectorAll('.mode-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === next);
    });
    hint.textContent = '点击牌堆，或按下「抽牌」按钮';
  }

  function createCardEl(card, reversed, delay, label) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    const el = document.createElement('div');
    el.className = 'card';
    el.style.animationDelay = `${delay}s`;
    el.innerHTML =
      '<div class="card-inner">' +
      `<div class="face card-back"><img src="${CARD_BACK}" alt="牌背"></div>` +
      `<div class="face card-front"><img src="${card.img}" alt="${card.name}" class="${reversed ? 'reversed' : ''}"></div>` +
      '</div>';
    slot.appendChild(el);
    if (label) {
      const cap = document.createElement('div');
      cap.className = 'slot-caption';
      cap.textContent = label;
      slot.appendChild(cap);
    }
    return { slot, el };
  }

  function flip(entry) {
    if (entry.revealed) return;
    entry.revealed = true;
    entry.el.classList.add('flipped');
    const rect = entry.el.getBoundingClientRect();
    Effects.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);
    setTimeout(renderReading, 320);
  }

  function renderReading() {
    reading.hidden = false;
    reading.innerHTML = '<div class="reading-card"></div>';
    const box = reading.firstElementChild;
    drawn.filter((d) => d.revealed).forEach((d) => {
      const entry = document.createElement('div');
      entry.className = 'reading-entry';
      const posCls = d.reversed ? 'reversed' : 'upright';
      const posTxt = d.reversed ? '逆位' : '正位';
      entry.innerHTML =
        '<div class="reading-head">' +
        `<span class="reading-name">${d.card.name}</span>` +
        `<span class="badge ${posCls}">${posTxt}</span>` +
        (d.slotLabel ? `<span class="reading-slot">${d.slotLabel}</span>` : '') +
        '</div>' +
        `<p class="reading-text">${d.reversed ? d.card.reversed : d.card.upright}</p>` +
        `<div class="reading-kw">${d.card.keywords.map((k) => `<span class="kw">${k}</span>`).join('')}</div>`;
      box.appendChild(entry);
    });
  }

  function draw() {
    if (deck.length === 0) return;
    const n = MODE_COUNT[mode] || 1;
    if (deck.length < n) {
      hint.textContent = '剩余牌数不足，请先洗牌';
      return;
    }
    clearSpread();
    const labels = MODE_LABELS[mode] || [];
    if (mode === 'celtic') slots.classList.add('celtic');
    for (let i = 0; i < n; i++) {
      const card = deck.pop();
      const reversed = Math.random() < 0.5;
      const label = labels[i] || '';
      const entry = {
        card,
        reversed,
        el: null,
        slot: null,
        revealed: false,
        slotLabel: label,
      };
      const { slot, el } = createCardEl(card, reversed, i * 0.06, label);
      entry.slot = slot;
      entry.el = el;
      el.addEventListener('click', () => flip(entry));
      slots.appendChild(slot);
      drawn.push(entry);
    }
    updateDeckUI();
    hint.textContent = '点击卡牌翻开，查看解读';
  }

  function shuffle() {
    deck = shuffleArray(TAROT_DECK);
    clearSpread();
    updateDeckUI();
    hint.textContent = '牌已洗好，点击牌堆或「抽牌」按钮';
  }

  modeGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-btn');
    if (btn && btn.dataset.mode !== mode) setMode(btn.dataset.mode);
  });
  deckBtn.addEventListener('click', draw);
  drawBtn.addEventListener('click', draw);
  shuffleBtn.addEventListener('click', shuffle);
  resetBtn.addEventListener('click', shuffle);

  updateDeckUI();
  Effects.init();
})();