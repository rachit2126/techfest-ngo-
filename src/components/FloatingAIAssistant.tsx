'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Sparkles, X, Send, ArrowRight, ShieldCheck } from 'lucide-react';

export default function FloatingAIAssistant() {
  const pathname = usePathname();
  if (pathname === '/donate/individual') {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; tools?: string[] }[]>([
    {
      role: 'assistant',
      text: 'Namaste! I am the Sahay AI Assistant. Ask me about verified NGOs near you, disaster relief needs, or donation guidelines.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.reply || 'No response', tools: data.toolsUsed }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Assistant service temporarily unavailable.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Pill on bottom right matching website light theme */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#EAF3EC] text-[#182820] shadow-lg border border-[#E3EAE3] transition-all cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-full bg-[#EAF3EC] text-[#075B3C] flex items-center justify-center border border-[#075B3C]/20">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="text-left text-xs">
              <span className="font-bold block text-[11px] text-[#075B3C] leading-none">Sahay AI</span>
              <span className="text-[#64746A] text-[10px] hidden sm:inline">Ask about verified needs</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#13845B] animate-pulse ml-0.5" />
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E3EAE3] overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-3 bg-white border-b border-[#E3EAE3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAF3EC] text-[#075B3C] flex items-center justify-center border border-[#075B3C]/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#182820]">Sahay Grounded Assistant</h4>
                  <span className="text-[10px] text-[#075B3C] font-medium flex items-center gap-1 font-hindi">
                    यत्र आवश्यकता, तत्र सहायः
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/assistant"
                  className="text-[10px] font-medium text-slate-600 hover:text-teal-700 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition"
                >
                  Full View
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Assistant"
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-md hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-3 space-y-2.5 max-h-72 overflow-y-auto bg-[#F8FAFC]">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-2.5 rounded-xl max-w-[88%] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {m.tools && m.tools.length > 0 && (
                      <span className="block text-[9px] font-mono text-teal-700 font-semibold mb-1">
                        Tools: {m.tools.join(', ')}
                      </span>
                    )}
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 p-1">
                  <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>Checking database tools & guidelines...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about emergencies, supplies, or NGOs..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white text-slate-800"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 cursor-pointer transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
