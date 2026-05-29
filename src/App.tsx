import { useState } from 'react';
import { useLinearRegression, StepName } from './hooks/useLinearRegression';
import { Sidebar } from './components/Sidebar';
import { MainChart } from './components/MainChart';
import { MathPanel } from './components/MathPanel';
import { Chatbot } from './components/Chatbot';
import { TheoryPage } from './pages/TheoryPage';
import { LargeScaleSimulator } from './pages/LargeScaleSimulator';
import { Play, SkipForward, SkipBack, RotateCcw, BookOpen, Activity, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function App() {
  const lr = useLinearRegression();
  const [activeTab, setActiveTab] = useState<'simulator' | 'theory' | 'massive'>('simulator');
  const [testX, setTestX] = useState<string>('');
  const [massiveState, setMassiveState] = useState({
    datasetType: 'seattle' as 'seattle' | 'co2' | 'salaries' | 'synthetic' | 'custom',
    iteration: 0,
    mOrig: 0,
    bOrig: 0,
    learningRate: 0.1,
    mse: 0,
    normalize: true,
    isExploded: false,
    dataCount: 2000
  });

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans relative">
      {/* Top Main Navbar */}
      <nav className="w-full bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 text-slate-300 rounded-lg">
             <Activity size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-100 hidden sm:block">
            Simulador de Regresión Lineal
          </h1>
        </div>
        <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-all shrink-0 ${activeTab === 'simulator' ? 'bg-slate-700 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Activity size={18} /> Simulador
          </button>
          <button 
            onClick={() => setActiveTab('theory')}
            className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-all shrink-0 ${activeTab === 'theory' ? 'bg-slate-700 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen size={18} /> Teoría y Casos Reales
          </button>
          <button 
            onClick={() => setActiveTab('massive')}
            className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-all shrink-0 ${activeTab === 'massive' ? 'bg-slate-700 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Cpu size={18} /> Gran Escala (Miles de Datos)
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'simulator' ? (
          <>
            <Sidebar
              data={lr.data}
              setData={lr.setData}
              m={lr.m}
              setM={lr.setM}
              b={lr.b}
              setB={lr.setB}
              learningRate={lr.learningRate}
              setLearningRate={lr.setLearningRate}
              locked={lr.currentStep > 0 || lr.iteration > 0}
            />

            <main className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto relative">
              {/* Top Header Controls */}
              <header className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="text-slate-200">Iteración:</span> {lr.iteration}
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">
                      Paso actual: <span className="text-slate-300">{StepName[lr.currentStep]}</span>
                    </p>
                    {lr.calculations && (
                      <p className="text-sm text-slate-400 font-medium">
                        Error (MSE): <span className="text-slate-300 font-mono">{parseFloat(lr.calculations.mse.toFixed(6)).toString()}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 overflow-x-auto">
                  <button 
                    onClick={lr.prevStep} 
                    disabled={lr.currentStep === 0 && lr.iteration === 0}
                    className="px-3 py-2 flex items-center gap-2 text-sm font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-slate-300"
                  >
                    <SkipBack size={16} /> Anterior
                  </button>
                  <button 
                    onClick={lr.nextStep} 
                    className="px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-md bg-slate-600 hover:bg-slate-500 text-white transition-colors shadow-lg shadow-slate-500/20"
                  >
                    Siguiente <SkipForward size={16} />
                  </button>
                  <div className="w-px bg-slate-700 mx-1 shrink-0"></div>
                  <button 
                    onClick={lr.runFullIteration} 
                    className="px-3 py-2 flex items-center gap-2 text-sm font-medium rounded-md hover:bg-slate-600/30 text-slate-300 transition-colors"
                  >
                    <Play size={16} /> Iteración
                  </button>
                  <button 
                    onClick={lr.reset} 
                    className="px-3 py-2 flex items-center gap-2 text-sm font-medium rounded-md hover:bg-rose-500/20 text-rose-400 transition-colors"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </header>

              {/* Chart Area */}
              <div className="h-[360px] shrink-0">
                <MainChart data={lr.data} m={lr.m} b={lr.b} />
              </div>

              {/* Widget: Usar el modelo */}
              {(() => {
                const mNum = Number(lr.m) || 0;
                const bNum = Number(lr.b) || 0;
                const xNum = testX === '' ? null : Number(testX);
                const pred = xNum !== null && !isNaN(xNum) ? mNum * xNum + bNum : null;
                return (
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shrink-0">
                    <div className="flex flex-wrap gap-6 items-start justify-between">
                      {/* Ecuación ajustada */}
                      <div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Modelo ajustado</div>
                        <div className="font-mono text-base text-slate-200 mb-2">
                          ŷ = <span className="text-white font-bold">{parseFloat(mNum.toFixed(4))}</span> · x + <span className="text-white font-bold">{parseFloat(bNum.toFixed(4))}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span><span className="text-slate-300 font-semibold">m = {parseFloat(mNum.toFixed(4))}</span> — pendiente (cuánto sube ŷ por cada unidad de x)</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <span><span className="text-slate-300 font-semibold">b = {parseFloat(bNum.toFixed(4))}</span> — intercepto (valor de ŷ cuando x = 0, donde la recta toca el eje Y)</span>
                        </div>
                      </div>
                      {/* Input de prueba */}
                      <div className="flex items-end gap-3">
                        <div>
                          <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1.5">Probar con X =</label>
                          <input
                            type="number"
                            value={testX}
                            onChange={(e) => setTestX(e.target.value)}
                            placeholder="ej: 3"
                            className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-slate-500"
                          />
                        </div>
                        <div className="text-slate-600 pb-2">→</div>
                        <div>
                          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Resultado ŷ =</div>
                          {pred !== null ? (
                            <div>
                              <div className="font-mono font-bold text-lg text-slate-100">{parseFloat(pred.toFixed(4))}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{parseFloat(mNum.toFixed(4))}·{testX} + {parseFloat(bNum.toFixed(4))}</div>
                            </div>
                          ) : (
                            <div className="font-mono text-slate-600 text-lg">–</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Convergencia del error */}
              {lr.history.length > 0 && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Convergencia del error (MSE)</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">El modelo converge cuando la curva se aplana — los cambios en m y b son casi nulos</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">MSE actual</span>
                      <span className="font-mono font-bold text-slate-200">{parseFloat((lr.calculations?.mse ?? 0).toFixed(4))}</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={90}>
                    <LineChart data={lr.history.map(h => ({ it: h.iteration, mse: parseFloat(h.mse.toFixed(4)) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="it" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'iteración', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={55} tickFormatter={v => parseFloat(v.toFixed(2)).toString()} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 6, fontSize: 11 }}
                        labelFormatter={v => `Iteración ${v}`}
                        formatter={(v) => [v != null ? parseFloat(Number(v).toFixed(4)) : v, 'MSE']}
                      />
                      <Line type="monotone" dataKey="mse" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: '#94a3b8' }} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Chatbot — inline, desplegable hacia abajo */}
              <Chatbot
                activeTab={activeTab}
                iteration={lr.iteration}
                step={lr.currentStep}
                m={lr.m}
                b={lr.b}
                learningRate={lr.learningRate}
                mse={lr.calculations?.mse || 0}
                data={lr.data}
                gradM={lr.calculations?.gradM}
                gradB={lr.calculations?.gradB}
                massiveState={massiveState}
              />
            </main>

            <MathPanel 
              step={lr.currentStep} 
              data={lr.data} 
              m={lr.m} 
              b={lr.b} 
              learningRate={lr.learningRate} 
              calculations={lr.calculations} 
            />
          </>
        ) : activeTab === 'theory' ? (
          <TheoryPage />
        ) : (
          <LargeScaleSimulator onStateChange={setMassiveState} />
        )}
      </div>

      {/* Chatbot popup — solo visible en Teoría y Gran Escala */}
      {activeTab !== 'simulator' && (
        <Chatbot
          mode="popup"
          activeTab={activeTab}
          iteration={lr.iteration}
          step={lr.currentStep}
          m={lr.m}
          b={lr.b}
          learningRate={lr.learningRate}
          mse={lr.calculations?.mse || 0}
          data={lr.data}
          massiveState={massiveState}
        />
      )}
    </div>
  );
}

export default App;
