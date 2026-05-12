import { useState, useMemo } from 'react';

export type DataPoint = { x: number | string; y: number | string };

export const Step = {
  PREDICTIONS: 0,
  ERRORS: 1,
  MSE: 2,
  GRADIENTS: 3,
  UPDATE: 4,
} as const;

export type Step = typeof Step[keyof typeof Step];

export const StepName: Record<Step, string> = {
  0: 'PREDICTIONS',
  1: 'ERRORS',
  2: 'MSE',
  3: 'GRADIENTS',
  4: 'UPDATE',
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
  const [iteration, setIteration] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<Step>(Step.PREDICTIONS);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Calculate all current values derived from m and b
  const calculations = useMemo(() => {
    const n = data.length;
    if (n === 0) return null;

    const mNum = Number(m) || 0;
    const bNum = Number(b) || 0;
    const lrNum = Number(learningRate) || 0;

    const predictions = data.map((d) => mNum * Number(d.x) + bNum);
    const errors = data.map((d, i) => predictions[i] - Number(d.y)); // y_hat - y, careful with sign for gradient
    // Usually gradient is (2/n) * sum((y_hat - y) * x)
    // If error = y - y_hat, grad = (-2/n) * sum((y - y_hat) * x)
    // Let's use standard convention: error = predicted - actual = y_hat - y
    
    const squaredErrors = errors.map((e) => Math.pow(e, 2));
    const mse = squaredErrors.reduce((sum, sq) => sum + sq, 0) / n;
    
    const gradM = (2 / n) * data.reduce((sum, d, i) => sum + errors[i] * Number(d.x), 0);
    const gradB = (2 / n) * data.reduce((sum, _, i) => sum + errors[i], 0);

    const nextM = mNum - lrNum * gradM;
    const nextB = bNum - lrNum * gradB;

    return {
      n,
      predictions,
      errors,
      squaredErrors,
      mse,
      gradM,
      gradB,
      nextM,
      nextB
    };
  }, [data, m, b, learningRate]);

  const nextStep = () => {
    if (currentStep < Step.UPDATE) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else {
      // We are at UPDATE, so apply changes and go to next iteration
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
    } else if (iteration > 1) {
      // Go back to previous iteration's UPDATE step
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

  const reset = () => {
    setData(DEFAULT_DATA);
    setM(0);
    setB(0);
    setLearningRate(0.01);
    setIteration(1);
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
    reset
  };
}
