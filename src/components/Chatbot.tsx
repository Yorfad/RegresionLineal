import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
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
  // Read API Key from environment variables (hidden from source code)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de Machine Learning. Pregúntame sobre el algoritmo o lo que estás viendo en la simulación.' }
  ]);
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
      const genAI = new GoogleGenerativeAI(apiKey);
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
        className={`fixed bottom-6 left-6 p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chatbot Window */}
      <div
        className={`fixed bottom-6 left-6 w-[400px] h-[600px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-left z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Asistente IA</h3>
              <p className="text-xs text-slate-400">Impulsado por Gemini</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200 hover:bg-slate-700 p-1 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`p-2 rounded-lg shrink-0 h-fit ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-blue-400" />}
              </div>
              <div className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'} prose prose-invert max-w-none overflow-x-auto break-words prose-p:leading-snug prose-pre:bg-slate-950`}>
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
                <Bot size={16} className="text-blue-400" />
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
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
};