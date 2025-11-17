// i18next Initialization
let i18nextInstance = null;
const emojiFontPromise = loadEmojiFont();

function loadEmojiFont() {
  if (document.fonts && document.fonts.load) {
    try {
      return document.fonts.load('400 1em "Noto Color Emoji"');
    } catch (err) {
      console.warn('Failed to request emoji font load:', err);
    }
  }
  return Promise.resolve();
}

async function initI18next() {
  i18nextInstance = i18next.createInstance();
  
  await i18nextInstance
    .use(i18nextBrowserLanguageDetector)
    .init({
      fallbackLng: 'ja',
      debug: false,
      resources: {
        ja: {
          translation: await fetch('./locales/ja/translation.json').then(r => r.json())
        },
        en: {
          translation: await fetch('./locales/en/translation.json').then(r => r.json())
        },
        'zh-Hant': {
          translation: await fetch('./locales/zh-Hant/translation.json').then(r => r.json())
        },
        'zh-Hans': {
          translation: await fetch('./locales/zh-Hans/translation.json').then(r => r.json())
        },
        ko: {
          translation: await fetch('./locales/ko/translation.json').then(r => r.json())
        }
      }
    });
  
  // Update UI with translations
  updateTranslations();
  
  // Setup language selector
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) {
    langSelect.value = i18nextInstance.language;
  langSelect.addEventListener('change', (e) => {
    i18nextInstance.changeLanguage(e.target.value).then(() => {
      updateTranslations();
      updateSelectOptions();
      // Update text based on current background and new language
      updateInitialText();
      updateFooterText();
      // Update flag names based on new language
      populateFlagSelects();
      render();
    });
  });
  }
}

function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key.startsWith('[')) {
      // Handle attributes like [placeholder]
      const match = key.match(/\[(\w+)\](.+)/);
      if (match) {
        const attr = match[1];
        const transKey = match[2];
        el.setAttribute(attr, i18nextInstance.t(transKey));
      }
    } else {
      el.textContent = i18nextInstance.t(key);
    }
  });
  
  // Update title
  document.title = i18nextInstance.t('title');
}

function updateSelectOptions() {
  // Update select options that have data-i18n
  document.querySelectorAll('select option[data-i18n]').forEach(option => {
    const key = option.getAttribute('data-i18n');
    option.textContent = i18nextInstance.t(key);
  });
}

function getDefaultText(backgroundType, lang) {
  // Fallback to Japanese if language not found
  const fallbackLang = 'ja';
  
  let langData = null;
  if (defaultTexts[backgroundType] && defaultTexts[backgroundType][lang]) {
    langData = defaultTexts[backgroundType][lang];
  } else if (defaultTexts[backgroundType] && defaultTexts[backgroundType][fallbackLang]) {
    langData = defaultTexts[backgroundType][fallbackLang];
  }
  
  if (!langData) return '';
  
  // 新しい構造（text/footer）と古い構造（文字列）の両方に対応
  if (typeof langData === 'string') {
    return langData;
  }
  return langData.text || '';
}

function getDefaultFooter(backgroundType, lang) {
  // Fallback to Japanese if language not found
  const fallbackLang = 'ja';
  
  let langData = null;
  if (defaultTexts[backgroundType] && defaultTexts[backgroundType][lang]) {
    langData = defaultTexts[backgroundType][lang];
  } else if (defaultTexts[backgroundType] && defaultTexts[backgroundType][fallbackLang]) {
    langData = defaultTexts[backgroundType][fallbackLang];
  }
  
  if (!langData || typeof langData === 'string') {
    return null;
  }
  return langData.footer || null;
}

function updateInitialText() {
  if (!els.bgSelect || !els.text) return;
  
  const lang = i18nextInstance ? i18nextInstance.language : 'ja';
  const currentBg = els.bgSelect.value;
  const text = getDefaultText(currentBg, lang);
  
  if (text) {
    els.text.value = text;
  }
}

function updateFooterText() {
  if (!els.bgSelect || !els.footerText) return;
  
  const currentBg = els.bgSelect.value;
  els.footerText.value = getFooterText(currentBg);
}

// Constants
const HIGHLIGHT_COLOR = "#D8AE5C";
const FLAG_DEFAULT_CODES = { flag1: 'CN', flag2: 'JP' };
const BACKGROUND_TYPES = {
  FOREIGN_AFFAIRS: 'background.png',
  DEFENSE: 'background2.png',
  MAO_NING: 'background3.png'
};

function getFooterPrefixes() {
  return {
    FOREIGN_AFFAIRS: i18nextInstance ? i18nextInstance.t('footerForeignAffairs') : '中国外交部報道官',
    DEFENSE: i18nextInstance ? i18nextInstance.t('footerDefense') : '中国国防部報道官'
  };
}
const FLAG_RENDER_CONFIG = {
  sizeRatio: 0.11,
  yRatio: 0.1,
  spacingRatio: 0.05
};
const FALLBACK_FLAGS = [
  {code: "CN", emoji: "🇨🇳", name: "中国"},
  {code: "JP", emoji: "🇯🇵", name: "日本"},
  {code: "TW", emoji: "🇹🇼", name: "台湾"},
  {code: "US", emoji: "🇺🇸", name: "アメリカ"},
  {code: "KR", emoji: "🇰🇷", name: "韓国"},
  {code: "RU", emoji: "🇷🇺", name: "ロシア"},
  {code: "GB", emoji: "🇬🇧", name: "イギリス"},
  {code: "FR", emoji: "🇫🇷", name: "フランス"},
  {code: "DE", emoji: "🇩🇪", name: "ドイツ"}
];

// DOM Elements - will be initialized after DOM is loaded
let els = {};

function initializeDOMElements() {
  els = {
    cv: document.getElementById('cv'),
    bgSelect: document.getElementById('bgSelect'),
    text: document.getElementById('text'),
    fontSize: document.getElementById('fontSize'),
    lineHeight: document.getElementById('lineHeight'),
    marginX: document.getElementById('marginX'),
    startY: document.getElementById('startY'),
    textColor: document.getElementById('textColor'),
    shadowBlur: document.getElementById('shadowBlur'),
    fontFamily: document.getElementById('fontFamily'),
    quoteMode: document.getElementById('quoteMode'),
    footerText: document.getElementById('footerText'),
    footerSize: document.getElementById('footerSize'),
    renderBtn: document.getElementById('renderBtn'),
    saveBtn: document.getElementById('saveBtn'),
    highlightGoldBtn: document.getElementById('highlightGoldBtn'),
    flagSelectContainer: document.getElementById('flagSelectContainer'),
    flag1: document.getElementById('flag1'),
    flag2: document.getElementById('flag2')
  };
}

// State
let bgImg = null;
let flagsData = [];
let defaultTexts = {};

// Utility Functions
function formatDateJP(d) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}

function getFontFamily() {
  if (!els.fontFamily) {
    return '"Noto Sans JP","Hiragino Sans","Yu Gothic",sans-serif';
  }
  const fontMap = {
    serif: '"Noto Serif JP","Hiragino Mincho ProN","Yu Mincho",serif',
    sans: '"Noto Sans JP","Hiragino Sans","Yu Gothic",sans-serif'
  };
  return fontMap[els.fontFamily.value] || fontMap.sans;
}

function formatDate(d, lang) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  
  if (lang === 'en') {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[m - 1]} ${day}, ${y}`;
  } else if (lang === 'ko') {
    return `${y}년 ${m}월 ${day}일`;
  } else if (lang === 'zh-Hans' || lang === 'zh-Hant') {
    return `${y}年${m}月${day}日`;
  }
  // Japanese default
  return `${y}年${m}月${day}日`;
}

function getFooterText(backgroundType) {
  const lang = i18nextInstance ? i18nextInstance.language : 'ja';
  
  // default-texts.jsonからフッターテキストを取得
  const defaultFooter = getDefaultFooter(backgroundType, lang);
  if (defaultFooter) {
    return defaultFooter;
  }
  
  // フォールバック: 動的に生成（後方互換性のため）
  const today = formatDate(new Date(), lang);
  const prefixes = getFooterPrefixes();
  
  if (backgroundType === BACKGROUND_TYPES.DEFENSE) {
    return `${prefixes.DEFENSE} ${today}`;
  }
  return `${prefixes.FOREIGN_AFFAIRS} ${today}`;
}

// Background Loading
function loadBackground(name) {
  bgImg = new Image();
  bgImg.onload = () => {
    els.cv.width = bgImg.width;
    els.cv.height = bgImg.height;
    render();
  };
  bgImg.src = './' + name;
}

// Default Texts Management
function loadDefaultTexts() {
  return fetch('./default-texts.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      defaultTexts = data;
    })
    .catch(error => {
      console.error('デフォルトテキストの読み込みに失敗しました:', error);
      defaultTexts = {};
    });
}

// Flag Data Management
function loadFlags() {
  fetch('./flags.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      flagsData = data;
      populateFlagSelects();
    })
    .catch(error => {
      console.error('国旗データの読み込みに失敗しました:', error);
      flagsData = FALLBACK_FLAGS;
      populateFlagSelects();
    });
}

function getFlagName(flag) {
  if (!i18nextInstance) return flag.name || flag.nameEn || '';
  
  const lang = i18nextInstance.language;
  const langMap = {
    'ja': 'name',
    'en': 'nameEn',
    'zh-Hans': 'nameZhHans',
    'zh-Hant': 'nameZhHant',
    'ko': 'nameKo'
  };
  
  const nameKey = langMap[lang] || 'nameEn';
  return flag[nameKey] || flag.nameEn || flag.name || '';
}

function createFlagOption(flag, defaultCode) {
  const option = document.createElement('option');
  option.value = flag.emoji;
  const flagName = getFlagName(flag);
  option.textContent = `${flagName} ${flag.emoji}`;
  if (flag.code === defaultCode) option.selected = true;
  return option;
}

function populateFlagSelects() {
  if (!els.flag1 || !els.flag2) return;
  
  els.flag1.innerHTML = '';
  els.flag2.innerHTML = '';

  flagsData.forEach(flag => {
    els.flag1.appendChild(createFlagOption(flag, FLAG_DEFAULT_CODES.flag1));
    els.flag2.appendChild(createFlagOption(flag, FLAG_DEFAULT_CODES.flag2));
  });
}

// [g]...[/g] を解析して色付きトークン列に変換
function parseTokens(text, baseColor, highlightColor) {
  const tokens = [];
  let i = 0;
  let currentColor = baseColor;
  while (i < text.length) {
    if (text.startsWith("[g]", i)) {
      currentColor = highlightColor;
      i += 3;
      continue;
    }
    if (text.startsWith("[/g]", i)) {
      currentColor = baseColor;
      i += 4;
      continue;
    }
    const ch = text[i];
    tokens.push({ char: ch, color: currentColor });
    i++;
  }
  return tokens;
}

// トークン列を行ごとに分割（自動折り返し）
function layoutTokens(ctx, tokens, maxWidth) {
  const lines = [];
  let currentTokens = [];
  let currentWidth = 0;

  for (const t of tokens) {
    if (t.char === "\n") {
      // 改行で行を確定
      lines.push({ tokens: currentTokens, width: currentWidth });
      currentTokens = [];
      currentWidth = 0;
      continue;
    }

    const w = ctx.measureText(t.char).width;
    if (currentWidth + w > maxWidth && currentTokens.length > 0) {
      // 折り返し
      lines.push({ tokens: currentTokens, width: currentWidth });
      currentTokens = [t];
      currentWidth = w;
    } else {
      currentTokens.push(t);
      currentWidth += w;
    }
  }

  if (currentTokens.length > 0) {
    lines.push({ tokens: currentTokens, width: currentWidth });
  }

  return lines;
}

// 最適なフォントサイズを計算（テキストが収まるように）
function calculateOptimalFontSize(ctx, tokens, maxWidth, maxHeight, lineHeight, fontFamily, minFontSize = 24, maxFontSize = 200) {
  let fontSize = maxFontSize;
  let lines;
  
  // 二分探索で最適なフォントサイズを見つける
  while (maxFontSize - minFontSize > 1) {
    fontSize = Math.floor((minFontSize + maxFontSize) / 2);
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    
    lines = layoutTokens(ctx, tokens, maxWidth);
    const totalHeight = lines.length * fontSize * lineHeight;
    
    if (totalHeight <= maxHeight) {
      minFontSize = fontSize; // このサイズで収まるので、もっと大きくできる
    } else {
      maxFontSize = fontSize; // 収まらないので、もっと小さくする必要がある
    }
  }
  
  // 最終確認：計算されたサイズで実際に収まるか
  fontSize = minFontSize;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  lines = layoutTokens(ctx, tokens, maxWidth);
  const totalHeight = lines.length * fontSize * lineHeight;
  
  if (totalHeight > maxHeight) {
    // まだ収まらない場合は、さらに縮小
    fontSize = Math.floor(fontSize * (maxHeight / totalHeight));
    fontSize = Math.max(fontSize, 24); // 最小サイズを保証
    // 再計算
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    lines = layoutTokens(ctx, tokens, maxWidth);
  }
  
  return { fontSize, lines };
}

// Rendering Functions
function drawBackground(ctx, width, height) {
  if (bgImg && bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, width, height);
  } else {
    ctx.fillStyle = "#7a1010";
    ctx.fillRect(0, 0, width, height);
  }
}

function drawFlags(ctx, width, height) {
  if (!els.bgSelect || els.bgSelect.value !== BACKGROUND_TYPES.MAO_NING) return;
  if (!els.flag1 || !els.flag2) return;

  const flag1 = els.flag1.value;
  const flag2 = els.flag2.value;
  const flagSize = Math.min(width * FLAG_RENDER_CONFIG.sizeRatio, height * FLAG_RENDER_CONFIG.sizeRatio);
  const flagY = height * FLAG_RENDER_CONFIG.yRatio;
  const flagSpacing = width * FLAG_RENDER_CONFIG.spacingRatio;
  const totalWidth = flagSize * 2 + flagSpacing;
  const flagX = (width - totalWidth) / 2;

  ctx.save();
  ctx.font = `${flagSize}px "Noto Color Emoji","Twemoji Mozilla","Apple Color Emoji","Segoe UI Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(flag1, flagX + flagSize / 2, flagY);
  ctx.fillText(flag2, flagX + flagSize + flagSpacing + flagSize / 2, flagY);
  
  ctx.restore();
}

function drawMainText(ctx, width, height) {
  if (!els.fontSize || !els.lineHeight || !els.marginX || !els.startY || 
      !els.textColor || !els.shadowBlur || !els.text || !els.quoteMode) return;
  
  const baseFontSize = parseInt(els.fontSize.value, 10) || 80;
  const lineHeight = parseFloat(els.lineHeight.value) || 1.25;
  const marginX = (parseFloat(els.marginX.value) || 10) / 100;
  const startYRatio = (parseFloat(els.startY.value) || 20) / 100;
  const baseColor = els.textColor.value || "#ffffff";
  const shadowBlur = parseInt(els.shadowBlur.value, 10) || 0;

  const areaX = width * marginX;
  const areaW = width - areaX * 2;
  const startY = height * startYRatio;

  // 利用可能な高さを計算（フッターのスペースを考慮）
  const footerText = els.footerText ? els.footerText.value.trim() : '';
  const footerHeight = footerText ? height * 0.12 : 0; // フッターがある場合の余白
  const availableHeight = height - startY - footerHeight;

  let raw = els.text.value;
  if (els.quoteMode.value === "both" && raw.trim()) {
    raw = "“" + raw + "”";
  }

  ctx.save();
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = shadowBlur;
  
  // フォントファミリーを取得
  const fontFamily = getFontFamily();
  
  // 一時的にフォントを設定してトークンを解析
  ctx.font = `700 ${baseFontSize}px ${fontFamily}`;
  const tokens = parseTokens(raw, baseColor, HIGHLIGHT_COLOR);
  
  // 最適なフォントサイズを計算
  const { fontSize, lines } = calculateOptimalFontSize(
    ctx, 
    tokens, 
    areaW, 
    availableHeight, 
    lineHeight,
    fontFamily,
    24, // 最小フォントサイズ
    baseFontSize // 最大フォントサイズ（ユーザー指定値）
  );
  
  // 計算されたフォントサイズで再設定
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  const linePx = fontSize * lineHeight;

  let y = startY;
  for (const line of lines) {
    const xStart = (width - line.width) / 2;
    let x = xStart;
    for (const t of line.tokens) {
      ctx.fillStyle = t.color;
      ctx.fillText(t.char, x, y);
      x += ctx.measureText(t.char).width;
    }
    y += linePx;
  }
  ctx.restore();
}

function drawFooter(ctx, width, height) {
  if (!els.footerText || !els.footerSize || !els.textColor || !els.shadowBlur) return;
  
  const footerText = els.footerText.value.trim();
  if (!footerText) return;

  const fSize = parseInt(els.footerSize.value, 10) || 32;
  const bottomMargin = height * 0.06;
  const baseColor = els.textColor.value || "#ffffff";
  const shadowBlur = parseInt(els.shadowBlur.value, 10) || 0;

  ctx.save();
  ctx.font = `500 ${fSize}px "Noto Serif JP","Hiragino Mincho ProN","Yu Mincho",serif`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.fillStyle = baseColor;
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = shadowBlur;

  const yFooter = height - bottomMargin;
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(width * 0.15, yFooter - fSize * 1.6, width * 0.70, 2);

  ctx.globalAlpha = 1;
  ctx.shadowBlur = shadowBlur;
  ctx.fillText(footerText, width / 2, yFooter);
  ctx.restore();
}

function render() {
  if (!els.cv) return;
  
  const cv = els.cv;
  const ctx = cv.getContext('2d');
  const width = cv.width;
  const height = cv.height;

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawFlags(ctx, width, height);
  drawMainText(ctx, width, height);
  drawFooter(ctx, width, height);
}

// Event Handlers
function handleBackgroundChange() {
  if (!els.bgSelect) return;
  
  const selected = els.bgSelect.value;
  loadBackground(selected);
  
  const isMaoNing = selected === BACKGROUND_TYPES.MAO_NING;
  if (els.flagSelectContainer) {
    els.flagSelectContainer.style.display = isMaoNing ? 'block' : 'none';
  }
  if (els.footerText) {
    els.footerText.value = getFooterText(selected);
  }
  
  // Update text based on new background and current language
  updateInitialText();
  render();
}

function handleHighlightGold() {
  if (!els.text) return;
  
  const ta = els.text;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  if (start === end) return;

  const value = ta.value;
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);
  const GOLD_TAG_OPEN = "[g]";
  const GOLD_TAG_CLOSE = "[/g]";

  ta.value = before + GOLD_TAG_OPEN + selected + GOLD_TAG_CLOSE + after;

  const newPos = before.length + GOLD_TAG_OPEN.length + selected.length + GOLD_TAG_CLOSE.length;
  ta.focus();
  ta.selectionStart = ta.selectionEnd = newPos;
  render();
}

function handleSaveImage() {
  if (!els.cv) return;
  
  const src = els.cv;
  const scale = 0.5;
  const w = src.width * scale;
  const h = src.height * scale;

  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;

  const offCtx = off.getContext("2d");
  offCtx.drawImage(src, 0, 0, w, h);

  off.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "propaganda.jpg";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/jpeg", 0.92);
}

// Event Listeners Setup
function setupEventListeners() {
  const renderTriggerIds = [
    "text", "fontSize", "lineHeight", "marginX", "startY",
    "textColor", "shadowBlur", "fontFamily", "quoteMode",
    "footerText", "footerSize", "flag1", "flag2"
  ];

  renderTriggerIds.forEach(id => {
    if (els[id]) {
      els[id].addEventListener("input", render);
      els[id].addEventListener("change", render);
    }
  });

  if (els.bgSelect) {
    els.bgSelect.addEventListener('change', handleBackgroundChange);
  }
  if (els.highlightGoldBtn) {
    els.highlightGoldBtn.addEventListener('click', handleHighlightGold);
  }
  if (els.renderBtn) {
    els.renderBtn.addEventListener("click", render);
  }
  if (els.saveBtn) {
    els.saveBtn.addEventListener("click", handleSaveImage);
  }
}

// Initialization
async function init() {
  // Initialize DOM elements first
  initializeDOMElements();
  
  // Load default texts
  await loadDefaultTexts();
  
  // Initialize i18next
  await initI18next();
  
  // Set initial text based on background and language
  if (els.footerText) {
    els.footerText.value = getFooterText(BACKGROUND_TYPES.FOREIGN_AFFAIRS);
  }
  if (els.flagSelectContainer) {
    els.flagSelectContainer.style.display = 'none';
  }
  
  updateInitialText();
  loadBackground(BACKGROUND_TYPES.FOREIGN_AFFAIRS);
  loadFlags();
  setupEventListeners();
}

async function waitForEmojiFont() {
  try {
    await emojiFontPromise;
  } catch (err) {
    console.warn('Emoji font load failed, falling back to system fonts:', err);
  }
}

window.onload = async () => {
  await init();
  await waitForEmojiFont();
  if (els.cv) {
    render();
  }
};

