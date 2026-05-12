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

## 🧭 La Guía Maestra: Cómo Resolver Cualquier Problema

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

## 🛠️ Tutorial Práctico: Resuélvelo a Mano

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
`;

// theoryContentBottom refactored to JSX components below.

export const TheoryPage: React.FC = () => {
  const lr = useLinearRegression();
  const [tutorialStep, setTutorialStep] = useState(0);

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
    if (lr.iteration > 1 && tutorialStep === 2) {
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

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 md:p-12 custom-scrollbar">
      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 md:p-16 mb-20 
          prose prose-invert prose-emerald max-w-none 
          prose-h1:text-4xl prose-h1:font-extrabold prose-h1:bg-gradient-to-r prose-h1:from-emerald-400 prose-h1:to-blue-400 prose-h1:bg-clip-text prose-h1:text-transparent
          prose-h2:text-3xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-4 prose-h2:mt-16
          prose-h3:text-2xl prose-h3:text-emerald-400 prose-h3:mt-10
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
              <Zap className="text-yellow-400" /> Laboratorio Interactivo: Compruébalo Tú Mismo
            </h3>
            <p className="text-slate-300 text-sm">
              Sigue las instrucciones animadas para replicar las matemáticas de arriba en el simulador real. Esta es una herramienta funcional, ¡prueba con tus propios datos después!
            </p>
          </div>

          {/* Interactive Tutorial Guide */}
          <div className="flex flex-wrap bg-slate-900 border-b border-slate-800 p-4 gap-4 justify-between items-center text-sm font-medium">
             <div className={`flex items-center gap-2 transition-colors duration-500 ${tutorialStep === 0 ? 'text-blue-400 animate-pulse' : 'text-slate-500 line-through'}`}>
                <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 font-bold">1</span>
                Añade puntos en X=1, 2 y 3
             </div>
             <ArrowRight className="text-slate-700 hidden md:block" />
             <div className={`flex items-center gap-2 transition-colors duration-500 ${tutorialStep === 1 ? 'text-blue-400 animate-pulse scale-105' : tutorialStep > 1 ? 'text-slate-500 line-through' : 'text-slate-600'}`}>
                <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 font-bold">2</span>
                Ajusta Learning Rate a 0.01
             </div>
             <ArrowRight className="text-slate-700 hidden md:block" />
             <div className={`flex items-center gap-2 transition-colors duration-500 ${tutorialStep === 2 ? 'text-emerald-400 animate-pulse font-bold text-base scale-105' : tutorialStep > 2 ? 'text-emerald-500' : 'text-slate-600'}`}>
                <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-slate-900 font-bold">3</span>
                {tutorialStep > 2 ? '¡Matemáticas Replicadas!' : 'Haz clic en "Siguiente"'}
             </div>
          </div>

          <div className="flex flex-col xl:flex-row h-auto xl:h-[600px]">
             {/* Left side: Graph and controls */}
             <div className="flex-1 flex flex-col p-4 gap-4 relative min-h-[400px]">
               
               {/* Controls */}
               <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700 shadow-inner">
                  <div className="flex items-center gap-3">
                     <label className="text-slate-300 font-medium text-sm">Learning Rate (α):</label>
                     <input 
                        type="number" 
                        step="0.001"
                        value={lr.learningRate} 
                        onChange={(e) => lr.setLearningRate(Number(e.target.value))}
                        className={`w-24 bg-slate-950 border rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 transition-all ${tutorialStep === 1 ? 'border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'border-slate-700'}`}
                     />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={lr.prevStep} disabled={lr.currentStep === 0 && lr.iteration === 1} className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors">
                      <SkipBack size={18} />
                    </button>
                    <button onClick={lr.nextStep} className={`flex items-center gap-2 px-4 py-2 rounded font-medium text-white shadow-lg transition-all ${tutorialStep === 2 ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(5,150,105,0.6)] animate-pulse' : 'bg-blue-600 hover:bg-blue-500'}`}>
                       Siguiente <SkipForward size={18} />
                    </button>
                    <button onClick={() => { lr.reset(); setTutorialStep(0); }} className="p-2 bg-slate-800 rounded hover:bg-rose-500/20 text-rose-400 ml-2 transition-colors">
                      <RotateCcw size={18} />
                    </button>
                  </div>
               </div>

               {/* Graph */}
               <div className={`flex-1 rounded-xl border relative overflow-hidden transition-all duration-500 ${tutorialStep === 0 ? 'border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-slate-700'}`}>
                 {tutorialStep === 0 && lr.data.length < 3 && (
                   <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center z-10">
                     <div className="bg-blue-600/90 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl animate-bounce whitespace-nowrap">
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
                {tutorialStep === 3 && (
                   <div className="p-4 bg-emerald-900/30 border-b border-emerald-800/50 flex flex-col gap-2 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 text-emerald-500/10">
                         <Zap size={100} />
                      </div>
                      <div className="text-emerald-400 font-bold flex items-center gap-2 text-lg"><Zap size={20} /> ¡Éxito Matemático!</div>
                      <p className="text-sm text-emerald-100/80 leading-relaxed relative z-10">
                        Compara los gradientes (-18.667 y -8) y los nuevos pesos (m:0.1867, b:0.08) en el panel de abajo con los cálculos manuales que leíste arriba. ¡El simulador hizo exactamente la misma matemática que tú!
                      </p>
                   </div>
                )}
                <MathPanel step={lr.currentStep} data={lr.data} m={lr.m} b={lr.b} learningRate={lr.learningRate} calculations={lr.calculations} />
             </div>
          </div>
        </div>

        {/* CASOS FAMOSOS JSX */}
        <div className="mt-20 border-t border-slate-800 pt-16">
          <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
            🌍 Casos Famosos de Regresión Lineal
          </h2>
          <p className="text-lg text-slate-300 mb-10">
            Para que veas que esto no es solo para predecir calificaciones, aquí hay tres casos reales que usaron regresión lineal y cambiaron al mundo. Cárgalos en el simulador para ver la matemática en acción.
          </p>

          <div className="flex flex-col gap-8 not-prose">
            {/* Caso 1: Hubble */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-900/30 text-blue-400 rounded-lg"><Telescope size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-white">La Expansión del Universo</h3>
                  <p className="text-blue-400 font-medium">Edwin Hubble (1929) - Ley de Hubble</p>
                </div>
              </div>
              <p className="text-slate-300 mb-6">Hubble aplicó regresión lineal para demostrar que el universo se expande. Relacionó la distancia de las galaxias con la velocidad a la que se alejan.</p>
              
              <div className="bg-slate-950 rounded-lg p-5 mb-6 border border-slate-800 text-sm text-slate-400">
                <strong className="text-white block mb-2">Los 5 Pasos en acción:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>1. Modelado:</strong> $X$ = Distancia de la galaxia, $Y$ = Velocidad de alejamiento.</li>
                  <li><strong>2. Predicciones:</strong> Al inicio asumimos que la velocidad no depende de la distancia ($m=0$).</li>
                  <li><strong>3. Error:</strong> Comparamos nuestras predicciones con las medidas reales del telescopio.</li>
                  <li><strong>4. Gradiente:</strong> Vemos que si aumentamos la pendiente $m$, el error se reduce muchísimo.</li>
                  <li><strong>5. Actualización:</strong> Ajustamos la línea hasta encontrar la "Constante de Hubble".</li>
                </ul>
              </div>

              <button 
                onClick={() => loadCase([{x: 1, y: 1.9}, {x: 2, y: 4.1}, {x: 3, y: 5.8}, {x: 4, y: 8.2}], 0.01)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <Play size={18} /> Cargar Caso Hubble en el Simulador
              </button>
            </div>

            {/* Caso 2: Galton */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-900/30 text-emerald-400 rounded-lg"><Dna size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-white">El Origen del nombre "Regresión"</h3>
                  <p className="text-emerald-400 font-medium">Sir Francis Galton - Biología Evolutiva</p>
                </div>
              </div>
              <p className="text-slate-300 mb-6">Galton trazó una línea para relacionar la altura de padres altos con la de sus hijos. Notó que los hijos "regresaban" hacia el promedio, bautizando al algoritmo para siempre.</p>
              
              <div className="bg-slate-950 rounded-lg p-5 mb-6 border border-slate-800 text-sm text-slate-400">
                <strong className="text-white block mb-2">Los 5 Pasos en acción:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>1. Modelado:</strong> $X$ = Altura de los padres, $Y$ = Altura de los hijos.</li>
                  <li><strong>2. Predicciones:</strong> El modelo empieza prediciendo alturas en base a una pendiente de cero.</li>
                  <li><strong>3. Error:</strong> Calculamos el MSE de las predicciones frente a los verdaderos datos familiares.</li>
                  <li><strong>4. Gradiente:</strong> Calculamos hacia dónde mover la pendiente para mejorar el ajuste.</li>
                  <li><strong>5. Actualización:</strong> La línea converge mostrando que $m$ es menor a 1 (Regresión hacia la media).</li>
                </ul>
              </div>

              <button 
                onClick={() => loadCase([{x: 16, y: 16.5}, {x: 17, y: 17.2}, {x: 18, y: 17.8}, {x: 19, y: 18.5}], 0.001)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <Play size={18} /> Cargar Caso Galton en el Simulador (LR: 0.001)
              </button>
            </div>

            {/* Caso 3: CAPM */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl hover:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-900/30 text-purple-400 rounded-lg"><TrendingUp size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Modelo CAPM y el Riesgo</h3>
                  <p className="text-purple-400 font-medium">Wall Street - Finanzas Cuantitativas</p>
                </div>
              </div>
              <p className="text-slate-300 mb-6">Usado por todo banco de inversión. Mide el riesgo de una acción comparada con el mercado. A la pendiente $m$ se le llama "Beta" (riesgo relativo) y al intercepto $b$, "Alpha".</p>
              
              <div className="bg-slate-950 rounded-lg p-5 mb-6 border border-slate-800 text-sm text-slate-400">
                <strong className="text-white block mb-2">Los 5 Pasos en acción:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>1. Modelado:</strong> $X$ = Rendimiento del mercado, $Y$ = Rendimiento de la acción.</li>
                  <li><strong>2. Predicciones:</strong> Suponemos al inicio que la acción no sigue al mercado ($m=0$).</li>
                  <li><strong>3. Error:</strong> Cuantificamos la diferencia entre nuestra predicción y el retorno real de la acción.</li>
                  <li><strong>4. Gradiente:</strong> Vemos cómo ajustar $m$ (Beta) y $b$ (Alpha) para acercarnos a la realidad.</li>
                  <li><strong>5. Actualización:</strong> Encontramos el Beta real. Si $m &gt; 1$, la acción es más volátil que el mercado.</li>
                </ul>
              </div>

              <button 
                onClick={() => loadCase([{x: 1, y: 1.2}, {x: 2, y: 2.5}, {x: 3, y: 3.1}, {x: 4, y: 4.8}, {x: 5, y: 5.5}], 0.01)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <Play size={18} /> Cargar Caso Wall Street en el Simulador
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
