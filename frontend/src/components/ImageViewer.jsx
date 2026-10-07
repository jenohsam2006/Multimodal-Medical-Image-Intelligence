import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn, ZoomOut, RotateCcw, Sliders, Eye, EyeOff, Layers,
  Crosshair, Sun, Sparkles, Maximize2, Move
} from 'lucide-react';

export default function ImageViewer({
  imageData,
  heatmapData,
  findings = [],
  selectedFindingId = null,
  onSelectFinding = () => {},
  isPoorQuality = false
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Layer toggles
  const [showBoxes, setShowBoxes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMasks, setShowMasks] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(65); // 0 - 100%

  // Windowing / Leveling controls
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);

  // Mouse coordinate tracker
  const [cursorCoord, setCursorCoord] = useState(null);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Reset viewport
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setInvert(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  // Panning handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) { // left click
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }

    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top) / rect.height;
      if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
        setCursorCoord({
          x: Math.round(normX * 1024),
          y: Math.round(normY * 1024),
          normX: normX.toFixed(2),
          normY: normY.toFixed(2)
        });
      } else {
        setCursorCoord(null);
      }
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Focus on finding
  useEffect(() => {
    if (selectedFindingId && findings.length > 0) {
      const target = findings.find(f => f.id === selectedFindingId);
      if (target && target.box) {
        // Center pan near the box
        const centerX = (target.box.xmin + target.box.xmax) / 2;
        const centerY = (target.box.ymin + target.box.ymax) / 2;
        // Subtle pan shift
        setZoom(1.35);
        setPan({ x: (0.5 - centerX) * 200, y: (0.5 - centerY) * 200 });
      }
    }
  }, [selectedFindingId]);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl text-slate-100">
      {/* Top Toolbar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition font-medium ${
              showBoxes
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Bounding Box Overlays"
          >
            <Layers className="w-3.5 h-3.5" />
            Boxes
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition font-medium ${
              showHeatmap
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Grad-CAM Attention Heatmap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Heatmap
          </button>

          <button
            onClick={() => setShowMasks(!showMasks)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition font-medium ${
              showMasks
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Segmentation Mask Contours"
          >
            <Layers className="w-3.5 h-3.5 rotate-45" />
            Masks
          </button>
        </div>

        {/* Heatmap Opacity Slider (when enabled) */}
        {showHeatmap && heatmapData && (
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-400">Heatmap Alpha:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
              className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="font-mono text-[11px] w-7 text-right text-rose-400">{heatmapOpacity}%</span>
          </div>
        )}

        {/* Radiology Image Adjustments (Windowing/Leveling) */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-1 px-2" title="Adjust Brightness">
            <Sun className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="50"
              max="180"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 px-2" title="Adjust Contrast">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="50"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <button
            onClick={() => setInvert(!invert)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
              invert ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Invert Grayscale (Radiological Negative)"
          >
            Invert LUT
          </button>
        </div>

        {/* Viewport Zoom & Reset */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1 text-slate-300">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative flex-1 min-h-[460px] max-h-[580px] bg-black radiology-grid flex items-center justify-center overflow-hidden cursor-crosshair select-none"
      >
        {imageData ? (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
              transformOrigin: 'center center'
            }}
            className="relative inline-block"
          >
            {/* Base Medical Radiograph */}
            <img
              ref={imageRef}
              src={imageData}
              alt="Chest Radiograph"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(1)' : ''}`,
                maxWidth: '480px',
                maxHeight: '480px',
                display: 'block'
              }}
              className="rounded-lg shadow-2xl pointer-events-none"
              draggable={false}
            />

            {/* Grad-CAM Heatmap Layer */}
            {showHeatmap && heatmapData && (
              <img
                src={heatmapData}
                alt="Grad-CAM Activation Map"
                style={{
                  opacity: heatmapOpacity / 100,
                  mixBlendMode: 'screen',
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
                className="rounded-lg"
              />
            )}

            {/* SVG Overlay for Bounding Boxes and Segmentation Masks */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Segmentation Polygons */}
              {showMasks && findings.map((finding) => {
                if (!finding.mask || !finding.mask.points || finding.mask.points.length === 0) return null;
                const isSelected = finding.id === selectedFindingId;
                const pointsStr = finding.mask.points
                  .map(([x, y]) => `${x * 100},${y * 100}`)
                  .join(' ');

                return (
                  <polygon
                    key={`mask-${finding.id}`}
                    points={pointsStr}
                    fill={finding.color || '#ef4444'}
                    fillOpacity={isSelected ? 0.35 : 0.20}
                    stroke={finding.color || '#ef4444'}
                    strokeWidth={isSelected ? 0.8 : 0.45}
                    strokeDasharray={isSelected ? '1.5 1' : 'none'}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Bounding Boxes */}
              {showBoxes && findings.map((finding) => {
                if (!finding.box) return null;
                const { ymin, xmin, ymax, xmax } = finding.box;
                const isSelected = finding.id === selectedFindingId;
                const width = (xmax - xmin) * 100;
                const height = (ymax - ymin) * 100;

                return (
                  <g
                    key={`box-${finding.id}`}
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => onSelectFinding(finding.id)}
                  >
                    {/* Bounding Rectangle */}
                    <rect
                      x={xmin * 100}
                      y={ymin * 100}
                      width={width}
                      height={height}
                      fill={isSelected ? (finding.color || '#ef4444') : 'transparent'}
                      fillOpacity={isSelected ? 0.15 : 0}
                      stroke={finding.color || '#ef4444'}
                      strokeWidth={isSelected ? 0.85 : 0.55}
                      strokeDasharray={isSelected ? 'none' : '2.5 1.5'}
                      rx="1"
                    />

                    {/* Corner Reticle Accents */}
                    <line x1={xmin * 100} y1={ymin * 100} x2={xmin * 100 + 4} y2={ymin * 100} stroke={finding.color || '#ef4444'} strokeWidth={1} />
                    <line x1={xmin * 100} y1={ymin * 100} x2={xmin * 100} y2={ymin * 100 + 4} stroke={finding.color || '#ef4444'} strokeWidth={1} />
                    <line x1={xmax * 100} y1={ymax * 100} x2={xmax * 100 - 4} y2={ymax * 100} stroke={finding.color || '#ef4444'} strokeWidth={1} />
                    <line x1={xmax * 100} y1={ymax * 100} x2={xmax * 100} y2={ymax * 100 - 4} stroke={finding.color || '#ef4444'} strokeWidth={1} />
                  </g>
                );
              })}
            </svg>

            {/* HTML Floating Badges for Findings */}
            {showBoxes && findings.map((finding) => {
              if (!finding.box) return null;
              const { ymin, xmin } = finding.box;
              const isSelected = finding.id === selectedFindingId;

              return (
                <div
                  key={`badge-${finding.id}`}
                  style={{
                    position: 'absolute',
                    top: `${ymin * 100}%`,
                    left: `${xmin * 100}%`,
                    transform: 'translateY(-100%)'
                  }}
                  onClick={() => onSelectFinding(finding.id)}
                  className={`cursor-pointer px-2 py-0.5 rounded-t-md text-[10px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md scale-105 z-20'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:bg-slate-800 z-10'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: finding.color || '#ef4444' }}
                  />
                  <span>{finding.finding_name.split('(')[0].trim()}</span>
                  <span className="font-mono text-[9px] opacity-80">{Math.round(finding.confidence)}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 text-slate-500">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No Medical Radiograph Loaded</p>
            <p className="text-xs opacity-75 mt-1">Upload a chest X-ray or select a benchmark case to begin analysis</p>
          </div>
        )}

        {/* Live Coordinate Crosshair Overlay */}
        {cursorCoord && (
          <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[10px] font-mono px-2 py-1 rounded text-slate-400 flex items-center gap-2 pointer-events-none">
            <Crosshair className="w-3 h-3 text-blue-400" />
            <span>X: {cursorCoord.x} px</span>
            <span>Y: {cursorCoord.y} px</span>
            <span className="text-slate-500">[{cursorCoord.normX}, {cursorCoord.normY}]</span>
          </div>
        )}

        {/* Quality Banner if degraded */}
        {isPoorQuality && (
          <div className="absolute top-2 left-2 bg-rose-500/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Non-Diagnostic Quality Alert Active
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>Modality: <strong className="text-slate-300">Chest Radiograph (PA/AP)</strong></span>
          <span>•</span>
          <span>Active Overlays: <strong className="text-slate-300">
            {[showBoxes && 'Boxes', showHeatmap && 'Heatmap', showMasks && 'Masks'].filter(Boolean).join(', ') || 'None'}
          </strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>Drag to pan • Click box to inspect • Invert for subtle margins</span>
        </div>
      </div>
    </div>
  );
}
