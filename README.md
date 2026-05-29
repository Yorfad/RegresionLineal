# Simulador de Regresión Lineal

Aplicación web educativa e interactiva para aprender Regresión Lineal Simple mediante visualización paso a paso del algoritmo de Descenso de Gradiente. Incluye un asistente de IA integrado, teoría completa y un simulador de gran escala con miles de datos reales.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Cómo Funciona la Aplicación](#cómo-funciona-la-aplicación)
  - [Pestaña 1: Simulador Paso a Paso](#pestaña-1-simulador-paso-a-paso)
  - [Pestaña 2: Teoría y Casos Reales](#pestaña-2-teoría-y-casos-reales)
  - [Pestaña 3: Gran Escala (Miles de Datos)](#pestaña-3-gran-escala-miles-de-datos)
- [Arquitectura del Código](#arquitectura-del-código)
  - [Hook Principal: useLinearRegression](#hook-principal-uselinearregression)
  - [Componentes](#componentes)
  - [Páginas](#páginas)
- [El Algoritmo Implementado](#el-algoritmo-implementado)
- [Flujo de Datos](#flujo-de-datos)
- [Chatbot con IA](#chatbot-con-ia)
- [Configuración de la API de Gemini](#configuración-de-la-api-de-gemini)

---

## Descripción General

Este proyecto es un **simulador didáctico de Regresión Lineal Simple** diseñado para estudiantes universitarios. Permite:

- Ver cómo el algoritmo ajusta una línea recta (`ŷ = m·x + b`) iteración por iteración
- Entender cada cálculo matemático paso a paso (predicciones, errores, gradientes, actualización de parámetros)
- Probar el modelo entrenado con cualquier valor de entrada
- Experimentar con datos reales a gran escala (casas de Seattle, emisiones de CO₂, salarios tech)
- Preguntar dudas a un asistente de IA que conoce el estado exacto del simulador

---

## Tecnologías Utilizadas

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework UI | React | 19.x |
| Lenguaje | TypeScript | 6.x |
| Bundler | Vite | 8.x |
| Estilos | Tailwind CSS | 4.x |
| Gráficas (datos pequeños) | Recharts | 3.x |
| Gráficas (datos grandes) | Canvas API nativo | — |
| Fórmulas matemáticas | KaTeX + remark-math + rehype-katex | — |
| Markdown | react-markdown | 10.x |
| Iconos | Lucide React | — |
| Inteligencia Artificial | Google Generative AI (Gemini) | — |
| Linting | ESLint + typescript-eslint | — |

---

## Estructura del Proyecto

```
RegresionLineal/
├── index.html                      # Punto de entrada HTML
├── package.json                    # Dependencias y scripts
├── vite.config.ts                  # Configuración del bundler
├── tsconfig.json                   # Configuración TypeScript (raíz)
├── tsconfig.app.json               # Configuración TypeScript para la app
├── .env                            # Variables de entorno (API Key de Gemini)
│
└── src/
    ├── main.tsx                    # Monta React en el DOM
    ├── App.tsx                     # Componente raíz: navegación entre pestañas
    ├── index.css                   # Estilos globales, tema, fixes de KaTeX
    │
    ├── hooks/
    │   └── useLinearRegression.ts  # Toda la lógica del algoritmo de regresión
    │
    ├── components/
    │   ├── Sidebar.tsx             # Panel izquierdo: ingresar y gestionar datos
    │   ├── MainChart.tsx           # Gráfica con Recharts (simulador básico)
    │   ├── CanvasChart.tsx         # Gráfica con Canvas (gran escala)
    │   ├── MathPanel.tsx           # Panel derecho: cálculos paso a paso
    │   └── Chatbot.tsx             # Asistente de IA (inline o popup)
    │
    └── pages/
        ├── TheoryPage.tsx          # Página de teoría + laboratorio interactivo
        └── LargeScaleSimulator.tsx # Simulador con miles de datos reales
```

---

## Instalación y Ejecución

### Requisitos previos
- Node.js 18 o superior
- npm 9 o superior

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Yorfad/RegresionLineal.git
cd RegresionLineal

# 2. Instalar dependencias
npm install

# 3. (Opcional) Configurar la API de Gemini
echo "VITE_GEMINI_API_KEY=tu_api_key_aqui" > .env

# 4. Iniciar el servidor de desarrollo
npm run dev

# 5. Abrir en el navegador: http://localhost:5173
```

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con hot-reload |
| `npm run build` | Compila TypeScript y genera el bundle de producción |
| `npm run preview` | Sirve el bundle de producción localmente |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto |

---

## Cómo Funciona la Aplicación

La aplicación tiene tres pestañas accesibles desde la barra de navegación superior.

### Pestaña 1: Simulador Paso a Paso

Es la vista principal. Permite ver el algoritmo de descenso de gradiente ejecutándose paso a paso con datos propios.

**Panel izquierdo — Sidebar:**
- Ingresa la **pendiente inicial** (`m`), el **intercepto inicial** (`b`) y la **tasa de aprendizaje** (`α`)
- Añade o elimina pares de datos (`x`, `y`) manualmente
- Pega datos en formato CSV: separados por comas, espacios o saltos de línea (`1,2 3,4 5,6` o uno por línea)
- Los inputs se **bloquean automáticamente** al comenzar a calcular; se desbloquean con **Reset**

**Panel central — Gráfica + Widget del modelo:**
- Muestra los puntos de datos y la línea de regresión ajustada en tiempo real
- Widget "Modelo ajustado": muestra la ecuación `ŷ = m·x + b`, explica `m` y `b`, y tiene un campo de prueba donde ingresas cualquier `x` y ves la predicción instantánea

**Chatbot (desplegable hacia abajo):**
- Conoce el estado exacto del simulador (iteración, m, b, gradientes, MSE, datos)
- Responde preguntas sobre el modelo, calcula predicciones con los valores actuales
- Enter envía el mensaje; Shift+Enter inserta un salto de línea

**Panel derecho — MathPanel (7 pasos):**

| # | Paso | Qué muestra |
|---|------|-------------|
| 1 | Predicciones (ŷ) | `ŷᵢ = m·xᵢ + b` para cada punto, fila a fila |
| 2 | Error por dato | `eᵢ = ŷᵢ − yᵢ` fila a fila |
| 3 | Error cuadrático | `eᵢ²` para cada error |
| 4 | Error total (J) | `J = (1/n)·Σeᵢ²` con sustitución completa |
| 5 | Matrices | Vector X, vector e, productos `eᵢ·xᵢ` y sumas parciales |
| 6 | Gradientes | `∂J/∂b` y `∂J/∂m` con cálculo detallado |
| 7 | Actualización | `m_nuevo` y `b_nuevo` con cada paso de la sustitución |

**Botones de control:**

| Botón | Acción |
|-------|--------|
| Anterior | Retrocede un paso; si está en el paso 1, va a la iteración anterior |
| Siguiente | Avanza un paso; en el paso 7 aplica la actualización y pasa a la siguiente iteración |
| Iteración | Ejecuta los 7 pasos de una sola vez |
| Reset | Restaura datos y parámetros por defecto, desbloquea los inputs |

---

### Pestaña 2: Teoría y Casos Reales

Página educativa completa con:

- **Guía maestra de 5 pasos** para resolver cualquier problema de regresión lineal
- **Tutorial práctico** para resolver "horas estudiadas vs. calificación" a mano y comprobar los resultados en el simulador embebido
- **3 casos reales históricos** cargables en el simulador con un clic:

| Caso | Año | Variables |
|------|-----|-----------|
| Ley de Hubble | 1929 | Distancia de galaxias → velocidad de recesión (expansión del universo) |
| Francis Galton | 1886 | Estatura de padres → estatura de hijos (origen del término "regresión") |
| Modelo CAPM | Actual | Rendimiento del mercado → rendimiento de una acción (Beta financiero) |

El chatbot en esta pestaña aparece como **popup** flotante en la esquina inferior derecha.

---

### Pestaña 3: Gran Escala (Miles de Datos)

Simulador de alto rendimiento para conjuntos de datos de 1,200 a 2,000 puntos.

**Datasets disponibles:**

| Dataset | Puntos | Variables |
|---------|--------|-----------|
| Casas de Seattle (simulado realista) | 2,000 | Tamaño (pies²) → Precio ($k) |
| Emisiones de CO₂ (simulado realista) | 1,500 | Cilindrada (L) → CO₂ (g/km) |
| Salarios Tech (simulado realista) | 1,200 | Años de experiencia → Sueldo ($k) |
| Generador Sintético | Configurable | Pendiente, intercepto y nivel de ruido a elección |
| Datos Personalizados | Los del usuario | Cualquier par X, Y en formato CSV |

**Características:**
- Datos generados con PRNG determinista (siempre los mismos valores con la misma semilla)
- Toggle de **Normalización Min-Max** que escala X e Y a `[0, 1]` para estabilidad numérica
- Demostración del **Gradiente Explosivo**: al desactivar normalización con learning rate alto, los parámetros divergen a `Infinity`
- Curva de pérdida (MSE) en tiempo real
- Control de velocidad: de 1 a 100 épocas por fotograma
- Widget de predicción: escribe un valor `X` y obtiene `ŷ` al instante
- El chatbot aparece como **popup** con acceso al estado actual del modelo

---

## Arquitectura del Código

### Hook Principal: `useLinearRegression`

**Archivo:** `src/hooks/useLinearRegression.ts`

Es el núcleo de toda la lógica del simulador básico. Todos los componentes de la pestaña "Simulador" lo consumen desde `App.tsx`.

```typescript
// Los 7 pasos del algoritmo
const Step = {
  PREDICTIONS:     0,  // ŷ = m·x + b
  ERRORS:          1,  // e = ŷ - y
  SQUARED_ERRORS:  2,  // e²
  MSE:             3,  // J = (1/n)·Σe²
  MATRICES:        4,  // vectores X y e, productos eᵢ·xᵢ
  GRADIENTS:       5,  // ∂J/∂m, ∂J/∂b
  UPDATE:          6,  // m_nuevo, b_nuevo
}
```

El objeto `calculations` se recalcula automáticamente con `useMemo` cada vez que cambian `data`, `m`, `b` o `learningRate`:

```typescript
calculations = {
  n,              // cantidad de puntos válidos
  points,         // datos limpios (filtrados por valores numéricos)
  predictions,    // ŷᵢ para cada punto
  errors,         // eᵢ = ŷᵢ - yᵢ
  squaredErrors,  // eᵢ²
  mse,            // J = Σeᵢ² / n
  gradM,          // ∂J/∂m
  gradB,          // ∂J/∂b
  nextM,          // m - α·∂J/∂m
  nextB,          // b - α·∂J/∂b
}
```

**Funciones clave:**

```typescript
nextStep()                   // avanza un paso; en el paso 7 aplica la actualización y va a iteración siguiente
prevStep()                   // retrocede usando el historial de iteraciones almacenado en history[]
runFullIteration()           // ejecuta los 7 pasos de una vez sin animación intermedia
runMultipleIterations(n)     // ejecuta n iteraciones completas en un solo bucle JS (sin re-renderizado)
solveAnalytically()          // calcula m y b exactos usando las Ecuaciones Normales (sin gradiente)
reset()                      // restaura todo al estado inicial (iteration=0, step=0)
```

**¿Por qué `solveAnalytically`?** El descenso de gradiente es iterativo y puede tardar miles de pasos en converger. Las Ecuaciones Normales dan la solución exacta en una sola pasada por los datos:

```
m = (n·Σxᵢyᵢ - Σxᵢ·Σyᵢ) / (n·Σxᵢ² - (Σxᵢ)²)
b = (Σyᵢ - m·Σxᵢ) / n
```

Esta función se usa en el botón "Resolver (exacto)" de la página de Teoría para demostrar la diferencia entre la solución iterativa (gradiente) y la solución analítica (matemática directa).

---

### Componentes

#### `Sidebar.tsx`

Panel de configuración izquierdo. Gestiona la entrada de datos del usuario.

- **Prop `locked`:** cuando el usuario ha comenzado a calcular (`currentStep > 0 || iteration > 0`), los inputs de datos X/Y y sus botones add/delete se deshabilitan. Los parámetros `m`, `b` y `α` permanecen editables en todo momento — el usuario puede cambiarlos mientras el algoritmo avanza. Se desbloquea al hacer Reset.
- **`parsePasteData(text)`:** parsea texto libre con pares `x, y` en cualquier formato (CSV con comas, separado por espacios, uno por línea, o combinación). Separa por `[\s,]+` y empareja valores de dos en dos. Acepta `1,2 3,4 5,6` o `1,2\n3,4\n5,6` o `1 2\n3 4`.
- Sección "Pegar Datos" colapsable con `ChevronDown/Up`. Solo visible cuando los inputs no están bloqueados.

#### `MainChart.tsx`

Gráfica del simulador básico con **Recharts**.

- Usa `ComposedChart` con un `Scatter` para los puntos y una `Line` para la recta
- Calcula los dos puntos extremos de la línea a partir de `m`, `b` y los límites del dominio de los datos
- Filtra valores inválidos (`NaN`, vacíos) antes de renderizar

#### `CanvasChart.tsx`

Gráfica de alto rendimiento para miles de puntos. Usa `<canvas>` con la API 2D del navegador.

- Calcula la escala de ejes (`minX`, `maxX`, `minY`, `maxY`) para mapear coordenadas de datos a píxeles
- Re-dibuja en cada `useEffect` cuando cambian `data`, `m` o `b`
- Detecta el punto más cercano al cursor con `onMouseMove` y muestra un tooltip con `x`, `y`, predicción y error

#### `MathPanel.tsx`

Panel de cálculos paso a paso del simulador básico.

El componente interno `StepCard` controla qué pasos son visibles:

```typescript
// Solo aparece si el paso actual >= al stepId del card
// El card activo tiene fondo destacado; los anteriores aparecen atenuados
const StepCard = ({ stepId, currentStep, title, children }) => {
  if (currentStep < stepId) return null;
  const isActive = currentStep === stepId;
  ...
};
```

Cada `FormulaBox` tiene dos líneas:
1. La fórmula matemática en `font-mono`
2. Un subtítulo en lenguaje natural (prop `sub`) que la explica

#### `Chatbot.tsx`

Asistente de IA con dos modos controlados por la prop `mode`:

**`mode="inline"` (Simulador):**
Renderiza un panel dentro del flujo normal, con barra de toggle arriba que abre el chat hacia abajo.

**`mode="popup"` (Teoría y Gran Escala):**
Renderiza un botón FAB flotante que abre una ventana 400×520px en la esquina inferior derecha.

El input del chat es un `<textarea>` auto-expansible:
- Empieza con 1 línea de alto
- Crece automáticamente hasta 150px conforme se escribe
- **Enter** envía, **Shift+Enter** inserta salto de línea
- Al enviar se resetea a 1 línea

El sistema de prompts construye un `systemContext` dinámico antes de cada llamada a Gemini que incluye el estado completo del simulador activo (m, b, gradientes, MSE, ecuación del modelo) más instrucciones explícitas para calcular predicciones y manejar problemas externos.

---

### Páginas

#### `TheoryPage.tsx`

Contiene la teoría como un string de Markdown largo con fórmulas LaTeX, renderizado con `react-markdown` + KaTeX.

El laboratorio interactivo embebido:
- Tiene su propia instancia de `useLinearRegression`
- Precarga el dataset de ejemplo al montar el componente
- Un sistema de `tutorialStep` (0–3) guía al usuario con indicadores animados
- Reutiliza `MainChart` y `MathPanel` para mostrar el estado en tiempo real

Los botones de casos reales llaman a `loadCase(caseId, data, learningRate)` que:
1. Hace reset del hook
2. Carga los datos del caso
3. Establece el `activeCase` (Hubble, Galton, CAPM o tutorial) para que `getDynamicLaboratoryExplanation()` genere texto específico al contexto del problema
4. Hace scroll al laboratorio

El estado `solvedAnalytically` diferencia entre solución por gradiente y solución por Ecuaciones Normales — la explicación del panel cambia según cuál se usó.

#### `LargeScaleSimulator.tsx`

Simulador encapsulado. Toda su lógica de entrenamiento es interna; solo expone el estado actual a `App.tsx` mediante el callback `onStateChange` (para que el chatbot tenga contexto).

**Generador de datos determinista (Mulberry32):**
```typescript
const createRandomGenerator = (seed: number) => {
  let s = seed;
  return () => {
    let z = (s = (s + 0x9e3779b9) | 0);
    z = Math.imul(z ^ (z >>> 16), 2246822507);
    z = Math.imul(z ^ (z >>> 13), 3266489909);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
};
```
La misma semilla siempre produce los mismos datos, lo que hace los experimentos reproducibles.

**Bucle de entrenamiento con `requestAnimationFrame`:**
```typescript
// Ejecuta N épocas por frame (configurable 1–100x)
// Mantiene la UI responsiva mientras entrena
const animateTraining = (time: number) => {
  runBatch(trainingSpeed);
  requestRef.current = requestAnimationFrame(animateTraining);
};
```

**Por qué normalizar — la raíz del problema:**

Cuando los datos no están normalizados (por ejemplo, X = tamaño de casa en pies², rango 800–4500), el gradiente de la pendiente incluye la suma `Σ(eᵢ · xᵢ)`. Los errores se multiplican por valores grandes (hasta 4500), produciendo gradientes del orden de millones. Con α=0.1, un solo paso de actualización podría cambiar `m` en cientos de miles de unidades — el modelo explota a `NaN` en la primera iteración.

**Cómo funciona la normalización Min-Max:**

```typescript
// Antes de entrenar, se mapean x e y al rango [0, 1]
const x_norm = (x - minX) / rangeX    // rangeX = maxX - minX
const y_norm = (y - minY) / rangeY    // rangeY = maxY - minY

// El gradiente ahora trabaja con valores x' ∈ [0, 1] → magnitudes controladas
// Se entrena en espacio normalizado:
localMNorm -= learningRate * gradM    // m en espacio [0,1]
localBNorm -= learningRate * gradB    // b en espacio [0,1]
```

**Conversión de vuelta a escala original para mostrar al usuario:**

El modelo entrenado tiene `m_norm` y `b_norm` en espacio normalizado. Para mostrar la ecuación en unidades reales (pies² → $k):

```
// Derivación matemática:
// En espacio normalizado: y' = m_norm · x' + b_norm
// Sustituyendo: (y-minY)/rangeY = m_norm · (x-minX)/rangeX + b_norm
// Despejando y:
//   y = m_norm · (rangeY/rangeX) · x
//       + [b_norm · rangeY + minY - m_norm · (minX/rangeX) · rangeY]

m_orig = m_norm · (rangeY / rangeX)
b_orig = (b_norm - m_norm · minX/rangeX) · rangeY + minY
```

Esta conversión se ejecuta en un `useEffect` cada vez que cambian `mNorm`, `bNorm`, `normalize` o los datos, y es lo que muestra el widget "MODELO AJUSTADO" en la interfaz.

**Detección de gradiente explosivo:**

```typescript
if (isNaN(localMNorm) || !isFinite(localMNorm) ||
    isNaN(localBNorm) || !isFinite(localBNorm)) {
  setIsExploded(true);  // Activa el aviso rojo y detiene el entrenamiento
  break;
}
```

Esto ocurre cuando, sin normalización y con α alto, los parámetros exceden el límite de representación de `float64` (~1.8×10³⁰⁸).

**Curva de pérdida (MSE history):**

El simulador grande mantiene un historial circular de hasta 100 puntos `{ iteration, mse }`. Se dibuja con Canvas en un elemento `<canvas ref={lossCanvasRef} width={96} height={40}>` usando `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, `ctx.stroke()`. El canvas escala el MSE al rango de píxeles disponible.

---

## El Algoritmo Implementado

La regresión lineal simple busca `m` y `b` en `ŷ = m·x + b` que minimicen el Error Cuadrático Medio:

```
J(m, b) = (1/n) · Σᵢ (ŷᵢ - yᵢ)²
```

El **Descenso de Gradiente** actualiza los parámetros iterativamente en la dirección opuesta al gradiente:

```
∂J/∂m = (2/n) · Σᵢ (ŷᵢ - yᵢ) · xᵢ
∂J/∂b = (2/n) · Σᵢ (ŷᵢ - yᵢ)

m ← m - α · ∂J/∂m
b ← b - α · ∂J/∂b
```

Donde `α` es la **tasa de aprendizaje**. Si `α` es muy grande y los datos no están normalizados, el gradiente explota: los parámetros divergen a `±Infinity` en pocas iteraciones.

---

## Flujo de Datos

```
[Sidebar]
  datos (x, y), m, b, α
        ↓
[useLinearRegression]
  useMemo recalcula predictions, errors,
  squaredErrors, mse, gradM, gradB, nextM, nextB
        ↓
  ┌─────────────┬────────────┬──────────────┬──────────────┐
  ↓             ↓            ↓              ↓              ↓
[MainChart]  [MathPanel]  [Widget ŷ]  [Chatbot]     [App header]
 (gráfica)   (7 pasos)  (predicción)  (contexto IA) (iteración/paso)
```

En la pestaña **Gran Escala**, toda la lógica vive dentro de `LargeScaleSimulator.tsx`. El único dato que sube es el estado resumido via `onStateChange` para que el chatbot pueda responder preguntas sobre el modelo.

---

## Chatbot con IA

El asistente utiliza el modelo `gemini-flash-latest` de Google. Tiene dos modos de renderizado:

- **`mode="inline"`** (Simulador): panel colapsable embebido en el flujo de la página, se despliega hacia abajo.
- **`mode="popup"`** (Teoría y Gran Escala): botón FAB en esquina inferior derecha que abre una ventana 400×520px.

### Cómo se construye el contexto

Antes de cada llamada a la API de Gemini, el componente ensambla un `systemContext` con el estado exacto del simulador activo. Este es el flujo:

```
[Usuario escribe un mensaje]
        ↓
handleSend() se ejecuta
        ↓
Se construye systemContext según el activeTab:

  if (activeTab === 'simulator') {
    // Incluye: iteración, paso actual (StepName[step]),
    // m con 6 decimales, b con 6 decimales,
    // ecuación ŷ = m·x + b lista para sustitución,
    // gradM y gradB del último cálculo,
    // todos los pares (x, y) del dataset como JSON,
    // MSE con 6 decimales,
    // instrucción explícita: "calcula ŷ = {m} × x + {b} y muestra la sustitución"
  }
  if (activeTab === 'massive') {
    // Incluye: dataset activo, épocas, m y b en escala original,
    // ecuación ajustada, MSE, normalización activa, gradiente explotado,
    // instrucción de predicción con los valores actuales
  }
  if (activeTab === 'theory') {
    // Contexto sobre lo que el usuario está leyendo
  }

        ↓
prompt = systemContext + "\n\nPregunta del usuario: " + userMessage
        ↓
model.generateContent(prompt)
        ↓
Respuesta renderizada con react-markdown + KaTeX
```

**Capacidades declaradas explícitamente al modelo:**

1. Usar los valores exactos del simulador (`m`, `b`, `gradM`, `gradB`) para responder predicciones
2. Calcular `ŷ = m·x_nuevo + b` mostrando la sustitución numérica completa
3. Resolver problemas de regresión externos con las Ecuaciones Normales cuando el usuario provee datos
4. Interpretar pendiente, intercepto, MSE y gradientes en el contexto del problema
5. Responder siempre en español con formato LaTeX para fórmulas matemáticas

### Fórmulas matemáticas en el chat

Las respuestas de Gemini usan sintaxis LaTeX que `react-markdown` + `rehype-katex` convierte a fórmulas renderizadas:

| Sintaxis en texto | Resultado visual |
|-------------------|-----------------|
| `$\hat{y} = mx + b$` | Fórmula inline |
| `$$J = \frac{1}{n}\sum e_i^2$$` | Bloque de fórmula centrado |

El archivo `index.css` incluye un fix para `.katex-display { overflow-x: auto }` que evita que fórmulas largas rompan el layout horizontal del chat.

---

## Configuración de la API de Gemini

**Opción A — Variable de entorno:**
```bash
# Archivo .env en la raíz del proyecto
VITE_GEMINI_API_KEY=AIzaSy...
```
> La clave queda expuesta en el bundle de producción. Solo usar en entornos controlados.

**Opción B — Configuración por usuario (recomendada para producción):**
El chatbot incluye un panel de configuración (icono de llave en la barra del chat) donde cada usuario pega su propia API Key. Se almacena en `localStorage` del navegador y nunca sale del dispositivo.

Las claves de Gemini son gratuitas en [Google AI Studio](https://aistudio.google.com).
