/*************************************/
/**           ChatWidget            **/
/*************************************/
// Archivo para renderizar el botón de chat

// Librerías y módulos 
import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

// Componente principal
const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy el asistente de Premezclado Manzanillo. ¿En qué puedo ayudarte hoy?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const resp = await api.post('/api/chat', { messages: nextMessages });
      const data = resp.data;
      const content = data?.content || 'Lo siento, hubo un problema al responder.';
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'No pude conectar con el servicio de chat. Inténtalo más tarde.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        className="fixed bottom-4 right-4 bg-brand-primary dark:bg-green-600 text-white shadow-lg hover:bg-brand-dark dark:hover:bg-green-700 transition-colors duration-300 z-[9999] w-16 h-16 flex items-center justify-center rounded-2xl"
        aria-label="Abrir chat"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 50, rotate: 45 }}
        animate={{ opacity: 1, y: 0, rotate: 45 }}
        transition={{ duration: 0.5, delay: 1 }}
        onClick={() => setOpen(true)}
      >
        <motion.div animate={{ rotate: -45 }}>
          <MessageCircle size={24} />
        </motion.div>
      </motion.button>

      {/* Panel de chat */}
      {open && (
        <div className="fixed bottom-24 right-4 w-[92vw] max-w-md h-[70vh] bg-white dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-brand-primary text-white dark:bg-dark-btn">
            <span className="font-semibold">Asistente</span>
            <button aria-label="Cerrar" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow ${
                  m.role === 'user'
                    ? 'ml-auto bg-green-600 text-white'
                    : 'mr-auto bg-gray-100 dark:bg-dark-primary text-gray-800 dark:text-gray-100'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-gray-100 dark:bg-dark-primary text-gray-800 dark:text-gray-100 max-w-[85%] rounded-xl px-3 py-2 text-sm shadow">
                Escribiendo…
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 dark:border-white/10 p-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Escribe tu mensaje…"
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-brand-primary text-white px-3 py-2 text-sm hover:bg-green-800 disabled:opacity-60"
            >
              <Send className="w-4 h-4 mr-1" /> Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
