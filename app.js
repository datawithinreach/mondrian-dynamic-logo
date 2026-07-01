// Mondrian Dynamic Identity Generator - Aligned Wordmark Lockup Update
const WIDTH = 256;
const HEIGHT = 256;
const STROKE_WIDTH = 8;
const MIN_BLOCK_SIZE = 35;

// Global Settings State
let currentShape = 'circle'; // null = Rect, 'rhombus', 'circle'
let currentTheme = 'light';

function getThemeColors() {
  if (currentTheme === 'dark') {
    return {
      white: '#121318', // deep charcoal background blocks
      black: '#dccaa0', // warm gold grid lines, borders, and text
      blackBlock: '#dccaa0', // warm gold filled blocks
      red: '#b30000',   // rich crimson red
      blue: '#467181',  // slate blue
      yellow: '#dda93e' // ochre yellow
    };
  } else {
    return {
      white: '#f5f5f7', // classic warm white blocks
      black: '#111112', // classic black borders/lines
      blackBlock: '#111112', // black filled blocks
      red: '#b30000',   // rich crimson red
      blue: '#467181',  // slate blue
      yellow: '#dda93e' // ochre yellow
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
  btnExportPng512: document.getElementById('btn-export-png-only-512'),
  btnExportPng1024: document.getElementById('btn-export-png-only-1024'),
  btnExportPng2048: document.getElementById('btn-export-png-only-2048'),
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
  btnExportPng512: document.getElementById('btn-export-png-text-512'),
  btnExportPng1024: document.getElementById('btn-export-png-text-1024'),
  btnExportPng2048: document.getElementById('btn-export-png-text-2048'),
  currentLayout: null,
  animId: null,
  autoplayInt: null,
  isAutoplay: false
};

const canvMonogram = {
  id: 'monogram',
  svg: document.getElementById('preview-logo-monogram'),
  btnNext: document.getElementById('btn-next-monogram'),
  btnAutoplay: document.getElementById('btn-autoplay-monogram'),
  btnExportSvg: document.getElementById('btn-export-svg-monogram'),
  btnExportPng512: document.getElementById('btn-export-png-monogram-512'),
  btnExportPng1024: document.getElementById('btn-export-png-monogram-1024'),
  btnExportPng2048: document.getElementById('btn-export-png-monogram-2048'),
  currentLayout: null,
  animId: null,
  autoplayInt: null,
  isAutoplay: false
};

const canvGeom = {
  id: 'geom',
  svg: document.getElementById('preview-logo-geom'),
  btnNext: document.getElementById('btn-next-geom'),
  btnAutoplay: document.getElementById('btn-autoplay-geom'),
  btnExportSvg: document.getElementById('btn-export-svg-geom'),
  btnExportPng512: document.getElementById('btn-export-png-geom-512'),
  btnExportPng1024: document.getElementById('btn-export-png-geom-1024'),
  btnExportPng2048: document.getElementById('btn-export-png-geom-2048'),
  currentLayout: null,
  animId: null,
  autoplayInt: null,
  isAutoplay: false
};

const ALL_CANVASES = [canvOnly, canvText, canvMonogram, canvGeom];

// 1. Recursive Subdivision Generator
function generateMondrianLayout(isSplit = false, shape = 'rect') {
  function getSinglePiece(w, h, startX, startY, isSplitPiece = false) {
    const rects = [];
    const lines = [];

    function split(x, y, w, h, depth) {
      // Keep split shape segments visually clean and minimal with larger block sizes and strict depth limits
      const minBlock = isSplitPiece ? 32 : 20;
      const canSplitH = h >= minBlock * 2;
      const canSplitV = w >= minBlock * 2;
      const forceStop = isSplitPiece ? (w < 50 && h < 50) : (w < 40 && h < 40);
      const randomStop = isSplitPiece ? (depth > 0 && Math.random() > 0.2) : (depth > 1 && Math.random() > 0.45);
      const mustStop = isSplitPiece ? (depth >= 2) : (depth >= 3);

      if (forceStop || mustStop || (!canSplitH && !canSplitV) || (depth > 0 && randomStop)) {
        rects.push({ x, y, w, h, depth });
        return;
      }

      let splitH = Math.random() > 0.5;
      if (canSplitH && !canSplitV) splitH = true;
      if (!canSplitH && canSplitV) splitH = false;

      if (splitH) {
        const splitY = Math.round(y + minBlock + Math.random() * (h - 2 * minBlock));
        lines.push({ type: 'h', val: splitY, start: x, end: x + w });
        split(x, y, w, splitY - y, depth + 1);
        split(x, splitY, w, y + h - splitY, depth + 1);
      } else {
        const splitX = Math.round(x + minBlock + Math.random() * (w - 2 * minBlock));
        lines.push({ type: 'v', val: splitX, start: y, end: y + h });
        split(x, y, splitX - x, h, depth + 1);
        split(splitX, y, x + w - splitX, h, depth + 1);
      }
    }

    split(startX, startY, w, h, 0);

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

    if (!hasRed && !hasBlue && !hasYellow && shuffled.length > 0) {
      shuffled[0].fillKey = 'red';
    }

    return { rects, lines };
  }

  if (isSplit) {
    const combined = { rects: [], lines: [] };
    if (shape === 'rhombus') {
      // 4 independent pieces: top, bottom, left, right (adjusted to prevent corner overlap)
      const p1 = getSinglePiece(160, 80, 48, 0, true);
      const p2 = getSinglePiece(160, 80, 48, 176, true);
      const p3 = getSinglePiece(40, 80, 0, 88, true);
      const p4 = getSinglePiece(40, 80, 216, 88, true);
      combined.rects.push(...p1.rects, ...p2.rects, ...p3.rects, ...p4.rects);
      combined.lines.push(...p1.lines, ...p2.lines, ...p3.lines, ...p4.lines);
    } else if (shape === 'circle') {
      // Circle: 2 smaller independent pieces (y=76 and y=180 cuts for a 104px gap)
      const p1 = getSinglePiece(234, 76, 11, 0, true);
      const p2 = getSinglePiece(234, 76, 11, 180, true);
      combined.rects.push(...p1.rects, ...p2.rects);
      combined.lines.push(...p1.lines, ...p2.lines);
    } else {
      // Rectangle: 2 independent pieces (top and bottom halves, y=88 and y=168 cuts)
      const p1 = getSinglePiece(256, 88, 0, 0, true);
      const p2 = getSinglePiece(256, 88, 0, 168, true);
      combined.rects.push(...p1.rects, ...p2.rects);
      combined.lines.push(...p1.lines, ...p2.lines);
    }
    return combined;
  }

  // Standard 256x256 layout
  return getSinglePiece(256, 256, 0, 0);
}

function getSplitPieces(now, themeColors, strokeWidth) {
  const pieces = [];
  if (currentShape === 'rhombus') {
    // 4 independent pieces: top, bottom, left, right triangles adjusted to prevent overlap
    const topClip = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    topClip.setAttribute('points', '128,0 208,80 48,80');
    const topBorder = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    topBorder.setAttribute('points', '128,0 208,80 48,80');

    const botClip = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    botClip.setAttribute('points', '128,256 208,176 48,176');
    const botBorder = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    botBorder.setAttribute('points', '128,256 208,176 48,176');

    const leftClip = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    leftClip.setAttribute('points', '0,128 40,168 40,88');
    const leftBorder = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    leftBorder.setAttribute('points', '0,128 40,168 40,88');

    const rightClip = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    rightClip.setAttribute('points', '256,128 216,168 216,88');
    const rightBorder = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    rightBorder.setAttribute('points', '256,128 216,168 216,88');

    pieces.push(
      { id: 'top', clip: topClip, border: topBorder, perimeter: 386 },
      { id: 'bottom', clip: botClip, border: botBorder, perimeter: 386 },
      { id: 'left', clip: leftClip, border: leftBorder, perimeter: 193 },
      { id: 'right', clip: rightClip, border: rightBorder, perimeter: 193 }
    );
  } else if (currentShape === 'circle') {
    // 2 smaller independent pieces: top and bottom circular segments (y=76 and y=180 cuts)
    const topClip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    topClip.setAttribute('d', 'M 11,76 A 128,128 0 0,1 245,76 Z');
    const topBorder = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    topBorder.setAttribute('d', 'M 11,76 A 128,128 0 0,1 245,76 Z');

    const botClip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    botClip.setAttribute('d', 'M 245,180 A 128,128 0 0,1 11,180 Z');
    const botBorder = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    botBorder.setAttribute('d', 'M 245,180 A 128,128 0 0,1 11,180 Z');

    pieces.push(
      { id: 'top', clip: topClip, border: topBorder, perimeter: 537 },
      { id: 'bottom', clip: botClip, border: botBorder, perimeter: 537 }
    );
  } else {
    // 2 independent pieces: top and bottom rectangles
    const topClip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    topClip.setAttribute('x', '0');
    topClip.setAttribute('y', '0');
    topClip.setAttribute('width', '256');
    topClip.setAttribute('height', '88');
    const topBorder = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    topBorder.setAttribute('x', '0');
    topBorder.setAttribute('y', '0');
    topBorder.setAttribute('width', '256');
    topBorder.setAttribute('height', '88');

    const botClip = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    botClip.setAttribute('x', '0');
    botClip.setAttribute('y', '168');
    botClip.setAttribute('width', '256');
    botClip.setAttribute('height', '88');
    const botBorder = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    botBorder.setAttribute('x', '0');
    botBorder.setAttribute('y', '168');
    botBorder.setAttribute('width', '256');
    botBorder.setAttribute('height', '88');

    pieces.push(
      { id: 'top', clip: topClip, border: topBorder, perimeter: 688 },
      { id: 'bottom', clip: botClip, border: botBorder, perimeter: 688 }
    );
  }

  pieces.forEach(p => {
    p.border.setAttribute('fill', 'none');
    p.border.setAttribute('stroke', themeColors.black);
    p.border.setAttribute('stroke-width', strokeWidth);
    p.border.setAttribute('stroke-linejoin', 'round');
    p.border.setAttribute('stroke-linecap', 'round');
  });

  return pieces;
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
    let containerG = null;

    // Determine viewBox & root elements
    const isLockup = canvas.id === 'text';
    canvas.svg.setAttribute('viewBox', isLockup ? '-4 -4 1056 264' : '-4 -4 264 264');

    // Setup Clipping Defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Inject base64 encoded stylesheet inside SVG context so the font renders inside isolated contexts (like canvas and image files)
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      @font-face {
        font-family: 'Oswald';
        font-style: normal;
        font-weight: 300;
        src: url(data:font/woff2;charset=utf-8;base64,${window.OSWALD_LIGHT_BASE64 || ''}) format('woff2');
      }
    `;
    defs.appendChild(style);

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
    let containerG = null;
    if (isLockup) {
      containerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      canvas.svg.appendChild(containerG);
    }

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

    if (canvas.id === 'geom') {
      const pieces = getSplitPieces(now, themeColors, STROKE_WIDTH);
      pieces.forEach(p => {
        // 1. Setup a unique clip path for this specific piece
        const pClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        pClipPath.setAttribute('id', `clip-geom-${p.id}-${now}`);
        pClipPath.appendChild(p.clip);
        defs.appendChild(pClipPath);

        // 2. Setup a group for this piece's internal fills & lines
        const pG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pG.setAttribute('clip-path', `url(#clip-geom-${p.id}-${now})`);
        canvas.svg.appendChild(pG);

        // Draw fills inside this piece
        if (fillOpacity > 0 && activeLayout.rects) {
          activeLayout.rects.forEach(r => {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', r.x);
            rect.setAttribute('y', r.y);
            rect.setAttribute('width', r.w);
            rect.setAttribute('height', r.h);
            let fillVal = themeColors[r.fillKey || 'white'];
            if (r.fillKey === 'black' && themeColors.blackBlock) {
              fillVal = themeColors.blackBlock;
            }
            rect.setAttribute('fill', fillVal);
            rect.setAttribute('fill-opacity', fillOpacity);
            rect.setAttribute('stroke', 'none');
            pG.appendChild(rect);
          });
        }

        // Draw internal lines inside this piece
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
            pG.appendChild(line);
          });
        }

        // 3. Draw closed border outline for this piece
        if (lineProgress > 0) {
          p.border.setAttribute('stroke-dasharray', p.perimeter);
          p.border.setAttribute('stroke-dashoffset', p.perimeter * (1 - lineProgress));
          canvas.svg.appendChild(p.border);
        }
      });
      canvas.svg.appendChild(defs);
    } else {
      canvas.svg.appendChild(defs);

      // Group for logo drawing (with translation & scale if inside a lockup)
      // Scale logo down from 256px to 76px to match uppercase text height (font-size: 76)
      if (isLockup) {
        containerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        canvas.svg.appendChild(containerG);
      }

      const logoG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      logoG.setAttribute('clip-path', `url(#clip-${canvas.id}-${now})`);
      
      if (isLockup) {
        logoG.setAttribute('transform', 'translate(40, 89.6) scale(0.3)');
        containerG.appendChild(logoG);
      } else {
        canvas.svg.appendChild(logoG);
      }

      // A. Render fills
      if (fillOpacity > 0 && activeLayout.rects) {
        activeLayout.rects.forEach(r => {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', r.x);
          rect.setAttribute('y', r.y);
          rect.setAttribute('width', r.w);
          rect.setAttribute('height', r.h);
          let fillVal = themeColors[r.fillKey || 'white'];
          if (r.fillKey === 'black' && themeColors.blackBlock) {
            fillVal = themeColors.blackBlock;
          }
          rect.setAttribute('fill', fillVal);
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
          const currentStrokeWidth = isLockup ? 15 : STROKE_WIDTH;
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
        const currentStrokeWidth = isLockup ? 15 : STROKE_WIDTH;
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', themeColors.black);
        border.setAttribute('stroke-width', currentStrokeWidth);
        
        if (isLockup) {
          // Draw the border scaled inside a container group to match fills/lines perfectly
          const borderG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          borderG.setAttribute('transform', 'translate(40, 89.6) scale(0.3)');
          borderG.appendChild(border);
          containerG.appendChild(borderG);
        } else {
          canvas.svg.appendChild(border);
        }
      }
    }

    // D. If lockup, render wordmark (Standard Oswald typography for 'text')
    if (isLockup) {
      if (canvas.id === 'text') {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '140');
        text.setAttribute('y', '128'); // Center line of the 256px logo height space
        text.setAttribute('dy', '8'); // Finely nudge vertical alignment down for perfect visual center alignment
        text.setAttribute('font-family', "'Oswald', -apple-system, sans-serif");
        text.setAttribute('font-weight', '300'); // Oswald Light
        text.setAttribute('font-size', '76');
        text.setAttribute('fill', themeColors.black);
        text.setAttribute('letter-spacing', '0.04em'); // Expand letter spacing for premium display feel
        text.setAttribute('alignment-baseline', 'middle');
        text.textContent = 'DATA WITHIN REACH';
        containerG.appendChild(text);
      }

      // Auto-crop viewBox to wrap the bounding box tightly with a 16px safety padding (eliminates wasted canvas space)
      const bbox = containerG.getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        const pad = 16;
        const vbX = bbox.x - pad;
        const vbY = bbox.y - pad;
        const vbW = bbox.width + pad * 2;
        const vbH = bbox.height + pad * 2;
        canvas.svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
      }
    }

    // E. If monogram or split shape monogram, render centered uppercase monogram "DWR"
    if (canvas.id === 'monogram' || canvas.id === 'geom') {
      const isDark = currentTheme === 'dark';
      const shadowColor = isDark ? '#121318' : '#ffffff';
      const frontColor = isDark ? '#dccaa0' : '#111112';
      const fontSize = canvas.id === 'geom' ? '84' : '110';

      // 1. Draw drop shadow text first (offset by dx=2, dy=2) - Only for standard monogram overlay
      if (canvas.id === 'monogram') {
        const shadowText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        shadowText.setAttribute('x', '130'); // 128 + 2
        shadowText.setAttribute('y', '128'); // 128 + 2
        shadowText.setAttribute('dy', '10'); // 8 + 2 vertical offset
        shadowText.setAttribute('font-family', "'Oswald', -apple-system, sans-serif");
        shadowText.setAttribute('font-weight', '300'); // Oswald Light
        shadowText.setAttribute('font-size', fontSize);
        shadowText.setAttribute('fill', shadowColor);
        shadowText.setAttribute('text-anchor', 'middle');
        shadowText.setAttribute('alignment-baseline', 'middle');
        shadowText.textContent = 'DWR';
        canvas.svg.appendChild(shadowText);
      }

      // 2. Draw front text
      const frontText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      frontText.setAttribute('x', '128');
      frontText.setAttribute('y', '128');
      const dyVal = canvas.id === 'geom' ? '10' : '8';
      frontText.setAttribute('dy', dyVal);
      frontText.setAttribute('font-family', "'Oswald', -apple-system, sans-serif");
      frontText.setAttribute('font-weight', '300'); // Oswald Light
      frontText.setAttribute('font-size', fontSize);
      frontText.setAttribute('fill', frontColor);
      frontText.setAttribute('text-anchor', 'middle');
      frontText.setAttribute('alignment-baseline', 'middle');
      frontText.textContent = 'DWR';
      canvas.svg.appendChild(frontText);
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
  // Clone the live on-screen SVG node which already has the correct layout coordinates and fonts loaded/measured
  const clone = canvasObj.svg.cloneNode(true);
  
  // Make the clone natively transparent and set high-quality rendering options
  clone.style.backgroundColor = 'transparent';
  clone.setAttribute('shape-rendering', 'geometricPrecision');
  
  // Retrieve the current live viewBox dimensions from the clone to calculate the exact aspect ratio dynamically
  const viewBoxStr = clone.getAttribute('viewBox') || '0 0 264 264';
  const parts = viewBoxStr.split(' ').map(Number);
  const vbWidth = parts[2];
  const vbHeight = parts[3];
  const aspect = vbWidth / vbHeight;
  
  const w = targetWidth;
  const h = Math.round(targetWidth / aspect);
  
  // Super-sampling: Render the vector SVG at 4x target bounds first to capture high-density details
  const scaleFactor = 4;
  const wHigh = w * scaleFactor;
  const hHigh = h * scaleFactor;
  
  // Set explicit high-res dimensions on the cloned SVG element
  clone.setAttribute('width', wHigh);
  clone.setAttribute('height', hHigh);
  
  const svgString = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(blob);
  
  const image = new Image();
  image.onload = () => {
    // Add a short delay to ensure the inlined base64 web font has finished decoding and layout activation before drawing to canvas
    setTimeout(() => {
      // 1. Draw the high-res SVG image onto a high-res canvas context
      const highResCanvas = document.createElement('canvas');
      highResCanvas.width = wHigh;
      highResCanvas.height = hHigh;
      const highResCtx = highResCanvas.getContext('2d');
      highResCtx.clearRect(0, 0, wHigh, hHigh);
      highResCtx.drawImage(image, 0, 0, wHigh, hHigh);
      
      // 2. Perform high-quality incremental step-down scaling (halving dimensions in steps) to eliminate aliasing/jagged line artifacts
      let currentCanvas = highResCanvas;
      let currentWidth = wHigh;
      let currentHeight = hHigh;
      
      while (currentWidth > w * 2) {
        const nextWidth = Math.round(currentWidth / 2);
        const nextHeight = Math.round(currentHeight / 2);
        
        const nextCanvas = document.createElement('canvas');
        nextCanvas.width = nextWidth;
        nextCanvas.height = nextHeight;
        const nextCtx = nextCanvas.getContext('2d');
        nextCtx.clearRect(0, 0, nextWidth, nextHeight);
        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = 'high';
        nextCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);
        
        currentCanvas = nextCanvas;
        currentWidth = nextWidth;
        currentHeight = nextHeight;
      }
      
      // 3. Final draw onto the target-size canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = w;
      finalCanvas.height = h;
      const finalCtx = finalCanvas.getContext('2d');
      finalCtx.clearRect(0, 0, w, h);
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(currentCanvas, 0, 0, w, h);
      
      const pngURL = finalCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngURL;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobURL);
    }, 100);
  };
  image.src = blobURL;
}

function exportSvg(canvasObj, filename) {
  // Clone the live on-screen SVG node which already has the correct layout coordinates and fonts loaded/measured
  const clone = canvasObj.svg.cloneNode(true);
  clone.style.backgroundColor = 'transparent';
  
  const svgContent = clone.outerHTML;
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
    playTransition(canv, generateMondrianLayout(canv.id === 'geom', currentShape));
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
    if (canv.currentLayout) {
      playTransition(canv, canv.currentLayout);
    }
  });

  // Dynamically update the header logo text to match the active brand colors
  const headerLogo = document.querySelector('.header-logo-text');
  if (headerLogo) {
    if (theme === 'dark') {
      headerLogo.style.background = 'none';
      headerLogo.style.webkitTextFillColor = '#dccaa0';
      headerLogo.style.color = '#dccaa0';
    } else {
      headerLogo.style.background = '';
      headerLogo.style.webkitTextFillColor = '';
      headerLogo.style.color = '';
    }
  }
}

// Init Function
function init() {
  document.getElementById('btn-global-rect').addEventListener('click', (e) => updateGlobalShape(null, e.currentTarget));
  document.getElementById('btn-global-rhombus').addEventListener('click', (e) => updateGlobalShape('rhombus', e.currentTarget));
  document.getElementById('btn-global-circle').addEventListener('click', (e) => updateGlobalShape('circle', e.currentTarget));

  document.getElementById('btn-global-light').addEventListener('click', (e) => updateGlobalTheme('light', e.currentTarget));
  document.getElementById('btn-global-dark').addEventListener('click', (e) => updateGlobalTheme('dark', e.currentTarget));

  const colors = getThemeColors();
  ALL_CANVASES.forEach(canv => {
    canv.svg.parentElement.style.backgroundColor = colors.white;
    const initial = generateMondrianLayout(canv.id === 'geom', currentShape);
    playTransition(canv, initial);

    // Initialize Autoplay on page load
    canv.isAutoplay = true;
    canv.btnAutoplay.classList.add('active');
    canv.autoplayInt = setInterval(() => {
      playTransition(canv, generateMondrianLayout(canv.id === 'geom', currentShape));
    }, 3000);

    canv.btnNext.addEventListener('click', () => {
      playTransition(canv, generateMondrianLayout(canv.id === 'geom', currentShape));
    });

    canv.btnAutoplay.addEventListener('click', () => {
      canv.isAutoplay = !canv.isAutoplay;
      canv.btnAutoplay.classList.toggle('active', canv.isAutoplay);
      if (canv.isAutoplay) {
        canv.autoplayInt = setInterval(() => {
          playTransition(canv, generateMondrianLayout(canv.id === 'geom', currentShape));
        }, 3000);
      } else {
        clearInterval(canv.autoplayInt);
      }
    });

    canv.btnExportSvg.addEventListener('click', () => {
      let suffix = 'standalone';
      if (canv.id === 'text') suffix = 'brand_lockup';
      else if (canv.id === 'monogram') suffix = 'monogram';
      else if (canv.id === 'geom') suffix = 'split_monogram';
      exportSvg(canv, `data_within_reach_${suffix}.svg`);
    });
    canv.btnExportPng512.addEventListener('click', () => {
      let suffix = 'standalone';
      if (canv.id === 'text') suffix = 'brand_lockup';
      else if (canv.id === 'monogram') suffix = 'monogram';
      else if (canv.id === 'geom') suffix = 'split_monogram';
      exportPng(canv, `data_within_reach_${suffix}_512.png`, 512);
    });
    canv.btnExportPng1024.addEventListener('click', () => {
      let suffix = 'standalone';
      if (canv.id === 'text') suffix = 'brand_lockup';
      else if (canv.id === 'monogram') suffix = 'monogram';
      else if (canv.id === 'geom') suffix = 'split_monogram';
      exportPng(canv, `data_within_reach_${suffix}_1024.png`, 1024);
    });
    canv.btnExportPng2048.addEventListener('click', () => {
      let suffix = 'standalone';
      if (canv.id === 'text') suffix = 'brand_lockup';
      else if (canv.id === 'monogram') suffix = 'monogram';
      else if (canv.id === 'geom') suffix = 'split_monogram';
      exportPng(canv, `data_within_reach_${suffix}_2048.png`, 2048);
    });
  });
}

init();
