// Mondrian Dynamic Identity Generator - Aligned Wordmark Lockup Update
const WIDTH = 256;
const HEIGHT = 256;
const STROKE_WIDTH = 8;
const MIN_BLOCK_SIZE = 35;

// Global Settings State
let currentShape = null; // null = Rect, 'rhombus', 'circle'
let currentTheme = 'light';

function getThemeColors() {
  if (currentTheme === 'dark') {
    return {
      white: '#121318', // deep charcoal background blocks
      black: '#ffffff', // white grid lines and borders
      red: '#ff3b30',   // vibrant neon red
      blue: '#0a84ff',  // vibrant neon blue
      yellow: '#ffd60a' // vibrant neon yellow
    };
  } else {
    return {
      white: '#f5f5f7', // classic warm white blocks
      black: '#111112', // classic black borders/lines
      red: '#e52521',
      blue: '#0f52ba',
      yellow: '#facd05'
    };
  }
}

// Canvas Configuration
const canvOnly = {
  id: 'only',
  svg: document.getElementById('preview-logo-only'),
  btnNext: document.getElementById('btn-next-only'),
  btnAutoplay: document.getElementById('btn-autoplay-only'),
  btnExportSvg: document.getElementById('btn-export-svg-only'),
  btnExportPng256: document.getElementById('btn-export-png-only-256'),
  btnExportPng1024: document.getElementById('btn-export-png-only-1024'),
  currentLayout: null,
  animId: null,
  autoplayInt: null,
  isAutoplay: false
};

const canvText = {
  id: 'text',
  svg: document.getElementById('preview-logo-text'),
  btnNext: document.getElementById('btn-next-text'),
  btnAutoplay: document.getElementById('btn-autoplay-text'),
  btnExportSvg: document.getElementById('btn-export-svg-text'),
  btnExportPng256: document.getElementById('btn-export-png-text-256'),
  btnExportPng1024: document.getElementById('btn-export-png-text-1024'),
  currentLayout: null,
  animId: null,
  autoplayInt: null,
  isAutoplay: false
};

const ALL_CANVASES = [canvOnly, canvText];

// 1. Recursive Subdivision Generator
function generateMondrianLayout() {
  const rects = [];
  const lines = [];

  function split(x, y, w, h, depth) {
    const canSplitH = h >= MIN_BLOCK_SIZE * 2;
    const canSplitV = w >= MIN_BLOCK_SIZE * 2;
    const forceStop = w < 60 && h < 60;
    const randomStop = depth > 1 && Math.random() > 0.45;
    const mustStop = depth >= 4;

    if (forceStop || mustStop || (!canSplitH && !canSplitV) || (depth > 0 && randomStop)) {
      rects.push({ x, y, w, h, depth });
      return;
    }

    let splitH = Math.random() > 0.5;
    if (canSplitH && !canSplitV) splitH = true;
    if (!canSplitH && canSplitV) splitH = false;

    if (splitH) {
      const splitY = Math.round(y + MIN_BLOCK_SIZE + Math.random() * (h - 2 * MIN_BLOCK_SIZE));
      lines.push({ type: 'h', val: splitY, start: x, end: x + w });
      split(x, y, w, splitY - y, depth + 1);
      split(x, splitY, w, y + h - splitY, depth + 1);
    } else {
      const splitX = Math.round(x + MIN_BLOCK_SIZE + Math.random() * (w - 2 * MIN_BLOCK_SIZE));
      lines.push({ type: 'v', val: splitX, start: y, end: y + h });
      split(x, y, splitX - x, h, depth + 1);
      split(splitX, y, x + w - splitX, h, depth + 1);
    }
  }

  split(0, 0, WIDTH, HEIGHT, 0);

  let hasRed = false, hasBlue = false, hasYellow = false, hasBlack = false;
  const shuffled = [...rects].sort(() => Math.random() - 0.5);

  shuffled.forEach((r) => {
    let fillKey = 'white';
    const rand = Math.random();
    if (!hasRed && rand < 0.2) {
      fillKey = 'red';
      hasRed = true;
    } else if (!hasBlue && rand < 0.35) {
      fillKey = 'blue';
      hasBlue = true;
    } else if (!hasYellow && rand < 0.55) {
      fillKey = 'yellow';
      hasYellow = true;
    } else if (!hasBlack && rand < 0.65 && r.w * r.h < 5000) {
      fillKey = 'black';
      hasBlack = true;
    }
    r.fillKey = fillKey;
  });

  if (!hasRed && !hasBlue && !hasYellow) {
    shuffled[0].fillKey = 'red';
  }

  return { rects, lines };
}

// 2. Play Dynamic Exit -> Enter Sequence
function playTransition(canvas, targetLayout) {
  const startTime = performance.now();
  const sourceLayout = canvas.currentLayout;

  const EXIT_FADE_DUR = 250;
  const EXIT_RETRACT_DUR = 350;
  const EXIT_TOTAL_DUR = sourceLayout ? (EXIT_FADE_DUR + EXIT_RETRACT_DUR) : 0;
  
  const ENTER_DRAW_DUR = 500;
  const ENTER_FADE_DUR = 300;
  const ENTER_TOTAL_DUR = ENTER_DRAW_DUR + ENTER_FADE_DUR;
  
  const TOTAL_DURATION = EXIT_TOTAL_DUR + ENTER_TOTAL_DUR;

  function renderFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / TOTAL_DURATION, 1);
    const themeColors = getThemeColors();
    
    // Clear SVG
    canvas.svg.innerHTML = '';
    canvas.svg.style.backgroundColor = themeColors.white;

    // Determine viewBox & root elements
    const isLockup = canvas.id === 'text';
    canvas.svg.setAttribute('viewBox', isLockup ? '-4 -4 1050 264' : '-4 -4 264 264');

    // Setup Clipping Defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipPath.setAttribute('id', `clip-${canvas.id}-${now}`);

    if (currentShape === 'rhombus') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', '128,0 256,128 128,256 0,128');
      clipPath.appendChild(poly);
    } else if (currentShape === 'circle') {
      const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circ.setAttribute('cx', 128);
      circ.setAttribute('cy', 128);
      circ.setAttribute('r', 128);
      clipPath.appendChild(circ);
    } else {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', 0);
      rect.setAttribute('y', 0);
      rect.setAttribute('width', 256);
      rect.setAttribute('height', 256);
      clipPath.appendChild(rect);
    }
    defs.appendChild(clipPath);
    canvas.svg.appendChild(defs);

    // Group for logo drawing (with translation & scale if inside a lockup)
    // Scale logo down from 256px to 76px to match uppercase text height (font-size: 76)
    const logoG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    logoG.setAttribute('clip-path', `url(#clip-${canvas.id}-${now})`);
    
    if (isLockup) {
      logoG.setAttribute('transform', 'translate(40, 90) scale(0.3)');
    }
    canvas.svg.appendChild(logoG);

    let activeLayout = null;
    let lineProgress = 0;
    let fillOpacity = 0;

    if (sourceLayout && elapsed <= EXIT_TOTAL_DUR) {
      activeLayout = sourceLayout;
      if (elapsed <= EXIT_FADE_DUR) {
        fillOpacity = 1 - (elapsed / EXIT_FADE_DUR);
        lineProgress = 1.0;
      } else {
        fillOpacity = 0;
        lineProgress = 1 - (elapsed - EXIT_FADE_DUR) / EXIT_RETRACT_DUR;
      }
    } else {
      activeLayout = targetLayout;
      const enterElapsed = sourceLayout ? (elapsed - EXIT_TOTAL_DUR) : elapsed;
      if (enterElapsed <= ENTER_DRAW_DUR) {
        lineProgress = enterElapsed / ENTER_DRAW_DUR;
        fillOpacity = 0;
      } else {
        lineProgress = 1.0;
        fillOpacity = Math.min((enterElapsed - ENTER_DRAW_DUR) / ENTER_FADE_DUR, 1);
      }
    }

    // A. Render fills
    if (fillOpacity > 0 && activeLayout.rects) {
      activeLayout.rects.forEach(r => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', r.x);
        rect.setAttribute('y', r.y);
        rect.setAttribute('width', r.w);
        rect.setAttribute('height', r.h);
        rect.setAttribute('fill', themeColors[r.fillKey || 'white']);
        rect.setAttribute('fill-opacity', fillOpacity);
        rect.setAttribute('stroke', 'none');
        logoG.appendChild(rect);
      });
    }

    // B. Render internal lines
    if (lineProgress > 0 && activeLayout.lines) {
      activeLayout.lines.forEach(l => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        if (l.type === 'h') {
          const currentEnd = l.start + (l.end - l.start) * lineProgress;
          line.setAttribute('x1', l.start);
          line.setAttribute('y1', l.val);
          line.setAttribute('x2', currentEnd);
          line.setAttribute('y2', l.val);
        } else {
          const currentEnd = l.start + (l.end - l.start) * lineProgress;
          line.setAttribute('x1', l.val);
          line.setAttribute('y1', l.start);
          line.setAttribute('x2', l.val);
          line.setAttribute('y2', currentEnd);
        }
        const currentStrokeWidth = isLockup ? 9 : STROKE_WIDTH;
        line.setAttribute('stroke', themeColors.black);
        line.setAttribute('stroke-width', currentStrokeWidth);
        line.setAttribute('stroke-linecap', 'butt');
        logoG.appendChild(line);
      });
    }

    // C. Draw perimeter border (apply scale transform if in lockup)
    if (lineProgress > 0) {
      let border = null;
      if (currentShape === 'rhombus') {
        border = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        border.setAttribute('points', '128,0 256,128 128,256 0,128');
        border.setAttribute('stroke-linejoin', 'round');
        border.setAttribute('stroke-linecap', 'round');
        const perimeter = 724.0;
        border.setAttribute('stroke-dasharray', perimeter);
        border.setAttribute('stroke-dashoffset', perimeter * (1 - lineProgress));
      } else if (currentShape === 'circle') {
        border = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        border.setAttribute('cx', 128);
        border.setAttribute('cy', 128);
        border.setAttribute('r', 128);
        border.setAttribute('stroke-linecap', 'round');
        const perimeter = 804.2;
        border.setAttribute('stroke-dasharray', perimeter);
        border.setAttribute('stroke-dashoffset', perimeter * (1 - lineProgress));
      } else {
        border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        border.setAttribute('x', 0);
        border.setAttribute('y', 0);
        border.setAttribute('width', 256);
        border.setAttribute('height', 256);
        border.setAttribute('stroke-linejoin', 'round');
        border.setAttribute('stroke-linecap', 'round');
        const perimeter = 1024.0;
        border.setAttribute('stroke-dasharray', perimeter);
        border.setAttribute('stroke-dashoffset', perimeter * (1 - lineProgress));
      }
      const currentStrokeWidth = isLockup ? 9 : STROKE_WIDTH;
      border.setAttribute('fill', 'none');
      border.setAttribute('stroke', themeColors.black);
      border.setAttribute('stroke-width', currentStrokeWidth);
      
      if (isLockup) {
        // Draw the border scaled inside a container group to match fills/lines perfectly
        const borderG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        borderG.setAttribute('transform', 'translate(40, 90) scale(0.3)');
        borderG.appendChild(border);
        canvas.svg.appendChild(borderG);
      } else {
        canvas.svg.appendChild(border);
      }
    }

    // D. If lockup, render aligned wordmark text (font-size 76, baseline y=155 for perfect visual centering of Antonio Light)
    if (isLockup) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '140');
      text.setAttribute('y', '155'); // Balanced baseline y=155 to match the vertical center of the scaled logo
      text.setAttribute('font-family', "'Antonio', -apple-system, sans-serif");
      text.setAttribute('font-weight', '300'); // Antonio Light
      text.setAttribute('font-size', '76');
      text.setAttribute('fill', themeColors.black);
      text.setAttribute('letter-spacing', '0.04em'); // Expand letter spacing for premium display feel
      text.textContent = 'DATA WITHIN REACH';
      canvas.svg.appendChild(text);
    }

    if (progress < 1) {
      canvas.animId = requestAnimationFrame(renderFrame);
    } else {
      canvas.currentLayout = targetLayout;
    }
  }

  if (canvas.animId) cancelAnimationFrame(canvas.animId);
  canvas.animId = requestAnimationFrame(renderFrame);
}

// 3. Exporters
function exportPng(canvasObj, filename, targetWidth) {
  const svgString = new XMLSerializer().serializeToString(canvasObj.svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(blob);
  
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const isLockup = canvasObj.id === 'text';
    const aspect = isLockup ? (1050 / 264) : 1;
    
    const w = targetWidth;
    const h = Math.round(targetWidth / aspect);
    
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d');
    
    context.fillStyle = getThemeColors().white;
    context.fillRect(0, 0, w, h);
    context.drawImage(image, 0, 0, w, h);
    
    const pngURL = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngURL;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  image.src = blobURL;
}

function exportSvg(canvasObj, filename) {
  const svgContent = canvasObj.svg.outerHTML;
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Global Options Switchers
function updateGlobalShape(shape, clickedBtn) {
  if (currentShape === shape) return;
  currentShape = shape;

  document.querySelectorAll('.global-controls-section #btn-global-rect, #btn-global-rhombus, #btn-global-circle').forEach(btn => {
    btn.classList.remove('active');
  });
  clickedBtn.classList.add('active');

  // Redraw both previews instantly with new subdivisions
  ALL_CANVASES.forEach(canv => {
    playTransition(canv, generateMondrianLayout());
  });
}

// Theme Switcher
function updateGlobalTheme(theme, clickedBtn) {
  if (currentTheme === theme) return;
  currentTheme = theme;

  document.querySelectorAll('.global-controls-section #btn-global-light, #btn-global-dark').forEach(btn => {
    btn.classList.remove('active');
  });
  clickedBtn.classList.add('active');

  const colors = getThemeColors();

  ALL_CANVASES.forEach(canv => {
    canv.svg.parentElement.style.backgroundColor = colors.white;
    canv.svg.style.backgroundColor = colors.white;
    if (canv.currentLayout) {
      playTransition(canv, canv.currentLayout);
    }
  });
}

// Setup Synchronized Preview Autoplay
let previewAutoplayInt = null;
function startPreviewAutoplay() {
  if (previewAutoplayInt) clearInterval(previewAutoplayInt);
  
  previewAutoplayInt = setInterval(() => {
    const sharedLayout = generateMondrianLayout();
    playTransition(canvOnly, sharedLayout);
    playTransition(canvText, sharedLayout);
  }, 3000);
}

// Init Function
function init() {
  document.getElementById('btn-global-rect').addEventListener('click', (e) => updateGlobalShape(null, e.currentTarget));
  document.getElementById('btn-global-rhombus').addEventListener('click', (e) => updateGlobalShape('rhombus', e.currentTarget));
  document.getElementById('btn-global-circle').addEventListener('click', (e) => updateGlobalShape('circle', e.currentTarget));

  document.getElementById('btn-global-light').addEventListener('click', (e) => updateGlobalTheme('light', e.currentTarget));
  document.getElementById('btn-global-dark').addEventListener('click', (e) => updateGlobalTheme('dark', e.currentTarget));

  ALL_CANVASES.forEach(canv => {
    const initial = generateMondrianLayout();
    playTransition(canv, initial);

    canv.btnNext.addEventListener('click', () => {
      playTransition(canv, generateMondrianLayout());
    });

    canv.btnAutoplay.addEventListener('click', () => {
      canv.isAutoplay = !canv.isAutoplay;
      canv.btnAutoplay.classList.toggle('active', canv.isAutoplay);
      if (canv.isAutoplay) {
        canv.autoplayInt = setInterval(() => {
          playTransition(canv, generateMondrianLayout());
        }, 3000);
      } else {
        clearInterval(canv.autoplayInt);
      }
    });

    canv.btnExportSvg.addEventListener('click', () => {
      const suffix = canv.id === 'text' ? 'brand_lockup' : 'standalone';
      exportSvg(canv, `data_within_reach_${suffix}.svg`);
    });
    canv.btnExportPng256.addEventListener('click', () => {
      const suffix = canv.id === 'text' ? 'brand_lockup' : 'standalone';
      exportPng(canv, `data_within_reach_${suffix}_256.png`, 256);
    });
    canv.btnExportPng1024.addEventListener('click', () => {
      const suffix = canv.id === 'text' ? 'brand_lockup' : 'standalone';
      exportPng(canv, `data_within_reach_${suffix}_1024.png`, 1024);
    });
  });

  startPreviewAutoplay();
}

init();
