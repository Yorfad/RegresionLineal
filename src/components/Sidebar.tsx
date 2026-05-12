import React from 'react';
import type { DataPoint } from '../hooks/useLinearRegression';
import { Settings, Plus, Trash2 } from 'lucide-react';

interface SidebarProps {
  data: DataPoint[];
  setData: React.Dispatch<React.SetStateAction<DataPoint[]>>;
  m: number | string;
  setM: (m: number | string) => void;
  b: number | string;
  setB: (b: number | string) => void;
  learningRate: number | string;
  setLearningRate: (lr: number | string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ data, setData, m, setM, b, setB, learningRate, setLearningRate }) => {
  const handleAddPoint = () => {
    setData([...data, { x: 0, y: 0 }]);
  };

  const handleRemovePoint = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleUpdatePoint = (index: number, field: 'x' | 'y', value: string) => {
    const numValue = value === '' ? '' : parseFloat(value);
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: isNaN(numValue as number) ? '' : numValue };
    setData(newData);
  };
  return (
    <aside className="w-full md:w-80 bg-slate-800 p-6 flex flex-col gap-6 border-r border-slate-700 overflow-y-auto shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <Settings size={24} />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Linear Sim
        </h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Parámetros Iniciales</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Pendiente inicial (m)</label>
          <input
            type="number"
            step="0.1"
            value={m}
            onChange={(e) => setM(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Intercepto inicial (b)</label>
          <input
            type="number"
            step="0.1"
            value={b}
            onChange={(e) => setB(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Learning Rate (α)</label>
          <input
            type="number"
            step="0.001"
            value={learningRate}
            onChange={(e) => setLearningRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">Datos (X, Y)</h2>
          <button 
            onClick={handleAddPoint}
            className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {data.map((point, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="number"
                value={point.x}
                onChange={(e) => handleUpdatePoint(index, 'x', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <input
                type="number"
                value={point.y}
                onChange={(e) => handleUpdatePoint(index, 'y', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                onClick={() => handleRemovePoint(index)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* We can add m and b direct controls here if needed, but the simulation drives them */}
    </aside>
  );
};
