import { RacerType, Stats, Checkpoint } from './types';

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const FPS = 60;

// Japanese UI Strings
export const UI_TEXT = {
  TITLE: "カービィのエアライダー", // Kirby Air Rider
  START: "レース開始", // Start Race
  CONTROLS: "操作: 自動加速。左右でハンドル、大きなボタンでドリフト（チャージ）",
  PRO_TIP: "キャラクターの一言", // Character's Quote
  LOADING: "星に聞いています...", // Asking the stars...
  LAP: "ラップ",
  FINISHED: "ゴール！",
  RANK: "順位",
  TIME: "タイム",
  BACK_TO_MENU: "キャラクター選択",
  COMMENTARY: "実況解説",
  YOU: "あなた",
  STATS: {
    SPEED: "スピード",
    TURN: "旋回性能",
    WEIGHT: "重さ (アタック)"
  }
};

export const RACER_NAMES_JP: Record<RacerType, string> = {
  [RacerType.KIRBY]: "カービィ",
  [RacerType.META_KNIGHT]: "メタナイト",
  [RacerType.DEDEDE]: "デデデ大王"
};

export const RACER_QUOTES: Record<RacerType, string> = {
  [RacerType.KIRBY]: "ポヨッ！ポヨ、行っくよー！", 
  [RacerType.META_KNIGHT]: "速さだけが強さではない...甘いな。",
  [RacerType.DEDEDE]: "ガハハ！ワシのハンマーで蹴散らしてやるわい！"
};

// SVGs as Data URIs
const createSvgDataUri = (svgContent: string) => 
  `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;

export const TITLE_LOGO_SVG = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fecfef;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff8c00;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="2" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <path d="M250 10 L270 60 L320 65 L280 95 L295 145 L250 120 L205 145 L220 95 L180 65 L230 60 Z" fill="#ffd700" opacity="0.2" transform="rotate(15 250 75)"/>
  <g font-family="'Arial Black', 'Fredoka', sans-serif" font-weight="900" text-anchor="middle">
     <text x="250" y="50" font-size="35" fill="#fff" stroke="#ff007f" stroke-width="6" filter="url(#shadow)">カービィ</text>
     <text x="250" y="50" font-size="35" fill="url(#grad1)">カービィ</text>
     <circle cx="250" cy="78" r="14" fill="url(#goldGrad)" stroke="#fff" stroke-width="2" filter="url(#shadow)" />
     <text x="250" y="84" font-size="16" fill="#fff" font-weight="bold">の</text>
     <text x="250" y="130" font-size="55" fill="#fff" stroke="#0056b3" stroke-width="8" filter="url(#shadow)">エアライダー</text>
     <text x="250" y="130" font-size="55" fill="#00d2ff" stroke="#fff" stroke-width="2">エアライダー</text>
  </g>
</svg>
`);

const KIRBY_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bodyGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#ffd1df;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff9ebd;stop-opacity:1" />
    </radialGradient>
  </defs>
  <path d="M50 85 L30 95 L35 75 L20 60 L40 60 L50 40 L60 60 L80 60 L65 75 L70 95 Z" fill="#ffd700" stroke="#e65100" stroke-width="2" transform="translate(0, 10) scale(1, 0.5)" />
  <ellipse cx="25" cy="85" rx="18" ry="12" fill="#bf0000" />
  <ellipse cx="75" cy="85" rx="18" ry="12" fill="#bf0000" />
  <circle cx="50" cy="50" r="40" fill="url(#bodyGrad)" stroke="#ea8da5" stroke-width="2"/>
  <circle cx="15" cy="45" r="12" fill="#ff9ebd" />
  <circle cx="85" cy="45" r="12" fill="#ff9ebd" />
  <ellipse cx="30" cy="55" rx="6" ry="3" fill="#ff6b9d" opacity="0.6" />
  <ellipse cx="70" cy="55" rx="6" ry="3" fill="#ff6b9d" opacity="0.6" />
  <ellipse cx="38" cy="40" rx="4" ry="10" fill="black" />
  <ellipse cx="62" cy="40" rx="4" ry="10" fill="black" />
  <circle cx="38" cy="35" r="2" fill="white" />
  <circle cx="62" cy="35" r="2" fill="white" />
  <circle cx="50" cy="60" r="3" fill="#990000" />
</svg>`;

const META_KNIGHT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M10 50 Q50 20 90 50 L85 80 Q50 60 15 80 Z" fill="#1a237e" />
  <ellipse cx="35" cy="85" rx="12" ry="8" fill="#4a004a" />
  <ellipse cx="65" cy="85" rx="12" ry="8" fill="#4a004a" />
  <circle cx="50" cy="50" r="35" fill="#283593" />
  <g transform="translate(80, 40) rotate(-45)">
     <path d="M0 0 L20 -40 L0 -50 L-20 -40 Z" fill="#ffeb3b" stroke="#fbc02d" stroke-width="2" />
     <path d="M-5 0 L5 0 L0 -60" stroke="#fff" stroke-width="3" />
     <circle cx="0" cy="0" r="8" fill="#f57f17" />
     <path d="M-8 -10 L-20 -20 L-10 -30" fill="none" stroke="#ffeb3b" stroke-width="3" />
     <path d="M8 -10 L20 -20 L10 -30" fill="none" stroke="#ffeb3b" stroke-width="3" />
  </g>
  <path d="M20 45 Q50 25 80 45 L75 75 Q50 85 25 75 Z" fill="#cfd8dc" stroke="#546e7a" stroke-width="2" />
  <ellipse cx="40" cy="52" rx="6" ry="14" fill="#ffd600" filter="drop-shadow(0 0 2px #ffeb3b)"/>
  <ellipse cx="60" cy="52" rx="6" ry="14" fill="#ffd600" filter="drop-shadow(0 0 2px #ffeb3b)"/>
  <path d="M15 45 Q25 25 35 45" fill="#311b92" stroke="#b39ddb" stroke-width="2" />
  <path d="M85 45 Q75 25 65 45" fill="#311b92" stroke="#b39ddb" stroke-width="2" />
</svg>`;

const DEDEDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g transform="translate(82, 50) rotate(10)">
     <rect x="-10" y="-40" width="20" height="90" fill="#5d4037" rx="2" />
     <rect x="-25" y="-60" width="50" height="40" fill="#d32f2f" rx="5" stroke="#b71c1c" stroke-width="3" />
     <polygon points="0,-50 -5,-35 10,-45 -10,-45 5,-35" fill="#ffeb3b" transform="translate(0,5)"/>
     <rect x="-25" y="-60" width="5" height="40" fill="#8e0000" />
     <rect x="20" y="-60" width="5" height="40" fill="#8e0000" />
  </g>
  <path d="M15 95 L25 40 Q50 20 75 40 L85 95" fill="#d50000" stroke="#8e0000" stroke-width="2"/>
  <circle cx="50" cy="55" r="32" fill="#039be5" />
  <path d="M35 90 Q50 80 65 90" fill="#fff" />
  <rect x="30" y="80" width="40" height="15" fill="#fbc02d" rx="2" />
  <path d="M30 80 L35 95 L40 80 L45 95 L50 80 L55 95 L60 80 L65 95 L70 80" fill="#ef6c00" opacity="0.5"/>
  <path d="M30 30 Q50 10 70 30" fill="#d50000" />
  <circle cx="50" cy="18" r="7" fill="#ffeb3b" />
  <path d="M28 30 H72 V40 H28 Z" fill="#ffeb3b" />
  <path d="M35 50 Q50 65 65 50 Q50 45 35 50" fill="#ffeb3b" stroke="#f9a825" stroke-width="2" />
  <path d="M35 40 Q40 35 45 40" fill="none" stroke="black" stroke-width="2" />
  <path d="M55 40 Q60 35 65 40" fill="none" stroke="black" stroke-width="2" />
  <circle cx="40" cy="42" r="3" fill="black" />
  <circle cx="60" cy="42" r="3" fill="black" />
  <circle cx="20" cy="60" r="10" fill="#ffca28" />
</svg>`;

export const RACER_SVGS: Record<RacerType, string> = {
  [RacerType.KIRBY]: createSvgDataUri(KIRBY_SVG),
  [RacerType.META_KNIGHT]: createSvgDataUri(META_KNIGHT_SVG),
  [RacerType.DEDEDE]: createSvgDataUri(DEDEDE_SVG)
};

export const MAX_STATS = {
  SPEED: 0.04,
  TURN: 0.06,
  WEIGHT: 1.0
};

export const RACER_STATS: Record<RacerType, Stats> = {
  [RacerType.KIRBY]: {
    topSpeed: MAX_STATS.SPEED * 0.70,
    acceleration: 0.002, 
    turnSpeed: MAX_STATS.TURN * 0.70,
    weight: MAX_STATS.WEIGHT * 0.70,
    chargeSpeed: 0.5,
    color: '#FFAFCC',
    secondaryColor: '#FFC8DD'
  },
  [RacerType.META_KNIGHT]: {
    topSpeed: MAX_STATS.SPEED * 0.90,
    acceleration: 0.003, 
    turnSpeed: MAX_STATS.TURN * 0.40,
    weight: MAX_STATS.WEIGHT * 0.70,
    chargeSpeed: 0.4,
    color: '#2D31FA',
    secondaryColor: '#5D61FF'
  },
  [RacerType.DEDEDE]: {
    topSpeed: MAX_STATS.SPEED * 0.50,
    acceleration: 0.0015, 
    turnSpeed: MAX_STATS.TURN * 0.90,
    weight: MAX_STATS.WEIGHT * 0.90,
    chargeSpeed: 0.6,
    color: '#FFD700',
    secondaryColor: '#FF0000'
  }
};

// SCALED TRACK (1.5x - Half previous size, but still spacious enough)
const TRACK_SCALE = 1.5;
export const TRACK_CHECKPOINTS: Checkpoint[] = [
  { position: { x: 0 * TRACK_SCALE, y: 0 * TRACK_SCALE }, radius: 300 * TRACK_SCALE },       
  { position: { x: 1200 * TRACK_SCALE, y: 0 * TRACK_SCALE }, radius: 300 * TRACK_SCALE },     
  { position: { x: 1800 * TRACK_SCALE, y: 600 * TRACK_SCALE }, radius: 300 * TRACK_SCALE },  
  { position: { x: 1200 * TRACK_SCALE, y: 1200 * TRACK_SCALE }, radius: 300 * TRACK_SCALE },   
  { position: { x: 0 * TRACK_SCALE, y: 1200 * TRACK_SCALE }, radius: 300 * TRACK_SCALE },   
  { position: { x: -600 * TRACK_SCALE, y: 600 * TRACK_SCALE }, radius: 300 * TRACK_SCALE }, 
];

export const WORLD_SIZE = { width: 9000, height: 9000 };
export const TRACK_WIDTH = 250; 
export const WALL_BOUNCE_LOSS = 0.6;
export const COLLISION_RADIUS = 40;