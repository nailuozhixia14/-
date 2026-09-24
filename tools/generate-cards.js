'use strict';
// 塔罗牌 SVG 图片资源生成器
// 用法：node tools/generate-cards.js
// 输出：images/card-back.svg 与 images/cards/*.svg（22 大阿卡纳 + 56 小阿卡纳）

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CARDS_DIR = path.join(ROOT, 'images', 'cards');
fs.mkdirSync(CARDS_DIR, { recursive: true });

const GOLD = '#d9b96a';
const GOLD_DIM = '#8f7b3f';
const INK = '#f3e6bd';
const DEEP = '#241b3d';

// ---------- 几何辅助 ----------
function poly(cx, cy, r, n, rot = -90) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI / 180) * (rot + (i * 360) / n);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}
function star5(cx, cy, r, fill, rot = -90) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.48;
    const a = (Math.PI / 180) * (rot + i * 36);
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}
function star8(cx, cy, r, fill) {
  return `<path fill="${fill}" d="M ${poly(cx, cy, r, 4, 0)} Z M ${poly(cx, cy, r, 4, 45)} Z"/>`;
}
function circlePath(cx, cy, r) {
  return `M ${cx} ${cy} m ${-r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
}
function crescent(cx, cy, r, fill, shift = 0.44) {
  return `<path fill-rule="evenodd" fill="${fill}" d="${circlePath(cx, cy, r)} ${circlePath(cx + r * shift, cy - r * 0.05, r)} Z"/>`;
}
function sun(cx, cy, r, fill, ray) {
  let rays = '';
  for (let i = 0; i < 14; i++) {
    const a = ((i * 360) / 14) * (Math.PI / 180);
    const x1 = cx + Math.cos(a) * r * 1.12;
    const y1 = cy + Math.sin(a) * r * 1.12;
    const x2 = cx + Math.cos(a) * r * 1.42;
    const y2 = cy + Math.sin(a) * r * 1.42;
    rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ray}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return rays + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}
function heart(cx, cy, s, fill) {
  return `<path d="M ${cx} ${cy + s * 0.4} C ${cx - s * 1.15} ${cy - s * 0.3}, ${cx - s * 0.55} ${cy - s * 0.95}, ${cx} ${cy - s * 0.35} C ${cx + s * 0.55} ${cy - s * 0.95}, ${cx + s * 1.15} ${cy - s * 0.3}, ${cx} ${cy + s * 0.4} Z" fill="${fill}"/>`;
}
function ring(cx, cy, r, stroke, sw = 4, dash = null) {
  const d = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}"${d}/>`;
}
function diamond(cx, cy, r, fill) {
  return `<polygon points="${poly(cx, cy, r, 4, 0)}" fill="${fill}"/>`;
}
function infinity(cx, cy, s, c) {
  return ring(cx - s * 0.5, cy, s * 0.56, c, 9) + ring(cx + s * 0.5, cy, s * 0.56, c, 9);
}
function crown(cx, cy, s, c) {
  return `<path d="M ${cx - s} ${cy + s * 0.3} L ${cx - s} ${cy - s * 0.2} L ${cx - s * 0.55} ${cy + s * 0.1} L ${cx} ${cy - s * 0.72} L ${cx + s * 0.55} ${cy + s * 0.1} L ${cx + s} ${cy - s * 0.2} L ${cx + s} ${cy + s * 0.3} Z" fill="${c}"/>`;
}
function horns(cx, cy, s, c) {
  return `<path d="M ${cx - s} ${cy} Q ${cx - s * 1.1} ${cy - s * 1.2} ${cx - s * 0.55} ${cy - s * 1.4} Q ${cx - s * 0.25} ${cy - s * 0.8} ${cx} ${cy - s * 0.5}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>` +
    `<path d="M ${cx + s} ${cy} Q ${cx + s * 1.1} ${cy - s * 1.2} ${cx + s * 0.55} ${cy - s * 1.4} Q ${cx + s * 0.25} ${cy - s * 0.8} ${cx} ${cy - s * 0.5}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`;
}
function key(cx, cy, s, c, rot = 0) {
  return `<g transform="rotate(${rot} ${cx} ${cy})"><line x1="${cx - s}" y1="${cy}" x2="${cx + s * 0.6}" y2="${cy}" stroke="${c}" stroke-width="6"/><circle cx="${cx + s * 0.72}" cy="${cy}" r="${s * 0.36}" fill="none" stroke="${c}" stroke-width="6"/><line x1="${cx + s * 0.55}" y1="${cy - s * 0.4}" x2="${cx + s * 0.55}" y2="${cy + s * 0.4}" stroke="${c}" stroke-width="5"/></g>`;
}
function shield(cx, cy, s, c) {
  return `<path d="M ${cx} ${cy - s} L ${cx + s * 0.8} ${cy - s * 0.6} L ${cx + s * 0.8} ${cy + s * 0.3} Q ${cx + s * 0.8} ${cy + s * 0.8} ${cx} ${cy + s} Q ${cx - s * 0.8} ${cy + s * 0.8} ${cx - s * 0.8} ${cy + s * 0.3} L ${cx - s * 0.8} ${cy - s * 0.6} Z" fill="${c}"/>`;
}
function wheel(cx, cy, r, c) {
  let spokes = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 * Math.PI) / 180;
    spokes += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * r).toFixed(1)}" y2="${(cy + Math.sin(a) * r).toFixed(1)}" stroke="${c}" stroke-width="5"/>`;
  }
  return ring(cx, cy, r, c, 6) + ring(cx, cy, r * 0.55, c, 3) + `<circle cx="${cx}" cy="${cy}" r="${r * 0.16}" fill="${c}"/>` + spokes;
}
function scale(cx, cy, s, c) {
  const top = cy - s * 0.7;
  return `<line x1="${cx - s}" y1="${top}" x2="${cx + s}" y2="${top}" stroke="${c}" stroke-width="7" stroke-linecap="round"/>` +
    `<line x1="${cx}" y1="${top}" x2="${cx}" y2="${cy + s * 0.8}" stroke="${c}" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M ${cx - s} ${top} L ${cx - s * 1.1} ${top + s * 0.5}" stroke="${c}" stroke-width="4"/>` +
    `<path d="M ${cx - s * 1.1} ${top + s * 0.5} L ${cx - s * 0.9} ${top + s * 0.5} L ${cx - s * 0.78} ${top + s * 0.8} L ${cx - s * 1.42} ${top + s * 0.8} L ${cx - s * 1.3} ${top + s * 0.5} Z" fill="${c}"/>` +
    `<path d="M ${cx + s} ${top} L ${cx + s * 1.1} ${top + s * 0.5}" stroke="${c}" stroke-width="4"/>` +
    `<path d="M ${cx + s * 1.1} ${top + s * 0.5} L ${cx + s * 0.9} ${top + s * 0.5} L ${cx + s * 0.78} ${top + s * 0.8} L ${cx + s * 1.42} ${top + s * 0.8} L ${cx + s * 1.3} ${top + s * 0.5} Z" fill="${c}"/>`;
}
function skull(cx, cy, s, c) {
  return `<path d="M ${cx} ${cy - s} Q ${cx + s} ${cy - s * 0.9} ${cx + s * 0.72} ${cy - s * 0.1} Q ${cx + s * 0.72} ${cy + s * 0.45} ${cx + s * 0.5} ${cy + s * 0.62} L ${cx + s * 0.28} ${cy + s * 0.82} Q ${cx + s * 0.14} ${cy + s * 0.98} ${cx} ${cy + s * 0.98} Q ${cx - s * 0.14} ${cy + s * 0.98} ${cx - s * 0.28} ${cy + s * 0.82} L ${cx - s * 0.5} ${cy + s * 0.62} Q ${cx - s * 0.72} ${cy + s * 0.45} ${cx - s * 0.72} ${cy - s * 0.1} Q ${cx - s} ${cy - s * 0.9} ${cx} ${cy - s} Z" fill="${c}"/>` +
    `<circle cx="${cx - s * 0.3}" cy="${cy - s * 0.1}" r="${s * 0.2}" fill="${DEEP}"/>` +
    `<circle cx="${cx + s * 0.3}" cy="${cy - s * 0.1}" r="${s * 0.2}" fill="${DEEP}"/>` +
    `<path d="M ${cx - s * 0.16} ${cy + s * 0.18} L ${cx - s * 0.05} ${cy + s * 0.36} L ${cx} ${cy + s * 0.3} L ${cx + s * 0.05} ${cy + s * 0.36} L ${cx + s * 0.16} ${cy + s * 0.18} Z" fill="${DEEP}"/>`;
}
function trumpet(cx, cy, s, c, rot = -35) {
  return `<g transform="rotate(${rot} ${cx} ${cy})"><path d="M ${cx - s} ${cy + s * 0.1} L ${cx + s * 0.2} ${cy + s * 0.1} L ${cx + s * 0.7} ${cy + s * 0.55} L ${cx + s * 0.2} ${cy + s * 0.55} Z" fill="${c}"/><line x1="${cx - s * 0.15}" y1="${cy + s * 0.32}" x2="${cx + s * 0.55}" y2="${cy + s * 0.32}" stroke="${c}" stroke-width="4"/></g>`;
}
function tower(cx, cy, s, c) {
  return `<rect x="${cx - s * 0.45}" y="${cy - s}" width="${s * 0.9}" height="${s * 2}" fill="none" stroke="${c}" stroke-width="6"/>` +
    `<rect x="${cx - s * 0.45}" y="${cy - s}" width="${s * 0.9}" height="${s * 0.35}" fill="${c}"/>` +
    `<path d="M ${cx - s * 0.55} ${cy - s} L ${cx - s * 0.55} ${cy - s * 1.1} L ${cx - s * 0.25} ${cy - s} M ${cx + s * 0.55} ${cy - s} L ${cx + s * 0.55} ${cy - s * 1.1} L ${cx + s * 0.25} ${cy - s}" fill="none" stroke="${c}" stroke-width="6"/>`;
}
function lightning(cx, cy, s, c) {
  return `<polygon points="${cx},${cy - s} ${cx - s * 0.5},${cy + s * 0.05} ${cx - s * 0.12},${cy + s * 0.05} ${cx - s * 0.35},${cy + s} ${cx + s * 0.45},${cy - s * 0.15} ${cx + s * 0.08},${cy - s * 0.15} ${cx + s * 0.3},${cy - s}" fill="${c}"/>`;
}
function lantern(cx, cy, s, c) {
  return `<line x1="${cx}" y1="${cy - s * 1.2}" x2="${cx}" y2="${cy + s * 0.6}" stroke="${c}" stroke-width="6"/>` +
    `<path d="M ${cx - s * 0.35} ${cy - s * 0.8} L ${cx + s * 0.35} ${cy - s * 0.8} L ${cx + s * 0.45} ${cy - s * 0.45} L ${cx - s * 0.45} ${cy - s * 0.45} Z" fill="${c}"/>` +
    `<rect x="${cx - s * 0.5}" y="${cy - s * 0.45}" width="${s}" height="${s * 0.85}" rx="6" fill="none" stroke="${c}" stroke-width="5"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${s * 0.22}" fill="${c}"/>` +
    `<line x1="${cx - s * 0.55}" y1="${cy + s * 0.5}" x2="${cx + s * 0.55}" y2="${cy + s * 0.5}" stroke="${c}" stroke-width="5"/>`;
}
function wreath(cx, cy, rx, ry, c, n = 30) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = cx + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry;
    const rot = (a * 180) / Math.PI;
    out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="4" fill="${c}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return out;
}
function wings(cx, cy, s, c) {
  let out = '';
  for (let i = 0; i < 3; i++) {
    const yy = cy - s * 0.4 + i * s * 0.35;
    out += `<path d="M ${cx} ${cy - s * 0.1} Q ${cx - s * (0.5 + i * 0.25)} ${yy - s * 0.3} ${cx - s * (0.9 + i * 0.25)} ${yy}" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    out += `<path d="M ${cx} ${cy - s * 0.1} Q ${cx + s * (0.5 + i * 0.25)} ${yy - s * 0.3} ${cx + s * (0.9 + i * 0.25)} ${yy}" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  }
  return out;
}
function lion(cx, cy, r, c) {
  let mane = '';
  for (let i = 0; i < 20; i++) {
    const a = (i * 18 * Math.PI) / 180;
    const x1 = cx + Math.cos(a) * r * 0.92;
    const y1 = cy + Math.sin(a) * r * 0.92;
    const x2 = cx + Math.cos(a) * r * 1.15;
    const y2 = cy + Math.sin(a) * r * 1.15;
    mane += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
  }
  return mane + `<circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="${DEEP}"/>` +
    `<circle cx="${cx - r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.1}" fill="${c}"/><circle cx="${cx + r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.1}" fill="${c}"/><path d="M ${cx - r * 0.22} ${cy + r * 0.15} L ${cx} ${cy + r * 0.35} L ${cx + r * 0.22} ${cy + r * 0.15}" fill="none" stroke="${c}" stroke-width="4"/>`;
}
function pentagram(cx, cy, r, c, invert = false) {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI / 180) * ((invert ? 90 : -90) + i * 144);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const order = [0, 2, 4, 1, 3, 0];
  const d = 'M ' + order.map((i) => `${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`).join(' L ');
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round"/>`;
}
function venus(cx, cy, s, c) {
  return ring(cx, cy, s * 0.5, c, 5) + `<line x1="${cx}" y1="${cy + s * 0.5}" x2="${cx}" y2="${cy + s * 1.1}" stroke="${c}" stroke-width="5"/><line x1="${cx - s * 0.4}" y1="${cy + s * 0.8}" x2="${cx + s * 0.4}" y2="${cy + s * 0.8}" stroke="${c}" stroke-width="5"/>`;
}
function tripleCross(cx, cy, s, c) {
  return `<line x1="${cx}" y1="${cy - s}" x2="${cx}" y2="${cy + s}" stroke="${c}" stroke-width="8" stroke-linecap="round"/>` +
    `<line x1="${cx - s * 0.6}" y1="${cy - s * 0.55}" x2="${cx + s * 0.6}" y2="${cy - s * 0.55}" stroke="${c}" stroke-width="7" stroke-linecap="round"/>` +
    `<line x1="${cx - s * 0.7}" y1="${cy - s * 0.05}" x2="${cx + s * 0.7}" y2="${cy - s * 0.05}" stroke="${c}" stroke-width="7" stroke-linecap="round"/>` +
    `<line x1="${cx - s * 0.4}" y1="${cy + s * 0.5}" x2="${cx + s * 0.4}" y2="${cy + s * 0.5}" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
}
function scythe(cx, cy, s, c, rot = -30) {
  return `<g transform="rotate(${rot} ${cx} ${cy})"><line x1="${cx - s}" y1="${cy + s}" x2="${cx + s * 0.9}" y2="${cy - s * 0.7}" stroke="${c}" stroke-width="8" stroke-linecap="round"/><path d="M ${cx + s * 0.9} ${cy - s * 0.7} Q ${cx + s * 1.7} ${cy - s * 0.2} ${cx + s * 0.8} ${cy + s * 0.5} Q ${cx + s * 0.95} ${cy + s * 0.25} ${cx + s * 0.7} ${cy + s * 0.1} Q ${cx + s * 1.1} ${cy - s * 0.4} ${cx + s * 0.9} ${cy - s * 0.7} Z" fill="${c}"/></g>`;
}
function wandLine(x1, y1, x2, y2, c) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="9" stroke-linecap="round"/>` + diamond(x2, y2, 16, c);
}
// ---------- 花色符号 ----------
function suitWand(cx, cy, s, c) {
  const w = Math.max(4, s * 0.14);
  return `<line x1="${cx}" y1="${cy - s}" x2="${cx}" y2="${cy + s}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>` +
    `<polygon points="${cx},${cy - s - s * 0.55} ${cx + s * 0.32},${cy - s} ${cx},${cy - s + s * 0.4} ${cx - s * 0.32},${cy - s}" fill="${c}"/>` +
    `<path d="M ${cx} ${cy - s * 0.75} Q ${cx + s * 0.55} ${cy - s * 0.6} ${cx + s * 0.3} ${cy - s * 0.25} Q ${cx + s * 0.14} ${cy - s * 0.4} ${cx} ${cy - s * 0.55} Z" fill="${c}"/>` +
    `<path d="M ${cx} ${cy - s * 0.75} Q ${cx - s * 0.55} ${cy - s * 0.6} ${cx - s * 0.3} ${cy - s * 0.25} Q ${cx - s * 0.14} ${cy - s * 0.4} ${cx} ${cy - s * 0.55} Z" fill="${c}"/>`;
}
function suitCup(cx, cy, s, c) {
  const w = Math.max(4, s * 0.12);
  return `<path d="M ${cx - s * 0.7} ${cy - s * 0.2} Q ${cx} ${cy - s * 1.05} ${cx + s * 0.7} ${cy - s * 0.2} L ${cx + s * 0.36} ${cy + s * 0.1} L ${cx - s * 0.36} ${cy + s * 0.1} Z" fill="${c}"/>` +
    `<line x1="${cx}" y1="${cy + s * 0.1}" x2="${cx}" y2="${cy + s * 0.6}" stroke="${c}" stroke-width="${w}"/>` +
    `<line x1="${cx - s * 0.4}" y1="${cy + s * 0.75}" x2="${cx + s * 0.4}" y2="${cy + s * 0.75}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function suitSword(cx, cy, s, c) {
  const w = Math.max(4, s * 0.1);
  return `<polygon points="${cx},${cy - s} ${cx + w * 0.8},${cy - s * 0.55} ${cx + w * 0.8},${cy + s * 0.5} ${cx},${cy + s * 0.7} ${cx - w * 0.8},${cy + s * 0.5} ${cx - w * 0.8},${cy - s * 0.55}" fill="${c}"/>` +
    `<line x1="${cx - s * 0.55}" y1="${cy + s * 0.35}" x2="${cx + s * 0.55}" y2="${cy + s * 0.35}" stroke="${c}" stroke-width="${w * 1.4}" stroke-linecap="round"/>` +
    `<circle cx="${cx}" cy="${cy + s * 0.7}" r="${s * 0.16}" fill="${c}"/>`;
}
function suitPentacle(cx, cy, s, c) {
  return ring(cx, cy, s * 0.82, c, Math.max(3, s * 0.1)) + star5(cx, cy, s * 0.5, c);
}
function suitSymbol(key, cx, cy, s, c) {
  if (key === 'wands') return suitWand(cx, cy, s, c);
  if (key === 'cups') return suitCup(cx, cy, s, c);
  if (key === 'swords') return suitSword(cx, cy, s, c);
  return suitPentacle(cx, cy, s, c);
}

// ---------- 大阿卡纳 ----------
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
const MAJOR = [
  ['愚者', 'The Fool', '#ffd54f'],
  ['魔术师', 'The Magician', '#f26d5b'],
  ['女祭司', 'The High Priestess', '#a9c2ff'],
  ['女皇', 'The Empress', '#e58fb1'],
  ['皇帝', 'The Emperor', '#d95d39'],
  ['教皇', 'The Hierophant', '#b8a6ff'],
  ['恋人', 'The Lovers', '#ff9ecf'],
  ['战车', 'The Chariot', '#7fb7ff'],
  ['力量', 'Strength', '#ffb24d'],
  ['隐者', 'The Hermit', '#8f9bb3'],
  ['命运之轮', 'Wheel of Fortune', '#59c2b7'],
  ['正义', 'Justice', '#c2a878'],
  ['倒吊人', 'The Hanged Man', '#8bb3d4'],
  ['死神', 'Death', '#d8d8e0'],
  ['节制', 'Temperance', '#7fd1c8'],
  ['恶魔', 'The Devil', '#c65b6e'],
  ['高塔', 'The Tower', '#ff8f6b'],
  ['星星', 'The Star', '#ffe27a'],
  ['月亮', 'The Moon', '#b9c9ff'],
  ['太阳', 'The Sun', '#ffd166'],
  ['审判', 'Judgement', '#a6e3e9'],
  ['世界', 'The World', '#8fd694'],
];

function majorEmblem(i, acc) {
  switch (i) {
    case 0:
      return sun(175, 235, 60, acc, GOLD) + `<circle cx="175" cy="235" r="34" fill="${GOLD}" opacity="0.4"/>` +
        `<circle cx="175" cy="365" r="14" fill="#f6f1ea"/><circle cx="175" cy="365" r="6" fill="${acc}"/><path d="M175 380 Q175 394 175 402" stroke="${GOLD}" stroke-width="4" fill="none"/>` +
        `<path d="M 85 428 Q 175 372 265 428" stroke="${GOLD}" stroke-width="5" fill="none"/>`;
    case 1:
      return infinity(175, 230, 52, acc) + wandLine(140, 390, 210, 210, GOLD) +
        suitCup(128, 330, 17, GOLD) + suitSword(222, 330, 17, GOLD) + suitPentacle(128, 200, 14, GOLD) + suitWand(222, 200, 17, GOLD);
    case 2:
      return `<line x1="95" y1="180" x2="95" y2="420" stroke="${GOLD}" stroke-width="9"/><line x1="255" y1="180" x2="255" y2="420" stroke="${GOLD}" stroke-width="9"/>` +
        `<path d="M 95 222 Q 175 252 255 222" stroke="${GOLD}" stroke-width="6" fill="none"/>` +
        crescent(175, 305, 62, acc) + `<circle cx="175" cy="342" r="5" fill="${GOLD}"/>`;
    case 3:
      return crown(175, 215, 70, acc) + heart(175, 320, 42, acc) + venus(175, 412, 22, GOLD);
    case 4:
      return crown(175, 215, 72, acc) + horns(175, 320, 55, GOLD) + ring(175, 415, 18, GOLD, 5);
    case 5:
      return tripleCross(175, 275, 95, acc) + key(148, 400, 46, GOLD, -45) + key(202, 400, 46, GOLD, 45);
    case 6:
      return ring(155, 285, 42, acc, 6) + ring(195, 285, 42, GOLD, 6) + heart(175, 355, 32, acc) + sun(175, 205, 26, GOLD, GOLD);
    case 7:
      return shield(175, 270, 72, acc) + star5(175, 200, 16, GOLD) + ring(125, 392, 26, GOLD, 5) + ring(225, 392, 26, GOLD, 5) + `<circle cx="125" cy="392" r="8" fill="${GOLD}"/><circle cx="225" cy="392" r="8" fill="${GOLD}"/>`;
    case 8:
      return infinity(175, 220, 55, acc) + lion(175, 360, 52, acc);
    case 9:
      return lantern(175, 330, 40, acc) + `<line x1="118" y1="430" x2="232" y2="205" stroke="${GOLD}" stroke-width="6"/>` + star5(232, 205, 11, GOLD);
    case 10:
      return wheel(175, 300, 82, acc) + suitCup(175, 205, 15, GOLD) + suitSword(270, 300, 15, GOLD) + suitPentacle(175, 395, 13, GOLD) + suitWand(80, 300, 15, GOLD);    case 11:
      return suitSword(175, 300, 100, GOLD) + scale(175, 300, 72, acc);
    case 12:
      return `<polygon points="175,178 268,420 82,420" fill="none" stroke="${acc}" stroke-width="5"/>` +
        `<circle cx="175" cy="250" r="16" fill="${acc}"/><line x1="175" y1="266" x2="175" y2="348" stroke="${acc}" stroke-width="8" stroke-linecap="round"/>` +
        `<line x1="175" y1="310" x2="135" y2="330" stroke="${acc}" stroke-width="8" stroke-linecap="round"/><line x1="175" y1="310" x2="215" y2="330" stroke="${acc}" stroke-width="8" stroke-linecap="round"/>` +
        `<line x1="175" y1="348" x2="150" y2="390" stroke="${acc}" stroke-width="8" stroke-linecap="round"/><line x1="175" y1="348" x2="200" y2="390" stroke="${acc}" stroke-width="8" stroke-linecap="round"/>` +
        `<circle cx="175" cy="188" r="8" fill="${GOLD}"/>`;
    case 13:
      return skull(175, 275, 58, acc) + scythe(118, 392, 66, GOLD);
    case 14:
      return wings(175, 218, 55, acc) + suitCup(175, 320, 42, acc) + `<path d="M 175 290 L 175 250" stroke="${GOLD}" stroke-width="6" stroke-dasharray="3 8"/>` + `<circle cx="175" cy="242" r="5" fill="${GOLD}"/>`;
    case 15:
      return horns(175, 245, 55, acc) + pentagram(175, 335, 58, acc, true) + ring(175, 420, 16, GOLD, 5) + ring(175, 448, 16, GOLD, 5);
    case 16:
      return tower(175, 305, 58, acc) + lightning(252, 252, 52, GOLD) + crown(110, 205, 26, GOLD);
    case 17:
      return star8(175, 272, 70, acc) + star5(90, 190, 13, GOLD) + star5(255, 205, 11, GOLD) + star5(125, 430, 10, GOLD) + star5(225, 428, 12, GOLD) + `<path d="M 100 452 Q 175 424 250 452" stroke="${GOLD}" stroke-width="4" fill="none"/>`;
    case 18:
      return crescent(175, 300, 72, acc) + `<circle cx="175" cy="300" r="50" fill="${DEEP}" opacity="0.4"/>` +
        `<circle cx="158" cy="288" r="7" fill="${GOLD}"/><circle cx="192" cy="288" r="7" fill="${GOLD}"/><path d="M 160 322 Q 175 338 190 322" stroke="${GOLD}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        star5(88, 190, 12, GOLD) + star5(260, 232, 9, GOLD) + star5(118, 432, 10, GOLD) + `<path d="M 128 454 Q 175 424 222 454" stroke="${acc}" stroke-width="5" fill="none"/>`;
    case 19:
      return sun(175, 270, 62, acc, GOLD) + `<circle cx="175" cy="270" r="38" fill="none" stroke="${GOLD}" stroke-width="4"/>` + star5(175, 270, 16, GOLD);
    case 20: {
      let rays = '';
      for (let k = 0; k < 12; k++) {
        const a = (k * 30 * Math.PI) / 180;
        const x1 = 175 + Math.cos(a) * 92;
        const y1 = 300 + Math.sin(a) * 92;
        const x2 = 175 + Math.cos(a) * 128;
        const y2 = 300 + Math.sin(a) * 128;
        rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${acc}" stroke-width="4"/>`;
      }
      return rays + trumpet(175, 300, 62, GOLD, -35);
    }
    case 21:
      return wreath(175, 300, 96, 68, acc) + star8(175, 300, 34, GOLD) + `<circle cx="175" cy="300" r="14" fill="${acc}"/>`;
    default:
      return '';
  }
}
// ---------- 小阿卡纳 ----------
const SUITS = [
  { key: 'wands', cn: '权杖', color: '#f26d5b', element: '火' },
  { key: 'cups', cn: '圣杯', color: '#6fa8ff', element: '水' },
  { key: 'swords', cn: '宝剑', color: '#b9c4d8', element: '风' },
  { key: 'pentacles', cn: '星币', color: '#8fd694', element: '土' },
];
const RANKS = [
  ['ace', '王牌'], ['02', '二'], ['03', '三'], ['04', '四'], ['05', '五'], ['06', '六'], ['07', '七'],
  ['08', '八'], ['09', '九'], ['10', '十'], ['page', '侍从'], ['knight', '骑士'], ['queen', '王后'], ['king', '国王'],
];
const PIP = {
  2: [[175, 205], [175, 395]],
  3: [[175, 185], [175, 300], [175, 415]],
  4: [[115, 205], [235, 205], [115, 395], [235, 395]],
  5: [[115, 195], [235, 195], [175, 300], [115, 405], [235, 405]],
  6: [[115, 185], [235, 185], [115, 300], [235, 300], [115, 415], [235, 415]],
  7: [[115, 185], [235, 185], [115, 300], [175, 300], [235, 300], [115, 415], [235, 415]],
  8: [[115, 175], [235, 175], [115, 255], [235, 255], [115, 345], [235, 345], [115, 425], [235, 425]],
  9: [[95, 195], [175, 195], [255, 195], [95, 300], [175, 300], [255, 300], [95, 405], [175, 405], [255, 405]],
  10: [[115, 165], [235, 165], [115, 235], [235, 235], [115, 300], [235, 300], [115, 365], [235, 365], [115, 430], [235, 430]],
};
function courtExtra(rank, cx, cy, s, c) {
  if (rank === 'page') return star5(cx, cy - s * 1.35, s * 0.32, c);
  if (rank === 'knight') return shield(cx, cy - s * 1.3, s * 0.55, c);
  if (rank === 'queen') return crown(cx, cy - s * 1.35, s * 0.75, c);
  if (rank === 'king') return crown(cx, cy - s * 1.4, s * 0.9, c) + `<circle cx="${cx}" cy="${cy + s * 1.6}" r="${s * 0.3}" fill="none" stroke="${c}" stroke-width="4"/>`;
}

// ---------- 卡面框架 ----------
function cornerOrnaments(acc) {
  return `${star5(58, 66, 10, acc)}${star5(292, 66, 10, acc)}${star5(58, 534, 10, acc)}${star5(292, 534, 10, acc)}`;
}
function card(acc, topLabel, bottomLabel, emblem, subLabel) {
  const sub = subLabel ? `<text x="175" y="102" text-anchor="middle" font-family="Georgia, serif" font-size="12" letter-spacing="2" fill="${acc}">${subLabel}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 600" width="350" height="600">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#2a2140"/>
<stop offset="1" stop-color="#12101f"/>
</linearGradient>
<radialGradient id="halo" cx="0.5" cy="0.5" r="0.62">
<stop offset="0" stop-color="${acc}" stop-opacity="0.2"/>
<stop offset="1" stop-color="${acc}" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="350" height="600" rx="24" fill="url(#bg)"/>
<rect x="14" y="14" width="322" height="572" rx="15" fill="none" stroke="${GOLD}" stroke-width="2.5"/>
<rect x="23" y="23" width="304" height="554" rx="11" fill="none" stroke="${GOLD_DIM}" stroke-width="1"/>
<rect x="30" y="30" width="290" height="540" rx="9" fill="url(#halo)"/>
${cornerOrnaments(acc)}
<rect x="44" y="44" width="262" height="64" rx="32" fill="none" stroke="${acc}" stroke-width="1.6"/>
<text x="175" y="86" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="40" fill="${INK}" font-weight="bold">${topLabel}</text>
${sub}
${emblem}
<rect x="54" y="502" width="242" height="58" rx="29" fill="none" stroke="${GOLD_DIM}" stroke-width="1.4"/>
<text x="175" y="540" text-anchor="middle" font-family="Georgia, 'Microsoft YaHei', serif" font-size="30" fill="${INK}">${bottomLabel}</text>
</svg>`;
}
function minorCard(suit, rankKey, rankCn) {
  const acc = suit.color;
  let emblem;
  if (rankKey === 'ace') {
    emblem = ring(175, 300, 92, acc, 3) + suitSymbol(suit.key, 175, 300, 70, acc) + star5(175, 180, 14, acc) + star5(175, 420, 14, acc);
  } else if (['page', 'knight', 'queen', 'king'].includes(rankKey)) {
    emblem = suitSymbol(suit.key, 175, 300, 58, acc) + courtExtra(rankKey, 175, 300, 58, acc);
  } else {
    const n = parseInt(rankKey, 10);
    const s = n >= 7 ? 20 : 23;
    emblem = PIP[n].map((p) => suitSymbol(suit.key, p[0], p[1], s, acc)).join('');
  }
  return card(acc, rankCn, suit.cn, emblem, suit.element);
}

// ---------- 卡背 ----------
function cardBack() {
  let lattice = '';
  for (let x = -200; x < 400; x += 28) {
    lattice += `<line x1="${x}" y1="0" x2="${x + 600}" y2="600" stroke="${GOLD_DIM}" stroke-opacity="0.12" stroke-width="1"/>`;
    lattice += `<line x1="${x + 600}" y1="0" x2="${x}" y2="600" stroke="${GOLD_DIM}" stroke-opacity="0.12" stroke-width="1"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 600" width="350" height="600">
<defs>
<linearGradient id="bb" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#241b3d"/>
<stop offset="1" stop-color="#0f0c1d"/>
</linearGradient>
</defs>
<rect width="350" height="600" rx="24" fill="url(#bb)"/>
<rect x="14" y="14" width="322" height="572" rx="15" fill="none" stroke="${GOLD}" stroke-width="2.5"/>
<rect x="23" y="23" width="304" height="554" rx="11" fill="none" stroke="${GOLD_DIM}" stroke-width="1"/>
${lattice}
<circle cx="175" cy="300" r="150" fill="none" stroke="${GOLD_DIM}" stroke-width="1.5"/>
<circle cx="175" cy="300" r="120" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>
${star8(175, 300, 84, GOLD)}
<circle cx="175" cy="300" r="40" fill="${DEEP}" stroke="${GOLD}" stroke-width="3"/>
${crescent(175, 300, 24, GOLD)}
${star5(80, 90, 12, GOLD)}${star5(270, 90, 12, GOLD)}${star5(80, 510, 12, GOLD)}${star5(270, 510, 12, GOLD)}
</svg>`;
}

// ---------- 输出 ----------
const files = [];
MAJOR.forEach(([cn, en, acc], i) => {
  const emblem = majorEmblem(i, acc);
  files.push([`major-${String(i).padStart(2, '0')}.svg`, card(acc, ROMAN[i], cn, emblem, en.toUpperCase())]);
});
SUITS.forEach((suit) => {
  RANKS.forEach(([rk, cn]) => {
    files.push([`${suit.key}-${rk}.svg`, minorCard(suit, rk, cn)]);
  });
});
files.forEach(([name, svg]) => fs.writeFileSync(path.join(CARDS_DIR, name), svg, 'utf8'));
fs.writeFileSync(path.join(ROOT, 'images', 'card-back.svg'), cardBack(), 'utf8');
console.log('生成完成：' + files.length + ' 张卡牌 + 1 张卡背');