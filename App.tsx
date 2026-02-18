
import React, { useState, useEffect } from 'react';
import { BaseScores, LogEntry, AppState } from './types';
import { INITIAL_SCORES } from './constants';
import ScoreDial from './components/ScoreDial';
import AssessmentForm from './components/AssessmentForm';
import ActionLog from './components/ActionLog';
import WoodenFish from './components/WoodenFish';
import { LayoutDashboard, BookOpen, PenTool, RefreshCw, Gavel, Check, Copy } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assessment' | 'log' | 'woodenfish'>('dashboard');
  const [baseScores, setBaseScores] = useState<BaseScores>(INITIAL_SCORES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [meritCount, setMeritCount] = useState<number>(0);
  const [dailyQuote, setDailyQuote] = useState({ 
    content: "积善之家，必有余庆；积不善之家，必有余殃。", 
    source: "《周易》" 
  });
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate Log Points (Exclude woodenfish spendings from the main Score Dial to prevent double counting or confusion, 
  // or include them if you want spending to reduce your "Life Score". 
  // For now, we only count 'general' logs for the score, or all logs? 
  // Usually spending merit in a game shouldn't lower your ethical 'Score'. 
  // Let's exclude 'woodenfish' category from the ScoreDial calculation to keep "Karma Score" pure.)
  const logPoints = logs.reduce((acc, log) => {
    if (log.category === 'woodenfish') return acc; // Spending merit points doesn't lower your moral score
    if (log.type === 'merit' || log.type === 'correction') return acc + log.points;
    if (log.type === 'demerit') return acc - log.points;
    return acc;
  }, 0);

  // Load from local storage (simple persistence)
  useEffect(() => {
    const saved = localStorage.getItem('fubao_state');
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        setBaseScores(parsed.baseScores);
        setLogs(parsed.logs);
        if (parsed.woodenFishCount !== undefined) {
          setMeritCount(parsed.woodenFishCount);
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('fubao_state', JSON.stringify({ 
      baseScores, 
      logs,
      woodenFishCount: meritCount
    }));
  }, [baseScores, logs, meritCount]);

  const fetchQuote = async () => {
    setIsLoadingQuote(true);
    try {
      // Fetch from Hitokoto API (Chinese quotes)
      // c=i: Poetry, c=k: Philosophy, c=d: Literature
      const response = await fetch('https://v1.hitokoto.cn/?c=i&c=k&c=d');
      if (response.ok) {
        const data = await response.json();
        setDailyQuote({
          content: data.hitokoto,
          source: data.from_who ? `— ${data.from_who}《${data.from}》` : `— 《${data.from}》`
        });
      }
    } catch (error) {
      console.error("Failed to fetch quote:", error);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Fetch quote on mount
  useEffect(() => {
    fetchQuote();
  }, []);

  const handleAddLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  const handleClearLogs = () => {
    if (confirm("您确定要清空所有省察记录吗？")) {
      setLogs([]);
    }
  };

  // Handle spending in Wooden Fish component
  const handleWoodenFishSpend = (amount: number, item: string) => {
    setMeritCount(c => Math.max(0, c - amount));
    // Add to logs for history tracking
    handleAddLog({
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'demerit', // Technically a cost
      description: `兑换：${item}`,
      points: amount,
      category: 'woodenfish'
    });
  };

  const handleCopyQQ = () => {
    navigator.clipboard.writeText("665889946").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="min-h-screen font-sans text-zen-ink pb-20 bg-[#f0efe9]">
      {/* Top Navigation / Branding */}
      <header className="bg-zen-ink text-zen-paper py-6 px-4 shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-wide">儒释道福报量化评分系统</h1>
            <p className="text-xs md:text-sm text-stone-400 mt-1">常云举团队 • 定制修身系统</p>
          </div>
          <div className="hidden md:block text-right">
             <div className="text-xs text-zen-gold border border-zen-gold px-2 py-1 rounded">日用修持</div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 mt-6">
        
        {/* Navigation Tabs (Mobile optimized) */}
        <div className="flex overflow-x-auto space-x-2 md:space-x-4 mb-8 pb-2 border-b border-stone-200 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'dashboard' ? 'bg-zen-red text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>福报总览</span>
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'assessment' ? 'bg-zen-red text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>基础定品</span>
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'log' ? 'bg-zen-red text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>日用省察</span>
          </button>
          <button
            onClick={() => setActiveTab('woodenfish')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'woodenfish' ? 'bg-zen-red text-white shadow-md' : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>电子木鱼</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 lg:col-span-1">
                   <ScoreDial baseScores={baseScores} logPoints={logPoints} />
               </div>
               <div className="flex flex-col gap-4">
                  <div className="bg-stone-800 text-stone-200 p-6 rounded-xl shadow-sm relative group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif font-bold text-zen-gold">每日一言</h3>
                        <button 
                          onClick={fetchQuote} 
                          className={`text-stone-500 hover:text-zen-gold transition-colors ${isLoadingQuote ? 'animate-spin' : ''}`}
                          title="刷新"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="italic leading-relaxed transition-opacity duration-300 min-h-[3rem]">
                        "{dailyQuote.content}"
                      </p>
                      <p className="text-right text-sm mt-3 text-stone-400">{dailyQuote.source}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-stone-200 flex-1">
                     <h3 className="font-bold text-lg mb-4">数据简报</h3>
                     <div className="flex justify-between border-b border-stone-100 py-2">
                        <span>基础得分</span>
                        <span className="font-mono font-bold">
                            {(Object.values(baseScores.buddhism) as number[]).reduce((a, b) => a + b, 0) +
                             (Object.values(baseScores.confucianism) as number[]).reduce((a, b) => a + b, 0) +
                             (Object.values(baseScores.taoism) as number[]).reduce((a, b) => a + b, 0)}
                        </span>
                     </div>
                     <div className="flex justify-between border-b border-stone-100 py-2">
                        <span>损益净值</span>
                        <span className={`font-mono font-bold ${logPoints >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {logPoints > 0 ? '+' : ''}{logPoints}
                        </span>
                     </div>
                     <div className="flex justify-between border-b border-stone-100 py-2">
                        <span>积累功德</span>
                        <span className="font-mono font-bold text-zen-gold">
                            {meritCount}
                        </span>
                     </div>
                     <div className="mt-4 text-xs text-stone-400">
                        *当前总分由“基础定品”与历史“日用省察”累计得出。
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'assessment' && (
            <AssessmentForm scores={baseScores} onChange={setBaseScores} />
          )}

          {activeTab === 'log' && (
            <ActionLog logs={logs.filter(l => l.category !== 'woodenfish')} onAddLog={handleAddLog} onClearLogs={handleClearLogs} />
          )}

          {activeTab === 'woodenfish' && (
            <div className="max-w-5xl mx-auto">
              <WoodenFish 
                count={meritCount} 
                logs={logs}
                onIncrement={() => setMeritCount(c => c + 1)} 
                onSpend={handleWoodenFishSpend}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-10 bg-white border-t border-stone-200 mt-12">
        {/* QQ Group Section - Copyable */}
        <div className="mb-8 px-4">
           <div className="bg-zen-ink text-zen-paper p-8 rounded-2xl max-w-md mx-auto shadow-2xl relative overflow-hidden border border-stone-800">
              <div className="relative z-10 flex flex-col items-center">
                 <h3 className="text-xl font-serif font-bold mb-6 text-stone-300">欢迎加入交流群</h3>
                 
                 <div 
                    onClick={handleCopyQQ}
                    className="group flex flex-col items-center justify-center bg-stone-800/50 w-full py-6 rounded-xl border border-stone-700/50 cursor-pointer hover:bg-stone-700/50 transition-colors relative"
                    title="点击复制群号"
                 >
                    <span className="text-stone-500 text-xs mb-2 uppercase tracking-widest flex items-center gap-1 group-hover:text-stone-300 transition-colors">
                        反馈交流QQ群 <Copy className="w-3 h-3" />
                    </span>
                    <span className="text-4xl md:text-5xl font-black text-zen-gold tracking-wider drop-shadow-sm group-hover:scale-105 transition-transform">
                       665889946
                    </span>
                    
                    {/* Copied Feedback Overlay */}
                    {copied && (
                        <div className="absolute inset-0 bg-stone-800/95 flex items-center justify-center rounded-xl animate-fade-in transition-opacity">
                            <span className="text-green-400 font-bold flex items-center gap-2">
                                <Check className="w-5 h-5" /> 已复制到剪贴板
                            </span>
                        </div>
                    )}
                 </div>
                 
                 <p className="text-xs text-stone-500 mt-6 opacity-80">点击上方群号即可复制 • 儒释道福报量化评分系统</p>
              </div>
              
              {/* Decorative background */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zen-red via-zen-gold to-zen-ink opacity-50"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-zen-gold/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-zen-red/5 rounded-full blur-3xl pointer-events-none"></div>
           </div>
        </div>

        <div className="text-stone-400 text-sm">
          <p>&copy; {new Date().getFullYear()} 常云举团队. 保留所有权利.</p>
          <p className="mt-1 text-xs">此系统唯为修身自省之助，非卜筮改运之术。</p>
        </div>
      </footer>
    </div>
  );
}
