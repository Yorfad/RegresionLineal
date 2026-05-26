import React, { useRef, useEffect, useState } from 'react';

export interface ChartDataPoint {
  x: number;
  y: number;
}

interface CanvasChartProps {
  data: ChartDataPoint[];
  m: number; // original scale slope
  b: number; // original scale intercept
  xLabel: string;
  yLabel: string;
}

export const CanvasChart: React.FC<CanvasChartProps> = ({ data, m, b, xLabel, yLabel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Get data boundaries
  const bounds = React.useMemo(() => {
    if (data.length === 0) {
      return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      if (d.x < minX) minX = d.x;
      if (d.x > maxX) maxX = d.x;
      if (d.y < minY) minY = d.y;
      if (d.y > maxY) maxY = d.y;
    }

    // Add padding to bounds
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    const padFactor = 0.1;
    
    // If data values are strictly positive, clamp bounds to 0, otherwise allow negative values
    const minXBound = minX >= 0 ? Math.max(0, minX - dx * padFactor) : minX - dx * padFactor;
    const minYBound = minY >= 0 ? Math.max(0, minY - dy * padFactor) : minY - dy * padFactor;

    return {
      minX: minXBound,
      maxX: maxX + dx * padFactor,
      minY: minYBound,
      maxY: maxY + dy * padFactor,
    };
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      // Set display size
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      // Set actual resolution (multiply by devicePixelRatio for crisp rendering)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      draw(rect.width, rect.height);
    };

    const draw = (width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      // Design settings
      const padding = { top: 30, right: 30, bottom: 50, left: 75 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Coordinate converter helper functions
      const getCanvasX = (valX: number) => {
        return padding.left + ((valX - bounds.minX) / (bounds.maxX - bounds.minX)) * chartWidth;
      };

      const getCanvasY = (valY: number) => {
        return padding.top + chartHeight - ((valY - bounds.minY) / (bounds.maxY - bounds.minY)) * chartHeight;
      };

      // 1. Draw Grid Lines & Axes
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.lineWidth = 1;
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8'; // slate-400

      const xTicks = 6;
      for (let i = 0; i < xTicks; i++) {
        const valX = bounds.minX + (i * (bounds.maxX - bounds.minX)) / (xTicks - 1);
        const x = getCanvasX(valX);
        
        // Grid line
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();

        // Label
        ctx.textAlign = 'center';
        ctx.fillText(valX.toLocaleString(undefined, { maximumFractionDigits: 1 }), x, padding.top + chartHeight + 20);
      }

      const yTicks = 6;
      for (let i = 0; i < yTicks; i++) {
        const valY = bounds.minY + (i * (bounds.maxY - bounds.minY)) / (yTicks - 1);
        const y = getCanvasY(valY);

        // Grid line
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();

        // Label
        ctx.textAlign = 'right';
        ctx.fillText(valY.toLocaleString(undefined, { maximumFractionDigits: 1 }), padding.left - 12, y + 4);
      }

      // Axis labels
      ctx.fillStyle = '#cbd5e1'; // slate-300
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      
      // X Axis Label
      ctx.fillText(xLabel, padding.left + chartWidth / 2, padding.top + chartHeight + 42);

      // Y Axis Label (Rotated)
      ctx.save();
      ctx.translate(20, padding.top + chartHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();

      // 2. Draw Data Points
      if (data.length > 0) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'; // Blue semi-transparent
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'; // Blue outline
        ctx.lineWidth = 0.5;

        // Draw points
        // If data size is huge, optimize drawing
        const pointRadius = data.length > 2000 ? 2 : 3;

        for (const point of data) {
          const cx = getCanvasX(point.x);
          const cy = getCanvasY(point.y);

          // Only draw if inside bounds
          if (cx >= padding.left && cx <= padding.left + chartWidth && cy >= padding.top && cy <= padding.top + chartHeight) {
            ctx.beginPath();
            ctx.arc(cx, cy, pointRadius, 0, 2 * Math.PI);
            ctx.fill();
            if (data.length < 1000) {
              ctx.stroke();
            }
          }
        }
      }

      // 3. Draw Regression Line
      if (!isNaN(m) && !isNaN(b)) {
        const x1 = bounds.minX;
        const y1 = m * x1 + b;
        const x2 = bounds.maxX;
        const y2 = m * x2 + b;

        const lx1 = getCanvasX(x1);
        const ly1 = getCanvasY(y1);
        const lx2 = getCanvasX(x2);
        const ly2 = getCanvasY(y2);

        // Draw line with a neon emerald glow
        ctx.save();
        ctx.strokeStyle = '#10b981'; // emerald-500
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.moveTo(lx1, ly1);
        ctx.lineTo(lx2, ly2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Highlight Hovered Point if any
      if (hoveredPoint) {
        const hx = getCanvasX(hoveredPoint.x);
        const hy = getCanvasY(hoveredPoint.y);

        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#f59e0b'; // amber-500
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      }
    };

    // Initial draw
    resizeCanvas();

    // Listen to resize
    window.addEventListener('resize', resizeCanvas);
    
    // Mutation/Resize observer on container
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      resizeObserver.disconnect();
    };
  }, [data, m, b, bounds, hoveredPoint, xLabel, yLabel]);

  // Handle hover interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0 || data.length > 10000) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { top: 30, right: 30, bottom: 50, left: 75 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Convert pixel to data values
    let closestPoint: ChartDataPoint | null = null;
    let minDistance = Infinity;

    for (const point of data) {
      const px = padding.left + ((point.x - bounds.minX) / (bounds.maxX - bounds.minX)) * chartWidth;
      const py = padding.top + chartHeight - ((point.y - bounds.minY) / (bounds.maxY - bounds.minY)) * chartHeight;

      const dist = Math.hypot(x - px, y - py);
      // Hover threshold: 10 pixels
      if (dist < 10 && dist < minDistance) {
        minDistance = dist;
        closestPoint = point;
      }
    }

    if (closestPoint) {
      setHoveredPoint(closestPoint);
      setTooltipPos({ x: e.clientX - rect.left + 15, y: e.clientY - rect.top - 40 });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Dynamic Custom Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute bg-slate-900/95 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs shadow-xl pointer-events-none z-10 font-mono"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-sans font-semibold text-blue-400 mb-0.5">Punto Seleccionado</div>
          <div>X: {hoveredPoint.x.toLocaleString(undefined, { maximumFractionDigits: 3 })}</div>
          <div>Y: {hoveredPoint.y.toLocaleString(undefined, { maximumFractionDigits: 3 })}</div>
          <div className="text-emerald-400 mt-0.5">
            Pred: {(m * hoveredPoint.x + b).toLocaleString(undefined, { maximumFractionDigits: 3 })}
          </div>
          <div className="text-rose-400">
            Error: {(m * hoveredPoint.x + b - hoveredPoint.y).toLocaleString(undefined, { maximumFractionDigits: 3 })}
          </div>
        </div>
      )}
    </div>
  );
};
