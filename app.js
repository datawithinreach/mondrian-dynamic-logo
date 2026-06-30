// Mondrian Dynamic Identity Generator - Dark Mode Update
const WIDTH = 256;
const HEIGHT = 256;
const STROKE_WIDTH = 8;
const MIN_BLOCK_SIZE = 35;

// Theme State
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

// Canvas State Configuration
const canvA = {
  id: 'a',
  svg: document.getElementById('logo-svg'),
  btnNext: document.getElementById('btn-next'),
  btnAutoplay: document.getElementById('btn-autoplay'),
  btnExportSvg: document.getElementById('btn-export-svg-a'),
  btnExportPng256: document.getElementById('btn-export-png-a-256'),
  btnExportPng1024: document.getElementById('btn-export-png-a-1024'),
  currentLayout: null,
  animId: null,
  autoplayInt: null,
  isAutoplay: false,
  clip: null
};

const canvB = {
  id: 'b',
  svg: document.getElementById('logo-svg-b'),
  btnNext: document.getElementById('btn-next-b'),
  btnAutoplay: document.getElementById('btn-autoplay-b'),
  btnExportSvg: document.getElementById('btn-export-svg-b'),
  btnExportPng256: document.getElementById('btn-export-png-b-256'),
  btnExportPng1024: document.getElementById('btn-export-png-b-1024'),
  currentLayout: null,
  animId: null,
  autoplayInt: null,
  isAutoplay: false,
  clip: 'rhombus'
};

const canvC = {
  id: 'c',
  svg: document.getElementById('logo-svg-c'),
  btnNext: document.getElementById('btn-next-c'),
  btnAutoplay: document.getElementById('btn-autoplay-c'),
  btnExportSvg: document.getElementById('btn-export-svg-c'),
  btnExportPng256: document.getElementById('btn-export-png-c-256'),
  btnExportPng1024: document.getElementById('btn-export-png-c-1024'),
  currentLayout: null,
  animId: null,
  autoplayInt: null,
  isAutoplay: false,
  clip: 'circle'
};

const ALL_CANVASES = [canvA, canvB, canvC];

// 1. Recursive Subdivision Generator (returns keys instead of absolute hex colors)
function generateMondrianLayout() {
  const rects = [];
  const lines = []; // No outer boundaries here! Handled by single-path border elements.

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

  // Color assignments (assigning semantic keys: 'white', 'red', 'blue', 'yellow', 'black')
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
    canvas.svg.setAttribute('viewBox', '-4 -4 264 264');
    canvas.svg.style.backgroundColor = themeColors.white;

    // Setup Clipping Defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    if (canvas.clip === 'rhombus') {
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', `clip-${canvas.id}-${now}`);
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', '128,0 256,128 128,256 0,128');
      clipPath.appendChild(poly);
      defs.appendChild(clipPath);
    } else if (canvas.clip === 'circle') {
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', `clip-${canvas.id}-${now}`);
      const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circ.setAttribute('cx', 128);
      circ.setAttribute('cy', 128);
      circ.setAttribute('r', 128);
      clipPath.appendChild(circ);
      defs.appendChild(clipPath);
    } else {
      // Option A uses a rectangular clip path to contain outer bounds cleanly
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', `clip-${canvas.id}-${now}`);
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', 0);
      rect.setAttribute('y', 0);
      rect.setAttribute('width', 256);
      rect.setAttribute('height', 256);
      clipPath.appendChild(rect);
      defs.appendChild(clipPath);
    }
    canvas.svg.appendChild(defs);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('clip-path', `url(#clip-${canvas.id}-${now})`);
    canvas.svg.appendChild(g);

    let activeLayout = null;
    let lineProgress = 0;
    let fillOpacity = 0;
    let isExiting = false;

    if (sourceLayout && elapsed <= EXIT_TOTAL_DUR) {
      isExiting = true;
      activeLayout = sourceLayout;

      if (elapsed <= EXIT_FADE_DUR) {
        fillOpacity = 1 - (elapsed / EXIT_FADE_DUR);
        lineProgress = 1.0;
      } else {
        fillOpacity = 0;
        lineProgress = 1 - (elapsed - EXIT_FADE_DUR) / EXIT_RETRACT_DUR;
      }
    } else {
      isExiting = false;
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
        
        // Resolve semantic fill color
        const colorHex = themeColors[r.fillKey || 'white'];
        rect.setAttribute('fill', colorHex);
        rect.setAttribute('fill-opacity', fillOpacity);
        rect.setAttribute('stroke', 'none');
        g.appendChild(rect);
      });
    }

    // B. Render internal grid lines (using butt caps to avoid border leakage)
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
        line.setAttribute('stroke', themeColors.black);
        line.setAttribute('stroke-width', STROKE_WIDTH);
        line.setAttribute('stroke-linecap', 'butt');
        g.appendChild(line);
      });
    }

    // C. Draw perimeter borders
    if (lineProgress > 0) {
      if (canvas.clip === 'rhombus') {
        const border = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        border.setAttribute('points', '128,0 256,128 128,256 0,128');
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', themeColors.black);
        border.setAttribute('stroke-width', STROKE_WIDTH);
        border.setAttribute('stroke-linecap', 'round');
        border.setAttribute('stroke-linejoin', 'round');
        
        const perimeter = 724.0;
        border.setAttribute('stroke-dasharray', perimeter);
        border.setAttribute('stroke-dashoffset', perimeter * (1 - lineProgress));
        canvas.svg.appendChild(border);
      } else if (canvas.clip === 'circle') {
        const border = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        border.setAttribute('cx', 128);
        border.setAttribute('cy', 128);
        border.setAttribute('r', 128);
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', themeColors.black);
        border.setAttribute('stroke-width', STROKE_WIDTH);
        border.setAttribute('stroke-linecap', 'round');
        
        const perimeter = 804.2;
        border.setAttribute('stroke-dasharray', perimeter);
        border.setAttribute('stroke-dashoffset', perimeter * (1 - lineProgress));
        canvas.svg.appendChild(border);
      } else {
        const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        border.setAttribute('x', 0);
        border.setAttribute('y', 0);
        border.setAttribute('width', 256);
        border.setAttribute('height', 256);
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', themeColors.black);
        border.setAttribute('stroke-width', STROKE_WIDTH);
        border.setAttribute('stroke-linecap', 'round');
        border.setAttribute('stroke-linejoin', 'round');
        
        const perimeter = 1024.0;
        border.setAttribute('stroke-dasharray', perimeter);
        border.setAttribute('stroke-dashoffset', perimeter * (1 - lineProgress));
        canvas.svg.appendChild(border);
      }
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
function exportPng(canvasObj, filename, size) {
  const svgString = new XMLSerializer().serializeToString(canvasObj.svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(blob);
  
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    // Fill back plate matching the current logo theme color
    context.fillStyle = getThemeColors().white;
    context.fillRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);
    
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

// Global Theme Management
function updateLogoTheme(theme) {
  if (currentTheme === theme) return;
  currentTheme = theme;

  // Toggle active theme button UI
  document.getElementById('btn-theme-light').classList.toggle('active-theme', theme === 'light');
  document.getElementById('btn-theme-dark').classList.toggle('active-theme', theme === 'dark');

  const colors = getThemeColors();

  // Redraw all canvases and adjust frames backgrounds
  ALL_CANVASES.forEach(canv => {
    canv.svg.parentElement.style.backgroundColor = colors.white;
    canv.svg.style.backgroundColor = colors.white;
    if (canv.currentLayout) {
      playTransition(canv, canv.currentLayout);
    }
  });
}

// Initial setup
function init() {
  // Theme listeners
  document.getElementById('btn-theme-light').addEventListener('click', () => updateLogoTheme('light'));
  document.getElementById('btn-theme-dark').addEventListener('click', () => updateLogoTheme('dark'));

  // Canvas elements setup
  ALL_CANVASES.forEach(canv => {
    const initial = generateMondrianLayout();
    playTransition(canv, initial);

    // Event attachments
    canv.btnNext.addEventListener('click', () => {
      playTransition(canv, generateMondrianLayout());
    });

    canv.btnAutoplay.addEventListener('click', () => {
      canv.isAutoplay = !canv.isAutoplay;
      canv.btnAutoplay.classList.toggle('active', canv.isAutoplay);
      if (canv.isAutoplay) {
        canv.autoplayInt = setInterval(() => {
          playTransition(canv, generateMondrianLayout());
        }, 4000);
      } else {
        clearInterval(canv.autoplayInt);
      }
    });

    canv.btnExportSvg.addEventListener('click', () => exportSvg(canv, `data_within_reach_logo_${canv.clip || 'rect'}.svg`));
    canv.btnExportPng256.addEventListener('click', () => exportPng(canv, `data_within_reach_logo_${canv.clip || 'rect'}_256x256.png`, 256));
    canv.btnExportPng1024.addEventListener('click', () => exportPng(canv, `data_within_reach_logo_${canv.clip || 'rect'}_1024x1024.png`, 1024));
  });
}

init();
