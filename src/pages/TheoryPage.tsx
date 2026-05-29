import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useLinearRegression } from '../hooks/useLinearRegression';
import { MainChart } from '../components/MainChart';
import { MathPanel } from '../components/MathPanel';
import { SkipForward, SkipBack, RotateCcw, ArrowRight, MousePointerClick, Zap, Play, Telescope, Dna, TrendingUp } from 'lucide-react';

const theoryContentTop = `
# La Guía Definitiva de la Regresión Lineal Simple

La regresión lineal no es solo una herramienta estadística básica; es el **algoritmo fundacional del Machine Learning moderno**. Mucho antes de que existieran las redes neuronales profundas y la inteligencia artificial como la conocemos hoy, científicos, economistas y astrónomos ya utilizaban este poderoso modelo matemático para entender, modelar y predecir el comportamiento del universo.

En esta guía exhaustiva, aprenderás exactamente qué es, cómo aplicarla a cualquier problema mediante una **receta universal de 5 pasos**, y luego lo pondremos a prueba en un **laboratorio interactivo incrustado**.

---

## La Guía Maestra: Cómo Resolver Cualquier Problema

La belleza de la Regresión Lineal por Descenso de Gradiente es que, matemáticamente, siempre se resuelve igual. Si te enfrentas a un problema donde tienes datos históricos y necesitas predecir un valor numérico futuro, aplica siempre estos 5 pasos inmutables:

### Paso 1: Recolección y Modelado (La Hipótesis)
Identifica tus variables. Quién es tu variable independiente ($X$, los datos de entrada o características) y tu variable dependiente ($Y$, lo que quieres predecir, la etiqueta). Establece la ecuación de la recta, que será nuestra "hipótesis":
$$ \\hat{y} = mx + b $$
Inicializa tus pesos (parámetros) $m$ (pendiente) y $b$ (intercepto) en cero o en valores aleatorios. En este punto, tu modelo es como un cerebro vacío; no sabe nada.

> **Ejemplo real:** Eres un profesor y quieres predecir la calificación de un estudiante (variable dependiente $Y$) basándote en las horas que estudió (variable independiente $X$). Recolectas datos históricos de exámenes pasados. Al inicio, tu modelo arranca con sus pesos en cero ($m=0, b=0$).

### Paso 2: Las Predicciones Iniciales
Toma todos los valores de tus datos de entrenamiento ($X$) y pásalos por la fórmula. Calcula qué predice tu modelo matemáticamente ($\\hat{y}$). Al principio, como los parámetros están en cero, tus predicciones serán terribles.

> **Ejemplo real:** Tienes un estudiante en tus datos que estudió 3 horas ($X=3$). Usas tu modelo inicial: $\\hat{y} = (0)(3) + 0$. El modelo predice que el estudiante sacará una calificación de **0**.

### Paso 3: Medir el Error (Función de Costo)
En Machine Learning, el modelo no puede aprender si no sabe qué tan equivocado está. Calcula qué tan lejos está cada predicción $\\hat{y}$ de la realidad $Y$. 
Elevamos ese error individual al cuadrado (para evitar que los errores negativos y positivos se cancelen entre sí, y para castigar más fuerte a los errores muy lejanos). Luego, calculamos el promedio de todos esos errores al cuadrado. Esto se llama **Error Cuadrático Medio (MSE)** o función de costo $J$:
$$ J = \\frac{1}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i)^2 $$

> **Ejemplo real:** El estudiante que estudió 3 horas en la realidad sacó un **6** ($Y=6$). Tu modelo había predicho un **0**. El error es $(0 - 6) = -6$. Al elevarlo al cuadrado, el castigo para ese error es de **36**. Haces esto con todos tus alumnos y promedias los castigos.

### Paso 4: La Dirección del Aprendizaje (Gradientes)
Imagina que la función de costo $J$ es una montaña tridimensional y tú estás en la cima con los ojos vendados. Para llegar al valle (el menor error posible), tanteas el suelo con el pie para sentir la inclinación. 
En matemáticas, esa "inclinación" se calcula sacando las derivadas parciales de la función de costo respecto a tus dos parámetros ($m$ y $b$). Las derivadas te indicarán hacia dónde sube el error más rápido.
$$ \\frac{\\partial J}{\\partial m} = \\frac{2}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i)x_i $$
$$ \\frac{\\partial J}{\\partial b} = \\frac{2}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i) $$

> **Ejemplo real:** Calculas las derivadas de esos enormes errores de 36 puntos. La matemática te indica como una brújula: *"Si quieres dejar de predecir 0 y acercarte a 6, necesitas que tu pendiente ($m$) sea un número positivo más grande"*.

### Paso 5: Actualización de Parámetros
Finalmente, el "aprendizaje". Ajusta tus parámetros moviéndolos matemáticamente en dirección **contraria** al gradiente (hacia abajo). Multiplicamos los gradientes por el **Learning Rate** ($\\alpha$) para controlar el tamaño de ese paso y no pasarnos de largo:
$$ m := m - \\alpha \\frac{\\partial J}{\\partial m} $$
$$ b := b - \\alpha \\frac{\\partial J}{\\partial b} $$

> **Ejemplo real:** Siguiendo la brújula del gradiente, actualizas tus pesos. La pendiente $m$ pasa de 0 a 0.5. El intercepto $b$ pasa de 0 a 0.2. Ahora tu ecuación es más inteligente: $\\hat{y} = 0.5x + 0.2$. Vuelves al **Paso 2**, y si evalúas al mismo alumno de 3 horas, la predicción será **1.7** (¡Ya no es cero!).

Repite desde el Paso 2 miles de veces (iteraciones) hasta que los valores de $m$ y $b$ se estabilicen y el Error $J$ alcance su mínimo posible (convergencia). ¡Felicidades, tu modelo ha sido entrenado!

---

## Tutorial Práctico: Resuélvelo a Mano

Para entender cómo "aprende" la Inteligencia Artificial, vamos a ser la computadora por un momento. Queremos predecir la calificación de un estudiante en un examen (0 a 10) basándonos en cuántas horas estudió.

### El Dataset
Tenemos los datos de 3 estudiantes:
*   **Estudiante 1:** Estudió **1 hora** ($x=1$), sacó **2 puntos** ($y=2$).
*   **Estudiante 2:** Estudió **2 horas** ($x=2$), sacó **4 puntos** ($y=4$).
*   **Estudiante 3:** Estudió **3 horas** ($x=3$), sacó **6 puntos** ($y=6$).

### Primera Iteración (Learning Rate = 0.01)

1. **Hipótesis Inicial:** $m=0, b=0$. Predicciones iniciales: $\\hat{y}_1=0, \\hat{y}_2=0, \\hat{y}_3=0$.
2. **Gradiente de Pendiente ($m$):** 
   $$ \\frac{\\partial J}{\\partial m} = \\frac{2}{3} [ (0 - 2)(1) + (0 - 4)(2) + (0 - 6)(3) ] = \\frac{2}{3} [ -28 ] = \\mathbf{-18.667} $$
3. **Gradiente de Intercepto ($b$):**
   $$ \\frac{\\partial J}{\\partial b} = \\frac{2}{3} [ (0 - 2) + (0 - 4) + (0 - 6) ] = \\frac{2}{3} [ -12 ] = \\mathbf{-8.00} $$
4. **Nuevos Valores:**
   $$ m = 0 - (0.01 \\cdot -18.667) = \\mathbf{0.1867} $$
   $$ b = 0 - (0.01 \\cdot -8.00) = \\mathbf{0.08} $$

¡Felicidades! Acabas de dar el primer paso de entrenamiento a mano.

### Evolución y Resolución Completa del Problema

Si repetimos este proceso (Paso 2 al Paso 5) en un bucle durante cientos de iteraciones, veremos cómo cambian los parámetros progresivamente:

*   **Iteración 1:** $m = 0.1867$, $b = 0.0800$, $MSE = 14.7710$
*   **Iteración 10:** $m = 1.1663$, $b = 0.4922$, $MSE = 1.8443$
*   **Iteración 100:** $m = 1.7451$, $b = 0.5795$, $MSE = 0.0482$
*   **Iteración 1000 (Convergencia):** $m = 1.9708$, $b = 0.0664$, $MSE = 0.00063$

#### La Solución Final:
La ecuación de predicción entrenada es:
$$ \\hat{y} = 2.00 \\cdot x + 0.00 $$

Es decir, el algoritmo ha aprendido matemáticamente la regla perfecta: **la calificación del examen es exactamente el doble de las horas estudiadas** ($\\hat{y} = 2x$). Si un nuevo estudiante estudia **4.5 horas**, el modelo predecirá con total confianza una calificación de **9.0**.
`;

// theoryContentBottom refactored to JSX components below.

export const TheoryPage: React.FC = () => {
  const lr = useLinearRegression();
  const [tutorialStep, setTutorialStep] = useState(0);

  // Preload the exact "hours studied" dataset and learning rate on mount
  useEffect(() => {
    lr.reset();
    lr.setData([
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 }
    ]);
    lr.setLearningRate(0.01);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (lr.data.length >= 3 && tutorialStep === 0) {
      setTutorialStep(1);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (lr.learningRate === 0.01 && tutorialStep === 1) {
      setTutorialStep(2);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (lr.iteration > 0 && tutorialStep === 2) {
      setTutorialStep(3);
    }
  }, [lr.data.length, lr.learningRate, lr.iteration, tutorialStep]);

  const loadCase = (data: {x: number, y: number}[], lrValue: number) => {
    lr.reset();
    lr.setData(data);
    lr.setLearningRate(lrValue);
    setTutorialStep(3); // To not trigger tutorial popups
    document.getElementById('simulator-lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getDynamicLaboratoryExplanation = () => {
    const currentM = Number(lr.m) || 0;
    const currentB = Number(lr.b) || 0;
    const currentMse = lr.calculations?.mse || 0;
    const it = lr.iteration;

    let title = "Progreso de Entrenamiento";
    let text = "";

    if (it === 1) {
      title = "Primera Iteración Completada";
      text = `El simulador ha ejecutado los 7 pasos del panel derecho y ha dado su primer paso de aprendizaje:
* **Paso 1 (ŷ):** Predijo $\\hat{y}_i = 0 \\cdot x_i + 0 = 0$ para todos los puntos.
* **Pasos 2-3 (errores):** Calculó $e_i = 0 - y_i$ y sus cuadrados.
* **Paso 4 (J):** $J = 18.6700$ — el error inicial con $m=0, b=0$.
* **Pasos 5-6 (matrices y gradientes):** $\\partial J / \\partial m = -18.667$, $\\partial J / \\partial b = -8.00$.
* **Paso 7 (actualización):** $m$ cambió de $0.00$ a $${currentM.toFixed(4)}$ y $b$ a $${currentB.toFixed(4)}$.

Compara con los cálculos manuales de la guía — los valores son exactamente iguales.`;
    } else if (Math.abs(currentM - 2) <= 0.05 && Math.abs(currentB) <= 0.05) {
      title = "Modelo Convergido";
      text = `En la iteración ${it}, el modelo encontró la solución optima:
* **Pendiente ($m$):** $${currentM.toFixed(4)} \\approx 2.00$ — la calificación es el doble de las horas de estudio.
* **Intercepto ($b$):** $${currentB.toFixed(4)} \\approx 0.00$ — con 0 horas estudiadas, la predicción es 0 puntos.
* **Error (MSE):** $${currentMse.toFixed(6)}$ — prácticamente cero.
* **Predicción para 4.5 horas:** $\\hat{y} = 2.00 \\times 4.5 + 0.00 = 9.0$ puntos.

La línea cruza exactamente por los tres puntos. Usa "Resolver" para llegar aquí instantáneamente con la solución analítica exacta.`;
    } else {
      title = `Entrenando (Iteración ${it})`;
      const distM = Math.abs(2.0 - currentM);

      if (distM > 0.8) {
        text = `El modelo ajusta sus parámetros en la iteración ${it}:
* **Pendiente actual ($m$):** $${currentM.toFixed(4)}$ (subiendo hacia $2.00$).
* **Intercepto actual ($b$):** $${currentB.toFixed(4)}$ (ajustándose hacia $0.00$).
* **Error (MSE):** $${currentMse.toFixed(4)}$.

Cada iteración repite los 7 pasos del panel. Haz clic en "50 Épocas" para acelerar o en "Resolver" para la solución exacta instantánea.`;
      } else {
        text = `El modelo está muy cerca de la solución en la iteración ${it}:
* **Pendiente actual ($m$):** $${currentM.toFixed(4)}$ (objetivo: $2.00$).
* **Intercepto actual ($b$):** $${currentB.toFixed(4)}$ (objetivo: $0.00$).
* **Error (MSE):** $${currentMse.toFixed(6)}$.

El gradiente es casi cero — el modelo no tiene mucho más que ajustar. Haz clic en "Resolver" para la solución analítica exacta.`;
      }
    }

    return { title, text };
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 md:p-12 custom-scrollbar">
      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 md:p-16 mb-20 
          prose prose-invert max-w-none
          prose-h1:text-4xl prose-h1:font-extrabold prose-h1:text-slate-100
          prose-h2:text-3xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-4 prose-h2:mt-16
          prose-h3:text-2xl prose-h3:text-slate-300 prose-h3:mt-10
          prose-p:text-lg prose-p:text-slate-300 prose-p:leading-relaxed
          prose-strong:text-slate-200
          prose-li:text-lg prose-li:text-slate-300">
        
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {theoryContentTop}
        </ReactMarkdown>

        {/* --- INLINE SIMULATOR LAB --- */}
        <div id="simulator-lab" className="my-16 bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl not-prose">
          <div className="bg-slate-800 p-6 border-b border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Zap className="text-slate-400" /> Laboratorio Interactivo: Compruébalo Tú Mismo
            </h3>
            <p className="text-slate-300 text-sm">
              Sigue las instrucciones animadas para replicar las matemáticas de arriba en el simulador real. Esta es una herramienta funcional, ¡prueba con tus propios datos después!
            </p>
          </div>

          {/* Interactive Tutorial Guide */}
          <div className="flex flex-wrap bg-slate-900 border-b border-slate-800 p-4 gap-4 justify-between items-center text-sm font-medium">
             <div className={`flex items-center gap-2 transition-colors duration-500 ${tutorialStep === 0 ? 'text-slate-200 animate-pulse' : 'text-slate-500 line-through'}`}>
                <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 font-bold">1</span>
                Añade puntos en X=1, 2 y 3
             </div>
             <ArrowRight className="text-slate-700 hidden md:block" />
             <div className={`flex items-center gap-2 transition-colors duration-500 ${tutorialStep === 1 ? 'text-slate-200 animate-pulse scale-105' : tutorialStep > 1 ? 'text-slate-500 line-through' : 'text-slate-600'}`}>
                <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 font-bold">2</span>
                Ajusta Learning Rate a 0.01
             </div>
             <ArrowRight className="text-slate-700 hidden md:block" />
             <div className={`flex items-center gap-2 transition-colors duration-500 ${tutorialStep === 2 ? 'text-slate-200 animate-pulse font-bold text-base scale-105' : tutorialStep > 2 ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 font-bold">3</span>
                {tutorialStep > 2 ? '¡Matemáticas Replicadas!' : 'Haz clic en "Siguiente"'}
             </div>
          </div>

          <div className="flex flex-col xl:flex-row h-auto xl:h-[600px]">
             {/* Left side: Graph and controls */}
             <div className="flex-1 flex flex-col p-4 gap-4 relative min-h-[400px]">
               
               {/* Controls */}
               <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700 shadow-inner">
                  <div className="flex items-center gap-3 flex-wrap">
                     <div className="flex items-center gap-2">
                        <label className="text-slate-300 font-medium text-sm">Learning Rate (α):</label>
                        <input 
                           type="number" 
                           step="0.001"
                           value={lr.learningRate} 
                           onChange={(e) => lr.setLearningRate(Number(e.target.value))}
                           className={`w-24 bg-slate-950 border rounded px-2 py-1 text-white focus:outline-none focus:border-slate-500 transition-all ${tutorialStep === 1 ? 'border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.4)]' : 'border-slate-700'}`}
                        />
                     </div>
                     
                     <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 border border-slate-800 rounded-md text-xs font-mono">
                        <span className="text-slate-500 font-bold">ITERACIÓN ACTUAL:</span>
                        <span className="text-slate-200 font-bold text-sm">{lr.iteration}</span>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={lr.prevStep} 
                      disabled={lr.currentStep === 0 && lr.iteration === 1} 
                      className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
                      title="Paso Anterior"
                    >
                      <SkipBack size={18} />
                    </button>
                    
                    <button 
                      onClick={lr.nextStep} 
                      className={`flex items-center gap-1.5 px-3 py-2 rounded font-medium text-sm text-white shadow-lg transition-all ${tutorialStep === 2 ? 'bg-slate-500 hover:bg-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.4)] animate-pulse' : 'bg-slate-600 hover:bg-slate-500'}`}
                    >
                       Siguiente Paso <SkipForward size={14} />
                    </button>

                    <button 
                      onClick={() => {
                        lr.runMultipleIterations(1);
                        setTutorialStep(3);
                      }}
                      className="px-3 py-2 bg-slate-850 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm rounded transition-colors"
                    >
                      1 Época
                    </button>

                    <button 
                      onClick={() => {
                        lr.runMultipleIterations(50);
                        setTutorialStep(3);
                      }}
                      className="px-3 py-2 bg-slate-850 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm rounded transition-colors"
                    >
                      50 Épocas
                    </button>

                    <button
                      onClick={() => {
                        lr.solveAnalytically();
                        setTutorialStep(3);
                      }}
                      className="px-3 py-2 bg-slate-700/20 hover:bg-slate-700/40 text-slate-300 border border-slate-700/50 font-semibold text-sm rounded transition-colors animate-pulse"
                    >
                      Resolver (exacto)
                    </button>

                    <button 
                      onClick={() => {
                        lr.reset();
                        lr.setData([
                          { x: 1, y: 2 },
                          { x: 2, y: 4 },
                          { x: 3, y: 6 }
                        ]);
                        lr.setLearningRate(0.01);
                        setTutorialStep(2);
                      }} 
                      className="p-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 ml-2 rounded transition-colors"
                      title="Reiniciar a m=0, b=0"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>
               </div>

               {/* Graph */}
               <div className={`flex-1 rounded-xl border relative overflow-hidden transition-all duration-500 ${tutorialStep === 0 ? 'border-slate-500/60 shadow-[0_0_20px_rgba(148,163,184,0.2)]' : 'border-slate-700'}`}>
                 {tutorialStep === 0 && lr.data.length < 3 && (
                   <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center z-10">
                     <div className="bg-slate-600/90 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl animate-bounce whitespace-nowrap">
                        <MousePointerClick size={20} /> 
                        Haz clic {3 - lr.data.length} veces más para añadir puntos
                     </div>
                   </div>
                 )}
                 <MainChart data={lr.data} m={lr.m} b={lr.b} />
               </div>
             </div>

             {/* Right side: Math Panel */}
             <div className="w-full xl:w-[450px] border-t xl:border-t-0 xl:border-l border-slate-800 bg-slate-900/50 overflow-y-auto">
                {tutorialStep === 3 && (() => {
                  const { title, text } = getDynamicLaboratoryExplanation();
                  return (
                    <div className="p-4 bg-slate-700/30 border-b border-slate-600/50 flex flex-col gap-2 relative overflow-hidden text-slate-200">
                      <div className="absolute -right-4 -top-4 text-slate-500/10">
                         <Zap size={100} />
                      </div>
                      <div className="text-slate-200 font-bold flex items-center gap-2 text-lg">
                        <Zap size={20} /> {title}
                      </div>
                      <div className="text-xs text-slate-300/90 leading-relaxed relative z-10 prose prose-invert prose-p:my-1 prose-ul:my-1">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  );
                })()}
                <MathPanel step={lr.currentStep} data={lr.data} m={lr.m} b={lr.b} learningRate={lr.learningRate} calculations={lr.calculations} />
             </div>
          </div>
        </div>

        {/* CASOS FAMOSOS JSX */}
        <div className="mt-20 border-t border-slate-800 pt-16">
          <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
            Casos Reales de Regresión Lineal
          </h2>
          <p className="text-lg text-slate-300 mb-10">
            Para que veas que esto no es solo para predecir calificaciones, aquí hay tres casos reales que usaron regresión lineal y cambiaron al mundo. Cárgalos en el simulador para ver la matemática en acción.
          </p>

          <div className="flex flex-col gap-10 not-prose">

            {/* Caso 1: Hubble */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl hover:border-slate-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-800/50 text-slate-300 rounded-lg"><Telescope size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-white">La Expansión del Universo</h3>
                  <p className="text-slate-400 font-medium">Edwin Hubble (1929) — Ley de Hubble</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3 text-sm text-slate-300">
                  <p>En 1929 Edwin Hubble midió la distancia a varias galaxias y su velocidad de alejamiento. Al trazar la recta de regresión descubrió que el universo se expande: cuanto más lejos está una galaxia, más rápido se aleja. Esto cambió para siempre nuestra visión del cosmos.</p>
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-1.5">
                    <p><strong className="text-slate-200">X</strong> — Distancia de la galaxia en Megapársecs (Mpc). 1 Mpc ≈ 3.26 millones de años luz.</p>
                    <p><strong className="text-slate-200">Y</strong> — Velocidad de recesión en km/s (medida por corrimiento al rojo del espectro de luz).</p>
                    <p><strong className="text-slate-200">m (pendiente)</strong> — La Constante de Hubble H₀. Significa: por cada Mpc extra de distancia, la galaxia se aleja ~500 km/s más rápido.</p>
                    <p><strong className="text-slate-200">b (intercepto)</strong> — Debe ser ≈ 0: una galaxia a distancia cero (nuestra propia) no se aleja.</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                    <p className="text-slate-400 font-semibold mb-2">Cómo usar el modelo</p>
                    <p className="text-slate-300">Si descubres una nueva galaxia a 1.5 Mpc, el modelo predice:<br/><span className="font-mono text-slate-200">ŷ = m × 1.5 + b</span><br/>Después puedes verificarlo midiendo su corrimiento al rojo con un espectrógrafo.</p>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-slate-400">
                    <p className="font-semibold text-slate-300 mb-2">Los 7 pasos del sistema aplicados</p>
                    <ul className="space-y-1">
                      <li><strong className="text-slate-300">Paso 1 (ŷ):</strong> Predice velocidad con la H₀ actual para cada galaxia.</li>
                      <li><strong className="text-slate-300">Pasos 2-3 (errores):</strong> Diferencia entre velocidad predicha y medida por telescopio.</li>
                      <li><strong className="text-slate-300">Paso 4 (J):</strong> MSE — promedio de los errores al cuadrado sobre las 6 galaxias.</li>
                      <li><strong className="text-slate-300">Paso 5 (matrices):</strong> Productos eᵢ·xᵢ que "pesan" más las galaxias lejanas.</li>
                      <li><strong className="text-slate-300">Paso 6 (gradientes):</strong> Dirección para ajustar H₀ y el origen.</li>
                      <li><strong className="text-slate-300">Paso 7 (actualización):</strong> Nuevo H₀ más preciso. Converge en la Constante de Hubble real.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loadCase([{x: 0.03, y: 170}, {x: 0.27, y: 290}, {x: 0.45, y: 200}, {x: 0.9, y: 290}, {x: 1.4, y: 500}, {x: 2.0, y: 1090}], 0.01)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <Play size={18} /> Cargar Caso Hubble en el Simulador
              </button>
            </div>

            {/* Caso 2: Galton */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl hover:border-slate-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-800/50 text-slate-300 rounded-lg"><Dna size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-white">El Origen del nombre "Regresión"</h3>
                  <p className="text-slate-400 font-medium">Sir Francis Galton (1886) — Biología Evolutiva</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3 text-sm text-slate-300">
                  <p>Galton estudió la herencia de la estatura midiendo cientos de familias en Inglaterra. Descubrió algo contraintuitivo: los hijos de padres muy altos tienden a ser más bajos que sus padres, y los hijos de padres muy bajos tienden a ser más altos. Llamó a este fenómeno "regresión hacia la media" — de ahí viene el nombre de todo el algoritmo.</p>
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-1.5">
                    <p><strong className="text-slate-200">X</strong> — Estatura promedio de los padres (pulgadas).</p>
                    <p><strong className="text-slate-200">Y</strong> — Estatura del hijo adulto (pulgadas).</p>
                    <p><strong className="text-slate-200">m (pendiente) ≈ 0.65</strong> — Por cada pulgada extra de los padres, el hijo solo crece 0.65 pulgadas. Si m fuera 1, los hijos replicarían exactamente la estatura de los padres; como m &lt; 1, "regresan" hacia la media.</p>
                    <p><strong className="text-slate-200">b (intercepto) ≈ 24</strong> — Componente de estatura independiente de los padres (nutrición, factores no genéticos).</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                    <p className="text-slate-400 font-semibold mb-2">Cómo usar el modelo</p>
                    <p className="text-slate-300">Padres con estatura promedio de 72 pulgadas (muy altos):<br/><span className="font-mono text-slate-200">ŷ = 0.65 × 72 + 24 = 70.8 pulgadas</span><br/>Su hijo se predice más bajo. Padres de 64 pulgadas:<br/><span className="font-mono text-slate-200">ŷ = 0.65 × 64 + 24 = 65.6 pulgadas</span><br/>Su hijo se predice más alto. Ambos "regresan" al centro.</p>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-slate-400">
                    <p className="font-semibold text-slate-300 mb-2">Los 7 pasos del sistema aplicados</p>
                    <ul className="space-y-1">
                      <li><strong className="text-slate-300">Paso 1 (ŷ):</strong> Predice estatura del hijo según la de los padres.</li>
                      <li><strong className="text-slate-300">Pasos 2-3 (errores):</strong> Diferencia entre estatura predicha y medida real del hijo.</li>
                      <li><strong className="text-slate-300">Paso 4 (J):</strong> MSE en pulgadas². Hay que minimizarlo para que la línea encaje mejor.</li>
                      <li><strong className="text-slate-300">Paso 5 (matrices):</strong> Productos eᵢ·xᵢ donde xᵢ son las estaturas de los padres.</li>
                      <li><strong className="text-slate-300">Paso 6 (gradientes):</strong> Indica que m debe subir desde 0 hacia 0.65.</li>
                      <li><strong className="text-slate-300">Paso 7 (actualización):</strong> Converge en m≈0.65 — la "regresión hacia la media" demostrada matemáticamente.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loadCase([{x: 64, y: 66}, {x: 66, y: 67.2}, {x: 68, y: 68.2}, {x: 70, y: 69.2}, {x: 72, y: 70.2}], 0.0001)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <Play size={18} /> Cargar Caso Galton en el Simulador
              </button>
            </div>

            {/* Caso 3: CAPM */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl hover:border-slate-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-800/50 text-slate-300 rounded-lg"><TrendingUp size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Riesgo Financiero (CAPM)</h3>
                  <p className="text-slate-400 font-medium">Wall Street — Finanzas Cuantitativas</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3 text-sm text-slate-300">
                  <p>El modelo CAPM (Capital Asset Pricing Model) usa regresión lineal para medir cuánto se mueve una acción en relación con el mercado completo. Los analistas de Wall Street corren esta regresión cada mes para clasificar acciones como "agresivas" o "conservadoras".</p>
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-1.5">
                    <p><strong className="text-slate-200">X</strong> — Rendimiento mensual del mercado (S&amp;P 500), en porcentaje.</p>
                    <p><strong className="text-slate-200">Y</strong> — Rendimiento mensual de la acción, en porcentaje.</p>
                    <p><strong className="text-slate-200">m = Beta (β)</strong> — Sensibilidad al mercado. β &gt; 1: la acción amplifica los movimientos del mercado (más riesgo). β &lt; 1: más estable que el mercado. β &lt; 0: se mueve al revés (activo refugio).</p>
                    <p><strong className="text-slate-200">b = Alpha (α)</strong> — Rendimiento propio de la acción, independiente del mercado. Alpha positivo es el "valor agregado" del gestor o la empresa.</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                    <p className="text-slate-400 font-semibold mb-2">Cómo usar el modelo</p>
                    <p className="text-slate-300">Si el mercado sube un 3% este mes y la acción tiene β=1.5:<br/><span className="font-mono text-slate-200">ŷ = 1.5 × 3 + 0 = 4.5%</span><br/>La acción debería subir 4.5%. Si realmente subió 6%, el Alpha fue de +1.5% — la empresa generó valor extra. Para verificarlo, solo necesitas los datos históricos mensuales de la acción y el índice.</p>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-slate-400">
                    <p className="font-semibold text-slate-300 mb-2">Los 7 pasos del sistema aplicados</p>
                    <ul className="space-y-1">
                      <li><strong className="text-slate-300">Paso 1 (ŷ):</strong> Predice el rendimiento de la acción según el mercado del mes.</li>
                      <li><strong className="text-slate-300">Pasos 2-3 (errores):</strong> Diferencia entre rendimiento predicho y real de la acción.</li>
                      <li><strong className="text-slate-300">Paso 4 (J):</strong> MSE en puntos porcentuales². Cuanto menor, mejor ajuste histórico.</li>
                      <li><strong className="text-slate-300">Paso 5 (matrices):</strong> Los productos eᵢ·xᵢ ponderan los meses de alta volatilidad.</li>
                      <li><strong className="text-slate-300">Paso 6 (gradientes):</strong> Indica hacia dónde ajustar Beta y Alpha.</li>
                      <li><strong className="text-slate-300">Paso 7 (actualización):</strong> Converge en Beta=1.5 — la acción amplifica el mercado x1.5.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loadCase([{x: -2.0, y: -3.0}, {x: 1.0, y: 1.5}, {x: 3.0, y: 4.5}, {x: -1.0, y: -1.5}, {x: 4.0, y: 6.0}], 0.01)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <Play size={18} /> Cargar Caso CAPM en el Simulador
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
