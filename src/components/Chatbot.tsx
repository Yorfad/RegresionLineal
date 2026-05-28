import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Key, Eye, EyeOff } from 'lucide-react';
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
  massiveState
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
        statusDetails = `
- Iteración actual: ${iteration}
- Paso actual dentro de la iteración: ${StepName[step]}
- Pendiente actual (m): ${Number(m).toFixed(4)}
- Intercepto actual (b): ${Number(b).toFixed(4)}
- Tasa de aprendizaje (learning rate): ${learningRate}
- Error actual (MSE): ${mse ? mse.toFixed(4) : 'N/A'}
- Puntos de datos activos en pantalla (x, y): ${JSON.stringify(data)}
`;
      } else if (activeTab === 'theory') {
        activeTabName = "Teoría y Casos Reales del Teorema";
        statusDetails = `
El usuario está leyendo la teoría de regresión lineal simple y tres casos reales solucionados con regresión lineal en el mundo real.
Ayúdale a comprender el teorema y cómo aplicarlo a problemas reales de su propia universidad o profesión.
`;
      } else if (activeTab === 'massive' && massiveState) {
        activeTabName = "Simulador a Gran Escala (Miles de Datos)";
        statusDetails = `
Métricas actuales del simulador masivo:
- Dataset activo: ${massiveState.datasetType}
- Número de puntos de datos: ${massiveState.dataCount}
- Época/Iteración de entrenamiento actual: ${massiveState.iteration}
- Pendiente actual (m): ${massiveState.isExploded ? 'NaN' : massiveState.mOrig.toFixed(4)}
- Intercepto actual (b): ${massiveState.isExploded ? 'NaN' : massiveState.bOrig.toFixed(2)}
- Tasa de aprendizaje (α): ${massiveState.learningRate}
- Error Cuadrático Medio (MSE) actual: ${massiveState.mse === Infinity ? 'Infinity' : massiveState.mse.toFixed(4)}
- Normalización Min-Max activa: ${massiveState.normalize ? 'Sí' : 'No'}
- ¿El gradiente ha explotado?: ${massiveState.isExploded ? 'Sí (Valores se volvieron NaN o Infinity por inestabilidad numérica)' : 'No'}

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
Eres un tutor experto en Machine Learning y Matemáticas.
El usuario está utilizando un simulador interactivo de Regresión Lineal Simple.
Actualmente se encuentra en la pestaña: **${activeTabName}**.

Detalles de estado y contexto actual:
${statusDetails}

Reglas de respuesta:
1. Responde en español de forma pedagógica, clara y amigable.
2. Si es relevante, utiliza los valores numéricos actuales de la pantalla (m, b, iteración, datos) para ilustrar tus explicaciones y cálculos.
3. Adapta tu explicación al nivel de un estudiante universitario, explicando con intuición y rigor matemático equilibrado.
4. Para renderizar fórmulas matemáticas, utiliza estrictamente formato LaTeX en Markdown. Envuelve las fórmulas en línea con el símbolo de un solo dólar (ejemplo: $y = mx + b$) y los bloques matemáticos destacados con doble dólar (ejemplo: $$MSE = \\frac{1}{N} \\sum (\\hat{y}_i - y_i)^2$$).
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white shadow-lg shadow-slate-700/30 transition-all transform hover:scale-105 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chatbot Window */}
      <div
        className={`fixed bottom-6 left-6 w-[400px] h-[600px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-left z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/50 text-slate-300 rounded-lg">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Asistente IA</h3>
              <p className="text-xs text-slate-400">Impulsado por Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowSettings(prev => !prev)} 
              className={`p-1.5 rounded-md transition-colors ${showSettings ? 'bg-slate-600/30 text-slate-200 border border-slate-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
              title="Configurar API Key de Gemini"
            >
              <Key size={16} />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200 hover:bg-slate-700 p-1 rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* API Key Settings Panel */}
        {showSettings && (
          <div className="bg-slate-950 p-4 border-b border-slate-800 text-xs flex flex-col gap-2 relative z-20 select-none">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Key size={14} className="text-slate-400" /> CONFIGURACIÓN DE GEMINI API
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Para usar el chatbot gratis, obtén una llave en <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:underline">Google AI Studio</a> y pégala aquí. Tu llave se almacena de forma segura en tu navegador.
            </p>
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-2 text-[10px] text-amber-300 leading-normal">
              ⚠ <strong>Nota de Seguridad:</strong> Las claves configuradas en archivos <code>.env</code> (con prefijo <code>VITE_</code>) se empaquetan en el frontend de producción y quedan visibles en el navegador. Para despliegues públicos, borra la clave del archivo <code>.env</code> y permite que cada estudiante use su clave aquí, o bien implementa un proxy backend (Frontend → Backend → Gemini).
            </div>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  placeholder={import.meta.env.VITE_GEMINI_API_KEY ? "Usando clave por defecto (.env)" : "Pega tu Gemini API Key..."}
                  value={customApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomApiKey(val);
                    if (val) {
                      localStorage.setItem('gemini_api_key', val);
                    } else {
                      localStorage.removeItem('gemini_api_key');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 pr-8 focus:outline-none focus:border-slate-500 font-mono text-[10px]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(prev => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {customApiKey && (
                <button
                  onClick={() => {
                    setCustomApiKey('');
                    localStorage.removeItem('gemini_api_key');
                  }}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-900/40 px-2 rounded font-semibold transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
            {import.meta.env.VITE_GEMINI_API_KEY && !customApiKey && (
              <div className="text-[9px] text-slate-300 font-medium bg-slate-800/40 border border-slate-700/40 rounded p-1 text-center mt-0.5">
                ✓ Usando API Key preconfigurada (.env)
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`p-2 rounded-lg shrink-0 h-fit ${msg.role === 'user' ? 'bg-slate-600' : 'bg-slate-800'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-slate-300" />}
              </div>
              <div className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-slate-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'} prose prose-invert max-w-none overflow-x-auto break-words prose-p:leading-snug prose-pre:bg-slate-950`}>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 self-start max-w-[85%]">
              <div className="p-2 rounded-lg bg-slate-800 shrink-0 h-fit">
                <Bot size={16} className="text-slate-300" />
              </div>
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input
            type="text"
            placeholder="Pregunta algo sobre el modelo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
};