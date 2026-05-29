import { useState, useMemo } from 'react';

export type DataPoint = { x: number | string; y: number | string };

export const Step = {
  PREDICTIONS: 0,
  ERRORS: 1,
  SQUARED_ERRORS: 2,
  MSE: 3,
  MATRICES: 4,
  GRADIENTS: 5,
  UPDATE: 6,
} as const;

export type Step = typeof Step[keyof typeof Step];

export const StepName: Record<Step, string> = {
  0: 'Predicciones (ŷ)',
  1: 'Error por dato',
  2: 'Error cuadrático',
  3: 'MSE (Error total)',
  4: 'Construcción de matrices',
  5: 'Gradientes',
  6: 'Actualización',
};

export interface HistoryRecord {
  iteration: number;
  m: number;
  b: number;
  mse: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 5 },
  { x: 4, y: 4 },
  { x: 5, y: 5 },
];

export function useLinearRegression() {
  const [data, setData] = useState<DataPoint[]>(DEFAULT_DATA);
  const [m, setM] = useState<number | string>(0);
  const [b, setB] = useState<number | string>(0);
  const [learningRate, setLearningRate] = useState<number | string>(0.01);
  const [iteration, setIteration] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<Step>(Step.PREDICTIONS);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const calculations = useMemo(() => {
    const cleanData = data
      .map((d) => ({
        x: d.x === '' ? NaN : Number(d.x),
        y: d.y === '' ? NaN : Number(d.y),
      }))
      .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

    const n = cleanData.length;
    if (n === 0) return null;

    const mNum = Number(m) || 0;
    const bNum = Number(b) || 0;
    const lrNum = Number(learningRate) || 0;

    const predictions = cleanData.map((d) => mNum * d.x + bNum);
    const errors = cleanData.map((d, i) => predictions[i] - d.y);
    const squaredErrors = errors.map((e) => Math.pow(e, 2));
    const mse = squaredErrors.reduce((sum, sq) => sum + sq, 0) / n;

    const gradM = (2 / n) * cleanData.reduce((sum, d, i) => sum + errors[i] * d.x, 0);
    const gradB = (2 / n) * cleanData.reduce((sum, _, i) => sum + errors[i], 0);

    const nextM = mNum - lrNum * gradM;
    const nextB = bNum - lrNum * gradB;

    return {
      n,
      points: cleanData,
      predictions,
      errors,
      squaredErrors,
      mse,
      gradM,
      gradB,
      nextM,
      nextB,
    };
  }, [data, m, b, learningRate]);

  const nextStep = () => {
    if (currentStep < Step.UPDATE) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else {
      if (calculations) {
        setHistory((prev) => [...prev, { iteration, m: Number(m) || 0, b: Number(b) || 0, mse: calculations.mse }]);
        setM(calculations.nextM);
        setB(calculations.nextB);
        setIteration((prev) => prev + 1);
        setCurrentStep(Step.PREDICTIONS);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > Step.PREDICTIONS) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else if (iteration > 0) {
      const lastRecord = history[history.length - 1];
      if (lastRecord) {
        setM(lastRecord.m);
        setB(lastRecord.b);
        setIteration(lastRecord.iteration);
        setHistory((prev) => prev.slice(0, -1));
        setCurrentStep(Step.UPDATE);
      }
    }
  };

  const runFullIteration = () => {
    if (calculations) {
      setHistory((prev) => [...prev, { iteration, m: Number(m) || 0, b: Number(b) || 0, mse: calculations.mse }]);
      setM(calculations.nextM);
      setB(calculations.nextB);
      setIteration((prev) => prev + 1);
      setCurrentStep(Step.PREDICTIONS);
    }
  };

  const runMultipleIterations = (epochsCount: number) => {
    let localM = Number(m) || 0;
    let localB = Number(b) || 0;
    const lrNum = Number(learningRate) || 0.01;

    const cleanData = data
      .map((d) => ({
        x: d.x === '' ? NaN : Number(d.x),
        y: d.y === '' ? NaN : Number(d.y),
      }))
      .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

    const n = cleanData.length;
    if (n === 0) return;

    let localIteration = iteration;
    const tempHistory = [...history];

    for (let step = 0; step < epochsCount; step++) {
      let gradM = 0;
      let gradB = 0;
      let errorSumSq = 0;

      for (let i = 0; i < n; i++) {
        const xVal = cleanData[i].x;
        const yVal = cleanData[i].y;
        const pred = localM * xVal + localB;
        const error = pred - yVal;
        gradM += error * xVal;
        gradB += error;
        errorSumSq += error * error;
      }

      gradM = (2 / n) * gradM;
      gradB = (2 / n) * gradB;

      tempHistory.push({
        iteration: localIteration,
        m: localM,
        b: localB,
        mse: errorSumSq / n,
      });

      localM = localM - lrNum * gradM;
      localB = localB - lrNum * gradB;
      localIteration++;
    }

    setM(localM);
    setB(localB);
    setIteration(localIteration);
    setHistory(tempHistory);
    setCurrentStep(Step.PREDICTIONS);
  };

  // Exact solution using normal equations — no gradient descent needed
  const solveAnalytically = () => {
    const cleanData = data
      .map((d) => ({ x: d.x === '' ? NaN : Number(d.x), y: d.y === '' ? NaN : Number(d.y) }))
      .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));
    const n = cleanData.length;
    if (n < 2) return;
    const sumX  = cleanData.reduce((s, d) => s + d.x, 0);
    const sumY  = cleanData.reduce((s, d) => s + d.y, 0);
    const sumXY = cleanData.reduce((s, d) => s + d.x * d.y, 0);
    const sumX2 = cleanData.reduce((s, d) => s + d.x * d.x, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return;
    const newM = (n * sumXY - sumX * sumY) / denom;
    const newB = (sumY - newM * sumX) / n;
    setHistory((prev) => [...prev, { iteration, m: Number(m) || 0, b: Number(b) || 0, mse: calculations?.mse ?? 0 }]);
    setM(newM);
    setB(newB);
    setIteration((prev) => prev + 1);
    setCurrentStep(Step.PREDICTIONS);
  };

  const reset = () => {
    setData(DEFAULT_DATA);
    setM(0);
    setB(0);
    setLearningRate(0.01);
    setIteration(0);
    setCurrentStep(Step.PREDICTIONS);
    setHistory([]);
  };

  return {
    data,
    setData,
    m,
    setM,
    b,
    setB,
    learningRate,
    setLearningRate,
    iteration,
    currentStep,
    calculations,
    history,
    nextStep,
    prevStep,
    runFullIteration,
    runMultipleIterations,
    solveAnalytically,
    reset,
  };
}
