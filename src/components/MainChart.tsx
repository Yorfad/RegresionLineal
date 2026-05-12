import React from 'react';
import { Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import type { DataPoint } from '../hooks/useLinearRegression';

interface MainChartProps {
  data: DataPoint[];
  m: number | string;
  b: number | string;
}

export const MainChart: React.FC<MainChartProps> = ({ data, m, b }) => {
  // To draw the regression line, we need to span across the data's X range
  const minX = Math.min(...data.map(d => Number(d.x))) - 1;
  const maxX = Math.max(...data.map(d => Number(d.x))) + 1;
  
  const lineData = [
    { x: minX, y: Number(m) * minX + Number(b) },
    { x: maxX, y: Number(m) * maxX + Number(b) }
  ];

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={[0, 'auto']} 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8' }} 
          />
          <YAxis 
            dataKey="y" 
            type="number" 
            domain={[0, 'auto']} 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8' }} 
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
          />
          <Scatter name="Datos" data={data} fill="#3b82f6" />
          <Line 
            name="Regresión" 
            data={lineData} 
            dataKey="y" 
            type="linear" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={false} 
            isAnimationActive={true} 
            animationDuration={500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
