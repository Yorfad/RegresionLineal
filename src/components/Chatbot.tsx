import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Key, Eye, EyeOff, ChevronDown, ChevronUp, MessageCircle, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { StepName } from '../hooks/useLinearRegression';
import type { Step, DataPoint } from '../hooks/useLinearRegression';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  activeTab: 'simulator' | 'theory' | 'massive';
  iteration: number;
  step: Step;
  m: number | string;
  b: number | string;
  learningRate: number | string;
  mse: number;
  data: DataPoint[];
  mode?: 'inline' | 'popup';
  gradM?: number;
  gradB?: number;
  massiveState?: {
    datasetType: 'seattle' | 'co2' | 'salaries' | 'synthetic' | 'custom';
    iteration: number;
    mOrig: number;
    bOrig: number;
    learningRate: number;
    mse: number;
    normalize: boolean;
    isExploded: boolean;
    dataCount: number;
  };
}

export const Chatbot: React.FC<ChatbotProps> = ({
  activeTab,
  iteration,
  step,
  m,
  b,
  learningRate,
  mse,
  data,
  mode = 'inline',
  gradM,
  gradB,
  massiveState,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom API Key from localStorage
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showKey, setShowKey] = useState(false);

  // Active API key (Vite env var or user custom key)
  const activeApiKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  const [messages, setMessages] = useState<Message[]>(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const userKey = localStorage.getItem('gemini_api_key') || '';
    
    if (!envKey && !userKey) {
      return [
        { 
          role: 'assistant', 
          content: '¡Hola! Soy tu asistente de ML. ⚠️ **Nota:** No se detectó ninguna API Key de Gemini configurada. Por favor, haz clic en el icono de llave (🔑) en la cabecera del chat e ingresa tu API Key de Google AI Studio (es gratuita) para habilitar el tutor de IA.' 
        }
      ];
    }
    return [{ role: 'assistant', content: '¡Hola! Soy tu asistente de Machine Learning. Pregúntame sobre el algoritmo o lo que estás viendo en la simulación.' }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  useEffect(() => {
    if (input === '') autoResize(textareaRef.current);
  }, [input]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (!activeApiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: '❌ **Error:** No se ha configurado ninguna API Key. Haz clic en el icono de llave (🔑) arriba para ingresar una.' }]);
        setIsLoading(false);
        return;
      }
      const genAI = new GoogleGenerativeAI(activeApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      // Context-Aware Prompting
      let activeTabName = "";
      let statusDetails = "";

      if (activeTab === 'simulator') {
        activeTabName = "Simulador Paso a Paso";
        const mNum = Number(m) || 0;
        const bNum = Number(b) || 0;
        statusDetails = `
- Iteración actual: ${iteration}
- Paso actual dentro de la iteración: ${StepName[step]}
- Pendiente (m / β₁): ${mNum.toFixed(6)}  → por cada unidad que aumenta x, ŷ cambia en ${mNum.toFixed(6)}
- Intercepto (b / β₀): ${bNum.toFixed(6)}  → cuando x = 0, ŷ = ${bNum.toFixed(6)} (donde la recta toca el eje Y)
- Ecuación del modelo ajustado: ŷ = ${mNum.toFixed(4)} · x + ${bNum.toFixed(4)}
- Gradiente de pendiente (∂J/∂m): ${gradM !== undefined ? gradM.toFixed(6) : 'no calculado aún'}
- Gradiente de intercepto (∂J/∂b): ${gradB !== undefined ? gradB.toFixed(6) : 'no calculado aún'}
- Tasa de aprendizaje (α): ${learningRate}
- Error actual (MSE): ${mse ? mse.toFixed(6) : 'N/A'}
- Puntos de datos activos (x, y): ${JSON.stringify(data)}

INSTRUCCIÓN IMPORTANTE: Si el usuario pregunta por la predicción para un valor x concreto, SIEMPRE calcula ŷ = ${mNum.toFixed(4)} × (valor_de_x) + ${bNum.toFixed(4)} y muestra la sustitución completa.
`;
      } else if (activeTab === 'theory') {
        activeTabName = "Teoría y Casos Reales del Teorema";
        statusDetails = `
El usuario está leyendo la teoría de regresión lineal simple y tres casos reales solucionados con regresión lineal en el mundo real.
Ayúdale a comprender el teorema y cómo aplicarlo a problemas reales de su propia universidad o profesión.
`;
      } else if (activeTab === 'massive' && massiveState) {
        activeTabName = "Simulador a Gran Escala (Miles de Datos)";
        const mO = massiveState.isExploded ? NaN : massiveState.mOrig;
        const bO = massiveState.isExploded ? NaN : massiveState.bOrig;
        statusDetails = `
Métricas actuales del simulador masivo:
- Dataset activo: ${massiveState.datasetType}
- Número de puntos de datos: ${massiveState.dataCount}
- Época/Iteración de entrenamiento actual: ${massiveState.iteration}
- Pendiente (m / β₁): ${massiveState.isExploded ? 'NaN' : mO.toFixed(6)}  → por cada unidad que sube x, ŷ cambia en ${massiveState.isExploded ? 'NaN' : mO.toFixed(6)}
- Intercepto (b / β₀): ${massiveState.isExploded ? 'NaN' : bO.toFixed(6)}  → valor de ŷ cuando x = 0 (donde la recta toca el eje Y)
- Ecuación del modelo ajustado: ŷ = ${massiveState.isExploded ? 'NaN' : mO.toFixed(4)} · x + ${massiveState.isExploded ? 'NaN' : bO.toFixed(4)}
- Tasa de aprendizaje (α): ${massiveState.learningRate}
- Error Cuadrático Medio (MSE) actual: ${massiveState.mse === Infinity ? 'Infinity' : massiveState.mse.toFixed(6)}
- Normalización Min-Max activa: ${massiveState.normalize ? 'Sí' : 'No'}
- ¿El gradiente ha explotado?: ${massiveState.isExploded ? 'Sí (Valores se volvieron NaN o Infinity por inestabilidad numérica)' : 'No'}

INSTRUCCIÓN IMPORTANTE: Si el usuario pregunta por la predicción para un valor x concreto y el modelo no ha explotado, calcula ŷ = ${massiveState.isExploded ? 'NaN' : mO.toFixed(4)} × (valor_de_x) + ${massiveState.isExploded ? 'NaN' : bO.toFixed(4)} y muestra la sustitución completa.

Temas clave de esta pestaña:
1. Procesamiento masivo de datos: Diferencia entre CPU, GPU (cómputo paralelo) y TPU.
2. Derivación automática (Autograd) y Backpropagation usando frameworks modernos (PyTorch, TensorFlow).
3. Explosión del gradiente (Exploding Gradient): Por qué ocurre al desactivar la normalización y mantener una tasa de aprendizaje alta como 0.1 en coordenadas de escala real.
4. Normalización de características (Feature Scaling): Cómo mapear variables a [0, 1] previene el desbordamiento numérico.
5. El tamaño de lote (Batch) y costo computacional O(N).

Si el gradiente ha explotado en su simulación actual, indícale de manera amigable que desactive el entrenamiento, active la normalización y reinicie el simulador, o que reduzca drásticamente la tasa de aprendizaje (a un valor como 0.00005) para ver cómo converge lentamente sin normalizar.
`;
      }

      const systemContext = `
Eres un tutor experto en Machine Learning, Estadística y Regresión Lineal.
El usuario está utilizando un simulador interactivo de Regresión Lineal Simple.
Actualmente se encuentra en la pestaña: **${activeTabName}**.

Detalles de estado y contexto actual del simulador:
${statusDetails}

CAPACIDADES — puedes hacer TODO lo siguiente:
1. Responder preguntas sobre el estado actual del simulador usando los valores de arriba.
2. Resolver CUALQUIER problema de regresión lineal que el usuario presente, aunque no esté cargado en el simulador.
3. Cuando el usuario te dé un conjunto de datos (pares x, y), calcular la pendiente y el intercepto usando las ecuaciones normales:
   - $m = \\beta_1 = \\frac{n\\sum x_i y_i - \\sum x_i \\sum y_i}{n\\sum x_i^2 - (\\sum x_i)^2}$
   - $b = \\beta_0 = \\frac{\\sum y_i - m \\sum x_i}{n}$
4. Calcular predicciones: dado un nuevo valor $x$, calcular $\\hat{y} = mx + b$.
5. Interpretar resultados: explicar qué significa la pendiente, el intercepto, el MSE y el R² en el contexto del problema.
6. Si el usuario plantea un problema pero NO proporciona los datos numéricos, pídele que los comparta o sugiérele ingresarlos en el simulador para visualizarlos paso a paso.

Reglas de respuesta:
1. Responde SIEMPRE en español de forma pedagógica, clara y amigable.
2. Cuando el usuario presente un conjunto de datos, muestra los cálculos intermedios paso a paso (sumas, productos, sustitución en fórmulas).
3. Adapta tu explicación al nivel de un estudiante universitario, con intuición y rigor matemático equilibrado.
4. Para fórmulas matemáticas usa LaTeX estrictamente: fórmulas en línea con $...$ y bloques con $$...$$.
5. Cuando respondas predicciones, muestra la sustitución explícita: $\\hat{y} = m \\cdot x + b = valor$.
      `;

      const prompt = systemContext + "\n\nPregunta del usuario: " + userMessage;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      let errorMsg = error.message || 'Error al conectar con Gemini.';
      if (errorMsg.includes('API key not valid')) {
        errorMsg = 'Tu API Key de Gemini es inválida. Por favor, revisa el código.';
      }
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── POPUP MODE (Theory & Large Scale pages) ───────────────────────────────
  if (mode === 'popup') {
    const chatBody = (
      <div className="flex flex-col h-full">
        {/* Settings */}
        {showSettings && (
          <div className="bg-slate-950 p-3 border-b border-slate-800 text-xs flex flex-col gap-2 select-none shrink-0">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Key size={13} className="text-slate-400" /> CONFIGURACIÓN DE GEMINI API
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Obtén una llave gratis en{' '}
              <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:underline">Google AI Studio</a>{' '}
              y pégala aquí.
            </p>
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-2 text-[10px] text-amber-300">
              ⚠ Las claves <code>VITE_</code> quedan expuestas en el frontend. Para producción, usa un proxy backend.
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={import.meta.env.VITE_GEMINI_API_KEY ? 'Usando clave por defecto (.env)' : 'Pega tu Gemini API Key...'}
                  value={customApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomApiKey(val);
                    if (val) localStorage.setItem('gemini_api_key', val);
                    else localStorage.removeItem('gemini_api_key');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 pr-8 focus:outline-none focus:border-slate-500 font-mono text-[10px]"
                />
                <button type="button" onClick={() => setShowKey(p => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {customApiKey && (
                <button onClick={() => { setCustomApiKey(''); localStorage.removeItem('gemini_api_key'); }} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-900/40 px-2 rounded font-semibold transition-colors text-[11px]">
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 max-w-[90%] min-w-0 ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`p-1.5 rounded-lg shrink-0 h-fit ${msg.role === 'user' ? 'bg-slate-600' : 'bg-slate-700'}`}>
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} className="text-slate-300" />}
              </div>
              <div className={`px-3 py-2 rounded-xl text-xs ${msg.role === 'user' ? 'bg-slate-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-700'} prose prose-invert max-w-full break-words prose-p:leading-snug prose-p:my-0.5 prose-pre:bg-slate-950 prose-pre:overflow-x-auto prose-table:overflow-x-auto [&_.katex-display]:overflow-x-auto`}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 self-start">
              <div className="p-1.5 rounded-lg bg-slate-700 shrink-0"><Bot size={13} className="text-slate-300" /></div>
              <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 rounded-tl-none flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2 shrink-0">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Pregunta algo sobre regresión lineal... (Enter envía, Shift+Enter nueva línea)"
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500 transition-colors resize-none"
            style={{ minHeight: '38px', maxHeight: '150px', overflowY: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );

    return (
      <>
        {/* FAB */}
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white shadow-lg shadow-slate-900/40 transition-all transform z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        >
          <MessageCircle size={24} />
        </button>

        {/* Popup window */}
        <div
          className={`fixed bottom-6 right-6 w-[400px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-200 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-700/50 text-slate-300 rounded-lg"><Bot size={16} /></div>
              <div>
                <span className="font-bold text-slate-100 text-sm">Asistente IA</span>
                <span className="text-slate-500 text-[10px] block leading-none">Impulsado por Gemini</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettings(p => !p); }}
                className={`p-1.5 rounded-md transition-colors ${showSettings ? 'bg-slate-600/30 text-slate-200 border border-slate-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                title="Configurar API Key"
              >
                <Key size={14} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
          {chatBody}
        </div>
      </>
    );
  }

  // ─── INLINE MODE (Simulator page) ───────────────────────────────────────────
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shrink-0">

      {/* Toggle bar — always visible at TOP, click to open/close */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className="px-4 py-3 flex items-center justify-between cursor-pointer select-none hover:bg-slate-700/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-200">Asistente IA</span>
          <span className="text-[11px] text-slate-500">· Impulsado por Gemini</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(prev => !prev); }}
            className={`p-1.5 rounded-md transition-colors ${showSettings ? 'bg-slate-600/30 text-slate-200 border border-slate-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
            title="Configurar API Key de Gemini"
          >
            <Key size={14} />
          </button>
          {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </div>

      {/* Chat body — opens downward */}
      {isOpen && (
        <div className="border-t border-slate-700 flex flex-col" style={{ height: '300px' }}>

          {/* API Key Settings Panel */}
          {showSettings && (
            <div className="bg-slate-950 p-3 border-b border-slate-800 text-xs flex flex-col gap-2 select-none shrink-0">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Key size={13} className="text-slate-400" /> CONFIGURACIÓN DE GEMINI API
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Obtén una llave gratis en{' '}
                <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:underline">
                  Google AI Studio
                </a>{' '}
                y pégala aquí.
              </p>
              <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-2 text-[10px] text-amber-300 leading-normal">
                ⚠ Las claves <code>VITE_</code> quedan expuestas en el frontend. Para producción, usa un proxy backend.
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder={import.meta.env.VITE_GEMINI_API_KEY ? 'Usando clave por defecto (.env)' : 'Pega tu Gemini API Key...'}
                    value={customApiKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomApiKey(val);
                      if (val) localStorage.setItem('gemini_api_key', val);
                      else localStorage.removeItem('gemini_api_key');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 pr-8 focus:outline-none focus:border-slate-500 font-mono text-[10px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(prev => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {customApiKey && (
                  <button
                    onClick={() => { setCustomApiKey(''); localStorage.removeItem('gemini_api_key'); }}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-900/40 px-2 rounded font-semibold transition-colors text-[11px]"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              {import.meta.env.VITE_GEMINI_API_KEY && !customApiKey && (
                <div className="text-[9px] text-slate-300 bg-slate-800/40 border border-slate-700/40 rounded p-1 text-center">
                  ✓ Usando API Key preconfigurada (.env)
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[90%] min-w-0 ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <div className={`p-1.5 rounded-lg shrink-0 h-fit ${msg.role === 'user' ? 'bg-slate-600' : 'bg-slate-700'}`}>
                  {msg.role === 'user' ? <User size={13} /> : <Bot size={13} className="text-slate-300" />}
                </div>
                <div className={`px-3 py-2 rounded-xl text-xs ${msg.role === 'user' ? 'bg-slate-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-700'} prose prose-invert max-w-full break-words prose-p:leading-snug prose-p:my-0.5 prose-pre:bg-slate-950 prose-pre:overflow-x-auto prose-table:overflow-x-auto [&_.katex-display]:overflow-x-auto`}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 self-start">
                <div className="p-1.5 rounded-lg bg-slate-700 shrink-0 h-fit">
                  <Bot size={13} className="text-slate-300" />
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 rounded-tl-none flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2 shrink-0">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Pregunta algo... (Enter envía, Shift+Enter nueva línea)"
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500 transition-colors resize-none"
              style={{ minHeight: '38px', maxHeight: '150px', overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};