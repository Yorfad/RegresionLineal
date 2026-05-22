import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Play, Pause, SkipForward, RotateCcw, AlertTriangle, Cpu, HelpCircle, Upload, Check, Sparkles } from 'lucide-react';
import { CanvasChart } from '../components/CanvasChart';
import 'katex/dist/katex.min.css';

interface DataPoint {
  x: number;
  y: number;
}

// Deterministic random number generator with seed
const createRandomGenerator = (seed: number) => {
  let s = seed;
  return () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
};

// Generates 2,000 houses: Size in sqft (800 - 4500) vs. Price ($120k - $800k)
const generateSeattleHousing = (): DataPoint[] => {
  const rand = createRandomGenerator(42);
  const data: DataPoint[] = [];
  for (let i = 0; i < 2000; i++) {
    const x = 800 + rand() * 3700;
    const noise = (rand() - 0.5) * 70 + (rand() - 0.5) * 30;
    const y = 0.16 * x + 45 + noise;
    data.push({ x: Math.round(x), y: Math.round(y * 10) / 10 });
  }
  return data;
};

// Generates 1,500 cars: Engine Displacement (L) vs CO2 emissions (g/km)
const generateCO2Emissions = (): DataPoint[] => {
  const rand = createRandomGenerator(123);
  const data: DataPoint[] = [];
  for (let i = 0; i < 1500; i++) {
    const x = 1.0 + rand() * 5.2;
    const noise = (rand() - 0.5) * 30;
    const y = 42 * x + 95 + noise;
    data.push({ x: Math.round(x * 10) / 10, y: Math.round(y) });
  }
  return data;
};

// Generates 1,200 devs: Experience (years) vs. Salary ($k)
const generateTechSalaries = (): DataPoint[] => {
  const rand = createRandomGenerator(999);
  const data: DataPoint[] = [];
  for (let i = 0; i < 1200; i++) {
    const x = rand() * 20;
    const noise = (rand() - 0.5) * 16 + (rand() - 0.5) * 8;
    const y = 7.6 * x + 58 + noise;
    data.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }
  return data;
};

// Theoretical explanation of computation and AI at scale
const computationTheory = `
## 🧠 La Computación Moderna y la IA en la Regresión Lineal

A nivel universitario, es fácil calcular una regresión con 5 o 10 puntos de datos en una pizarra o en Excel. Sin embargo, en problemas del mundo real y sistemas de Inteligencia Artificial (como las redes neuronales que procesan textos o imágenes), los modelos se entrenan con **millones de registros** y **miles de variables de entrada**.

Aquí es donde entra la intersección entre las matemáticas, el hardware y la ingeniería de software:

### 1. El Desafío Computacional del Escalado: Complejidad $O(N)$
En el **Descenso de Gradiente Clásico (Batch)**, para actualizar la pendiente $m$ y el intercepto $b$ una sola vez, debemos calcular la predicción y el error para **cada uno de los $N$ registros**:
$$ \\frac{\\partial J}{\\partial m} = \\frac{2}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i)x_i $$

Si el dataset tiene 1,000,000 de registros, ¡una sola actualización requiere un millón de sumas y multiplicaciones! Si necesitamos 5,000 iteraciones para llegar al mínimo, el procesador tendrá que calcular **5,000 millones de operaciones**. 
* En sistemas reales, se utiliza una variante llamada **Descenso de Gradiente Estocástico por Mini-Lotes (Mini-batch SGD)**, que divide los datos en pedazos pequeños (ej. 32 o 64 puntos) y actualiza los parámetros tras evaluar cada pedazo. Esto acelera el aprendizaje y reduce la memoria requerida dramáticamente.

### 2. Paralelización Masiva: El poder de las GPUs y TPUs
Una CPU tradicional (el procesador de tu computadora) tiene entre 4 y 16 núcleos muy potentes y optimizados para ejecutar tareas secuenciales muy complejas una tras otra. En cambio, una **GPU (unidad de procesamiento gráfico)** posee **miles de núcleos pequeños** diseñados para realizar operaciones matemáticas simples de forma simultánea.

La regresión lineal se expresa en álgebra lineal como un simple producto de matrices:
$$ \\hat{Y} = X W + B $$

En lugar de recorrer los datos en un bucle \`for\` secuencial, la IA moderna envía toda la matriz de datos a la GPU. Los miles de núcleos de la GPU calculan en paralelo la predicción de cada registro al mismo tiempo. Lo que a una CPU secuencial le tomaría segundos, una GPU lo calcula en una fracción de milisegundo. Las **TPUs (Tensor Processing Units)** van un paso más allá, estando físicamente diseñadas en circuitos dedicados exclusivamente a la multiplicación matricial para IA.

### 3. Frameworks Modernos (PyTorch, TensorFlow y Autograd)
En este simulador, calculamos la derivada parcial a mano: derivamos $J$ respecto a $m$ y escribimos la fórmula explícita en código TypeScript. 
En proyectos de IA reales, las redes neuronales tienen miles de capas interconectadas y es imposible derivar las ecuaciones de forma manual. Frameworks como **PyTorch** y **TensorFlow** utilizan **Diferenciación Automática (Autograd)**.
A medida que la computadora realiza las predicciones de forma "hacia adelante" (Forward Pass), el framework construye un grafo computacional dinámico. Luego, al calcular el error, realiza una propagación hacia atrás (**Backpropagation**) aplicando la regla de la cadena para obtener automáticamente los gradientes de todos los parámetros del modelo, sin importar qué tan complejas sean las fórmulas.
`;

export const LargeScaleSimulator: React.FC = () => {
  const [datasetType, setDatasetType] = useState<'seattle' | 'co2' | 'salaries' | 'synthetic' | 'custom'>('seattle');
  
  // Custom synthetic data config
  const [numPoints, setNumPoints] = useState<number>(1000);
  const [trueM, setTrueM] = useState<number>(3.5);
  const [trueB, setTrueB] = useState<number>(20);
  const [noiseLevel, setNoiseLevel] = useState<number>(15);

  // Custom pasted CSV data config
  const [csvText, setCsvText] = useState<string>(
    "// Pega tus datos aquí en columnas (X Y), separados por coma, espacio o tabulación.\n" +
    "// Ejemplo:\n" +
    "10, 45\n" +
    "15, 62\n" +
    "20, 78\n" +
    "25, 93\n" +
    "30, 110\n" +
    "35, 125\n" +
    "40, 142\n" +
    "45, 160\n" +
    "50, 175"
  );
  const [csvSuccessMessage, setCsvSuccessMessage] = useState<string | null>(null);

  // Data states
  const [data, setData] = useState<DataPoint[]>([]);
  const [xLabel, setXLabel] = useState<string>('Tamaño de Casa (pies cuadrados)');
  const [yLabel, setYLabel] = useState<string>('Precio ($ Mil)');

  // Normalization configuration
  const [normalize, setNormalize] = useState<boolean>(true);

  // Model parameters (normalized space if normalized is true, else original space)
  const [mNorm, setMNorm] = useState<number>(0);
  const [bNorm, setBNorm] = useState<number>(0);

  // Model parameters in original scale (always updated for displaying and rendering)
  const [mOrig, setMOrig] = useState<number>(0);
  const [bOrig, setBOrig] = useState<number>(0);

  // Hyperparameters
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [trainingSpeed, setTrainingSpeed] = useState<number>(10); // epochs per tick

  // Training metrics
  const [iteration, setIteration] = useState<number>(0);
  const [mse, setMse] = useState<number>(0); // original scale MSE
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in ms
  const [history, setHistory] = useState<{ iteration: number; mse: number }[]>([]);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const requestRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);

  // Calculate bounding boxes of dataset
  const dataStats = useMemo(() => {
    if (data.length === 0) return { minX: 0, maxX: 1, minY: 0, maxY: 1, rangeX: 1, rangeY: 1 };
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      minX,
      maxX,
      minY,
      maxY,
      rangeX: maxX - minX || 1,
      rangeY: maxY - minY || 1
    };
  }, [data]);

  // Load / Generate datasets
  useEffect(() => {
    setIsRunning(false);
    resetModel();

    if (datasetType === 'seattle') {
      setData(generateSeattleHousing());
      setXLabel('Tamaño de Casa (pies cuadrados)');
      setYLabel('Precio ($ Mil USD)');
      setLearningRate(0.1); // High stable rate with normalization
    } else if (datasetType === 'co2') {
      setData(generateCO2Emissions());
      setXLabel('Cilindrada del Motor (Litros)');
      setYLabel('Emisión de CO2 (g/km)');
      setLearningRate(0.1);
    } else if (datasetType === 'salaries') {
      setData(generateTechSalaries());
      setXLabel('Años de Experiencia');
      setYLabel('Salario Anual ($ Mil USD)');
      setLearningRate(0.1);
    } else if (datasetType === 'synthetic') {
      generateSyntheticData();
    }
  }, [datasetType]);

  // Handle synthetic data generation
  const generateSyntheticData = () => {
    setIsRunning(false);
    resetModel();
    const rand = createRandomGenerator(777);
    const generated: DataPoint[] = [];
    for (let i = 0; i < numPoints; i++) {
      const x = rand() * 100;
      const noise = (rand() - 0.5) * noiseLevel * 2;
      const y = trueM * x + trueB + noise;
      generated.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }
    setData(generated);
    setXLabel('Variable Independiente (X)');
    setYLabel('Variable Dependiente (Y)');
    setLearningRate(0.1);
  };

  // Parse pasted CSV text
  const handleParseCsv = () => {
    setIsRunning(false);
    resetModel();
    try {
      const lines = csvText.split('\n');
      const parsed: DataPoint[] = [];
      
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('//') || line.startsWith('#')) continue;
        
        // Split by comma, tab or spaces
        const parts = line.split(/[,\t\s]+/).map(p => parseFloat(p.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          parsed.push({ x: parts[0], y: parts[1] });
        }
      }

      if (parsed.length < 2) {
        alert('Por favor ingresa al menos 2 puntos de datos válidos con formato: X Y');
        return;
      }

      setData(parsed);
      setXLabel('Datos Personalizados (X)');
      setYLabel('Datos Personalizados (Y)');
      setLearningRate(0.01);
      setCsvSuccessMessage(`¡Importado con éxito! Se cargaron ${parsed.length} puntos.`);
      setTimeout(() => setCsvSuccessMessage(null), 3000);
    } catch (e) {
      alert('Error parsing data. Asegúrate de ingresar números organizados en dos columnas.');
    }
  };

  // Calculate current MSE and sync parameters to original scale
  useEffect(() => {
    if (data.length === 0) return;

    let calculatedM = 0;
    let calculatedB = 0;

    if (normalize) {
      // Convert normalized weights back to original coordinates
      // y_norm = mNorm * x_norm + bNorm
      // (y - minY)/rangeY = mNorm * (x - minX)/rangeX + bNorm
      // y = mNorm * (rangeY / rangeX) * x + [bNorm * rangeY + minY - mNorm * minX * (rangeY / rangeX)]
      calculatedM = mNorm * (dataStats.rangeY / dataStats.rangeX);
      calculatedB = (bNorm - mNorm * (dataStats.minX / dataStats.rangeX)) * dataStats.rangeY + dataStats.minY;
    } else {
      calculatedM = mNorm;
      calculatedB = bNorm;
    }

    setMOrig(calculatedM);
    setBOrig(calculatedB);

    // Check for explosion
    if (isNaN(calculatedM) || isNaN(calculatedB) || !isFinite(calculatedM) || !isFinite(calculatedB)) {
      setIsExploded(true);
      setIsRunning(false);
      setMse(Infinity);
      return;
    }

    // Calculate real scale MSE
    let errorSumSq = 0;
    for (let i = 0; i < data.length; i++) {
      const pred = calculatedM * data[i].x + calculatedB;
      const diff = pred - data[i].y;
      errorSumSq += diff * diff;
    }
    const currentMse = errorSumSq / data.length;
    setMse(currentMse);
  }, [data, mNorm, bNorm, normalize, dataStats]);

  // Reset training state
  const resetModel = () => {
    setIsRunning(false);
    setIsExploded(false);
    setMNorm(0);
    setBNorm(0);
    setIteration(0);
    setElapsedTime(0);
    setHistory([]);
    prevTimeRef.current = null;
  };

  // Single step gradient descent logic
  const stepGradientDescent = (lr: number) => {
    const n = data.length;
    if (n === 0 || isExploded) return;

    let gradM = 0;
    let gradB = 0;

    if (normalize) {
      // Calculate gradients in normalized space [0, 1]
      for (let i = 0; i < n; i++) {
        const x_norm = (data[i].x - dataStats.minX) / dataStats.rangeX;
        const y_norm = (data[i].y - dataStats.minY) / dataStats.rangeY;

        const pred = mNorm * x_norm + bNorm;
        const error = pred - y_norm;

        gradM += error * x_norm;
        gradB += error;
      }

      gradM = (2 / n) * gradM;
      gradB = (2 / n) * gradB;

      const nextMNorm = mNorm - lr * gradM;
      const nextBNorm = bNorm - lr * gradB;

      setMNorm(nextMNorm);
      setBNorm(nextBNorm);
    } else {
      // Calculate gradients in raw original space
      for (let i = 0; i < n; i++) {
        const pred = mNorm * data[i].x + bNorm; // mNorm and bNorm are original space here
        const error = pred - data[i].y;

        gradM += error * data[i].x;
        gradB += error;
      }

      gradM = (2 / n) * gradM;
      gradB = (2 / n) * gradB;

      const nextM = mNorm - lr * gradM;
      const nextB = bNorm - lr * gradB;

      setMNorm(nextM);
      setBNorm(nextB);
    }
  };

  // Execute batch of steps
  const runBatch = (stepsCount: number) => {
    if (isExploded) return;
    
    const startTime = performance.now();
    let currentIt = iteration;
    
    // We execute intermediate updates locally to avoid React re-rendering overhead
    let localMNorm = mNorm;
    let localBNorm = bNorm;
    const localHistory = [...history];

    const n = data.length;
    const { minX, rangeX, minY, rangeY } = dataStats;

    for (let step = 0; step < stepsCount; step++) {
      let gradM = 0;
      let gradB = 0;
      let errorSumSq = 0;

      if (normalize) {
        // Normalized training
        for (let i = 0; i < n; i++) {
          const x_norm = (data[i].x - minX) / rangeX;
          const y_norm = (data[i].y - minY) / rangeY;
          const pred = localMNorm * x_norm + localBNorm;
          const error = pred - y_norm;

          gradM += error * x_norm;
          gradB += error;
          errorSumSq += error * error;
        }

        gradM = (2 / n) * gradM;
        gradB = (2 / n) * gradB;

        localMNorm = localMNorm - learningRate * gradM;
        localBNorm = localBNorm - learningRate * gradB;

        // original MSE for history
        const localMOrig = localMNorm * (rangeY / rangeX);
        const localBOrig = (localBNorm - localMNorm * (minX / rangeX)) * rangeY + minY;
        
        let realErrorSq = 0;
        for (let i = 0; i < n; i++) {
          const p = localMOrig * data[i].x + localBOrig;
          const diff = p - data[i].y;
          realErrorSq += diff * diff;
        }
        const currentMse = realErrorSq / n;

        currentIt++;
        if (currentIt % Math.max(1, Math.round(stepsCount / 10)) === 0 || step === stepsCount - 1) {
          localHistory.push({ iteration: currentIt, mse: currentMse });
        }

        if (isNaN(localMNorm) || isNaN(localBNorm) || !isFinite(localMNorm) || !isFinite(localBNorm)) {
          setIsExploded(true);
          break;
        }
      } else {
        // Raw training
        for (let i = 0; i < n; i++) {
          const pred = localMNorm * data[i].x + localBNorm;
          const error = pred - data[i].y;

          gradM += error * data[i].x;
          gradB += error;
          errorSumSq += error * error;
        }

        gradM = (2 / n) * gradM;
        gradB = (2 / n) * gradB;

        localMNorm = localMNorm - learningRate * gradM;
        localBNorm = localBNorm - learningRate * gradB;
        
        const currentMse = errorSumSq / n;
        currentIt++;
        
        if (currentIt % Math.max(1, Math.round(stepsCount / 10)) === 0 || step === stepsCount - 1) {
          localHistory.push({ iteration: currentIt, mse: currentMse });
        }

        if (isNaN(localMNorm) || isNaN(localBNorm) || !isFinite(localMNorm) || !isFinite(localBNorm)) {
          setIsExploded(true);
          break;
        }
      }
    }

    const duration = performance.now() - startTime;

    setMNorm(localMNorm);
    setBNorm(localBNorm);
    setIteration(currentIt);
    setElapsedTime(prev => prev + duration);
    setHistory(localHistory.slice(-100)); // Cap history to last 100 points for efficiency
  };

  // Run automatically until convergence (low delta MSE)
  const runToConvergence = () => {
    if (isExploded) return;
    setIsRunning(false);
    
    const startTime = performance.now();
    let currentIt = iteration;
    let localMNorm = mNorm;
    let localBNorm = bNorm;
    let localMse = mse;
    let localHistory = [...history];

    const n = data.length;
    const { minX, rangeX, minY, rangeY } = dataStats;
    let delta = 1;
    let maxIt = 5000; // safety ceiling
    let itCount = 0;

    while (delta > 0.000001 && itCount < maxIt && !isExploded) {
      let gradM = 0;
      let gradB = 0;
      let errorSumSq = 0;

      if (normalize) {
        for (let i = 0; i < n; i++) {
          const x_norm = (data[i].x - minX) / rangeX;
          const y_norm = (data[i].y - minY) / rangeY;
          const pred = localMNorm * x_norm + localBNorm;
          const error = pred - y_norm;
          gradM += error * x_norm;
          gradB += error;
        }

        gradM = (2 / n) * gradM;
        gradB = (2 / n) * gradB;

        localMNorm = localMNorm - learningRate * gradM;
        localBNorm = localBNorm - learningRate * gradB;

        // Calculate original scale metrics
        const localMOrig = localMNorm * (rangeY / rangeX);
        const localBOrig = (localBNorm - localMNorm * (minX / rangeX)) * rangeY + minY;
        
        let realErrorSq = 0;
        for (let i = 0; i < n; i++) {
          const p = localMOrig * data[i].x + localBOrig;
          const diff = p - data[i].y;
          realErrorSq += diff * diff;
        }
        const newMse = realErrorSq / n;
        
        delta = Math.abs(localMse - newMse);
        localMse = newMse;
        currentIt++;
        itCount++;

        if (itCount % 50 === 0) {
          localHistory.push({ iteration: currentIt, mse: localMse });
        }

        if (isNaN(localMNorm) || isNaN(localBNorm) || !isFinite(localMNorm) || !isFinite(localBNorm)) {
          setIsExploded(true);
          break;
        }
      } else {
        // Raw training
        for (let i = 0; i < n; i++) {
          const pred = localMNorm * data[i].x + localBNorm;
          const error = pred - data[i].y;
          gradM += error * data[i].x;
          gradB += error;
          errorSumSq += error * error;
        }

        gradM = (2 / n) * gradM;
        gradB = (2 / n) * gradB;

        localMNorm = localMNorm - learningRate * gradM;
        localBNorm = localBNorm - learningRate * gradB;

        const newMse = errorSumSq / n;
        delta = Math.abs(localMse - newMse);
        localMse = newMse;
        currentIt++;
        itCount++;

        if (itCount % 50 === 0) {
          localHistory.push({ iteration: currentIt, mse: localMse });
        }

        if (isNaN(localMNorm) || isNaN(localBNorm) || !isFinite(localMNorm) || !isFinite(localBNorm)) {
          setIsExploded(true);
          break;
        }
      }
    }

    const duration = performance.now() - startTime;
    setMNorm(localMNorm);
    setBNorm(localBNorm);
    setIteration(currentIt);
    setElapsedTime(prev => prev + duration);
    setHistory(localHistory.slice(-100));
  };

  // Continuous training animation loop
  const animateTraining = (time: number) => {
    if (!isRunning || isExploded) return;

    if (prevTimeRef.current !== null) {
      // Execute N iterations per animation frame
      runBatch(trainingSpeed);
    }
    prevTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animateTraining);
  };

  useEffect(() => {
    if (isRunning && !isExploded) {
      requestRef.current = requestAnimationFrame(animateTraining);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      prevTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, mNorm, bNorm, learningRate, trainingSpeed, isExploded]);

  // Mini canvas helper for rendering the MSE loss curve
  const lossCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = lossCanvasRef.current;
    if (!canvas || history.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 10;
    const w = canvas.width - 2 * pad;
    const h = canvas.height - 2 * pad;

    const mses = history.map(h => h.mse).filter(m => isFinite(m) && !isNaN(m));
    if (mses.length < 2) return;

    const maxMse = Math.max(...mses);
    const minMse = Math.min(...mses);
    const range = maxMse - minMse || 1;

    ctx.beginPath();
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.lineWidth = 2;

    for (let i = 0; i < history.length; i++) {
      const pt = history[i];
      const px = pad + (i / (history.length - 1)) * w;
      // Invert Y as canvas coordinates start from top-left
      const py = pad + h - ((pt.mse - minMse) / range) * h;
      
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [history]);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 md:p-12 custom-scrollbar">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1 text-sm">
              <Sparkles size={16} className="animate-pulse" /> LABORATARIO AVANZADO DE APRENDIZAJE AUTOMÁTICO
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Regresión Lineal a Gran Escala
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Experimenta con miles de registros reales, observa el fenómeno del gradiente explotando y descubre el rol de la normalización.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono text-slate-300">
              <Cpu size={14} className="text-indigo-400" />
              Dataset: <span className="text-emerald-400 font-bold">{data.length.toLocaleString()} puntos</span>
            </div>
          </div>
        </header>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Config (Size: 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Card 1: Data Source Selector */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                📂 1. Seleccionar Conjunto de Datos
              </h2>
              
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setDatasetType('seattle')}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex justify-between items-center ${datasetType === 'seattle' ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                >
                  <div>
                    <div className="text-white font-medium">Casas de Seattle (Real)</div>
                    <div className="text-xs text-slate-500">2,000 casas • Tamaño vs Precio</div>
                  </div>
                  {datasetType === 'seattle' && <Check size={16} />}
                </button>

                <button
                  onClick={() => setDatasetType('co2')}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex justify-between items-center ${datasetType === 'co2' ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                >
                  <div>
                    <div className="text-white font-medium">Emisiones de CO2 (Real)</div>
                    <div className="text-xs text-slate-500">1,500 autos • Motor vs CO2</div>
                  </div>
                  {datasetType === 'co2' && <Check size={16} />}
                </button>

                <button
                  onClick={() => setDatasetType('salaries')}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex justify-between items-center ${datasetType === 'salaries' ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                >
                  <div>
                    <div className="text-white font-medium">Salarios Tech (Real)</div>
                    <div className="text-xs text-slate-500">1,200 devs • Años Exp. vs Sueldo</div>
                  </div>
                  {datasetType === 'salaries' && <Check size={16} />}
                </button>

                <button
                  onClick={() => setDatasetType('synthetic')}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex justify-between items-center ${datasetType === 'synthetic' ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                >
                  <div>
                    <div className="text-white font-medium">Generador Sintético</div>
                    <div className="text-xs text-slate-500">Configura tamaño, ruido y función</div>
                  </div>
                  {datasetType === 'synthetic' && <Check size={16} />}
                </button>

                <button
                  onClick={() => setDatasetType('custom')}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex justify-between items-center ${datasetType === 'custom' ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-semibold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                >
                  <div>
                    <div className="text-white font-medium">Pegar Datos Personalizados</div>
                    <div className="text-xs text-slate-500">Ingresa tus propios pares X, Y</div>
                  </div>
                  {datasetType === 'custom' && <Check size={16} />}
                </button>
              </div>

              {/* Synthetic Config Subpanel */}
              {datasetType === 'synthetic' && (
                <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs flex flex-col gap-3">
                  <div className="font-semibold text-slate-300">CONFIGURADOR SINTÉTICO</div>
                  <div>
                    <label className="text-slate-400 block mb-1">Número de Puntos: {numPoints.toLocaleString()}</label>
                    <input 
                      type="range" min="100" max="10000" step="100"
                      value={numPoints} onChange={(e) => setNumPoints(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Pendiente (m):</label>
                      <input 
                        type="number" value={trueM} onChange={(e) => setTrueM(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Intercepto (b):</label>
                      <input 
                        type="number" value={trueB} onChange={(e) => setTrueB(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Nivel de Ruido: {noiseLevel}</label>
                    <input 
                      type="range" min="0" max="50" step="1"
                      value={noiseLevel} onChange={(e) => setNoiseLevel(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <button 
                    onClick={generateSyntheticData}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition-colors text-xs"
                  >
                    Generar Datos
                  </button>
                </div>
              )}

              {/* CSV Custom input subpanel */}
              {datasetType === 'custom' && (
                <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-3">
                  <div className="text-xs font-semibold text-slate-300">DATOS CSV (FORMATO LIBRE)</div>
                  <textarea
                    rows={6}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleParseCsv}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition-colors text-xs flex items-center justify-center gap-2"
                  >
                    <Upload size={14} /> Importar Datos
                  </button>
                  {csvSuccessMessage && (
                    <div className="text-xs text-emerald-400 text-center font-medium bg-emerald-950/20 border border-emerald-900/50 rounded py-1">
                      {csvSuccessMessage}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Card 2: Hyperparameters & Normalization */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ⚙️ 2. Hiperparámetros y Escalado
              </h2>

              {/* Normalization Toggle */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                    Normalización de Datos
                    <span className="group relative cursor-pointer text-slate-500 hover:text-slate-300">
                      <HelpCircle size={14} />
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-800 text-slate-200 text-xs rounded p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 leading-relaxed font-sans normal-case">
                        Escala X e Y al rango [0, 1] antes de entrenar. Evita el desbordamiento matemático.
                      </span>
                    </span>
                  </label>
                  <button
                    onClick={() => {
                      setNormalize(prev => !prev);
                      resetModel();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${normalize ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${normalize ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  {normalize 
                    ? "✓ Min-Max Scaling activo. El gradiente es estable y la línea converge fluidamente."
                    : "⚠ Desactivado. El gradiente usará la escala original. ¡Peligro de explosión!"}
                </p>
              </div>

              {/* Learning Rate Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <label className="font-semibold text-slate-300">Learning Rate (α):</label>
                  <span className="font-mono text-blue-400 font-bold">{learningRate}</span>
                </div>
                <input 
                  type="number"
                  step="0.0001"
                  min="0.00000001"
                  value={learningRate} 
                  onChange={(e) => setLearningRate(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Training Speed Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <label className="font-semibold text-slate-300">Épocas por fotograma:</label>
                  <span className="font-mono text-indigo-400 font-bold">{trainingSpeed}x</span>
                </div>
                <input 
                  type="range" min="1" max="100" step="1"
                  value={trainingSpeed} onChange={(e) => setTrainingSpeed(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </section>
          </div>

          {/* Column 2: Graph & Metrics (Size: 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Visualizer and Live Dashboard */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4 flex-1">
              
              {/* Live Info bar */}
              <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex gap-6">
                  <div>
                    <span className="text-xs text-slate-500 block">ÉPOCA / ITERACIÓN</span>
                    <span className="text-xl font-bold font-mono text-white">{iteration.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">TIEMPO CÓMPUTO</span>
                    <span className="text-xl font-bold font-mono text-indigo-400">
                      {elapsedTime < 1 ? elapsedTime.toFixed(3) : Math.round(elapsedTime)} ms
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">ERROR ACTUAL (MSE)</span>
                    <span className="text-xl font-bold font-mono text-rose-400">
                      {mse === Infinity ? '¡EXPLOTÓ! (Infinity)' : mse.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg">
                  <div className="text-xs font-semibold text-slate-400">MODELO AJUSTADO:</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    {isExploded ? 'y = NaN * x + NaN' : `y = ${mOrig.toFixed(4)}x + ${bOrig.toFixed(2)}`}
                  </div>
                </div>
              </div>

              {/* Exploded Gradient Warning */}
              {isExploded && (
                <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 flex gap-3 text-rose-200">
                  <AlertTriangle className="text-rose-400 shrink-0 mt-0.5 animate-bounce" size={20} />
                  <div>
                    <strong className="text-rose-400 block mb-0.5">¡El Gradiente ha Explotado! (Exploding Gradient)</strong>
                    <p className="text-xs leading-relaxed text-rose-300">
                      Los valores de la pendiente y el intercepto se volvieron matemáticamente infinitos o NaN. 
                      Al entrenar en la escala original con valores altos (como X={dataStats.maxX.toLocaleString()}), 
                      los gradientes calculados son astronómicos. Al multiplicarlos por tu Learning Rate, los parámetros se disparan exponencialmente.
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        onClick={() => {
                          setNormalize(true);
                          setLearningRate(0.1);
                          resetModel();
                        }}
                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-700/60 rounded px-2.5 py-1 text-xs transition-colors"
                      >
                        Activar Normalización y Autocorrección
                      </button>
                      <button
                        onClick={resetModel}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded px-2.5 py-1 text-xs transition-colors"
                      >
                        Reiniciar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Graph Container */}
              <div className="h-[380px] w-full">
                <CanvasChart 
                  data={data} 
                  m={mOrig} 
                  b={bOrig} 
                  xLabel={xLabel} 
                  yLabel={yLabel} 
                />
              </div>

              {/* Controls and Loss mini curve */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-2 pt-2 border-t border-slate-800">
                
                {/* Control Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (isRunning) {
                        setIsRunning(false);
                      } else {
                        setIsExploded(false);
                        setIsRunning(true);
                      }
                    }}
                    disabled={isExploded}
                    className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow ${isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'}`}
                  >
                    {isRunning ? (
                      <>
                        <Pause size={16} /> Pausar Entrenamiento
                      </>
                    ) : (
                      <>
                        <Play size={16} /> Entrenar Continuo
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsExploded(false);
                      const startTime = performance.now();
                      stepGradientDescent(learningRate);
                      const duration = performance.now() - startTime;
                      setIteration(prev => prev + 1);
                      setElapsedTime(prev => prev + duration);
                    }}
                    disabled={isRunning || isExploded}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-lg transition-colors border border-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800"
                  >
                    <SkipForward size={16} className="inline mr-1" /> 1 Época
                  </button>

                  <button
                    onClick={() => runBatch(50)}
                    disabled={isRunning || isExploded}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
                  >
                    <SkipForward size={16} className="inline mr-1" /> 50 Épocas
                  </button>

                  <button
                    onClick={runToConvergence}
                    disabled={isRunning || isExploded}
                    className="px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-semibold text-sm rounded-lg transition-colors border border-blue-900/50 disabled:opacity-50"
                  >
                    ⚡ Ajustar Rápido
                  </button>

                  <button
                    onClick={resetModel}
                    className="p-2.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors border border-slate-700"
                    title="Reiniciar parámetros a m=0, b=0"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                {/* Mini Loss curve display */}
                <div className="flex items-center gap-3 bg-slate-950 p-2 border border-slate-800 rounded-lg w-full sm:w-auto">
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] block leading-none font-bold">HISTORIAL DE COSTO</span>
                    <span className="text-slate-300 text-xs font-mono">Curva de MSE</span>
                  </div>
                  <div className="w-24 h-10 bg-slate-900 border border-slate-800 rounded overflow-hidden relative">
                    {history.length < 2 ? (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-600">Sin datos</span>
                    ) : (
                      <canvas ref={lossCanvasRef} width={96} height={40} className="block" />
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Education theory section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl mt-4
          prose prose-invert prose-emerald max-w-none 
          prose-h2:text-2xl prose-h2:font-extrabold prose-h2:bg-gradient-to-r prose-h2:from-blue-400 prose-h2:to-emerald-400 prose-h2:bg-clip-text prose-h2:text-transparent prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-3 prose-h2:mt-10
          prose-h3:text-lg prose-h3:text-blue-400 prose-h3:mt-8
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-base
          prose-strong:text-slate-200
          prose-li:text-slate-300 prose-li:text-sm md:prose-li:text-base">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {computationTheory}
          </ReactMarkdown>
        </section>

      </div>
    </div>
  );
};
