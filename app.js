/**
 * PREMIUM IMAGE COMPARE APP - ENGINE
 * Highly optimized, GPU accelerated, single-page image comparison engine.
 */

// --- APPLICATION STATE ---
const state = {
  mode: 'side-by-side', // 'slider' | 'side-by-side' | 'blend' | 'difference' | 'blink' | 'tile-grid'
  sliderPos: 0.5,
  sliderOrientation: 'horizontal', // 'horizontal' | 'vertical'
  blendOpacity: 0.5,
  blinkInterval: 400, // ms
  blinkActive: false,
  blinkState: true, // true = show B, false = hide B
  blinkTimerId: null,
  blinkPaused: false,
  tileSize: 120, // px
  tileGridOverlayActive: false,
  diffHeatmapActive: false,
  
  bgMode: 'transparency-checkered', // 'transparency-checkered' | 'bg-black' | 'bg-white' | 'bg-neutral'
  gridActive: false,
  
  isDraggingSlider: false,
  isPanning: false,
  activePanSlot: null, // 'both' | 'a' | 'b'
  
  syncViewports: true,
  eyedropperActive: false,
  colorSensitivityR: 1,
  colorSensitivityG: 1,
  colorSensitivityB: 1,
  histogramChannel: 'all', // 'all' (RGB composite luma) | 'r' | 'g' | 'b' | 'luma' (Y)
  
  imageA: { loaded: false, width: 0, height: 0, name: '', size: 0, element: null, zoom: 1, panX: 0, panY: 0, canvas: null, ctx: null, startX: 0, startY: 0, samples: null, bitDepth: '' },
  imageB: { loaded: false, width: 0, height: 0, name: '', size: 0, element: null, zoom: 1, panX: 0, panY: 0, canvas: null, ctx: null, startX: 0, startY: 0, samples: null, bitDepth: '' },
  
  adjustments: {
    exposure: 1.0,
    gamma: 1.0,
    diffScale: 1.0,
    weightR: 1.0,
    weightG: 1.0,
    weightB: 1.0
  },

  // --- PRINT QC STATE ---
  qcActiveTab: 'deltae',
  qcRegions: [],
  qcTacActive: false,
  qcTacThreshold: 300,
  qcTacTarget: 'b',
  qcScumActive: false,
  qcScumThreshold: 3,
  qcDotGainSamplerActive: false,
  qcSamplerPin: null,
  qcDrawingRoi: false,
  qcDrawingMode: 'roi', // 'roi' | 'moire'
  qcMoireActive: false,
  qcMoireRegion: null
};

// --- DOM ELEMENTS ---
const elements = {
  viewport: document.getElementById('viewer-viewport'),
  panesContainer: document.getElementById('panes-container'),
  paneA: document.getElementById('pane-a'),
  paneB: document.getElementById('pane-b'),
  imgA: document.getElementById('img-a'),
  imgB: document.getElementById('img-b'),
  emptyA: document.getElementById('empty-a'),
  emptyB: document.getElementById('empty-b'),
  sliderDivider: document.getElementById('slider-divider'),
  modeBadge: document.getElementById('mode-badge'),
  gridOverlay: document.getElementById('grid-overlay'),
  metaPanel: document.getElementById('meta-panel'),
  btnToggleMeta: document.getElementById('btn-toggle-meta'),
  btnResetView: document.getElementById('btn-reset-view'),
  btnSamplesToggle: document.getElementById('btn-samples-toggle'),
  btnCloseDrawer: document.getElementById('btn-close-drawer'),
  sampleDrawer: document.getElementById('sample-drawer'),
  toast: document.getElementById('toast'),
  
  // View Preset Buttons
  btnZoomFit: document.getElementById('btn-zoom-fit'),
  btnZoomFill: document.getElementById('btn-zoom-fill'),
  btnZoom11: document.getElementById('btn-zoom-11'),
  btnMatchViews: document.getElementById('btn-match-views'),
  
  // Visual Calibration Sliders
  adjExposure: document.getElementById('adj-exposure'),
  valExposure: document.getElementById('val-exposure'),
  adjGamma: document.getElementById('adj-gamma'),
  valGamma: document.getElementById('val-gamma'),
  diffOnlyAdjustments: document.getElementById('diff-only-adjustments'),
  adjDiffScale: document.getElementById('adj-diff-scale'),
  valDiffScale: document.getElementById('val-diff-scale'),
  btnResetAdjustments: document.getElementById('btn-reset-adjustments'),
  
  // Eyedropper Elements
  btnToggleEyedropper: document.getElementById('btn-toggle-eyedropper'),
  tooltip: document.getElementById('pixel-inspector-tooltip'),
  tooltipPx: document.getElementById('tooltip-px'),
  tooltipPy: document.getElementById('tooltip-py'),
  tooltipSwatchA: document.getElementById('tooltip-swatch-a'),
  tooltipSwatchB: document.getElementById('tooltip-swatch-b'),
  tooltipValA: document.getElementById('tooltip-val-a'),
  tooltipValB: document.getElementById('tooltip-val-b'),
  tooltipAlert: document.getElementById('tooltip-alert'),
  tooltipDelta: document.getElementById('tooltip-delta'),
  
  // Metadata fields
  metaNameA: document.getElementById('meta-name-a'),
  metaDimA: document.getElementById('meta-dim-a'),
  metaSizeA: document.getElementById('meta-size-a'),
  metaNameB: document.getElementById('meta-name-b'),
  metaDimB: document.getElementById('meta-dim-b'),
  metaSizeB: document.getElementById('meta-size-b'),
  metaZoom: document.getElementById('meta-zoom'),
  metaPan: document.getElementById('meta-pan'),
  
  // Floating toolbar
  modeOptionGroup: document.getElementById('group-mode-options'),
  modeOptionDivider: document.getElementById('divider-mode-options'),
  modeOptionLabel: document.getElementById('option-label'),
  modeOptionSlider: document.getElementById('mode-option-slider'),
  modeOptionVal: document.getElementById('mode-option-val'),
  
  btnSwap: document.getElementById('btn-swap-images'),
  btnToggleSync: document.getElementById('btn-toggle-sync'),
  btnToggleGrid: document.getElementById('btn-toggle-grid'),
  btnClear: document.getElementById('btn-clear-images'),
  btnShowHelp: document.getElementById('btn-show-help'),
  helpModal: document.getElementById('help-modal'),
  btnCloseHelp: document.getElementById('btn-close-help'),
  
  // Inputs
  fileA: document.getElementById('file-a'),
  fileB: document.getElementById('file-b'),
  
  // Slider Split controls & difference heatmap options
  groupSliderOrientation: document.getElementById('group-slider-orientation'),
  btnSliderH: document.getElementById('btn-slider-h'),
  btnSliderV: document.getElementById('btn-slider-v'),
  diffToggleHeatmap: document.getElementById('diff-toggle-heatmap'),
  groupTileGridOptions: document.getElementById('group-tile-grid-options'),
  btnToggleTileGridLines: document.getElementById('btn-toggle-tile-grid-lines'),
  
  // Histogram Canvas
  histogramCanvas: document.getElementById('histogram-canvas')
};

// Setup initial element bindings
state.imageA.element = elements.imgA;
state.imageB.element = elements.imgB;

// ==========================================================================
//   STATE UPDATERS & RENDER SYNCHRONIZER
// ==========================================================================

// Apply zoom and pan state to elements using GPU Accelerated CSS properties
function updateViewerTransforms() {
  const root = document.documentElement;
  
  // Set global fallback variables for slider pos
  elements.viewport.style.setProperty('--slider-pos', state.sliderPos);
  elements.viewport.style.setProperty('--slider-pos-pct', `${state.sliderPos * 100}%`);
  
  // Update image A transforms
  elements.imgA.style.transform = `translate3d(${state.imageA.panX}px, ${state.imageA.panY}px, 0px) scale(${state.imageA.zoom})`;
  const overlayCanvasA = document.getElementById('canvas-a-overlay');
  if (overlayCanvasA) overlayCanvasA.style.transform = elements.imgA.style.transform;
  
  // Update image B transforms
  elements.imgB.style.transform = `translate3d(${state.imageB.panX}px, ${state.imageB.panY}px, 0px) scale(${state.imageB.zoom})`;
  const overlayCanvasB = document.getElementById('canvas-b-overlay');
  if (overlayCanvasB) overlayCanvasB.style.transform = elements.imgB.style.transform;
  const thermalCanv = document.getElementById('thermal-canvas');
  if (thermalCanv) thermalCanv.style.transform = elements.imgB.style.transform;
  
  // Update metadata stats
  if (state.syncViewports) {
    elements.metaZoom.textContent = `${Math.round(state.imageA.zoom * 100)}%`;
    elements.metaPan.textContent = `${Math.round(state.imageA.panX)}px, ${Math.round(state.imageA.panY)}px`;
  } else {
    elements.metaZoom.textContent = `A: ${Math.round(state.imageA.zoom * 100)}% | B: ${Math.round(state.imageB.zoom * 100)}%`;
    elements.metaPan.textContent = `A: ${Math.round(state.imageA.panX)},${Math.round(state.imageA.panY)}px | B: ${Math.round(state.imageB.panX)},${Math.round(state.imageB.panY)}px`;
  }
}

// Update GPU-accelerated SVG filter values in real-time
function updateSvgFilter() {
  const diffScale = state.adjustments.diffScale;
  const wR = state.adjustments.weightR;
  const wG = state.adjustments.weightG;
  const wB = state.adjustments.weightB;
  
  // 1. Color Matrix: scales colors channel-by-channel
  const matrixEl = document.getElementById('svg-diff-matrix');
  if (matrixEl) {
    const rScale = diffScale * wR;
    const gScale = diffScale * wG;
    const bScale = diffScale * wB;
    
    matrixEl.setAttribute('values', `
      ${rScale} 0 0 0 0
      0 ${gScale} 0 0 0
      0 0 ${bScale} 0 0
      0 0 0 1 0
    `.trim().replace(/\s+/g, ' '));
  }
  
  // 2. Component Transfer: Exposure & Gamma
  const exp = state.adjustments.exposure;
  const gam = state.adjustments.gamma;
  const exponent = 1 / gam; // Exponential curve inversion
  
  const channels = ['svg-func-r', 'svg-func-g', 'svg-func-b'];
  channels.forEach(id => {
    const chEl = document.getElementById(id);
    if (chEl) {
      chEl.setAttribute('amplitude', exp);
      chEl.setAttribute('exponent', exponent);
    }
  });
}

// Smart filter apply logic: runs through GPU filters only when calibration values deviate from neutral
function applyFilters() {
  updateSvgFilter();

  const hasAdj = state.adjustments.exposure !== 1.0 ||
                 state.adjustments.gamma !== 1.0 ||
                 state.adjustments.diffScale !== 1.0 ||
                 state.adjustments.weightR !== 1.0 ||
                 state.adjustments.weightG !== 1.0 ||
                 state.adjustments.weightB !== 1.0;

  if (hasAdj || state.mode === 'difference') {
    elements.panesContainer.style.filter = 'url(#diff-adjust-filter)';
  } else {
    elements.panesContainer.style.filter = 'none';
  }
}

// Set Comparison Mode
function setMode(mode) {
  state.mode = mode;
  
  // Stop blinking if changing away from blink mode
  if (mode !== 'blink') {
    stopBlinking();
    const blinkHint = document.getElementById('blink-spacebar-hint');
    if (blinkHint) blinkHint.classList.add('hidden');
  }

  // Hide thermal canvas when leaving difference mode; reset state
  if (mode !== 'difference' && state.diffHeatmapActive) {
    state.diffHeatmapActive = false;
    const cb = document.getElementById('diff-toggle-heatmap');
    if (cb) cb.checked = false;
  }
  const thermalCanvas = document.getElementById('thermal-canvas');
  if (thermalCanvas) thermalCanvas.classList.add('hidden');

  // Update classes on main viewport
  elements.viewport.className = ''; // Reset
  elements.viewport.classList.add(`mode-${mode}`, state.bgMode);
  if (state.eyedropperActive) {
    elements.viewport.classList.add('eyedropper-active');
  }
  
  // Update active tool button styling
  document.querySelectorAll('.btn-tool').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  
  // Update mode badge
  let modeName = '';
  switch (mode) {
    case 'slider': modeName = 'Slider Mode'; break;
    case 'side-by-side': modeName = 'Side-by-Side Mode'; break;
    case 'blend': modeName = 'Blend Mode'; break;
    case 'difference': modeName = 'Difference Mode'; break;
    case 'blink': modeName = 'Blink / Onion Skin'; break;
    case 'tile-grid': modeName = 'Tile Grid Mosaic'; break;
  }
  elements.modeBadge.textContent = modeName;
  
  // Contextual slot — hide all inner panels, show the right one
  ['ctx-slider','ctx-blend','ctx-blink','ctx-tile','ctx-hint'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  if (mode === 'slider') {
    const ctxEl = document.getElementById('ctx-slider');
    if (ctxEl) ctxEl.classList.remove('hidden');
    const splitVal = document.getElementById('ctx-split-val');
    if (splitVal) splitVal.textContent = `${Math.round(state.sliderPos * 100)}%`;
    const sl = document.getElementById('mode-option-slider');
    if (sl) { sl.min = 0; sl.max = 100; sl.value = state.sliderPos * 100; }
  } else if (mode === 'blend') {
    const ctxEl = document.getElementById('ctx-blend');
    if (ctxEl) ctxEl.classList.remove('hidden');
    const blendVal = document.getElementById('ctx-blend-val');
    if (blendVal) blendVal.textContent = `${Math.round(state.blendOpacity * 100)}%`;
    const sl = document.getElementById('mode-option-slider-blend');
    if (sl) sl.value = state.blendOpacity * 100;
    elements.viewport.style.setProperty('--blend-opacity', state.blendOpacity);
  } else if (mode === 'blink') {
    const ctxEl = document.getElementById('ctx-blink');
    if (ctxEl) ctxEl.classList.remove('hidden');
    const blinkVal = document.getElementById('ctx-blink-val');
    if (blinkVal) blinkVal.textContent = `${state.blinkInterval}ms`;
    const sl = document.getElementById('mode-option-slider-blink');
    if (sl) sl.value = state.blinkInterval;
    startBlinking();
  } else if (mode === 'tile-grid') {
    const ctxEl = document.getElementById('ctx-tile');
    if (ctxEl) ctxEl.classList.remove('hidden');
    const tileVal = document.getElementById('ctx-tile-val');
    if (tileVal) tileVal.textContent = `${state.tileSize}px`;
    const sl = document.getElementById('mode-option-slider-tile');
    if (sl) sl.value = state.tileSize;
    elements.viewport.style.setProperty('--tile-size', `${state.tileSize}px`);
  } else {
    const hintEl = document.getElementById('ctx-hint');
    const hintText = document.getElementById('ctx-hint-text');
    if (hintEl) hintEl.classList.remove('hidden');
    const hintMap = {
      'side-by-side': 'Drag images to compare',
      'difference': 'Highlights pixel-level changes',
    };
    if (hintText) hintText.textContent = hintMap[mode] || '';
  }

  // Legacy: keep groupSliderOrientation/groupTileGridOptions refs from breaking
  // (their elements now are hidden placeholders — no-op toggles are fine)
  
  // Hide/Show Difference Boost Calibration controls in HUD
  if (mode === 'difference') {
    elements.diffOnlyAdjustments.classList.remove('hidden');
  } else {
    elements.diffOnlyAdjustments.classList.add('hidden');
  }
  
  // Sync the SVG filter application state
  applyFilters();
  
  showToast(`Mode Switched: ${modeName}`);
}

// Background preset changer
function setBackgroundPreset(bgClass) {
  // Remove existing bg classes
  const bgClasses = ['transparency-checkered', 'bg-black', 'bg-white', 'bg-neutral'];
  bgClasses.forEach(cls => elements.viewport.classList.remove(cls));
  
  state.bgMode = bgClass;
  elements.viewport.classList.add(bgClass);
  
  document.querySelectorAll('.btn-bg').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.bg === bgClass);
  });
  
  showToast(`Background Changed`);
}

// ==========================================================================
//   HIGH-RESOLUTION OPTIMIZED PAN & ZOOM CORE
// ==========================================================================

function getSlotUnderCursor(event) {
  const rect = elements.viewport.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  
  if (state.mode === 'side-by-side') {
    return mx < rect.width / 2 ? 'a' : 'b';
  } else if (state.mode === 'slider') {
    if (state.sliderOrientation === 'vertical') {
      return my < rect.height * state.sliderPos ? 'b' : 'a';
    } else {
      return mx < rect.width * state.sliderPos ? 'b' : 'a';
    }
  } else if (state.mode === 'tile-grid') {
    const halfTile = state.tileSize / 2;
    const col = Math.floor(mx / halfTile);
    const row = Math.floor(my / halfTile);
    return (col + row) % 2 === 0 ? 'a' : 'b';
  } else {
    if (event.target && event.target.closest('#pane-a')) return 'a';
    if (event.target && event.target.closest('#pane-b')) return 'b';
    return 'b';
  }
}

function handleZoom(event) {
  event.preventDefault();
  
  const isZoomGesture = event.ctrlKey || event.altKey || event.metaKey;
  
  const rect = elements.viewport.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  // Decide which slots to zoom
  let targets = [];
  if (state.syncViewports) {
    targets = [state.imageA, state.imageB];
  } else {
    const slot = getSlotUnderCursor(event);
    targets = [slot === 'a' ? state.imageA : state.imageB];
  }
  
  if (isZoomGesture) {
    const zoomSpeed = 0.08;
    const delta = event.deltaY < 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
    
    // Map viewport cursor position to container-local coordinates.
    // In side-by-side mode, Pane B starts at left: 50%. So we must translate
    // the zoom focus to local pane-space (0 to width/2) to ensure zoom centers
    // are perfectly aligned and under the cursor.
    let focusX = mouseX;
    let focusY = mouseY;
    
    if (state.mode === 'side-by-side') {
      const halfWidth = rect.width / 2;
      if (mouseX < halfWidth) {
        focusX = mouseX;
      } else {
        focusX = mouseX - halfWidth;
      }
    }
    
    targets.forEach(imgState => {
      if (!imgState.loaded) return;
      const oldZoom = imgState.zoom;
      let newZoom = imgState.zoom * delta;
      
      // Clamp zoom parameter (min 5%, max 8000% for extreme closeups)
      newZoom = Math.max(0.05, Math.min(newZoom, 80));
      
      const zoomRatio = newZoom / oldZoom;
      imgState.panX = focusX - (focusX - imgState.panX) * zoomRatio;
      imgState.panY = focusY - (focusY - imgState.panY) * zoomRatio;
      imgState.zoom = newZoom;
    });
  } else {
    // Natural Scroll Panning
    targets.forEach(imgState => {
      if (!imgState.loaded) return;
      imgState.panX -= event.deltaX;
      imgState.panY -= event.deltaY;
    });
  }
  
  updateViewerTransforms();
}

function handlePanStart(event) {
  // Ignore clicks on floating panels/toolbars/buttons
  if (event.target.closest('.toolbar-container') || 
      event.target.closest('.meta-panel') || 
      event.target.closest('.btn-samples-toggle') ||
      event.target.closest('.btn-qc-toggle') ||
      event.target.closest('#print-qc-panel') ||
      event.target.closest('.sample-drawer') ||
      event.target.closest('.modal-card') ||
      event.target.closest('.pane-empty-state') ||
      event.target.closest('#slider-divider')) {
    return;
  }
  
  state.isPanning = true;
  state.activePanSlot = state.syncViewports ? 'both' : getSlotUnderCursor(event);
  
  // Cache starting coordinates for both images
  state.imageA.startX = event.clientX - state.imageA.panX;
  state.imageA.startY = event.clientY - state.imageA.panY;
  state.imageB.startX = event.clientX - state.imageB.panX;
  state.imageB.startY = event.clientY - state.imageB.panY;
}

function handlePanMove(event) {
  if (!state.isPanning) return;
  
  if (state.activePanSlot === 'both' || state.activePanSlot === 'a') {
    state.imageA.panX = event.clientX - state.imageA.startX;
    state.imageA.panY = event.clientY - state.imageA.startY;
  }
  if (state.activePanSlot === 'both' || state.activePanSlot === 'b') {
    state.imageB.panX = event.clientX - state.imageB.startX;
    state.imageB.panY = event.clientY - state.imageB.startY;
  }
  
  updateViewerTransforms();
}

function handlePanEnd() {
  state.isPanning = false;
  state.activePanSlot = null;
}

// Returns the effective pane dimensions for the current mode.
// In side-by-side mode each pane is half the viewport width.
function getEffectivePaneDimensions() {
  const w = elements.viewport.clientWidth;
  const h = elements.viewport.clientHeight;
  return {
    w: state.mode === 'side-by-side' ? w / 2 : w,
    h
  };
}

// Presets Algorithms for Fit, Fill, and 1:1 Scales
function getFitTransform(imgState) {
  if (!imgState.loaded) return { zoom: 1, panX: 0, panY: 0 };

  const { w: paneW, h: paneH } = getEffectivePaneDimensions();
  const w = imgState.width;
  const h = imgState.height;

  const paneRatio = paneW / paneH;
  const imgRatio = w / h;

  const fitScale = imgRatio > paneRatio ? paneW / w : paneH / h;

  const zoom = fitScale * 0.9; // 10% border margin
  const panX = (paneW - w * zoom) / 2;
  const panY = (paneH - h * zoom) / 2;

  return { zoom, panX, panY };
}

function getFillTransform(imgState) {
  if (!imgState.loaded) return { zoom: 1, panX: 0, panY: 0 };

  const { w: paneW, h: paneH } = getEffectivePaneDimensions();
  const w = imgState.width;
  const h = imgState.height;

  const paneRatio = paneW / paneH;
  const imgRatio = w / h;

  const fillScale = imgRatio > paneRatio ? paneH / h : paneW / w;

  const zoom = fillScale;
  const panX = (paneW - w * zoom) / 2;
  const panY = (paneH - h * zoom) / 2;

  return { zoom, panX, panY };
}

function get11Transform(imgState) {
  if (!imgState.loaded) return { zoom: 1, panX: 0, panY: 0 };

  const { w: paneW, h: paneH } = getEffectivePaneDimensions();

  const zoom = 1.0; // 100% original size
  const panX = (paneW - imgState.width) / 2;
  const panY = (paneH - imgState.height) / 2;

  return { zoom, panX, panY };
}

function applyPreset(type) {
  const targets = [];
  targets.push(state.imageA, state.imageB);
  
  targets.forEach(imgState => {
    if (!imgState.loaded) return;
    
    let transform;
    if (type === 'fit') {
      transform = getFitTransform(imgState);
    } else if (type === 'fill') {
      transform = getFillTransform(imgState);
    } else if (type === '11') {
      transform = get11Transform(imgState);
    }
    
    if (transform) {
      imgState.zoom = transform.zoom;
      imgState.panX = transform.panX;
      imgState.panY = transform.panY;
    }
  });
  
  updateViewerTransforms();
  showToast(`Applied preset: ${type.toUpperCase()}`);
}

// Fit images to fill the visible pane area (used on initial load and reset)
function fitToScreen() {
  applyPreset('fit');
}

// Aligns Image B to exactly match Image A's coordinates
function matchViews() {
  if (!state.imageA.loaded || !state.imageB.loaded) {
    showToast('Both images must be loaded to synchronize views.');
    return;
  }
  
  state.imageB.zoom = state.imageA.zoom;
  state.imageB.panX = state.imageA.panX;
  state.imageB.panY = state.imageA.panY;
  
  updateViewerTransforms();
  showToast('Synced views: Image B matched to Image A');
}

// ==========================================================================
//   SLIDER & BLINK TIMERS
// ==========================================================================

function handleSliderDragStart(event) {
  event.preventDefault();
  state.isDraggingSlider = true;
}

function handleSliderDragMove(event) {
  if (!state.isDraggingSlider) return;
  
  const rect = elements.viewport.getBoundingClientRect();
  let pos;
  
  if (state.sliderOrientation === 'vertical') {
    const currentY = event.clientY - rect.top;
    pos = currentY / rect.height;
  } else {
    const currentX = event.clientX - rect.left;
    pos = currentX / rect.width;
  }
  
  pos = Math.max(0, Math.min(pos, 1)); // Clamp
  
  state.sliderPos = pos;
  elements.viewport.style.setProperty('--slider-pos', pos);
  elements.viewport.style.setProperty('--slider-pos-pct', `${pos * 100}%`);
  
  // Sync contextual option slider if in slider mode
  if (state.mode === 'slider') {
    elements.modeOptionSlider.value = pos * 100;
    elements.modeOptionVal.textContent = `${Math.round(pos * 100)}%`;
  }
}

function handleSliderDragEnd() {
  state.isDraggingSlider = false;
}

function setSliderOrientation(orientation) {
  state.sliderOrientation = orientation;
  
  if (orientation === 'vertical') {
    elements.viewport.classList.add('slider-orientation-v');
    elements.btnSliderV.classList.add('active');
    elements.btnSliderH.classList.remove('active');
  } else {
    elements.viewport.classList.remove('slider-orientation-v');
    elements.btnSliderH.classList.add('active');
    elements.btnSliderV.classList.remove('active');
  }
  
  showToast(`Slider layout: ${orientation === 'vertical' ? 'Vertical Split' : 'Horizontal Split'}`);
}

function toggleTileGridLines(forceState) {
  if (forceState !== undefined) {
    state.tileGridOverlayActive = forceState;
  } else {
    state.tileGridOverlayActive = !state.tileGridOverlayActive;
  }
  
  if (elements.btnToggleTileGridLines) {
    elements.btnToggleTileGridLines.classList.toggle('active', state.tileGridOverlayActive);
  }
  elements.viewport.classList.toggle('tile-grid-overlay-active', state.tileGridOverlayActive);
  
  showToast(`Tile Grid Lines: ${state.tileGridOverlayActive ? 'Visible' : 'Hidden'}`);
}

// Onion Skin / Blinking Management
function startBlinking() {
  stopBlinking(); // Clear first
  state.blinkActive = true;
  state.blinkPaused = false; // Reset paused state
  state.blinkState = true;
  
  // Set initial blink state: Pane B visible, Pane A hidden
  elements.paneB.classList.remove('blink-hidden');
  elements.paneA.classList.add('blink-hidden');
  
  state.blinkTimerId = setInterval(() => {
    state.blinkState = !state.blinkState;
    if (state.blinkState) {
      elements.paneB.classList.remove('blink-hidden');
      elements.paneA.classList.add('blink-hidden');
    } else {
      elements.paneB.classList.add('blink-hidden');
      elements.paneA.classList.remove('blink-hidden');
    }
  }, state.blinkInterval);
}

function stopBlinking() {
  state.blinkActive = false;
  state.blinkPaused = false;
  if (state.blinkTimerId) {
    clearInterval(state.blinkTimerId);
    state.blinkTimerId = null;
  }
  elements.paneA.classList.remove('blink-hidden');
  elements.paneB.classList.remove('blink-hidden');
}

function toggleBlinkSpacebar() {
  if (state.blinkTimerId) {
    // It's actively blinking, so freeze it and go to manual mode
    clearInterval(state.blinkTimerId);
    state.blinkTimerId = null;
    state.blinkPaused = true;
    showToast('Blink Timer Paused (Manual Mode: Space to toggle)');
  }
  
  // Toggle the visible pane
  state.blinkState = !state.blinkState;
  if (state.blinkState) {
    elements.paneB.classList.remove('blink-hidden');
    elements.paneA.classList.add('blink-hidden');
    showToast('Blink Frame: B (Proof)');
  } else {
    elements.paneB.classList.add('blink-hidden');
    elements.paneA.classList.remove('blink-hidden');
    showToast('Blink Frame: A (Reference)');
  }
}

// ==========================================================================
//   IMAGE LOADING ENGINE & DRAG-DROP
// ==========================================================================

function inspectBitDepth(file, callback) {
  if (!file) {
    callback(null);
    return;
  }
  
  const nameLower = file.name.toLowerCase();
  
  if (nameLower.endsWith('.png')) {
    const blob = file.slice(0, 30);
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const buffer = e.target.result;
        const arr = new Uint8Array(buffer);
        // PNG header validation: 137, 80, 78, 71, 13, 10, 26, 10
        const isPng = arr[0] === 137 && arr[1] === 80 && arr[2] === 78 && arr[3] === 71;
        if (isPng && arr.length >= 25) {
          const bitDepth = arr[24];
          callback(bitDepth + '-bit');
        } else {
          callback('8-bit');
        }
      } catch (err) {
        console.error("Error parsing PNG bit depth:", err);
        callback('8-bit');
      }
    };
    reader.readAsArrayBuffer(blob);
  } else if (nameLower.endsWith('.exr')) {
    // Handled dynamically on loader decode, default to float
    callback('32-bit Float');
  } else {
    // JPEGs and others are standard 8-bit
    callback('8-bit');
  }
}

function convertExrToCanvas(parsed) {
  const { width, height, data } = parsed;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  
  const numChannels = data.length / (width * height);
  for (let row = 0; row < height; row++) {
    const flippedRow = height - 1 - row;
    for (let col = 0; col < width; col++) {
      const srcIdx = (row * width + col) * numChannels;
      const destIdx = (flippedRow * width + col) * 4;
      
      let r = data[srcIdx];
      let g = r;
      let b = r;
      let a = 1.0;
      
      if (numChannels === 2) {
        g = r;
        b = r;
        a = data[srcIdx + 1];
      } else if (numChannels >= 3) {
        g = data[srcIdx + 1];
        b = data[srcIdx + 2];
        if (numChannels >= 4) {
          a = data[srcIdx + 3];
        }
      }
      
      // Reinhard tonemapping: x / (x + 1)
      r = r / (r + 1.0);
      g = g / (g + 1.0);
      b = b / (b + 1.0);
      
      // Linear to sRGB (gamma 2.2 approximation)
      r = Math.pow(Math.max(0, Math.min(1, r)), 1.0 / 2.2);
      g = Math.pow(Math.max(0, Math.min(1, g)), 1.0 / 2.2);
      b = Math.pow(Math.max(0, Math.min(1, b)), 1.0 / 2.2);
      
      imgData.data[destIdx] = Math.max(0, Math.min(255, r * 255));
      imgData.data[destIdx + 1] = Math.max(0, Math.min(255, g * 255));
      imgData.data[destIdx + 2] = Math.max(0, Math.min(255, b * 255));
      imgData.data[destIdx + 3] = a !== undefined ? Math.max(0, Math.min(255, a * 255)) : 255;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function getDownsampledPixelSamples(imgEl) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, 128, 128);
    return ctx.getImageData(0, 0, 128, 128).data;
  } catch (err) {
    console.error("Error downsampling image:", err);
    return null;
  }
}

function renderHistogram() {
  const canvas = elements.histogramCanvas;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear scope area
  ctx.clearRect(0, 0, width, height);
  
  // Draw subtle digital helper gridlines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let y = 20; y < height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = 40; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  const chan = state.histogramChannel;
  
  // Empty states feedback
  if (!state.imageA.loaded && !state.imageB.loaded) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("WAITING FOR SIGNAL...", width / 2, height / 2 + 3);
    return;
  }

  // Pixel reads unavailable (canvas taint from file:// preset loading)
  const samplesUnavailable = (state.imageA.loaded && !state.imageA.samples) &&
                             (state.imageB.loaded && !state.imageB.samples);
  if (samplesUnavailable) {
    ctx.fillStyle = 'rgba(255, 170, 0, 0.5)';
    ctx.font = '9px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Use drag & drop for scope data", width / 2, height / 2 - 4);
    ctx.fillText("(file:// pixel reads blocked)", width / 2, height / 2 + 9);
    return;
  }
  
  const drawCurve = (imageState, isFilled, strokeColor, fillColor, lineWidth) => {
    if (!imageState.loaded || !imageState.samples) return;
    
    const samples = imageState.samples;
    const numPixels = 128 * 128;
    const bins = new Array(256).fill(0);
    
    const exp = state.adjustments.exposure;
    const gam = state.adjustments.gamma;
    const exponent = 1.0 / gam;
    
    // Shift and bin channels in real-time
    for (let i = 0; i < numPixels; i++) {
      const idx = i * 4;
      const rVal = samples[idx];
      const gVal = samples[idx + 1];
      const bVal = samples[idx + 2];
      const aVal = samples[idx + 3];
      
      if (aVal === 0) continue; // ignore transparent backgrounds
      
      let r = rVal / 255.0;
      let g = gVal / 255.0;
      let b = bVal / 255.0;
      
      // Compute exposure and gamma calibrations
      r = Math.pow(Math.max(0, Math.min(1, r * exp)), exponent);
      g = Math.pow(Math.max(0, Math.min(1, g * exp)), exponent);
      b = Math.pow(Math.max(0, Math.min(1, b * exp)), exponent);
      
      let finalVal = 0;
      if (chan === 'r') {
        finalVal = r * 255.0;
      } else if (chan === 'g') {
        finalVal = g * 255.0;
      } else if (chan === 'b') {
        finalVal = b * 255.0;
      } else {
        // 'all' composite and 'luma' Y channels: BT.709
        finalVal = (0.2126 * r + 0.7152 * g + 0.0722 * b) * 255.0;
      }
      
      const binIdx = Math.max(0, Math.min(255, Math.floor(finalVal)));
      bins[binIdx]++;
    }
    
    // Professional curve vertical scaling (ignore crush/clip extreme spikes to keep details scaled)
    let maxBin = 0;
    for (let k = 1; k < 255; k++) {
      if (bins[k] > maxBin) maxBin = bins[k];
    }
    if (maxBin === 0) {
      maxBin = Math.max(...bins) || 1;
    }
    
    const scaleY = (height - 8) / maxBin;
    
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    
    if (isFilled) {
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x < 256; x++) {
        const cx = (x / 255.0) * width;
        const cy = height - (bins[x] * scaleY);
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    
    ctx.beginPath();
    for (let x = 0; x < 256; x++) {
      const cx = (x / 255.0) * width;
      const cy = height - (bins[x] * scaleY);
      if (x === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  };
  
  // Choose colors matching cyberpunk design theme and active selection
  let colorA_fill = 'rgba(160, 100, 255, 0.12)';
  let colorA_stroke = 'rgba(160, 100, 255, 0.5)';
  let colorB_stroke = '#00ffff';
  
  if (chan === 'r') {
    colorA_fill = 'rgba(255, 51, 102, 0.1)';
    colorA_stroke = 'rgba(255, 51, 102, 0.5)';
    colorB_stroke = '#ff3366';
  } else if (chan === 'g') {
    colorA_fill = 'rgba(0, 255, 204, 0.1)';
    colorA_stroke = 'rgba(0, 255, 204, 0.5)';
    colorB_stroke = '#00ffcc';
  } else if (chan === 'b') {
    colorA_fill = 'rgba(51, 102, 255, 0.1)';
    colorA_stroke = 'rgba(51, 102, 255, 0.5)';
    colorB_stroke = '#3366ff';
  } else if (chan === 'luma') {
    colorA_fill = 'rgba(255, 255, 255, 0.08)';
    colorA_stroke = 'rgba(255, 255, 255, 0.4)';
    colorB_stroke = '#ffffff';
  }
  
  // Draw A: Translucent Fill
  if (state.imageA.loaded) {
    drawCurve(state.imageA, true, colorA_stroke, colorA_fill, 1.0);
  }
  
  // Draw B: Neon Outline
  if (state.imageB.loaded) {
    drawCurve(state.imageB, false, colorB_stroke, null, 1.5);
  }
}

function handleFileSelect(event, slot) {
  const file = event.target.files[0];
  if (file) {
    loadImageFile(file, slot);
  }
}

function loadImageFile(file, slot) {
  const nameLower = file.name.toLowerCase();
  const isExr = nameLower.endsWith('.exr');
  
  if (!isExr && !file.type.startsWith('image/')) {
    showToast('Invalid file format. Please select an image (EXR, PNG, JPG).');
    return;
  }
  
  // Show loading spinner
  document.getElementById('loader-' + slot).classList.remove('hidden');
  const emptyEl = slot === 'a' ? elements.emptyA : elements.emptyB;
  const imgEl = slot === 'a' ? elements.imgA : elements.imgB;
  emptyEl.classList.add('hidden');
  imgEl.classList.add('hidden');
  
  inspectBitDepth(file, (bitDepth) => {
    const imageState = slot === 'a' ? state.imageA : state.imageB;
    imageState.bitDepth = bitDepth;
    
    if (isExr) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const buffer = e.target.result;
          const loader = new THREE.EXRLoader();
          const parsed = loader.parse(buffer);
          
          // Verify bit depth from EXR pixel texture data types
          imageState.bitDepth = (parsed.type === THREE.FloatType) ? '32-bit Float' : '16-bit Float';
          
          const canvas = convertExrToCanvas(parsed);
          const dataUrl = canvas.toDataURL('image/png');
          setImageSource(dataUrl, file.name, file.size, slot);
        } catch (err) {
          console.error("Error decoding EXR file:", err);
          document.getElementById('loader-' + slot).classList.add('hidden');
          emptyEl.classList.remove('hidden');
          showToast('Failed to decode EXR file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = function(e) {
        const dataUrl = e.target.result;
        setImageSource(dataUrl, file.name, file.size, slot);
      };
      reader.readAsDataURL(file);
    }
  });
}

function updateImageCanvas(slot) {
  const imgState = slot === 'a' ? state.imageA : state.imageB;
  const imgEl = slot === 'a' ? elements.imgA : elements.imgB;
  
  if (!imgState.loaded) {
    imgState.canvas = null;
    imgState.ctx = null;
    return;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = imgState.width;
  canvas.height = imgState.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0);
  
  imgState.canvas = canvas;
  imgState.ctx = ctx;
}

// Load a preset image. Prefers the bundled base64 data URI (window.SAMPLE_DATA),
// which avoids file:// canvas-taint so pixel reads (eyedropper, histogram,
// thermal map) work without an HTTP server. Falls back to the direct path.
function loadPresetImage(key, filename, slot) {
  const dataUri = window.SAMPLE_DATA && window.SAMPLE_DATA[key];
  const src = dataUri || `assets/${key}.${key.startsWith('blenny') ? 'png' : 'jpg'}`;
  setImageSource(src, filename, 0, slot);
}

function setImageSource(src, filename, size, slot) {
  const isSlotA = slot === 'a';
  const imgEl = isSlotA ? elements.imgA : elements.imgB;
  const emptyEl = isSlotA ? elements.emptyA : elements.emptyB;
  const imageState = isSlotA ? state.imageA : state.imageB;
  
  // Show loader feedback
  document.getElementById('loader-' + slot).classList.remove('hidden');
  emptyEl.classList.add('hidden');
  imgEl.classList.add('hidden');
  
  imgEl.src = src;
  
  imgEl.onload = function() {
    imageState.loaded = true;
    imageState.width = imgEl.naturalWidth;
    imageState.height = imgEl.naturalHeight;
    imageState.name = filename;
    imageState.size = size;
    
    // Hide loader and show image
    document.getElementById('loader-' + slot).classList.add('hidden');
    imgEl.classList.remove('hidden');
    
    // Update labels in Metadata sidebar, including scan bit depths
    const sizeMb = size ? `${(size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown';
    const bitDepthText = imageState.bitDepth ? ` (${imageState.bitDepth})` : '';
    
    if (isSlotA) {
      elements.metaNameA.textContent = filename;
      elements.metaNameA.title = filename;
      elements.metaDimA.innerHTML = `Res: <span>${imageState.width} × ${imageState.height}${bitDepthText}</span>`;
      elements.metaSizeA.innerHTML = `Size: <span>${sizeMb}</span>`;
    } else {
      elements.metaNameB.textContent = filename;
      elements.metaNameB.title = filename;
      elements.metaDimB.innerHTML = `Res: <span>${imageState.width} × ${imageState.height}${bitDepthText}</span>`;
      elements.metaSizeB.innerHTML = `Size: <span>${sizeMb}</span>`;
    }
    
    // Build offscreen canvas cache for pixel reads
    updateImageCanvas(slot);
    
    // Cache downsampled samples for fast real-time histograms
    imageState.samples = getDownsampledPixelSamples(imgEl);
    
    showToast(`Loaded Image ${slot.toUpperCase()}: ${filename}`);
    
    // Automatically center and scale screen view
    fitToScreen();
    
    // Refresh histogram
    renderHistogram();
    
    // Refresh QC overlays on image load
    renderQCOverlays();
  };
}

// Drag & Drop Listeners
function setupDragAndDrop() {
  const panes = [
    { el: elements.paneA, slot: 'a' },
    { el: elements.paneB, slot: 'b' }
  ];
  
  panes.forEach(pane => {
    const emptyState = pane.slot === 'a' ? elements.emptyA : elements.emptyB;
    
    // Listen directly on Empty states for visual highlights
    emptyState.addEventListener('dragenter', (e) => {
      e.preventDefault();
      emptyState.classList.add('drag-over');
    });
    
    emptyState.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    
    emptyState.addEventListener('dragleave', (e) => {
      e.preventDefault();
      emptyState.classList.remove('drag-over');
    });
    
    emptyState.addEventListener('drop', (e) => {
      e.preventDefault();
      emptyState.classList.remove('drag-over');
      
      const file = e.dataTransfer.files[0];
      if (file) {
        loadImageFile(file, pane.slot);
      }
    });
  });
  
  // General window drag-over to support dropping anywhere
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());
}

// Smart Clipboard Pasting Listener
function setupClipboardPaste() {
  window.addEventListener('paste', function(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let file = null;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        file = items[i].getAsFile();
        break;
      }
    }
    
    if (file) {
      // Determine slot to paste image into based on emptiness and cursor position
      let slot = 'a';
      if (!state.imageA.loaded) {
        slot = 'a';
      } else if (!state.imageB.loaded) {
        slot = 'b';
      } else {
        // Both loaded, use cursor screen position (Left/Right half of viewport)
        const mouseX = lastMouseX || (window.innerWidth / 2);
        slot = mouseX < (window.innerWidth / 2) ? 'a' : 'b';
      }
      
      loadImageFile(file, slot);
    }
  });
}

// Track mouse positions for smart pasting
let lastMouseX = 0;
window.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
});

// Swap A and B images
function swapImages() {
  if (!state.imageA.loaded && !state.imageB.loaded) return;
  
  const tempSrc = elements.imgA.src;
  const tempState = { ...state.imageA };
  
  // Swap sources and display variables
  elements.imgA.src = elements.imgB.src;
  state.imageA = { ...state.imageB };
  state.imageA.element = elements.imgA;
  
  elements.imgB.src = tempSrc;
  state.imageB = { ...tempState };
  state.imageB.element = elements.imgB;
  
  // Toggle empty/loaded displays
  if (state.imageA.loaded) {
    elements.emptyA.classList.add('hidden');
    elements.imgA.classList.remove('hidden');
    
    const sizeMb = state.imageA.size ? `${(state.imageA.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown';
    const bitDepthText = state.imageA.bitDepth ? ` (${state.imageA.bitDepth})` : '';
    elements.metaNameA.textContent = state.imageA.name;
    elements.metaDimA.innerHTML = `Res: <span>${state.imageA.width} × ${state.imageA.height}${bitDepthText}</span>`;
    elements.metaSizeA.innerHTML = `Size: <span>${sizeMb}</span>`;
  } else {
    elements.emptyA.classList.remove('hidden');
    elements.imgA.classList.add('hidden');
    elements.metaNameA.textContent = 'No image loaded';
    elements.metaDimA.innerHTML = '-';
    elements.metaSizeA.innerHTML = '-';
  }
  
  if (state.imageB.loaded) {
    elements.emptyB.classList.add('hidden');
    elements.imgB.classList.remove('hidden');
    
    const sizeMb = state.imageB.size ? `${(state.imageB.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown';
    const bitDepthText = state.imageB.bitDepth ? ` (${state.imageB.bitDepth})` : '';
    elements.metaNameB.textContent = state.imageB.name;
    elements.metaDimB.innerHTML = `Res: <span>${state.imageB.width} × ${state.imageB.height}${bitDepthText}</span>`;
    elements.metaSizeB.innerHTML = `Size: <span>${sizeMb}</span>`;
  } else {
    elements.emptyB.classList.remove('hidden');
    elements.imgB.classList.add('hidden');
    elements.metaNameB.textContent = 'No image loaded';
    elements.metaDimB.innerHTML = '-';
    elements.metaSizeB.innerHTML = '-';
  }
  
  updateViewerTransforms();
  
  // Refresh histogram instantly on swap
  renderHistogram();
  
  showToast('Swapped Image A & B');
}

// Clear all inputs and reset viewport
function clearImages() {
  elements.imgA.src = '';
  elements.imgB.src = '';
  elements.imgA.classList.add('hidden');
  elements.imgB.classList.add('hidden');
  elements.emptyA.classList.remove('hidden');
  elements.emptyB.classList.remove('hidden');
  document.getElementById('loader-a').classList.add('hidden');
  document.getElementById('loader-b').classList.add('hidden');
  
  state.imageA = { loaded: false, width: 0, height: 0, name: '', size: 0, element: elements.imgA, zoom: 1, panX: 0, panY: 0, canvas: null, ctx: null, startX: 0, startY: 0, samples: null, bitDepth: '' };
  state.imageB = { loaded: false, width: 0, height: 0, name: '', size: 0, element: elements.imgB, zoom: 1, panX: 0, panY: 0, canvas: null, ctx: null, startX: 0, startY: 0, samples: null, bitDepth: '' };
  
  elements.metaNameA.textContent = 'No image loaded';
  elements.metaDimA.innerHTML = '-';
  elements.metaSizeA.innerHTML = '-';
  
  elements.metaNameB.textContent = 'No image loaded';
  elements.metaDimB.innerHTML = '-';
  elements.metaSizeB.innerHTML = '-';
  
  // Clear print QC state
  state.qcRegions = [];
  state.qcSamplerPin = null;
  state.qcMoireRegion = null;
  state.qcMoireActive = false;
  state.qcTacActive = false;
  state.qcScumActive = false;
  
  // Uncheck inputs and hide panels
  const scumChk = document.getElementById('qc-toggle-scum');
  if (scumChk) scumChk.checked = false;
  const tacChk = document.getElementById('qc-toggle-tac');
  if (tacChk) tacChk.checked = false;
  
  const outPanel = document.getElementById('qc-moire-analyzer-output');
  if (outPanel) outPanel.classList.add('hidden');
  
  const roiList = document.getElementById('qc-roi-list');
  if (roiList) roiList.innerHTML = `<p class="qc-empty-text">No active ROI regions. Click button above to draw on viewport.</p>`;
  
  const dotGainReadout = document.getElementById('qc-dotgain-readout');
  if (dotGainReadout) dotGainReadout.innerHTML = `<p class="qc-empty-text">Select sampler and click on a tonal patch to measure TVI.</p>`;
  
  // Hide overlays by default
  const overlayCanvasA = document.getElementById('canvas-a-overlay');
  const overlayCanvasB = document.getElementById('canvas-b-overlay');
  if (overlayCanvasA) overlayCanvasA.classList.add('hidden');
  if (overlayCanvasB) overlayCanvasB.classList.add('hidden');
  
  updateViewerTransforms();
  
  // Clear histogram
  renderHistogram();
  
  // Re-render QC overlays
  renderQCOverlays();
  
  showToast('Workspace Cleared');
}

// ==========================================================================
//   LOAD PRESET SAMPLES ENGINE
// ==========================================================================

// ==========================================================================
//   LOAD PRESET SAMPLES ENGINE (DYNAMIC HIGH-RES GENERATORS)
// ==========================================================================

function loadSamplePair(type) {
  elements.sampleDrawer.classList.remove('open');
  clearImages();
  
  showToast('Loading premium product render...');
  
  setTimeout(() => {
    try {
      if (type === 'spotlight') {
        loadSpotlightPreset();
      } else if (type === 'smartwatch' || type === 'transparent') {
        loadSmartwatchPreset();
      } else if (type === 'headset' || type === 'photo') {
        loadHeadsetPreset();
      } else if (type === 'blenny') {
        loadBlennyPreset();
      } else if (type === 'center') {
        loadCenterTestPreset();
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading demo preset.');
    }
  }, 100);
}

function loadSpotlightPreset() {
  showToast('Loading Ring Spotlight Cam EXR floating-point renders...');
  
  // Set Image A source (V4 render)
  loadExrPreset('assets/spotlight_cam_v04.exr', 'spotlight_cam_v04_litON.exr', 2042937, 'a');
  
  // Set Image B source (V2 render)
  setTimeout(() => {
    loadExrPreset('assets/spotlight_cam_v02.exr', 'spotlight_cam_v02_litON.exr', 2544490, 'b');
  }, 200);
}

function loadExrPreset(src, filename, size, slot) {
  const isSlotA = slot === 'a';
  const imgEl = isSlotA ? elements.imgA : elements.imgB;
  const emptyEl = isSlotA ? elements.emptyA : elements.emptyB;
  const imageState = isSlotA ? state.imageA : state.imageB;

  document.getElementById('loader-' + slot).classList.remove('hidden');
  emptyEl.classList.add('hidden');
  imgEl.classList.add('hidden');

  const showFailure = (reason) => {
    console.error('EXR load failed:', src, reason);
    document.getElementById('loader-' + slot).classList.add('hidden');
    emptyEl.classList.remove('hidden');
    showToast(`Failed to load EXR: ${filename} — ${reason}`);
  };

  const xhr = new XMLHttpRequest();
  xhr.open('GET', src, true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = function() {
    // status 0 = success on file://, 200 = success on http://
    if (xhr.status === 200 || xhr.status === 0) {
      const buffer = xhr.response;
      if (!buffer || buffer.byteLength === 0) {
        showFailure('empty response — open via a local server (e.g. VS Code Live Server)');
        return;
      }
      try {
        imageState.bitDepth = '16-bit Float';
        const loader = new THREE.EXRLoader();
        const parsed = loader.parse(buffer);
        imageState.bitDepth = (parsed.type === THREE.FloatType) ? '32-bit Float' : '16-bit Float';
        const canvas = convertExrToCanvas(parsed);
        setImageSource(canvas.toDataURL('image/png'), filename, size, slot);
      } catch (err) {
        showFailure('decode error — ' + err.message);
      }
    } else {
      showFailure('HTTP ' + xhr.status);
    }
  };

  xhr.onerror = function() {
    showFailure('network error — open via a local server (e.g. VS Code Live Server or python -m http.server)');
  };

  xhr.send();
}



function loadBlennyPreset() {
  showToast('Loading Blenny v01 vs v02…');
  loadPresetImage('blenny01_v01', 'blenny01_v01.png', 'a');
  setTimeout(() => loadPresetImage('blenny01_v02', 'blenny01_v02.png', 'b'), 150);
}

function loadSmartwatchPreset() {
  showToast('Loading luxury smartwatch 3D renders...');
  loadPresetImage('smartwatch_a', 'smartwatch_3D_render_master.png', 'a');
  setTimeout(() => loadPresetImage('smartwatch_b', 'smartwatch_compressed_fw_v1_0.jpg', 'b'), 200);
}

function loadHeadsetPreset() {
  showToast('Loading VR headset optics QA renders...');
  loadPresetImage('vr_headset_a', 'vr_headset_render_master.png', 'a');
  setTimeout(() => loadPresetImage('vr_headset_b', 'vr_headset_optics_drift_qc.jpg', 'b'), 200);
}

function loadCenterTestPreset() {
  showToast('Generating Perfect Center alignment test...');

  const W = 900, H = 600;

  function drawProductShape(ctx, cx, cy) {
    // Dark space background
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
    bg.addColorStop(0, '#12121e');
    bg.addColorStop(1, '#06060e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid guide lines (very faint)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Outer glow ring
    const glow = ctx.createRadialGradient(cx, cy, 110, cx, cy, 175);
    glow.addColorStop(0, 'rgba(0,200,255,0.18)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, 175, 0, Math.PI * 2); ctx.fill();

    // Body: rounded-rect product body
    const bw = 160, bh = 240;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 28);
    const bodyGrad = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
    bodyGrad.addColorStop(0, '#2a2a3c');
    bodyGrad.addColorStop(0.5, '#1c1c2c');
    bodyGrad.addColorStop(1, '#0e0e18');
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,130,200,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Lens circle
    const lensGrad = ctx.createRadialGradient(-16, -16, 4, 0, 0, 65);
    lensGrad.addColorStop(0, '#4466ff');
    lensGrad.addColorStop(0.4, '#1a1a40');
    lensGrad.addColorStop(1, '#0a0a20');
    ctx.beginPath(); ctx.arc(0, -30, 65, 0, Math.PI * 2);
    ctx.fillStyle = lensGrad; ctx.fill();
    ctx.strokeStyle = 'rgba(80,100,220,0.5)'; ctx.lineWidth = 2; ctx.stroke();

    // Inner lens ring
    ctx.beginPath(); ctx.arc(0, -30, 44, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100,140,255,0.4)'; ctx.lineWidth = 1; ctx.stroke();

    // Lens highlight
    ctx.beginPath(); ctx.arc(-18, -52, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();

    // Flash / indicator dot
    ctx.beginPath(); ctx.arc(52, -80, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4466'; ctx.fill();
    ctx.beginPath(); ctx.arc(52, -80, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,60,90,0.3)'; ctx.lineWidth = 2; ctx.stroke();

    // Bottom bar
    ctx.beginPath(); ctx.roundRect(-55, 70, 110, 22, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();

    ctx.restore();

    // Crosshair center guides (cyan)
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,204,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.setLineDash([]);

    // Corner registration marks
    const m = 20;
    [
      [m, m], [W - m, m], [m, H - m], [W - m, H - m]
    ].forEach(([x, y]) => {
      const sx = x < W / 2 ? 1 : -1, sy = y < H / 2 ? 1 : -1;
      ctx.strokeStyle = 'rgba(0,255,204,0.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * 16, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * 16); ctx.stroke();
    });
    ctx.restore();
  }

  // Image A: object exactly centered
  const canvasA = document.createElement('canvas');
  canvasA.width = W; canvasA.height = H;
  const ctxA = canvasA.getContext('2d');
  drawProductShape(ctxA, W / 2, H / 2);
  setImageSource(canvasA.toDataURL('image/png'), 'center_test_A_CENTERED.png', 0, 'a');

  // Image B: same object shifted 42px right and 28px down (~4.7% / 4.7% offset)
  setTimeout(() => {
    const canvasB = document.createElement('canvas');
    canvasB.width = W; canvasB.height = H;
    const ctxB = canvasB.getContext('2d');
    drawProductShape(ctxB, W / 2 + 42, H / 2 + 28);
    setImageSource(canvasB.toDataURL('image/png'), 'center_test_B_OFFSET_42x28.png', 0, 'b');
  }, 100);
}


// ==========================================================================
//   VIEWPORT SYNC, EYEDROPPER & CALIBRATION UTILITIES
// ==========================================================================

function toggleSync() {
  state.syncViewports = !state.syncViewports;
  
  const iconLock = elements.btnToggleSync.querySelector('.icon-lock');
  const iconUnlock = elements.btnToggleSync.querySelector('.icon-unlock');
  
  const lockLabel = document.getElementById('util-lock-label');
  if (state.syncViewports) {
    elements.btnToggleSync.classList.add('active');
    iconLock.classList.remove('hidden');
    iconUnlock.classList.add('hidden');
    if (lockLabel) lockLabel.textContent = 'Views Locked';
    showToast('Viewport Sync: LOCKED (Offset Preserved)');
  } else {
    elements.btnToggleSync.classList.remove('active');
    iconLock.classList.add('hidden');
    iconUnlock.classList.remove('hidden');
    if (lockLabel) lockLabel.textContent = 'Views Unlocked';
    showToast('Viewport Sync: UNLOCKED (Independent Panning)');
  }
  
  updateViewerTransforms();
}

function toggleEyedropper() {
  state.eyedropperActive = !state.eyedropperActive;
  
  elements.btnToggleEyedropper.classList.toggle('active', state.eyedropperActive);
  elements.viewport.classList.toggle('eyedropper-active', state.eyedropperActive);
  
  if (state.eyedropperActive) {
    showToast('Eyedropper: ACTIVE (Hover over images)');
  } else {
    elements.tooltip.classList.add('hidden');
    showToast('Eyedropper: DEACTIVATED');
  }
}

function updateEyedropper(event) {
  if (!state.eyedropperActive) return;
  
  // If neither image is loaded, hide tooltip and return
  if (!state.imageA.loaded && !state.imageB.loaded) {
    elements.tooltip.classList.add('hidden');
    return;
  }
  
  const rect = elements.viewport.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  // Dynamic high-precision floating positioning offset from cursor
  const tooltipW = elements.tooltip.clientWidth || 180;
  const tooltipH = elements.tooltip.clientHeight || 120;
  let left = event.clientX + 20;
  let top = event.clientY + 20;
  
  if (left + tooltipW > window.innerWidth) {
    left = event.clientX - tooltipW - 20;
  }
  if (top + tooltipH > window.innerHeight) {
    top = event.clientY - tooltipH - 20;
  }
  
  elements.tooltip.style.left = `${left}px`;
  elements.tooltip.style.top = `${top}px`;
  
  // Coordinate mapping depending on mode
  const coord = mapViewportToImage(mouseX, mouseY);
  if (!coord) {
    elements.tooltip.classList.add('hidden');
    return;
  }
  
  let hoveredSlot = coord.slot;
  let px = coord.x;
  let py = coord.y;
  
  // Display current mapped index
  elements.tooltipPx.textContent = px;
  elements.tooltipPy.textContent = py;
  
  let colorA = null;
  let colorB = null;
  
  // Retrieve color channel bytes from offscreen canvas context caches
  if (state.imageA.loaded && px >= 0 && px < state.imageA.width && py >= 0 && py < state.imageA.height) {
    try {
      const data = state.imageA.ctx.getImageData(px, py, 1, 1).data;
      colorA = { r: data[0], g: data[1], b: data[2], a: data[3] };
    } catch (e) {
      console.error("Error reading Image A pixel:", e);
    }
  }
  
  if (state.imageB.loaded && px >= 0 && px < state.imageB.width && py >= 0 && py < state.imageB.height) {
    try {
      const data = state.imageB.ctx.getImageData(px, py, 1, 1).data;
      colorB = { r: data[0], g: data[1], b: data[2], a: data[3] };
    } catch (e) {
      console.error("Error reading Image B pixel:", e);
    }
  }
  
  // Update Swatches & Label details
  if (colorA) {
    elements.tooltipSwatchA.style.backgroundColor = `rgba(${colorA.r}, ${colorA.g}, ${colorA.b}, ${colorA.a / 255})`;
    elements.tooltipValA.textContent = `RGB(${colorA.r}, ${colorA.g}, ${colorA.b})`;
  } else {
    elements.tooltipSwatchA.style.backgroundColor = 'transparent';
    elements.tooltipValA.textContent = 'RGB(-, -, -)';
  }
  
  if (colorB) {
    elements.tooltipSwatchB.style.backgroundColor = `rgba(${colorB.r}, ${colorB.g}, ${colorB.b}, ${colorB.a / 255})`;
    elements.tooltipValB.textContent = `RGB(${colorB.r}, ${colorB.g}, ${colorB.b})`;
  } else {
    elements.tooltipSwatchB.style.backgroundColor = 'transparent';
    elements.tooltipValB.textContent = 'RGB(-, -, -)';
  }
  
  // Visibility guard
  if (!colorA && !colorB) {
    elements.tooltip.classList.add('hidden');
    return;
  }
  
  elements.tooltip.classList.remove('hidden');
  
  // Anomaly detector triggers a minor yellow warning or a critical pulsing red alert based on difference magnitude
  if (colorA && colorB) {
    const diffR = Math.abs(colorA.r - colorB.r);
    const diffG = Math.abs(colorA.g - colorB.g);
    const diffB = Math.abs(colorA.b - colorB.b);
    const diffA = Math.abs(colorA.a - colorB.a);
    const maxDiff = Math.max(diffR, diffG, diffB, diffA);

    // Numeric ΔE (Euclidean RGB distance, 0-100 scale)
    const deltaE = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB) / Math.sqrt(3 * 255 * 255) * 100;
    if (elements.tooltipDelta) {
      elements.tooltipDelta.textContent = `ΔE ${deltaE.toFixed(1)}`;
      elements.tooltipDelta.classList.remove('hidden');
    }

    if (maxDiff >= 10) {
      elements.tooltip.classList.remove('alert-warn');
      elements.tooltip.classList.add('alert-active');
      elements.tooltipAlert.textContent = '🚨 CRITICAL DIFF';
      elements.tooltipAlert.style.color = '#ff3366';
      elements.tooltipAlert.style.textShadow = '0 0 8px rgba(255, 51, 102, 0.5)';
      elements.tooltipAlert.classList.remove('hidden');
    } else if (maxDiff > 0) {
      elements.tooltip.classList.remove('alert-active');
      elements.tooltip.classList.add('alert-warn');
      elements.tooltipAlert.textContent = '⚠️ MINOR DIFF';
      elements.tooltipAlert.style.color = '#ffaa00';
      elements.tooltipAlert.style.textShadow = '0 0 8px rgba(255, 170, 0, 0.5)';
      elements.tooltipAlert.classList.remove('hidden');
    } else {
      elements.tooltip.classList.remove('alert-active', 'alert-warn');
      elements.tooltipAlert.classList.add('hidden');
    }
  } else {
    elements.tooltip.classList.remove('alert-active', 'alert-warn');
    elements.tooltipAlert.classList.add('hidden');
    if (elements.tooltipDelta) elements.tooltipDelta.classList.add('hidden');
  }
}

function resetAdjustments() {
  state.adjustments.exposure = 1.0;
  state.adjustments.gamma = 1.0;
  state.adjustments.diffScale = 1.0;
  state.adjustments.weightR = 1.0;
  state.adjustments.weightG = 1.0;
  state.adjustments.weightB = 1.0;
  
  // Sync HUD range inputs
  elements.adjExposure.value = 1.0;
  elements.adjGamma.value = 1.0;
  elements.adjDiffScale.value = 1.0;
  // Sync UI labels
  elements.valExposure.textContent = '1.00x';
  elements.valGamma.textContent = '1.00';
  elements.valDiffScale.textContent = '1x';
  
  applyFilters();
  renderHistogram();
  renderQCOverlays();
  showToast('Calibration parameters reset to neutral');
}


// ==========================================================================
//   KEYBOARD CONTROLLER & SHORTCUT ACTIONS
// ==========================================================================

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', function(e) {
    // Ignore keyboard events if user is typing inside text inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    const key = e.key.toUpperCase();
    
    switch (key) {
      case 'S':
        setMode('slider');
        break;
      case 'D':
        setMode('side-by-side');
        break;
      case 'F':
        setMode('blend');
        break;
      case 'G':
        setMode('difference');
        break;
      case 'B':
        setMode('blink');
        break;
      case 'T':
        setMode('tile-grid');
        break;
      case ' ':
      case 'SPACEBAR':
        if (state.mode === 'blink') {
          e.preventDefault(); // Prevent page scrolling
          toggleBlinkSpacebar();
        }
        break;
      case 'X':
        swapImages();
        break;
      case 'Y':
        toggleSync();
        break;
      case 'I':
        toggleEyedropper();
        break;
      case 'R':
        fitToScreen();
        showToast('Reset Viewport Scale');
        break;
      case 'L':
        toggleGrid();
        break;
      case 'C':
        cycleBackground();
        break;
      case 'ESCAPE':
      case 'ESC':
        elements.helpModal.classList.add('hidden');
        elements.sampleDrawer.classList.remove('open');
        break;
    }
  });
}

function cycleBackground() {
  const backgrounds = ['transparency-checkered', 'bg-black', 'bg-white', 'bg-neutral'];
  const currentIndex = backgrounds.indexOf(state.bgMode);
  const nextIndex = (currentIndex + 1) % backgrounds.length;
  setBackgroundPreset(backgrounds[nextIndex]);
}

function toggleGrid() {
  state.gridActive = !state.gridActive;
  elements.gridOverlay.classList.toggle('hidden', !state.gridActive);
  elements.btnToggleGrid.classList.toggle('active', state.gridActive);
  showToast(state.gridActive ? 'Grid Alignment Active' : 'Grid Hidden');
}

// ==========================================================================
//   NOTIFICATIONS TOAST ENGINE
// ==========================================================================

// Debounced QC render — avoids running expensive full-image pixel loops on
// every tick of a range slider while the user is still dragging.
let _qcRenderTimer = null;
function scheduleQcRender() {
  clearTimeout(_qcRenderTimer);
  _qcRenderTimer = setTimeout(renderQCOverlays, 100);
}

let toastTimerId = null;
function showToast(message) {
  if (toastTimerId) {
    clearTimeout(toastTimerId);
  }
  
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  
  toastTimerId = setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 2200);
}

// ==========================================================================
//   EVENT INITIALIZATIONS
// ==========================================================================

function initEvents() {
  // 1. Zoom and Pan Bindings on Viewport
  elements.viewport.addEventListener('wheel', handleZoom, { passive: false });
  elements.viewport.addEventListener('mousedown', handlePanStart);
  window.addEventListener('mousemove', handlePanMove);
  window.addEventListener('mouseup', handlePanEnd);
  
  // 2. Drag & Drop
  setupDragAndDrop();
  
  // 3. Clipboard pasting
  setupClipboardPaste();
  
  // 4. File selection triggers
  elements.fileA.addEventListener('change', (e) => handleFileSelect(e, 'a'));
  elements.fileB.addEventListener('change', (e) => handleFileSelect(e, 'b'));
  
  // 5. Comparison toolbar button activations
  document.querySelectorAll('.btn-tool').forEach(btn => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
    });
  });
  
  // 6. Contextual slot slider interactions (new per-mode sliders)
  const sliderSplit = document.getElementById('mode-option-slider');
  if (sliderSplit) {
    sliderSplit.addEventListener('input', (e) => {
      const val = e.target.value;
      state.sliderPos = val / 100;
      elements.viewport.style.setProperty('--slider-pos', state.sliderPos);
      elements.viewport.style.setProperty('--slider-pos-pct', `${val}%`);
      const dispEl = document.getElementById('ctx-split-val');
      if (dispEl) dispEl.textContent = `${val}%`;
    });
  }

  const sliderBlend = document.getElementById('mode-option-slider-blend');
  if (sliderBlend) {
    sliderBlend.addEventListener('input', (e) => {
      const val = e.target.value;
      state.blendOpacity = val / 100;
      elements.viewport.style.setProperty('--blend-opacity', state.blendOpacity);
      const dispEl = document.getElementById('ctx-blend-val');
      if (dispEl) dispEl.textContent = `${val}%`;
    });
  }

  const sliderBlink = document.getElementById('mode-option-slider-blink');
  if (sliderBlink) {
    sliderBlink.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.blinkInterval = val;
      startBlinking();
      const dispEl = document.getElementById('ctx-blink-val');
      if (dispEl) dispEl.textContent = `${val}ms`;
    });
  }

  const sliderTile = document.getElementById('mode-option-slider-tile');
  if (sliderTile) {
    sliderTile.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.tileSize = val;
      elements.viewport.style.setProperty('--tile-size', `${val}px`);
      const dispEl = document.getElementById('ctx-tile-val');
      if (dispEl) dispEl.textContent = `${val}px`;
    });
  }

  // Color sensitivity sliders (Difference mode)
  ['r','g','b'].forEach(ch => {
    const sl = document.getElementById(`adj-color-${ch}`);
    if (!sl) return;
    sl.addEventListener('input', () => {
      state[`colorSensitivity${ch.toUpperCase()}`] = parseFloat(sl.value);
      applyFilters();
    });
  });
  
  // 7. Background switcher buttons
  document.querySelectorAll('.btn-bg').forEach(btn => {
    btn.addEventListener('click', () => {
      setBackgroundPreset(btn.dataset.bg);
    });
  });
  
  // 8. Collapsible Sidebar toggle
  elements.btnToggleMeta.addEventListener('click', () => {
    elements.metaPanel.classList.toggle('collapsed');
  });
  
  // 9. Reset zoom event
  elements.btnResetView.addEventListener('click', fitToScreen);
  
  // 10. Sample Preset triggers
  function openSamplesModal() {
    elements.sampleDrawer.classList.add('open');
    const backdrop = document.getElementById('samples-backdrop');
    if (backdrop) backdrop.classList.remove('hidden');
  }
  function closeSamplesModal() {
    elements.sampleDrawer.classList.remove('open');
    const backdrop = document.getElementById('samples-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
  }
  elements.btnSamplesToggle.addEventListener('click', () => {
    elements.sampleDrawer.classList.contains('open') ? closeSamplesModal() : openSamplesModal();
  });
  elements.btnCloseDrawer.addEventListener('click', closeSamplesModal);
  const samplesBackdrop = document.getElementById('samples-backdrop');
  if (samplesBackdrop) samplesBackdrop.addEventListener('click', closeSamplesModal);

  // Reset views toolbar button
  const btnResetViewToolbar = document.getElementById('btn-reset-view-toolbar');
  if (btnResetViewToolbar) btnResetViewToolbar.addEventListener('click', fitToScreen);
  const btnSampleSpotlight = document.getElementById('sample-card-spotlight');
  if (btnSampleSpotlight) {
    btnSampleSpotlight.addEventListener('click', () => {
      loadSamplePair('spotlight');
    });
  }
  document.getElementById('sample-card-cyberpunk').addEventListener('click', () => {
    loadSamplePair('smartwatch');
  });
  document.getElementById('sample-card-photo').addEventListener('click', () => {
    loadSamplePair('headset');
  });
  const btnSampleCenter = document.getElementById('sample-card-center');
  if (btnSampleCenter) {
    btnSampleCenter.addEventListener('click', () => {
      loadSamplePair('center');
    });
  }
  const btnSampleBlenny = document.getElementById('sample-card-blenny');
  if (btnSampleBlenny) {
    btnSampleBlenny.addEventListener('click', () => {
      loadSamplePair('blenny');
    });
  }
  
  // 11. Modal Help Overlay actions
  elements.btnShowHelp.addEventListener('click', () => {
    elements.helpModal.classList.remove('hidden');
  });
  elements.btnCloseHelp.addEventListener('click', () => {
    elements.helpModal.classList.add('hidden');
  });
  elements.helpModal.addEventListener('click', (e) => {
    if (e.target === elements.helpModal) {
      elements.helpModal.classList.add('hidden');
    }
  });
  
  // 12. Slider Drag divider listeners
  elements.sliderDivider.addEventListener('mousedown', handleSliderDragStart);
  window.addEventListener('mousemove', handleSliderDragMove);
  window.addEventListener('mouseup', handleSliderDragEnd);
  
  // Double click resets zoom
  elements.viewport.addEventListener('dblclick', (e) => {
    if (e.target.closest('.toolbar-container') || e.target.closest('.meta-panel')) return;
    fitToScreen();
  });
  
  // 13. Swap and Utilities Actions
  elements.btnSwap.addEventListener('click', swapImages);
  elements.btnToggleGrid.addEventListener('click', toggleGrid);
  elements.btnClear.addEventListener('click', clearImages);
  
  // 14. Viewport Presets
  elements.btnZoomFit.addEventListener('click', () => applyPreset('fit'));
  elements.btnZoomFill.addEventListener('click', () => applyPreset('fill'));
  elements.btnZoom11.addEventListener('click', () => applyPreset('11'));
  elements.btnMatchViews.addEventListener('click', matchViews);
  
  // 15. Viewport Locking and Eyedropper Toggles
  elements.btnToggleSync.addEventListener('click', toggleSync);
  elements.btnToggleEyedropper.addEventListener('click', toggleEyedropper);
  elements.viewport.addEventListener('mousemove', updateEyedropper);
  elements.viewport.addEventListener('mouseleave', () => {
    elements.tooltip.classList.add('hidden');
  });
  
  // Slider split layout orientation handlers
  if (elements.btnSliderH && elements.btnSliderV) {
    elements.btnSliderH.addEventListener('click', () => setSliderOrientation('horizontal'));
    elements.btnSliderV.addEventListener('click', () => setSliderOrientation('vertical'));
  }
  
  // Color Gradient Thermal Map toggle
  if (elements.diffToggleHeatmap) {
    elements.diffToggleHeatmap.addEventListener('change', (e) => {
      state.diffHeatmapActive = e.target.checked;
      const tc = document.getElementById('thermal-canvas');
      if (tc) tc.classList.toggle('hidden', !state.diffHeatmapActive);
      renderQCOverlays();
    });
  }
  
  // Tile grid visible lines toggle
  if (elements.btnToggleTileGridLines) {
    elements.btnToggleTileGridLines.addEventListener('click', () => {
      toggleTileGridLines();
    });
  }
  
  // 16. Visual Calibration adjustments
  elements.adjExposure.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.adjustments.exposure = val;
    elements.valExposure.textContent = val.toFixed(2) + 'x';
    applyFilters();
    renderHistogram();
    scheduleQcRender();
  });

  elements.adjGamma.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.adjustments.gamma = val;
    elements.valGamma.textContent = val.toFixed(2);
    applyFilters();
    renderHistogram();
    scheduleQcRender();
  });

  elements.adjDiffScale.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.adjustments.diffScale = val;
    elements.valDiffScale.textContent = val + 'x';
    applyFilters();
    renderHistogram();
    scheduleQcRender();
  });

  elements.btnResetAdjustments.addEventListener('click', resetAdjustments);
  
  // 17. Channel select trigger buttons for Real-Time Scope
  document.querySelectorAll('.btn-channel').forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states on tabs
      document.querySelectorAll('.btn-channel').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update state and refresh scope canvas
      state.histogramChannel = btn.dataset.chan;
      renderHistogram();
    });
  });
  
  // Set initial viewport layout
  window.addEventListener('resize', () => {
    if (state.imageA.loaded || state.imageB.loaded) {
      fitToScreen();
      renderQCOverlays();
    }
  });

  // ==========================================================================
  //   PRINT QC EVENT BINDINGS
  // ==========================================================================
  
  // 1. Sidebar toggle
  const btnToggleQc = document.getElementById('btn-toggle-qc');
  const btnCloseQc = document.getElementById('btn-close-qc');
  const qcPanel = document.getElementById('print-qc-panel');
  if (btnToggleQc && qcPanel) {
    btnToggleQc.addEventListener('click', () => {
      qcPanel.classList.toggle('collapsed');
    });
  }
  if (btnCloseQc && qcPanel) {
    btnCloseQc.addEventListener('click', () => {
      qcPanel.classList.add('collapsed');
    });
  }
  
  // 2. Tab switching
  document.querySelectorAll('.btn-qc-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-qc-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabName = btn.dataset.tab;
      state.qcActiveTab = tabName;
      
      // Toggle panes
      const paneIds = ['deltae', 'tac', 'dot', 'moire', 'artifacts'];
      paneIds.forEach(p => {
        const el = document.getElementById(`qc-tab-${p}`);
        if (el) el.classList.toggle('hidden', p !== tabName);
      });

      // Full QC state reset on every tab switch
      clearQcOverlayState();
      scheduleQcRender();
    });
  });
  
  // 3. TAC Threshold slider
  const tacSlider = document.getElementById('qc-tac-threshold');
  const valTacSlider = document.getElementById('qc-val-tac-threshold');
  if (tacSlider && valTacSlider) {
    tacSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.qcTacThreshold = val;
      valTacSlider.textContent = `${val}%`;
      scheduleQcRender();
    });
  }

  // 4. TAC Overlay checkbox
  const tacToggle = document.getElementById('qc-toggle-tac');
  if (tacToggle) {
    tacToggle.addEventListener('change', (e) => {
      state.qcTacActive = e.target.checked;
      renderQCOverlays();
    });
  }

  // 5. TAC Target selection
  document.querySelectorAll('#qc-tab-tac .btn-qc-radio').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#qc-tab-tac .btn-qc-radio').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.qcTacTarget = btn.dataset.target;
      renderQCOverlays();
    });
  });

  // 6. Scum Dot slider
  const scumSlider = document.getElementById('qc-scum-threshold');
  const valScumSlider = document.getElementById('qc-val-scum-threshold');
  if (scumSlider && valScumSlider) {
    scumSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.qcScumThreshold = val;
      valScumSlider.textContent = `${val}%`;
      scheduleQcRender();
    });
  }

  // 7. Scum Dot Toggle
  const scumToggle = document.getElementById('qc-toggle-scum');
  if (scumToggle) {
    scumToggle.addEventListener('change', (e) => {
      state.qcScumActive = e.target.checked;
      renderQCOverlays();
    });
  }
  
  // 8. ROI Drawing triggers
  const btnAddRoi = document.getElementById('btn-add-roi');
  const btnAddMoire = document.getElementById('btn-add-moire-roi');
  const drawOverlay = document.getElementById('roi-draw-overlay');
  
  const activateDrawOverlay = (mode) => {
    state.qcDrawingMode = mode;
    state.qcDotGainSamplerActive = false;
    const btnDot = document.getElementById('btn-sample-dotgain');
    if (btnDot) btnDot.classList.remove('active');
    
    if (elements.viewport) {
      elements.viewport.classList.remove('eyedropper-active');
    }
    
    if (drawOverlay) {
      drawOverlay.classList.remove('hidden');
    }
    showToast(mode === 'roi' ? 'Draw Region: Click and drag over image' : 'Draw FFT Box: Click and drag over pattern');
  };
  
  if (btnAddRoi) {
    btnAddRoi.addEventListener('click', () => {
      btnAddRoi.classList.add('active');
      if (btnAddMoire) btnAddMoire.classList.remove('active');
      activateDrawOverlay('roi');
    });
  }
  
  const btnClearRois = document.getElementById('btn-clear-rois');
  if (btnClearRois) {
    btnClearRois.addEventListener('click', () => {
      clearQcOverlayState();
      renderQCOverlays();
      showToast('Cleared ROI regions and overlays.');
    });
  }

  const btnClearMoire = document.getElementById('btn-clear-moire-roi');
  if (btnClearMoire) {
    btnClearMoire.addEventListener('click', () => {
      clearQcOverlayState();
      renderQCOverlays();
      showToast('Cleared Moiré region and overlays.');
    });
  }

  const btnClearDotGain = document.getElementById('btn-clear-dotgain-sampler');
  if (btnClearDotGain) {
    btnClearDotGain.addEventListener('click', () => {
      clearQcOverlayState();
      renderQCOverlays();
      showToast('Cleared sampler pin and overlays.');
    });
  }

  
  if (btnAddMoire) {
    btnAddMoire.addEventListener('click', () => {
      btnAddMoire.classList.add('active');
      if (btnAddRoi) btnAddRoi.classList.remove('active');
      activateDrawOverlay('moire');
    });
  }
  
  // 9. Spectrophotometer Toggle
  const btnSampleDot = document.getElementById('btn-sample-dotgain');
  if (btnSampleDot) {
    btnSampleDot.addEventListener('click', () => {
      state.qcDotGainSamplerActive = !state.qcDotGainSamplerActive;
      btnSampleDot.classList.toggle('active', state.qcDotGainSamplerActive);
      elements.viewport.classList.toggle('eyedropper-active', state.qcDotGainSamplerActive);
      
      if (state.qcDotGainSamplerActive) {
        if (drawOverlay) drawOverlay.classList.add('hidden');
        if (btnAddRoi) btnAddRoi.classList.remove('active');
        if (btnAddMoire) btnAddMoire.classList.remove('active');
        showToast('Spectrophotometer active. Click image to probe.');
      } else {
        showToast('Spectrophotometer deactivated.');
      }
    });
  }
  
  // 10. Draw overlay pointer events
  if (drawOverlay) {
    drawOverlay.addEventListener('mousedown', handleRoiDrawStart);
    drawOverlay.addEventListener('mousemove', handleRoiDrawMove);
    drawOverlay.addEventListener('mouseup', handleRoiDrawEnd);
  }
  
  // 11. Coordinate Sampler Probing click on Viewport
  elements.viewport.addEventListener('click', (e) => {
    if (state.qcDotGainSamplerActive) {
      if (e.target.closest('.toolbar-container') || 
          e.target.closest('.meta-panel') || 
          e.target.closest('#print-qc-panel') || 
          e.target.closest('.sample-drawer') || 
          e.target.closest('.modal-card')) {
        return;
      }
      
      const rect = elements.viewport.getBoundingClientRect();
      const vx = e.clientX - rect.left;
      const vy = e.clientY - rect.top;
      
      const coord = mapViewportToImage(vx, vy);
      if (coord && coord.x >= 0 && coord.y >= 0) {
        processDotGainSample(coord.x, coord.y);
      }
    }
  });

  // 12. Artifacts tab: Center / Banding / Halo check buttons
  document.querySelectorAll('.btn-center-check').forEach(btn => {
    btn.addEventListener('click', () => runCenterCheck(btn.dataset.slot));
  });
  document.querySelectorAll('.btn-banding-check').forEach(btn => {
    btn.addEventListener('click', () => runBandingCheck(btn.dataset.slot));
  });
  document.querySelectorAll('.btn-halo-check').forEach(btn => {
    btn.addEventListener('click', () => runHaloCheck(btn.dataset.slot));
  });
}

// ==========================================================================
//   PRINT QC MATHEMATICS & ALGORITHMIC ENGINE
// ==========================================================================

// --- 1. COLOR SPACE TRANSLATIONS ---

// sRGB to CIE Lab (D65 illuminant white point)
function rgbToLab(rVal, gVal, bVal) {
  // Normalize and apply inverse sRGB gamma expansion
  let rL = rVal / 255;
  let gL = gVal / 255;
  let bL = bVal / 255;
  
  rL = rL <= 0.04045 ? rL / 12.92 : Math.pow((rL + 0.055) / 1.055, 2.4);
  gL = gL <= 0.04045 ? gL / 12.92 : Math.pow((gL + 0.055) / 1.055, 2.4);
  bL = bL <= 0.04045 ? bL / 12.92 : Math.pow((bL + 0.055) / 1.055, 2.4);
  
  // Linear RGB to XYZ under D65 standard illuminant reference white
  const x = 0.4124564 * rL + 0.3575761 * gL + 0.1804375 * bL;
  const y = 0.2126729 * rL + 0.7151522 * gL + 0.0721750 * bL;
  const z = 0.0193339 * rL + 0.1191920 * gL + 0.9503041 * bL;
  
  // D65 reference white variables
  const xN = 0.95047;
  const yN = 1.00000;
  const zN = 1.08883;
  
  const f = (t) => t > 0.00885645 ? Math.pow(t, 1/3) : 7.787037 * t + (16/116);
  
  const fX = f(x / xN);
  const fY = f(y / yN);
  const fZ = f(z / zN);
  
  const l = 116 * fY - 16;
  const a = 500 * (fX - fY);
  const b = 200 * (fY - fZ);
  
  return [l, a, b];
}

// Euclidean CIE76 Delta-E metric
function deltaE76(lab1, lab2) {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

// sRGB to CMYK Profile-less subtractive translation
function rgbToCmyk(r, g, b) {
  const rPct = r / 255;
  const gPct = g / 255;
  const bPct = b / 255;
  
  const k = 1 - Math.max(rPct, gPct, bPct);
  const c = k === 1 ? 0 : (1 - rPct - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - gPct - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - bPct - k) / (1 - k);
  
  return {
    c: c * 100,
    m: m * 100,
    y: y * 100,
    k: k * 100
  };
}

// --- 2. COORDINATE MAPPING PROJECTIONS ---

function mapViewportToImage(vx, vy) {
  if (!state.imageA.loaded && !state.imageB.loaded) return null;
  const rect = elements.viewport.getBoundingClientRect();
  
  let slot = 'a';
  let px = 0;
  let py = 0;
  
  if (state.mode === 'side-by-side') {
    if (vx < rect.width / 2) {
      slot = 'a';
      px = (vx - state.imageA.panX) / state.imageA.zoom;
      py = (vy - state.imageA.panY) / state.imageA.zoom;
    } else {
      slot = 'b';
      const vxRel = vx - (rect.width / 2);
      px = (vxRel - state.imageB.panX) / state.imageB.zoom;
      py = (vy - state.imageB.panY) / state.imageB.zoom;
    }
  } else if (state.mode === 'slider') {
    if (state.sliderOrientation === 'vertical') {
      if (vy < rect.height * state.sliderPos) {
        slot = 'b';
      } else {
        slot = 'a';
      }
    } else {
      if (vx < rect.width * state.sliderPos) {
        slot = 'b';
      } else {
        slot = 'a';
      }
    }
    const imgState = slot === 'a' ? state.imageA : state.imageB;
    px = (vx - imgState.panX) / imgState.zoom;
    py = (vy - imgState.panY) / imgState.zoom;
  } else if (state.mode === 'tile-grid') {
    const halfTile = state.tileSize / 2;
    const col = Math.floor(vx / halfTile);
    const row = Math.floor(vy / halfTile);
    slot = (col + row) % 2 === 0 ? 'a' : 'b';
    const imgState = slot === 'a' ? state.imageA : state.imageB;
    px = (vx - imgState.panX) / imgState.zoom;
    py = (vy - imgState.panY) / imgState.zoom;
  } else {
    slot = state.imageA.loaded ? 'a' : 'b';
    const imgState = slot === 'a' ? state.imageA : state.imageB;
    px = (vx - imgState.panX) / imgState.zoom;
    py = (vy - imgState.panY) / imgState.zoom;
  }
  
  return { slot, x: Math.round(px), y: Math.round(py) };
}

// --- 3. OVERLAYS RENDERER ---

// Resets all per-tab QC overlay state and syncs UI controls.
// Called on tab switch and by individual "Clear" buttons.
function clearQcOverlayState() {
  // State
  state.qcRegions = [];
  state.qcSamplerPin = null;
  state.qcMoireRegion = null;
  state.qcMoireActive = false;
  state.qcTacActive = false;
  state.qcScumActive = false;

  // Dot-gain sampler
  if (state.qcDotGainSamplerActive) {
    state.qcDotGainSamplerActive = false;
    const btnDot = document.getElementById('btn-sample-dotgain');
    if (btnDot) btnDot.classList.remove('active');
    if (elements.viewport) elements.viewport.classList.remove('eyedropper-active');
  }

  // Uncheck overlay toggles
  const tacChk = document.getElementById('qc-toggle-tac');
  if (tacChk) tacChk.checked = false;
  const scumChk = document.getElementById('qc-toggle-scum');
  if (scumChk) scumChk.checked = false;

  // Hide output panels
  const moireOut = document.getElementById('qc-moire-analyzer-output');
  if (moireOut) moireOut.classList.add('hidden');

  // Reset list UIs
  renderQcRegionList();

  const dotReadout = document.getElementById('qc-dotgain-readout');
  if (dotReadout) dotReadout.innerHTML = `<p class="qc-empty-text">Select sampler and click on a tonal patch to measure TVI.</p>`;
}

function renderQCOverlays() {
  // Skip all canvas work if nothing needs drawing
  const needsPixelWork = state.qcTacActive || state.qcScumActive ||
    (state.mode === 'difference' && state.diffHeatmapActive);
  const needsDraw = state.qcRegions.length > 0 || state.qcMoireActive || !!state.qcSamplerPin;

  if (!needsPixelWork && !needsDraw) {
    // Still hide the canvases if images aren't loaded
    const ca = document.getElementById('canvas-a-overlay');
    const cb = document.getElementById('canvas-b-overlay');
    if (ca) ca.classList.add('hidden');
    if (cb) cb.classList.add('hidden');
    return;
  }

  const overlayCanvasA = document.getElementById('canvas-a-overlay');
  const overlayCanvasB = document.getElementById('canvas-b-overlay');
  
  if (!overlayCanvasA || !overlayCanvasB) return;
  
  const ctxA = overlayCanvasA.getContext('2d');
  const ctxB = overlayCanvasB.getContext('2d');
  
  // Sync aspect ratios to source image sizes
  if (state.imageA.loaded && (overlayCanvasA.width !== state.imageA.width || overlayCanvasA.height !== state.imageA.height)) {
    overlayCanvasA.width = state.imageA.width;
    overlayCanvasA.height = state.imageA.height;
  }
  if (state.imageB.loaded && (overlayCanvasB.width !== state.imageB.width || overlayCanvasB.height !== state.imageB.height)) {
    overlayCanvasB.width = state.imageB.width;
    overlayCanvasB.height = state.imageB.height;
  }
  
  // Clear buffers
  ctxA.clearRect(0, 0, overlayCanvasA.width, overlayCanvasA.height);
  ctxB.clearRect(0, 0, overlayCanvasB.width, overlayCanvasB.height);
  
  // Hide canvas elements by default unless images loaded
  overlayCanvasA.classList.add('hidden');
  overlayCanvasB.classList.add('hidden');
  
  if (state.imageA.loaded) overlayCanvasA.classList.remove('hidden');
  if (state.imageB.loaded) overlayCanvasB.classList.remove('hidden');
  
  // 3.1 TAC THERMAL HEATMAP
  if (state.qcTacActive) {
    const targetSlot = state.qcTacTarget;
    const imgState = targetSlot === 'a' ? state.imageA : state.imageB;
    const targetCtx = targetSlot === 'a' ? ctxA : ctxB;
    
    if (imgState.loaded && imgState.ctx) {
      const w = imgState.width;
      const h = imgState.height;
      const srcImgData = imgState.ctx.getImageData(0, 0, w, h);
      const srcData = srcImgData.data;
      const dstImgData = targetCtx.createImageData(w, h);
      const dstData = dstImgData.data;
      
      let exceededCount = 0;
      const threshold = state.qcTacThreshold;
      const len = w * h * 4;
      
      for (let i = 0; i < len; i += 4) {
        const aVal = srcData[i + 3];
        if (aVal === 0) continue;
        
        const r = srcData[i];
        const g = srcData[i + 1];
        const b = srcData[i + 2];
        
        const rPct = r / 255;
        const gPct = g / 255;
        const bPct = b / 255;
        
        const k = 1 - Math.max(rPct, gPct, bPct);
        const c = k === 1 ? 0 : (1 - rPct - k) / (1 - k);
        const m = k === 1 ? 0 : (1 - gPct - k) / (1 - k);
        const y = k === 1 ? 0 : (1 - bPct - k) / (1 - k);
        
        const totalInk = (c + m + y + k) * 100;
        
        if (totalInk > threshold) {
          exceededCount++;
          
          const excess = totalInk - threshold;
          const maxExcess = 400 - threshold;
          const ratio = Math.min(1, excess / maxExcess);
          
          if (ratio < 0.25) {
            dstData[i] = 255;
            dstData[i + 1] = 230 - Math.floor(120 * (ratio / 0.25));
            dstData[i + 2] = 0;
            dstData[i + 3] = 180;
          } else if (ratio < 0.6) {
            dstData[i] = 255;
            dstData[i + 1] = 110 - Math.floor(110 * ((ratio - 0.25) / 0.35));
            dstData[i + 2] = 0;
            dstData[i + 3] = 200;
          } else {
            dstData[i] = 255;
            dstData[i + 1] = 0;
            dstData[i + 2] = Math.floor(60 * ((ratio - 0.6) / 0.4));
            dstData[i + 3] = 220;
          }
        }
      }
      
      targetCtx.putImageData(dstImgData, 0, 0);
      
      // Update HUD stats % area
      const areaPct = (exceededCount / (w * h)) * 100;
      const tacAreaVal = document.getElementById('qc-val-tac-area');
      if (tacAreaVal) {
        tacAreaVal.textContent = `${areaPct.toFixed(2)}%`;
      }
    }
  }
  
  // 3.2 SCUM DOT PURPLE INDICATION (B only)
  if (state.qcScumActive && state.imageA.loaded && state.imageB.loaded && state.imageA.ctx && state.imageB.ctx) {
    const w = state.imageB.width;
    const h = state.imageB.height;
    
    if (state.imageA.width === w && state.imageA.height === h) {
      const srcDataA = state.imageA.ctx.getImageData(0, 0, w, h).data;
      const srcDataB = state.imageB.ctx.getImageData(0, 0, w, h).data;
      
      let dstImgData = null;
      if (state.qcTacActive && state.qcTacTarget === 'b') {
        dstImgData = ctxB.getImageData(0, 0, w, h);
      } else {
        dstImgData = ctxB.createImageData(w, h);
      }
      const dstData = dstImgData.data;
      
      const scumThreshold = state.qcScumThreshold;
      const len = w * h * 4;
      
      for (let i = 0; i < len; i += 4) {
        const rA = srcDataA[i];
        const gA = srcDataA[i + 1];
        const bA = srcDataA[i + 2];
        const aA = srcDataA[i + 3];
        
        if (aA > 0 && rA >= 252 && gA >= 252 && bA >= 252) {
          const rB = srcDataB[i];
          const gB = srcDataB[i + 1];
          const bB = srcDataB[i + 2];
          
          const inkB = 100 - ((rB + gB + bB) / 3 / 255) * 100;
          if (inkB >= scumThreshold) {
            dstData[i] = 179;
            dstData[i + 1] = 0;
            dstData[i + 2] = 255;
            dstData[i + 3] = 210;
          }
        }
      }
      ctxB.putImageData(dstImgData, 0, 0);
    }
  }
  
  // 3.3 DRAW ROI SELECTION RECTANGLES
  const drawRois = (ctx, imgState) => {
    if (!imgState.loaded) return;
    
    state.qcRegions.forEach(roi => {
      ctx.save();
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = Math.max(2, Math.round(2 / imgState.zoom));
      ctx.setLineDash([6, 4]);
      ctx.shadowColor = 'rgba(0, 255, 204, 0.5)';
      ctx.shadowBlur = 6;
      ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
      ctx.restore();
      
      ctx.save();
      ctx.font = `bold ${Math.max(12, Math.round(12 / imgState.zoom))}px "Outfit", sans-serif`;
      const text = `${roi.label} (ΔE: ${roi.avgDeltaE.toFixed(2)})`;
      const textWidth = ctx.measureText(text).width;
      const padding = 4 / imgState.zoom;
      const textHeight = 14 / imgState.zoom;
      
      ctx.fillStyle = 'rgba(10, 10, 20, 0.82)';
      ctx.fillRect(roi.x, roi.y - textHeight - padding * 2, textWidth + padding * 2, textHeight + padding * 2);
      
      ctx.fillStyle = '#00ffcc';
      ctx.fillText(text, roi.x + padding, roi.y - padding - 2);
      ctx.restore();
    });
  };
  
  drawRois(ctxA, state.imageA);
  drawRois(ctxB, state.imageB);
  
  // 3.4 DRAW FFT ANALYZER BOX
  if (state.qcMoireActive && state.qcMoireRegion) {
    const drawMoireBox = (ctx, imgState) => {
      if (!imgState.loaded) return;
      const r = state.qcMoireRegion;
      
      ctx.save();
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = Math.max(2, Math.round(2 / imgState.zoom));
      ctx.setLineDash([4, 4]);
      ctx.shadowColor = 'rgba(255, 0, 255, 0.5)';
      ctx.shadowBlur = 6;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      ctx.restore();
      
      ctx.save();
      ctx.font = `bold ${Math.max(11, Math.round(11 / imgState.zoom))}px "Outfit", sans-serif`;
      const labelText = "FFT SAMPLE ZONE (128x128)";
      const txtW = ctx.measureText(labelText).width;
      
      ctx.fillStyle = 'rgba(10, 10, 20, 0.82)';
      ctx.fillRect(r.x, r.y - 18 / imgState.zoom, txtW + 8 / imgState.zoom, 18 / imgState.zoom);
      
      ctx.fillStyle = '#ff00ff';
      ctx.fillText(labelText, r.x + 4 / imgState.zoom, r.y - 4 / imgState.zoom);
      ctx.restore();
    };
    drawMoireBox(ctxA, state.imageA);
    drawMoireBox(ctxB, state.imageB);
  }
  
  // 3.5 DRAW SPECTROPHOTOMETER PIN
  if (state.qcSamplerPin) {
    const drawPin = (ctx, imgState) => {
      if (!imgState.loaded) return;
      const { x, y } = state.qcSamplerPin;
      
      ctx.save();
      const rOuter = Math.max(8, Math.round(8 / imgState.zoom));
      const rInner = Math.max(3, Math.round(3 / imgState.zoom));
      const lineLen = Math.max(14, Math.round(14 / imgState.zoom));
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, Math.round(2 / imgState.zoom));
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(x, y, rOuter, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = '#a064ff';
      ctx.beginPath();
      ctx.arc(x, y, rInner, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = Math.max(1.5, Math.round(1.5 / imgState.zoom));
      ctx.beginPath();
      ctx.moveTo(x, y - lineLen);
      ctx.lineTo(x, y - rInner - 2);
      ctx.moveTo(x, y + rInner + 2);
      ctx.lineTo(x, y + lineLen);
      ctx.moveTo(x - lineLen, y);
      ctx.lineTo(x - rInner - 2, y);
      ctx.moveTo(x + rInner + 2, y);
      ctx.lineTo(x + lineLen, y);
      ctx.stroke();
      
      ctx.restore();
    };
    drawPin(ctxA, state.imageA);
    drawPin(ctxB, state.imageB);
  }
  
  // 3.6 COLOR GRADIENT THERMAL MAP (Difference mode only)
  // Renders to a dedicated canvas that sits ABOVE both panes, avoiding any
  // mix-blend-mode: difference contamination from pane-b.
  const thermalCanvas = document.getElementById('thermal-canvas');
  if (state.mode === 'difference' && state.diffHeatmapActive && thermalCanvas &&
      state.imageA.loaded && state.imageB.loaded && state.imageA.ctx && state.imageB.ctx) {
    const w = state.imageB.width;
    const h = state.imageB.height;

    if (state.imageA.width === w && state.imageA.height === h) {
      // Size + position the thermal canvas to match imgB exactly
      thermalCanvas.width = w;
      thermalCanvas.height = h;
      thermalCanvas.style.transform = elements.imgB.style.transform;

      const ctxT = thermalCanvas.getContext('2d');
      let srcDataA, srcDataB;
      try {
        srcDataA = state.imageA.ctx.getImageData(0, 0, w, h).data;
        srcDataB = state.imageB.ctx.getImageData(0, 0, w, h).data;
      } catch (e) {
        // Canvas is tainted (file:// security) — cannot read pixels
        thermalCanvas.classList.add('hidden');
        showToast('⚠️ Thermal map unavailable — load images via drag & drop or HTTP server', 4000);
        return;
      }

      const dstImgData = ctxT.createImageData(w, h);
      const dstData = dstImgData.data;

      const exp = state.adjustments.exposure;
      const gam = state.adjustments.gamma;
      const scale = state.adjustments.diffScale;
      const len = w * h * 4;

      for (let i = 0; i < len; i += 4) {
        const aA = srcDataA[i + 3];
        const aB = srcDataB[i + 3];
        if (aA === 0 || aB === 0) {
          dstData[i + 3] = 0;
          continue;
        }

        let rA = srcDataA[i] / 255;
        let gA = srcDataA[i + 1] / 255;
        let bA = srcDataA[i + 2] / 255;
        let rB = srcDataB[i] / 255;
        let gB = srcDataB[i + 1] / 255;
        let bB = srcDataB[i + 2] / 255;

        rA *= exp; gA *= exp; bA *= exp;
        rB *= exp; gB *= exp; bB *= exp;

        if (gam !== 1.0) {
          const inv = 1.0 / gam;
          rA = Math.pow(Math.max(0, rA), inv);
          gA = Math.pow(Math.max(0, gA), inv);
          bA = Math.pow(Math.max(0, bA), inv);
          rB = Math.pow(Math.max(0, rB), inv);
          gB = Math.pow(Math.max(0, gB), inv);
          bB = Math.pow(Math.max(0, bB), inv);
        }

        const rawDiff = (Math.abs(rA - rB) + Math.abs(gA - gB) + Math.abs(bA - bB)) / 3;
        const boostedDiff = Math.min(1.0, rawDiff * scale);

        // Blue (hue 240) = no difference → Red (hue 0) = max difference
        const hue = 240 * (1 - boostedDiff);
        const rgb = hslToRgb(hue / 360, 1.0, 0.5);

        dstData[i]     = rgb[0];
        dstData[i + 1] = rgb[1];
        dstData[i + 2] = rgb[2];
        dstData[i + 3] = 255;
      }
      ctxT.putImageData(dstImgData, 0, 0);
      thermalCanvas.classList.remove('hidden');
    }
  } else if (thermalCanvas && !state.diffHeatmapActive) {
    thermalCanvas.classList.add('hidden');
  }
}

// --- 4. ROI DRAWING HANDLERS ---

let drawStartClientX = 0;
let drawStartClientY = 0;
let activeSelectionBox = null;

function handleRoiDrawStart(e) {
  e.stopPropagation();
  e.preventDefault();
  state.isPanning = false;
  state.qcDrawingRoi = true;
  
  const rect = elements.viewport.getBoundingClientRect();
  drawStartClientX = e.clientX;
  drawStartClientY = e.clientY;
  
  activeSelectionBox = document.createElement('div');
  activeSelectionBox.className = 'roi-selection-box';
  
  if (state.qcDrawingMode === 'moire') {
    activeSelectionBox.style.borderColor = '#ff00ff';
    activeSelectionBox.style.backgroundColor = 'rgba(255, 0, 255, 0.08)';
    activeSelectionBox.style.boxShadow = '0 0 10px rgba(255, 0, 255, 0.4)';
  }
  
  activeSelectionBox.style.left = `${e.clientX - rect.left}px`;
  activeSelectionBox.style.top = `${e.clientY - rect.top}px`;
  activeSelectionBox.style.width = '0px';
  activeSelectionBox.style.height = '0px';
  
  elements.viewport.appendChild(activeSelectionBox);
}

function handleRoiDrawMove(e) {
  e.stopPropagation();
  if (!state.qcDrawingRoi || !activeSelectionBox) return;
  
  const rect = elements.viewport.getBoundingClientRect();
  
  const startX_V = Math.max(0, Math.min(rect.width, drawStartClientX - rect.left));
  const startY_V = Math.max(0, Math.min(rect.height, drawStartClientY - rect.top));
  const currentX_V = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  const currentY_V = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
  
  const left = Math.min(startX_V, currentX_V);
  const top = Math.min(startY_V, currentY_V);
  const width = Math.abs(startX_V - currentX_V);
  const height = Math.abs(startY_V - currentY_V);
  
  activeSelectionBox.style.left = `${left}px`;
  activeSelectionBox.style.top = `${top}px`;
  activeSelectionBox.style.width = `${width}px`;
  activeSelectionBox.style.height = `${height}px`;
}

function handleRoiDrawEnd(e) {
  e.stopPropagation();
  if (!state.qcDrawingRoi) return;
  state.qcDrawingRoi = false;
  
  if (activeSelectionBox) {
    activeSelectionBox.remove();
    activeSelectionBox = null;
  }
  
  // Hide draw overlays
  const drawOverlay = document.getElementById('roi-draw-overlay');
  if (drawOverlay) drawOverlay.classList.add('hidden');
  
  const btnRoi = document.getElementById('btn-add-roi');
  const btnMoire = document.getElementById('btn-add-moire-roi');
  if (btnRoi) btnRoi.classList.remove('active');
  if (btnMoire) btnMoire.classList.remove('active');
  
  const rect = elements.viewport.getBoundingClientRect();
  const startX_V = Math.max(0, Math.min(rect.width, drawStartClientX - rect.left));
  const startY_V = Math.max(0, Math.min(rect.height, drawStartClientY - rect.top));
  const endX_V = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  const endY_V = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
  
  const left_V = Math.min(startX_V, endX_V);
  const top_V = Math.min(startY_V, endY_V);
  const width_V = Math.abs(startX_V - endX_V);
  const height_V = Math.abs(startY_V - endY_V);
  
  if (width_V < 5 || height_V < 5) {
    showToast('Selection too small. Drag and draw to select.');
    return;
  }
  
  const startImg = mapViewportToImage(left_V, top_V);
  const endImg = mapViewportToImage(left_V + width_V, top_V + height_V);
  
  const targetImg = startImg.slot === 'a' ? state.imageA : state.imageB;
  if (!targetImg.loaded) {
    showToast('Load image first before creating a region.');
    return;
  }
  
  const imgX = Math.max(0, Math.min(targetImg.width - 2, startImg.x));
  const imgY = Math.max(0, Math.min(targetImg.height - 2, startImg.y));
  const imgW = Math.max(2, Math.min(targetImg.width - imgX, endImg.x - startImg.x));
  const imgH = Math.max(2, Math.min(targetImg.height - imgY, endImg.y - startImg.y));
  
  if (state.qcDrawingMode === 'roi') {
    addQcRegion(imgX, imgY, imgW, imgH);
  } else if (state.qcDrawingMode === 'moire') {
    setMoireRegion(imgX, imgY, imgW, imgH);
  }
}

// --- 5. DELTA-E PROCESSOR ---

function addQcRegion(x, y, w, h) {
  if (!state.imageA.loaded || !state.imageB.loaded) {
    showToast('Both Image A & B must be loaded to run Delta-E.');
    return;
  }
  
  try {
    const ctxA = state.imageA.ctx;
    const ctxB = state.imageB.ctx;
    
    const finalX = Math.max(0, Math.min(state.imageA.width - 2, x));
    const finalY = Math.max(0, Math.min(state.imageA.height - 2, y));
    const finalW = Math.max(2, Math.min(state.imageA.width - finalX, w));
    const finalH = Math.max(2, Math.min(state.imageA.height - finalY, h));
    
    const dataA = ctxA.getImageData(finalX, finalY, finalW, finalH).data;
    const dataB = ctxB.getImageData(finalX, finalY, finalW, finalH).data;
    
    let sumDeltaE = 0;
    let maxDeltaE = 0;
    const numPixels = finalW * finalH;
    
    for (let i = 0; i < numPixels * 4; i += 4) {
      const rA = dataA[i];
      const gA = dataA[i + 1];
      const bA = dataA[i + 2];
      
      const rB = dataB[i];
      const gB = dataB[i + 1];
      const bB = dataB[i + 2];
      
      const labA = rgbToLab(rA, gA, bA);
      const labB = rgbToLab(rB, gB, bB);
      
      const dE = deltaE76(labA, labB);
      sumDeltaE += dE;
      if (dE > maxDeltaE) maxDeltaE = dE;
    }
    
    const avgDeltaE = sumDeltaE / numPixels;
    const defaultLabel = `Region ${state.qcRegions.length + 1}`;
    
    const newRoi = {
      id: 'roi-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      x: finalX,
      y: finalY,
      width: finalW,
      height: finalH,
      label: defaultLabel,
      avgDeltaE,
      maxDeltaE
    };
    
    state.qcRegions.push(newRoi);
    
    renderQcRegionList();
    renderQCOverlays();
    showToast(`Added ROI: ${defaultLabel}`);
  } catch (err) {
    console.error("Error creating QC ROI:", err);
    showToast('Failed to analyze selected region.');
  }
}

function deleteQcRegion(id) {
  state.qcRegions = state.qcRegions.filter(r => r.id !== id);
  renderQcRegionList();
  renderQCOverlays();
  showToast('Deleted ROI region');
}

function renderQcRegionList() {
  const container = document.getElementById('qc-roi-list');
  if (!container) return;
  
  if (state.qcRegions.length === 0) {
    container.innerHTML = `<p class="qc-empty-text">No active ROI regions. Click button above to draw on viewport.</p>`;
    return;
  }
  
  container.innerHTML = '';
  
  state.qcRegions.forEach(roi => {
    const item = document.createElement('div');
    item.className = 'qc-roi-item';
    
    let badgeClass = 'badge-pass';
    let badgeText = 'PASS';
    if (roi.maxDeltaE > 4.0) {
      badgeClass = 'badge-fail';
      badgeText = 'FAIL';
    } else if (roi.maxDeltaE >= 2.0) {
      badgeClass = 'badge-warn';
      badgeText = 'WARN';
    }
    
    item.innerHTML = `
      <div class="qc-roi-header">
        <input type="text" class="qc-roi-label-input" value="${roi.label}" title="Rename Region" data-id="${roi.id}">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="${badgeClass}">${badgeText}</span>
          <button class="qc-roi-delete-btn" data-id="${roi.id}" title="Remove Region">×</button>
        </div>
      </div>
      <div class="qc-roi-stats">
        <span>Avg ΔE: <span class="qc-roi-stat-val">${roi.avgDeltaE.toFixed(2)}</span></span>
        <span>Max ΔE: <span class="qc-roi-stat-val">${roi.maxDeltaE.toFixed(2)}</span></span>
      </div>
    `;
    
    const input = item.querySelector('.qc-roi-label-input');
    input.addEventListener('input', (e) => {
      roi.label = e.target.value;
      renderQCOverlays();
    });
    
    const delBtn = item.querySelector('.qc-roi-delete-btn');
    delBtn.addEventListener('click', () => {
      deleteQcRegion(roi.id);
    });
    
    container.appendChild(item);
  });
}

// --- 6. SPECTROPHOTOMETER TONAL QUALITY SAMPLER ---

function processDotGainSample(x, y) {
  if (!state.imageA.loaded || !state.imageB.loaded) {
    showToast('Both Image A & B must be loaded to run Dot Gain analysis.');
    return;
  }
  
  if (x < 0 || x >= state.imageA.width || y < 0 || y >= state.imageA.height) {
    return;
  }
  
  state.qcSamplerPin = { x, y };
  
  try {
    const dataA = state.imageA.ctx.getImageData(x, y, 1, 1).data;
    const dataB = state.imageB.ctx.getImageData(x, y, 1, 1).data;
    
    const cmykA = rgbToCmyk(dataA[0], dataA[1], dataA[2]);
    const cmykB = rgbToCmyk(dataB[0], dataB[1], dataB[2]);
    
    const tviC = cmykB.c - cmykA.c;
    const tviM = cmykB.m - cmykA.m;
    const tviY = cmykB.y - cmykA.y;
    const tviK = cmykB.k - cmykA.k;
    
    let dominant = 'C';
    let maxPct = cmykA.c;
    if (cmykA.m > maxPct) { dominant = 'M'; maxPct = cmykA.m; }
    if (cmykA.y > maxPct) { dominant = 'Y'; maxPct = cmykA.y; }
    if (cmykA.k > maxPct) { dominant = 'K'; maxPct = cmykA.k; }
    
    const readout = document.getElementById('qc-dotgain-readout');
    if (readout) {
      readout.innerHTML = `
        <div style="font-size: 11px; color: var(--text-light); margin-bottom: 6px; font-weight: 500;">
          Sampler Probed: X: ${x} | Y: ${y}
        </div>
        <table class="qc-dotgain-table">
          <thead>
            <tr>
              <th>Ink Channel</th>
              <th style="text-align: right;">Exp (A)</th>
              <th style="text-align: right;">Meas (B)</th>
              <th style="text-align: right;">TVI (Gain)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="${dominant === 'C' ? 'background: rgba(0, 229, 255, 0.05);' : ''}">
              <td class="qc-dotgain-chan-lbl cyan">Cyan</td>
              <td style="text-align: right;">${cmykA.c.toFixed(1)}%</td>
              <td style="text-align: right;">${cmykB.c.toFixed(1)}%</td>
              <td style="text-align: right; font-weight: bold; color: ${tviC >= 0 ? '#ff3366' : '#00ffcc'}">${tviC >= 0 ? '+' : ''}${tviC.toFixed(1)}%</td>
            </tr>
            <tr style="${dominant === 'M' ? 'background: rgba(255, 0, 255, 0.05);' : ''}">
              <td class="qc-dotgain-chan-lbl magenta">Magenta</td>
              <td style="text-align: right;">${cmykA.m.toFixed(1)}%</td>
              <td style="text-align: right;">${cmykB.m.toFixed(1)}%</td>
              <td style="text-align: right; font-weight: bold; color: ${tviM >= 0 ? '#ff3366' : '#00ffcc'}">${tviM >= 0 ? '+' : ''}${tviM.toFixed(1)}%</td>
            </tr>
            <tr style="${dominant === 'Y' ? 'background: rgba(255, 235, 59, 0.05);' : ''}">
              <td class="qc-dotgain-chan-lbl yellow">Yellow</td>
              <td style="text-align: right;">${cmykA.y.toFixed(1)}%</td>
              <td style="text-align: right;">${cmykB.y.toFixed(1)}%</td>
              <td style="text-align: right; font-weight: bold; color: ${tviY >= 0 ? '#ff3366' : '#00ffcc'}">${tviY >= 0 ? '+' : ''}${tviY.toFixed(1)}%</td>
            </tr>
            <tr style="${dominant === 'K' ? 'background: rgba(255, 255, 255, 0.05);' : ''}">
              <td class="qc-dotgain-chan-lbl black">Black (K)</td>
              <td style="text-align: right;">${cmykA.k.toFixed(1)}%</td>
              <td style="text-align: right;">${cmykB.k.toFixed(1)}%</td>
              <td style="text-align: right; font-weight: bold; color: ${tviK >= 0 ? '#ff3366' : '#00ffcc'}">${tviK >= 0 ? '+' : ''}${tviK.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      `;
    }
    
    renderQCOverlays();
  } catch (err) {
    console.error("Error sampling dot gain:", err);
    showToast('Failed to sample pixel dot values.');
  }
}

// --- 7. FAST FOURIER TRANSFORM (FFT) MOIRE ANALYZER ---

function setMoireRegion(x, y, w, h) {
  if (!state.imageA.loaded || !state.imageB.loaded) {
    showToast('Both images must be loaded to run Moiré FFT.');
    return;
  }
  
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  
  const boxX = Math.max(0, Math.min(state.imageA.width - 128, Math.round(centerX - 64)));
  const boxY = Math.max(0, Math.min(state.imageA.height - 128, Math.round(centerY - 64)));
  
  state.qcMoireRegion = {
    x: boxX,
    y: boxY,
    width: 128,
    height: 128
  };
  
  state.qcMoireActive = true;
  
  const outPanel = document.getElementById('qc-moire-analyzer-output');
  if (outPanel) outPanel.classList.remove('hidden');
  
  runMoireFFT();
  renderQCOverlays();
  
  showToast('Completed Moiré 2D FFT spectral mapping');
}

function runMoireFFT() {
  const r = state.qcMoireRegion;
  if (!r) return;
  
  try {
    const dataA = state.imageA.ctx.getImageData(r.x, r.y, 128, 128).data;
    const reA = new Float64Array(16384);
    const imA = new Float64Array(16384);
    
    const dataB = state.imageB.ctx.getImageData(r.x, r.y, 128, 128).data;
    const reB = new Float64Array(16384);
    const imB = new Float64Array(16384);
    
    for (let i = 0; i < 16384; i++) {
      const idx = i * 4;
      const lumaA = 0.2126 * dataA[idx] + 0.7152 * dataA[idx + 1] + 0.0722 * dataA[idx + 2];
      reA[i] = lumaA / 255.0;
      imA[i] = 0.0;
      
      const lumaB = 0.2126 * dataB[idx] + 0.7152 * dataB[idx + 1] + 0.0722 * dataB[idx + 2];
      reB[i] = lumaB / 255.0;
      imB[i] = 0.0;
    }
    
    fft2D(reA, imA, 128, 128);
    fft2D(reB, imB, 128, 128);
    
    const magA = renderSpectralCanvas('fft-canvas-a', reA, imA);
    const magB = renderSpectralCanvas('fft-canvas-b', reB, imB);
    
    const confidence = analyzeMoireConfidence(magA, magB);
    const confEl = document.getElementById('qc-val-moire-confidence');
    if (confEl) {
      confEl.textContent = confidence;
      confEl.className = '';
      if (confidence === 'HIGH') {
        confEl.className = 'badge-fail';
      } else if (confidence === 'MEDIUM') {
        confEl.className = 'badge-warn';
      } else {
        confEl.className = 'badge-pass';
      }
    }
  } catch (err) {
    console.error("FFT analytical exception:", err);
    showToast('Failed to compute FFT frequency map.');
  }
}

// Bit Reversal Permutation for Cooley-Tukey Radix-2 FFT
function bitReverse(re, im, n) {
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      let temp = re[i]; re[i] = re[j]; re[j] = temp;
      temp = im[i]; im[i] = im[j]; im[j] = temp;
    }
    let m = n >> 1;
    while (m >= 2 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }
}

// Cooley-Tukey 1D Radix-2 FFT
function fft1D(re, im, n) {
  bitReverse(re, im, n);
  
  for (let len = 2; len <= n; len <<= 1) {
    let angle = -2 * Math.PI / len;
    let wlen_re = Math.cos(angle);
    let wlen_im = Math.sin(angle);
    
    for (let i = 0; i < n; i += len) {
      let w_re = 1;
      let w_im = 0;
      let half = len >> 1;
      
      for (let j = 0; j < half; j++) {
        let u_re = re[i + j];
        let u_im = im[i + j];
        
        let t_re = re[i + j + half] * w_re - im[i + j + half] * w_im;
        let t_im = re[i + j + half] * w_im + im[i + j + half] * w_re;
        
        re[i + j] = u_re + t_re;
        im[i + j] = u_im + t_im;
        
        re[i + j + half] = u_re - t_re;
        im[i + j + half] = u_im - t_im;
        
        let next_w_re = w_re * wlen_re - w_im * wlen_im;
        let next_w_im = w_re * wlen_im + w_im * wlen_re;
        w_re = next_w_re;
        w_im = next_w_im;
      }
    }
  }
}

// Cooley-Tukey 2D Row-Column Decomposition FFT
function fft2D(re, im, width, height) {
  for (let y = 0; y < height; y++) {
    const rowRe = new Float64Array(width);
    const rowIm = new Float64Array(width);
    const offset = y * width;
    
    for (let x = 0; x < width; x++) {
      rowRe[x] = re[offset + x];
      rowIm[x] = im[offset + x];
    }
    
    fft1D(rowRe, rowIm, width);
    
    for (let x = 0; x < width; x++) {
      re[offset + x] = rowRe[x];
      im[offset + x] = rowIm[x];
    }
  }
  
  for (let x = 0; x < width; x++) {
    const colRe = new Float64Array(height);
    const colIm = new Float64Array(height);
    
    for (let y = 0; y < height; y++) {
      colRe[y] = re[y * width + x];
      colIm[y] = im[y * width + x];
    }
    
    fft1D(colRe, colIm, height);
    
    for (let y = 0; y < height; y++) {
      re[y * width + x] = colRe[y];
      im[y * width + x] = colIm[y];
    }
  }
}

// Shift spectrum (FFTShift) and render as logarithmic magnitude neon teal canvas
function renderSpectralCanvas(canvasId, re, im) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(120, 120);
  const dst = imgData.data;
  
  const mag = new Float64Array(16384);
  let maxMag = 0;
  
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const idx = y * 128 + x;
      const sx = (x + 64) % 128;
      const sy = (y + 64) % 128;
      const sIdx = sy * 128 + sx;
      
      const m = Math.sqrt(re[sIdx] * re[sIdx] + im[sIdx] * im[sIdx]);
      mag[idx] = m;
      
      const distToCenter = Math.sqrt((x - 64) * (x - 64) + (y - 64) * (y - 64));
      if (distToCenter > 4) {
        if (m > maxMag) maxMag = m;
      }
    }
  }
  
  if (maxMag === 0) maxMag = 1;
  
  for (let dy = 0; dy < 120; dy++) {
    const sy = Math.floor((dy / 120) * 128);
    for (let dx = 0; dx < 120; dx++) {
      const sx = Math.floor((dx / 120) * 128);
      const mVal = mag[sy * 128 + sx];
      
      const norm = Math.log(1 + mVal * 15) / Math.log(1 + maxMag * 15);
      const val = Math.max(0, Math.min(255, Math.floor(norm * 255)));
      
      const dstIdx = (dy * 120 + dx) * 4;
      dst[dstIdx] = 0;
      dst[dstIdx + 1] = val;
      dst[dstIdx + 2] = Math.floor(val * 0.85);
      dst[dstIdx + 3] = 255;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  return mag;
}

function analyzeMoireConfidence(magA, magB) {
  if (!magA || !magB) return 'LOW';
  
  const countPeaks = (mag) => {
    let peakSum = 0;
    let peakCount = 0;
    
    for (let y = 1; y < 127; y++) {
      for (let x = 1; x < 127; x++) {
        const dx = x - 64;
        const dy = y - 64;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 15) {
          const val = mag[y * 128 + x];
          peakSum += val;
          
          let isLocalMax = true;
          for (let ny = -1; ny <= 1; ny++) {
            for (let nx = -1; nx <= 1; nx++) {
              if (ny === 0 && nx === 0) continue;
              const nVal = mag[(y + ny) * 128 + (x + nx)];
              if (nVal >= val) {
                isLocalMax = false;
                break;
              }
            }
            if (!isLocalMax) break;
          }
          
          if (isLocalMax && val > 0.02) {
            peakCount++;
          }
        }
      }
    }
    return { count: peakCount, sum: peakSum };
  };
  
  const peaksA = countPeaks(magA);
  const peaksB = countPeaks(magB);
  
  const ratioCount = peaksB.count / Math.max(1, peaksA.count);
  const ratioSum = peaksB.sum / Math.max(0.0001, peaksA.sum);
  
  if (ratioCount >= 2.2 || ratioSum >= 2.0) {
    return 'HIGH';
  } else if (ratioCount >= 1.4 || ratioSum >= 1.4) {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
}

// --- 8. PERFECT CENTER ANALYSIS ---

function runCenterCheck(slot) {
  const imgState = slot === 'a' ? state.imageA : state.imageB;
  if (!imgState.loaded || !imgState.ctx) {
    showToast('Load an image first to run Center Check.');
    return;
  }

  const W = imgState.width, H = imgState.height;

  // Sample corners (5×5 each) to estimate background luma
  const sampleCorner = (x, y) => {
    const d = imgState.ctx.getImageData(x, y, 5, 5).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) {
      sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    }
    return sum / 25;
  };
  const bgLuma = (sampleCorner(0, 0) + sampleCorner(W - 5, 0) +
                  sampleCorner(0, H - 5) + sampleCorner(W - 5, H - 5)) / 4;

  // Work on a downsampled canvas for speed (max 512px wide)
  const scale = Math.min(1, 512 / Math.max(W, H));
  const sw = Math.round(W * scale), sh = Math.round(H * scale);
  const offCanvas = document.createElement('canvas');
  offCanvas.width = sw; offCanvas.height = sh;
  const offCtx = offCanvas.getContext('2d');
  offCtx.drawImage(imgState.canvas, 0, 0, sw, sh);
  const pix = offCtx.getImageData(0, 0, sw, sh).data;

  // Find foreground centroid: pixels whose luma differs from bg by > 8
  const THRESH = 8;
  let sumX = 0, sumY = 0, count = 0;
  let minX = sw, maxX = 0, minY = sh, maxY = 0;

  for (let py = 0; py < sh; py++) {
    for (let px = 0; px < sw; px++) {
      const i = (py * sw + px) * 4;
      if (pix[i + 3] < 16) continue; // skip transparent
      const luma = 0.2126 * pix[i] + 0.7152 * pix[i + 1] + 0.0722 * pix[i + 2];
      if (Math.abs(luma - bgLuma) > THRESH) {
        sumX += px; sumY += py; count++;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
  }

  const readout = document.getElementById('qc-center-readout');
  if (!readout) return;

  if (count < 100) {
    readout.innerHTML = `<p class="qc-empty-text">Not enough foreground pixels found. Try a different image or lower the background threshold.</p>`;
    return;
  }

  // Scale centroid back to image coordinates
  const centX = (sumX / count) / scale;
  const centY = (sumY / count) / scale;
  const offX = centX - W / 2;
  const offY = centY - H / 2;
  const offXpct = (offX / W) * 100;
  const offYpct = (offY / H) * 100;
  const totalOffPct = Math.sqrt(offXpct * offXpct + offYpct * offYpct);

  let badge, badgeClass;
  if (totalOffPct < 1.0) { badge = 'PASS'; badgeClass = 'badge-pass'; }
  else if (totalOffPct < 3.0) { badge = 'WARN'; badgeClass = 'badge-warn'; }
  else { badge = 'FAIL'; badgeClass = 'badge-fail'; }

  const sign = (v) => v >= 0 ? '+' : '';

  readout.innerHTML = `
    <div class="qc-center-result">
      <div class="qc-roi-header" style="margin-bottom:8px;">
        <span style="font-size:12px;font-weight:600;color:var(--text-light);">Image ${slot.toUpperCase()} Centroid</span>
        <span class="${badgeClass}">${badge}</span>
      </div>
      <table class="qc-dotgain-table">
        <tbody>
          <tr>
            <td style="color:var(--text-muted)">Centroid X</td>
            <td style="text-align:right;font-family:monospace;">${Math.round(centX)} px</td>
            <td style="text-align:right;font-family:monospace;color:${Math.abs(offXpct)>=1?'#ff3366':'#00ffcc'}">${sign(offX)}${Math.round(offX)} px (${sign(offXpct)}${offXpct.toFixed(1)}%)</td>
          </tr>
          <tr>
            <td style="color:var(--text-muted)">Centroid Y</td>
            <td style="text-align:right;font-family:monospace;">${Math.round(centY)} px</td>
            <td style="text-align:right;font-family:monospace;color:${Math.abs(offYpct)>=1?'#ff3366':'#00ffcc'}">${sign(offY)}${Math.round(offY)} px (${sign(offYpct)}${offYpct.toFixed(1)}%)</td>
          </tr>
          <tr>
            <td style="color:var(--text-muted)">Radial Offset</td>
            <td style="text-align:right;font-family:monospace;"></td>
            <td style="text-align:right;font-family:monospace;font-weight:700;color:${totalOffPct>=3?'#ff3366':totalOffPct>=1?'#ffaa00':'#00ffcc'}">${totalOffPct.toFixed(2)}%</td>
          </tr>
          <tr>
            <td style="color:var(--text-muted)">Canvas Center</td>
            <td style="text-align:right;font-family:monospace;">${Math.round(W/2)} × ${Math.round(H/2)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div style="font-size:10px;color:var(--text-dim);margin-top:8px;">PASS &lt;1% · WARN 1–3% · FAIL &gt;3%</div>
    </div>`;
}

// --- 9. BANDING DETECTOR ---

function runBandingCheck(slot) {
  const imgState = slot === 'a' ? state.imageA : state.imageB;
  if (!imgState.loaded || !imgState.canvas) {
    showToast('Load an image first to run Banding Check.');
    return;
  }

  // Downsample to ≤256 for speed
  const scale = Math.min(1, 256 / Math.max(imgState.width, imgState.height));
  const sw = Math.round(imgState.width * scale);
  const sh = Math.round(imgState.height * scale);
  const off = document.createElement('canvas');
  off.width = sw; off.height = sh;
  const offCtx = off.getContext('2d');
  offCtx.drawImage(imgState.canvas, 0, 0, sw, sh);
  const pix = offCtx.getImageData(0, 0, sw, sh).data;

  // Build luma array
  const luma = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    const p = i * 4;
    luma[i] = (0.2126 * pix[p] + 0.7152 * pix[p + 1] + 0.0722 * pix[p + 2]) / 255;
  }

  // Scan rows: count step-then-flat patterns (banding signature)
  // A band is: N pixels with near-zero gradient, then a gradient spike, then N more flat pixels
  let bandingEvents = 0;
  let totalChecked = 0;
  const FLAT_THRESH = 0.004; // ~1 unit on 8-bit
  const STEP_THRESH = 0.01;  // meaningful luminance step

  for (let y = 0; y < sh; y++) {
    for (let x = 1; x < sw - 2; x++) {
      const idx = y * sw + x;
      const d0 = Math.abs(luma[idx] - luma[idx - 1]);     // prev diff
      const d1 = Math.abs(luma[idx + 1] - luma[idx]);     // current diff
      const d2 = Math.abs(luma[idx + 2] - luma[idx + 1]); // next diff
      totalChecked++;

      // Banding signature: flat → step → flat
      if (d0 < FLAT_THRESH && d1 > STEP_THRESH && d2 < FLAT_THRESH) {
        bandingEvents++;
      }
    }
  }
  // Also scan columns
  for (let x = 0; x < sw; x++) {
    for (let y = 1; y < sh - 2; y++) {
      const idx = y * sw + x;
      const d0 = Math.abs(luma[idx] - luma[(y - 1) * sw + x]);
      const d1 = Math.abs(luma[(y + 1) * sw + x] - luma[idx]);
      const d2 = Math.abs(luma[(y + 2) * sw + x] - luma[(y + 1) * sw + x]);
      totalChecked++;
      if (d0 < FLAT_THRESH && d1 > STEP_THRESH && d2 < FLAT_THRESH) {
        bandingEvents++;
      }
    }
  }

  const score = totalChecked > 0 ? (bandingEvents / totalChecked) * 100 : 0;

  let badge, badgeClass;
  if (score < 0.5) { badge = 'PASS'; badgeClass = 'badge-pass'; }
  else if (score < 1.5) { badge = 'WARN'; badgeClass = 'badge-warn'; }
  else { badge = 'FAIL'; badgeClass = 'badge-fail'; }

  const readout = document.getElementById('qc-banding-readout');
  if (!readout) return;

  readout.innerHTML = `
    <div class="qc-roi-header" style="margin-bottom:6px;">
      <span style="font-size:12px;font-weight:600;color:var(--text-light);">Image ${slot.toUpperCase()} Banding</span>
      <span class="${badgeClass}">${badge}</span>
    </div>
    <div class="qc-stats-readout">
      <p>Step-pattern events: <span>${bandingEvents.toLocaleString()}</span></p>
      <p>Banding index: <span style="color:${score>=1.5?'#ff3366':score>=0.5?'#ffaa00':'#00ffcc'};font-weight:700;">${score.toFixed(3)}%</span></p>
    </div>
    <div style="font-size:10px;color:var(--text-dim);margin-top:6px;">PASS &lt;0.5% · WARN 0.5–1.5% · FAIL &gt;1.5%</div>`;
}

// --- 10. HALO / FRINGE DETECTOR ---

function runHaloCheck(slot) {
  const imgState = slot === 'a' ? state.imageA : state.imageB;
  if (!imgState.loaded || !imgState.canvas) {
    showToast('Load an image first to run Halo Check.');
    return;
  }

  const scale = Math.min(1, 256 / Math.max(imgState.width, imgState.height));
  const sw = Math.round(imgState.width * scale);
  const sh = Math.round(imgState.height * scale);
  const off = document.createElement('canvas');
  off.width = sw; off.height = sh;
  const offCtx = off.getContext('2d');
  offCtx.drawImage(imgState.canvas, 0, 0, sw, sh);
  const pix = offCtx.getImageData(0, 0, sw, sh).data;

  const luma = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    const p = i * 4;
    luma[i] = (0.2126 * pix[p] + 0.7152 * pix[p + 1] + 0.0722 * pix[p + 2]) / 255;
  }

  // Edge detection: mark pixels with gradient magnitude > threshold
  const EDGE_THRESH = 0.12;
  const HALO_CONTRAST_THRESH = 0.06; // brightness anomaly near edge
  const edgeMap = new Uint8Array(sw * sh);

  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const idx = y * sw + x;
      const dx = luma[idx + 1] - luma[idx - 1];
      const dy = luma[idx + sw] - luma[idx - sw];
      if (Math.sqrt(dx * dx + dy * dy) > EDGE_THRESH) edgeMap[idx] = 1;
    }
  }

  // Dilate edge map by 1px to get inner fringe zone
  const innerZone = new Uint8Array(sw * sh);
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      if (edgeMap[y * sw + x]) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx2 = -1; dx2 <= 1; dx2++) {
            innerZone[(y + dy) * sw + (x + dx2)] = 1;
          }
        }
      }
    }
  }

  // Dilate again by 3px to get outer reference zone
  const outerZone = new Uint8Array(sw * sh);
  for (let y = 3; y < sh - 3; y++) {
    for (let x = 3; x < sw - 3; x++) {
      if (edgeMap[y * sw + x]) {
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx2 = -3; dx2 <= 3; dx2++) {
            outerZone[(y + dy) * sw + (x + dx2)] = 1;
          }
        }
      }
    }
  }

  // Halo pixels: in inner fringe zone AND significantly brighter than their
  // 5×5 neighborhood average (overshoot on the bright side of an edge)
  let haloPixels = 0;
  let innerCount = 0;

  for (let y = 2; y < sh - 2; y++) {
    for (let x = 2; x < sw - 2; x++) {
      const idx = y * sw + x;
      if (!innerZone[idx] || edgeMap[idx]) continue;
      innerCount++;

      // 5×5 neighbourhood average (outer reference)
      let nbSum = 0, nbCount = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx2 = -2; dx2 <= 2; dx2++) {
          const ni = (y + dy) * sw + (x + dx2);
          if (!edgeMap[ni]) { nbSum += luma[ni]; nbCount++; }
        }
      }
      if (nbCount === 0) continue;
      const nbAvg = nbSum / nbCount;

      // Overshoot: pixel is significantly brighter OR darker than its neighborhood
      if (Math.abs(luma[idx] - nbAvg) > HALO_CONTRAST_THRESH) {
        haloPixels++;
      }
    }
  }

  const score = innerCount > 0 ? (haloPixels / innerCount) * 100 : 0;

  let badge, badgeClass;
  if (score < 5) { badge = 'PASS'; badgeClass = 'badge-pass'; }
  else if (score < 15) { badge = 'WARN'; badgeClass = 'badge-warn'; }
  else { badge = 'FAIL'; badgeClass = 'badge-fail'; }

  const readout = document.getElementById('qc-halo-readout');
  if (!readout) return;

  readout.innerHTML = `
    <div class="qc-roi-header" style="margin-bottom:6px;">
      <span style="font-size:12px;font-weight:600;color:var(--text-light);">Image ${slot.toUpperCase()} Halo/Fringe</span>
      <span class="${badgeClass}">${badge}</span>
    </div>
    <div class="qc-stats-readout">
      <p>Edge fringe pixels: <span>${innerCount.toLocaleString()}</span></p>
      <p>Halo overshoot ratio: <span style="color:${score>=15?'#ff3366':score>=5?'#ffaa00':'#00ffcc'};font-weight:700;">${score.toFixed(1)}%</span></p>
    </div>
    <div style="font-size:10px;color:var(--text-dim);margin-top:6px;">PASS &lt;5% · WARN 5–15% · FAIL &gt;15%</div>`;
}

// Standard highly-optimized HSL to RGB conversion helper
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// --- APP INIT ---
function init() {
  setupKeyboardShortcuts();
  initEvents();
  
  // Set default comparison mode
  setMode('side-by-side');
}

window.onload = init;
