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

const f2 = (n: number) => n.toFixed(2);
const f4 = (n: number) => n.toFixed(4);

interface StepCardProps {
  stepId: Step;
  currentStep: Step;
  title: string;
  children: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ stepId, currentStep, title, children }) => {
  if (currentStep < stepId) return null;
  const isActive = currentStep === stepId;
  return (
    <div className={`rounded-xl border transition-colors ${isActive ? 'bg-slate-700/30 border-slate-600/50' : 'bg-slate-900/50 border-slate-700'}`}>
      <div className="flex items-center gap-2 p-3 border-b border-slate-700/50">
        <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 ${isActive ? 'bg-slate-400 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
          {stepId + 1}
        </span>
        <h3 className={`font-semibold text-sm ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
};

const FormulaBox: React.FC<{ children: React.ReactNode; sub?: string }> = ({ children, sub }) => (
  <div className="bg-slate-950 rounded-lg px-3 py-2 text-xs font-mono border border-slate-800 mb-3">
    <div className="text-slate-300">{children}</div>
    {sub && <div className="text-slate-500 text-[10px] mt-0.5 font-sans">{sub}</div>}
  </div>
);

const ResultRow: React.FC<{ label: React.ReactNode; value: React.ReactNode }> = ({ label, value }) => (
  <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 flex justify-between items-center text-xs">
    <span className="text-slate-400 font-mono">{label}</span>
    <span className="text-slate-200 font-bold">{value}</span>
  </div>
);

export const MathPanel: React.FC<MathPanelProps> = ({ step, m, b, learningRate, calculations }) => {
  if (!calculations) return null;

  const mNum = Number(m) || 0;
  const bNum = Number(b) || 0;
  const lrNum = Number(learningRate) || 0;
  const { n, points, predictions, errors, squaredErrors, mse, gradM, gradB, nextM, nextB } = calculations;

  const sumSqErrors: number = squaredErrors.reduce((s: number, v: number) => s + v, 0);
  const sumErrors: number  = errors.reduce((s: number, v: number) => s + v, 0);
  const errorsByX: number[] = points.map((d: { x: number }, i: number) => errors[i] * d.x);
  const sumErrorsByX: number = errorsByX.reduce((s: number, v: number) => s + v, 0);

  return (
    <aside className="w-full xl:w-[440px] bg-slate-800 p-4 flex flex-col gap-3 border-l border-slate-700 overflow-y-auto shrink-0">
      <h2 className="text-lg font-bold text-slate-100 px-1">Cálculos Paso a Paso</h2>

      {/* PASO 1: PREDICCIONES */}
      <StepCard stepId={Step.PREDICTIONS} currentStep={step} title="Cálculo de ŷ (predicciones)">
        <FormulaBox sub="predicción = pendiente · x + intercepto">
          ŷᵢ = m · xᵢ + b &nbsp;=&nbsp;
          <span className="text-slate-100">{f4(mNum)}</span> · xᵢ +{' '}
          <span className="text-slate-100">{f4(bNum)}</span>
        </FormulaBox>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="pb-1.5 text-left font-medium">i</th>
                <th className="pb-1.5 text-left font-medium">x (entrada)</th>
                <th className="pb-1.5 text-left font-medium">y (real)</th>
                <th className="pb-1.5 text-left font-medium text-slate-400">m·x + b</th>
                <th className="pb-1.5 text-right font-medium">ŷ (pred.)</th>
              </tr>
            </thead>
            <tbody>
              {points.map((d: { x: number; y: number }, i: number) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-1 text-slate-500">{i + 1}</td>
                  <td className="py-1">{d.x}</td>
                  <td className="py-1">{d.y}</td>
                  <td className="py-1 text-slate-500 font-mono">
                    {f4(mNum)}·{d.x} + {f4(bNum)}
                  </td>
                  <td className="py-1 text-right text-slate-200 font-semibold">{f4(predictions[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StepCard>

      {/* PASO 2: ERROR POR DATO */}
      <StepCard stepId={Step.ERRORS} currentStep={step} title="Cálculo del error por dato (eᵢ)">
        <FormulaBox sub="error = predicción − valor real">eᵢ = ŷᵢ − yᵢ</FormulaBox>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="pb-1.5 text-left font-medium">i</th>
                <th className="pb-1.5 text-left font-medium">ŷ (pred.)</th>
                <th className="pb-1.5 text-left font-medium">y (real)</th>
                <th className="pb-1.5 text-left font-medium text-slate-400">ŷ − y</th>
                <th className="pb-1.5 text-right font-medium">e (error)</th>
              </tr>
            </thead>
            <tbody>
              {points.map((d: { x: number; y: number }, i: number) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-1 text-slate-500">{i + 1}</td>
                  <td className="py-1 font-mono">{f4(predictions[i])}</td>
                  <td className="py-1">{d.y}</td>
                  <td className="py-1 text-slate-500 font-mono">
                    {f4(predictions[i])} − {d.y}
                  </td>
                  <td className="py-1 text-right text-orange-400 font-semibold">{f4(errors[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StepCard>

      {/* PASO 3: ERROR CUADRÁTICO */}
      <StepCard stepId={Step.SQUARED_ERRORS} currentStep={step} title="Cálculo del error cuadrático (eᵢ²)">
        <FormulaBox sub="error² = (predicción − real)²  — penaliza errores grandes">eᵢ² = (ŷᵢ − yᵢ)²</FormulaBox>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="pb-1.5 text-left font-medium">i</th>
                <th className="pb-1.5 text-left font-medium">e (error)</th>
                <th className="pb-1.5 text-left font-medium text-slate-400">(e)²</th>
                <th className="pb-1.5 text-right font-medium">e² (error²)</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e: number, i: number) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-1 text-slate-500">{i + 1}</td>
                  <td className="py-1 text-orange-400 font-mono">{f4(e)}</td>
                  <td className="py-1 text-slate-500 font-mono">({f4(e)})²</td>
                  <td className="py-1 text-right text-slate-200 font-semibold">{f4(squaredErrors[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StepCard>

      {/* PASO 4: ERROR TOTAL (MSE) */}
      <StepCard stepId={Step.MSE} currentStep={step} title="Cálculo del error total del modelo (J)">
        <FormulaBox sub="costo J = promedio de todos los errores²  — queremos minimizarlo">J = (1/n) · Σ eᵢ²</FormulaBox>
        <div className="space-y-2 text-xs">
          <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400 break-all">
            <span className="text-slate-500">Σ eᵢ² = </span>
            {squaredErrors.slice(0, 5).map((sq: number, i: number) => (
              <span key={i}>{i > 0 ? ' + ' : ''}{f2(sq)}</span>
            ))}
            {squaredErrors.length > 5 && <span> + …</span>}
          </div>
          <div className="bg-slate-900 rounded border border-slate-800 p-2 text-xs font-mono text-slate-400">= {f4(sumSqErrors)}</div>
          <div className="bg-slate-900 rounded border border-slate-800 p-2 flex justify-between items-center">
            <span className="text-slate-400 font-mono text-xs">
              J = {f4(sumSqErrors)} / {n}
            </span>
            <span className="text-slate-200 font-bold text-sm">= {f4(mse)}</span>
          </div>
        </div>
      </StepCard>

      {/* PASO 5: CONSTRUCCIÓN DE MATRICES */}
      <StepCard stepId={Step.MATRICES} currentStep={step} title="Construcción de matrices">
        <FormulaBox>Organizar X y e para el cálculo vectorial de gradientes</FormulaBox>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-900 rounded border border-slate-800 p-2">
            <div className="text-slate-500 text-[11px] font-semibold mb-1.5">Vector X (entradas)</div>
            {points.map((d: { x: number }, i: number) => (
              <div key={i} className="font-mono text-xs text-slate-300">
                x<sub>{i + 1}</sub> = {d.x}
              </div>
            ))}
          </div>
          <div className="bg-slate-900 rounded border border-slate-800 p-2">
            <div className="text-slate-500 text-[11px] font-semibold mb-1.5">Vector e (errores)</div>
            {errors.map((e: number, i: number) => (
              <div key={i} className="font-mono text-xs text-orange-400">
                e<sub>{i + 1}</sub> = {f4(e)}
              </div>
            ))}
          </div>
        </div>
        <div className="text-slate-500 text-[11px] font-semibold mb-1.5">
          Productos eᵢ · xᵢ <span className="font-normal text-slate-600">(para ∂J/∂m)</span>
        </div>
        <div className="overflow-x-auto mb-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="pb-1.5 text-left font-medium">i</th>
                <th className="pb-1.5 text-left font-medium">eᵢ</th>
                <th className="pb-1.5 text-left font-medium">xᵢ</th>
                <th className="pb-1.5 text-right font-medium">eᵢ · xᵢ</th>
              </tr>
            </thead>
            <tbody>
              {points.map((d: { x: number }, i: number) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-1 text-slate-500">{i + 1}</td>
                  <td className="py-1 text-orange-400 font-mono">{f4(errors[i])}</td>
                  <td className="py-1 font-mono">{d.x}</td>
                  <td className="py-1 text-right text-slate-300 font-mono">{f4(errorsByX[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1.5">
          <ResultRow label="Σ (eᵢ · xᵢ) =" value={f4(sumErrorsByX)} />
          <ResultRow label="Σ eᵢ =" value={f4(sumErrors)} />
        </div>
      </StepCard>

      {/* PASO 6: GRADIENTES */}
      <StepCard stepId={Step.GRADIENTS} currentStep={step} title="Cálculo de gradientes">
        <div className="space-y-4">
          <div>
            <div className="text-slate-400 text-xs font-semibold mb-1.5">Gradiente respecto a b (intercepto):</div>
            <FormulaBox sub="gradiente de b = dirección para reducir el costo ajustando el intercepto">∂J/∂b = (2/n) · Σ eᵢ</FormulaBox>
            <div className="space-y-1 text-xs">
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                = (2 / {n}) · ({f4(sumErrors)})
              </div>
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                = {f4(2 / n)} · ({f4(sumErrors)})
              </div>
              <ResultRow label="∂J/∂b =" value={f4(gradB)} />
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-semibold mb-1.5">Gradiente respecto a m (pendiente):</div>
            <FormulaBox sub="gradiente de m = dirección para reducir el costo ajustando la pendiente">∂J/∂m = (2/n) · Σ (eᵢ · xᵢ)</FormulaBox>
            <div className="space-y-1 text-xs">
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                = (2 / {n}) · ({f4(sumErrorsByX)})
              </div>
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                = {f4(2 / n)} · ({f4(sumErrorsByX)})
              </div>
              <ResultRow label="∂J/∂m =" value={f4(gradM)} />
            </div>
          </div>
        </div>
      </StepCard>

      {/* PASO 7: ACTUALIZACIÓN */}
      <StepCard stepId={Step.UPDATE} currentStep={step} title="Actualización de parámetros del modelo">
        <FormulaBox sub="nuevo parámetro = parámetro actual  −  tasa de aprendizaje (α) × gradiente">param_nuevo = param − α · ∂J/∂param</FormulaBox>
        <div className="space-y-4">
          <div>
            <div className="text-slate-400 text-xs font-semibold mb-1.5">Actualización de m (pendiente):</div>
            <div className="space-y-1 text-xs">
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                m_nuevo (pendiente) = m − α · (∂J/∂m)
              </div>
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                = {f4(mNum)} − {lrNum} · ({f4(gradM)})
              </div>
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                = {f4(mNum)} − ({f4(lrNum * gradM)})
              </div>
              <ResultRow label="m_nuevo =" value={f4(nextM)} />
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-semibold mb-1.5">Actualización de b (intercepto):</div>
            <div className="space-y-1 text-xs">
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                b_nuevo (intercepto) = b − α · (∂J/∂b)
              </div>
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                = {f4(bNum)} − {lrNum} · ({f4(gradB)})
              </div>
              <div className="bg-slate-900 rounded border border-slate-800 p-2 font-mono text-slate-400">
                = {f4(bNum)} − ({f4(lrNum * gradB)})
              </div>
              <ResultRow label="b_nuevo =" value={f4(nextB)} />
            </div>
          </div>
        </div>
      </StepCard>
    </aside>
  );
};
