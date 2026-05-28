import React from 'react';
import { Step, type DataPoint } from '../hooks/useLinearRegression';

interface MathPanelProps {
  step: Step;
  data: DataPoint[];
  m: number | string;
  b: number | string;
  learningRate: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calculations: any;
}

export const MathPanel: React.FC<MathPanelProps> = ({ step, data, m, b, learningRate, calculations }) => {
  if (!calculations) return null;

  return (
    <aside className="w-full xl:w-96 bg-slate-800 p-6 flex flex-col gap-6 border-l border-slate-700 overflow-y-auto shrink-0">
      <h2 className="text-xl font-bold text-slate-100">Cálculos Paso a Paso</h2>
      
      {/* PREDICTIONS STEP */}
      {step >= Step.PREDICTIONS && (
        <div className={`rounded-xl p-4 border transition-colors ${step === Step.PREDICTIONS ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-900/50 border-slate-700'}`}>
          <h3 className="text-slate-200 font-semibold mb-2">1. Predicciones (ŷ)</h3>
          <p className="text-sm text-slate-400 mb-3">Fórmula: ŷ = mx + b</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="pb-2">X</th>
                  <th className="pb-2">Y</th>
                  <th className="pb-2 text-slate-300">ŷ</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="py-1.5">{d.x}</td>
                    <td className="py-1.5">{d.y}</td>
                    <td className="py-1.5 text-slate-300 font-medium">{calculations.predictions[i].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ERRORS STEP */}
      {step >= Step.ERRORS && (
        <div className={`rounded-xl p-4 border transition-colors ${step === Step.ERRORS ? 'bg-orange-500/10 border-orange-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
          <h3 className="text-orange-400 font-semibold mb-2">2. Errores</h3>
          <p className="text-sm text-slate-400 mb-3">Error = ŷ - Y</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="pb-2">ŷ</th>
                  <th className="pb-2">Y</th>
                  <th className="pb-2 text-orange-400">Error</th>
                  <th className="pb-2">Error²</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="py-1.5">{calculations.predictions[i].toFixed(2)}</td>
                    <td className="py-1.5">{d.y}</td>
                    <td className="py-1.5 text-orange-400 font-medium">{calculations.errors[i].toFixed(2)}</td>
                    <td className="py-1.5">{calculations.squaredErrors[i].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MSE STEP */}
      {step >= Step.MSE && (
        <div className={`rounded-xl p-4 border transition-colors ${step === Step.MSE ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-900/50 border-slate-700'}`}>
          <h3 className="text-slate-200 font-semibold mb-2">3. Error Cuadrático Medio</h3>
          <p className="text-sm text-slate-400 mb-2">Promedio de los errores al cuadrado (J).</p>
          <div className="bg-slate-950 p-3 rounded-lg flex items-center justify-center border border-slate-800">
            <span className="text-xl font-bold text-slate-200">J = {calculations.mse.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* GRADIENTS STEP */}
      {step >= Step.GRADIENTS && (
        <div className={`rounded-xl p-4 border transition-colors ${step === Step.GRADIENTS ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-900/50 border-slate-700'}`}>
          <h3 className="text-slate-200 font-semibold mb-2">4. Gradientes (Derivadas)</h3>
          <p className="text-sm text-slate-400 mb-2">Calculamos la pendiente de la curva de error respecto a m y b.</p>
          <div className="space-y-2">
            <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">∂J/∂m =</span>
              <span className="text-slate-300 font-medium">{calculations.gradM.toFixed(4)}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">∂J/∂b =</span>
              <span className="text-slate-300 font-medium">{calculations.gradB.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STEP */}
      {step >= Step.UPDATE && (
        <div className={`rounded-xl p-4 border transition-colors ${step === Step.UPDATE ? 'bg-rose-500/10 border-rose-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
          <h3 className="text-rose-400 font-semibold mb-2">5. Actualización</h3>
          <p className="text-sm text-slate-400 mb-2">Multiplicamos el gradiente por el Learning Rate ({learningRate}) y lo restamos.</p>
          <div className="space-y-3 mt-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Nuevo m = m - (α × ∂J/∂m)</p>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">{Number(m).toFixed(4)} - ({learningRate} × {calculations.gradM.toFixed(4)}) =</span>
                <span className="text-rose-400 font-bold">{calculations.nextM.toFixed(4)}</span>
              </div>
            </div>
            <div className="h-px bg-slate-700 w-full"></div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Nuevo b = b - (α × ∂J/∂b)</p>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">{Number(b).toFixed(4)} - ({learningRate} × {calculations.gradB.toFixed(4)}) =</span>
                <span className="text-rose-400 font-bold">{calculations.nextB.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
