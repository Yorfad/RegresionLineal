import React, { useState } from 'react';
import type { DataPoint } from '../hooks/useLinearRegression';
import { Settings, Plus, Trash2, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarProps {
  data: DataPoint[];
  setData: React.Dispatch<React.SetStateAction<DataPoint[]>>;
  m: number | string;
  setM: (m: number | string) => void;
  b: number | string;
  setB: (b: number | string) => void;
  learningRate: number | string;
  setLearningRate: (lr: number | string) => void;
  locked: boolean;
}

const parsePasteData = (raw: string): DataPoint[] => {
  const result: DataPoint[] = [];
  const lines = raw.trim().split(/[\n\r;]+/);
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const nums = t.split(/[\s,]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    for (let i = 0; i + 1 < nums.length; i += 2) {
      result.push({ x: nums[i], y: nums[i + 1] });
    }
  }
  return result;
};


export const Sidebar: React.FC<SidebarProps> = ({
  data, setData, m, setM, b, setB, learningRate, setLearningRate, locked,
}) => {
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState('');

  const handleAddPoint = () => {
    if (locked) return;
    setData([...data, { x: 0, y: 0 }]);
  };

  const handleRemovePoint = (index: number) => {
    if (locked) return;
    setData(data.filter((_, i) => i !== index));
  };

  const handleUpdatePoint = (index: number, field: 'x' | 'y', value: string) => {
    if (locked) return;
    const numValue = value === '' ? '' : parseFloat(value);
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: isNaN(numValue as number) ? '' : numValue };
    setData(newData);
  };

  const handleApplyPaste = () => {
    if (locked) return;
    const parsed = parsePasteData(pasteText);
    if (parsed.length < 2) {
      setPasteError('Se necesitan al menos 2 pares válidos (x, y).');
      return;
    }
    setData(parsed);
    setPasteText('');
    setPasteError('');
    setShowPaste(false);
  };

  return (
    <aside className="w-full md:w-80 bg-slate-800 p-6 flex flex-col gap-6 border-r border-slate-700 overflow-y-auto shrink-0">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300">
          <Settings size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Linear Sim</h1>
      </div>

      {/* Lock banner */}
      {locked && (
        <div className="flex items-center gap-2 bg-slate-700/40 border border-slate-600/50 rounded-lg px-3 py-2 text-xs text-slate-300">
          <Lock size={13} className="shrink-0 text-slate-400" />
          <span>Reinicia para editar los parámetros y datos</span>
        </div>
      )}

      {/* Parámetros iniciales */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Parámetros Iniciales</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Pendiente inicial (m)</label>
          <input
            type="number"
            step="0.1"
            value={m}
            readOnly={locked}
            onChange={(e) => { if (!locked) setM(e.target.value === '' ? '' : parseFloat(e.target.value)); }}
            className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-slate-200 focus:outline-none transition-colors ${locked ? 'border-slate-800 opacity-50 cursor-not-allowed pointer-events-none' : 'border-slate-700 focus:border-slate-500 focus:ring-1 focus:ring-slate-500'}`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Intercepto inicial (b)</label>
          <input
            type="number"
            step="0.1"
            value={b}
            readOnly={locked}
            onChange={(e) => { if (!locked) setB(e.target.value === '' ? '' : parseFloat(e.target.value)); }}
            className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-slate-200 focus:outline-none transition-colors ${locked ? 'border-slate-800 opacity-50 cursor-not-allowed pointer-events-none' : 'border-slate-700 focus:border-slate-500 focus:ring-1 focus:ring-slate-500'}`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Learning Rate (α)</label>
          <input
            type="number"
            step="0.001"
            value={learningRate}
            readOnly={locked}
            onChange={(e) => { if (!locked) setLearningRate(e.target.value === '' ? '' : parseFloat(e.target.value)); }}
            className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-slate-200 focus:outline-none transition-colors ${locked ? 'border-slate-800 opacity-50 cursor-not-allowed pointer-events-none' : 'border-slate-700 focus:border-slate-500 focus:ring-1 focus:ring-slate-500'}`}
          />
        </div>
      </div>

      {/* Datos X, Y */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">Datos (X, Y)</h2>
          <button
            onClick={handleAddPoint}
            disabled={locked}
            className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                disabled={locked}
                onChange={(e) => handleUpdatePoint(index, 'x', e.target.value)}
                className={`w-full bg-slate-900 border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none transition-colors ${locked ? 'border-slate-800 opacity-50 cursor-not-allowed' : 'border-slate-700 focus:border-slate-500'}`}
              />
              <input
                type="number"
                value={point.y}
                disabled={locked}
                onChange={(e) => handleUpdatePoint(index, 'y', e.target.value)}
                className={`w-full bg-slate-900 border rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none transition-colors ${locked ? 'border-slate-800 opacity-50 cursor-not-allowed' : 'border-slate-700 focus:border-slate-500'}`}
              />
              <button
                onClick={() => handleRemovePoint(index)}
                disabled={locked}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pegar datos */}
      {!locked && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Pegar Datos</h2>
            <button
              onClick={() => { setShowPaste(p => !p); setPasteError(''); }}
              className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPaste ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {showPaste && (
            <div className="space-y-2">
              <p className="text-sm text-slate-400">
                Pega pares <code className="bg-slate-900 px-1 rounded text-slate-300">x,y</code> separados por coma, espacio o salto de línea.
              </p>
              <textarea
                rows={4}
                value={pasteText}
                onChange={(e) => { setPasteText(e.target.value); setPasteError(''); }}
                placeholder={'1,2\n3,4\n5,6'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-slate-500 resize-none"
              />
              {pasteError && (
                <p className="text-xs text-rose-400">{pasteError}</p>
              )}
              <button
                onClick={handleApplyPaste}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                Aplicar datos
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
