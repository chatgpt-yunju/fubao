import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Globe, Loader2, Bot } from 'lucide-react';
import { sendChatMessage, searchWithGemini, ChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: '您好，我是您的福报修持助手。无论是修身困惑还是佛道哲理，亦或是查询相关典故，我都可以为您解答。',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      let response: ChatResponse;

      if (useSearch) {
        // Use Gemini Flash with Google Search
        response = await searchWithGemini(userMsg.content);
      } else {
        // Use Gemini Pro for Chat
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        response = await sendChatMessage(userMsg.content, history);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "抱歉，连接出现问题，请稍后再试。",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-zen-red" />
          <h3 className="font-serif font-bold text-zen-ink">修身助手 (AI 问道)</h3>
        </div>
        <button
          onClick={() => setUseSearch(!useSearch)}
          className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
            useSearch 
              ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' 
              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
          }`}
        >
          {useSearch ? <Globe className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          {useSearch ? '已开启联网溯源' : '对话模式'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-zen-ink text-white rounded-br-none'
                  : 'bg-white border border-stone-100 text-zen-ink rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              
              {/* Sources from Search Grounding */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <p className="text-xs font-bold text-stone-500 mb-2 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> 来源出处
                  </p>
                  <div className="space-y-1">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-600 hover:underline truncate"
                      >
                        {idx + 1}. {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-none p-4 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-stone-100 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={useSearch ? "查询事实、新闻或具体典故..." : "寻求指引、智慧或建议..."}
          className="flex-1 border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zen-red text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-zen-red text-white p-2 rounded-lg hover:bg-red-900 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default AiAssistant;