
import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Heart, Sun, BookOpen, Crown, Smile, Coffee, Flame, ScrollText, X, Fish, Cloud, Waves, Hourglass, History, Calendar } from 'lucide-react';
import { LogEntry } from '../types';

interface WoodenFishProps {
  count: number;
  logs: LogEntry[];
  onIncrement: () => void;
  onSpend: (amount: number, item: string) => void;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  rotation: number; // Add rotation for more organic feel
}

// --- Data: Shop Items ---
interface ShopItem {
  id: string;
  name: string;
  cost: number;
  icon: React.ReactNode;
  description: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'joy', name: '平安喜乐', cost: 100, icon: <Smile className="w-5 h-5" />, description: "愿心无挂碍，随遇而安" },
  { id: 'health', name: '身体健康', cost: 500, icon: <Coffee className="w-5 h-5" />, description: "愿身如金刚，百病不侵" },
  { id: 'wisdom', name: '开启智慧', cost: 666, icon: <BookOpen className="w-5 h-5" />, description: "愿破除无明，洞见真理" },
  { id: 'love', name: '良缘得赐', cost: 888, icon: <Heart className="w-5 h-5" />, description: "愿得一心人，白首不离" },
  { id: 'wealth', name: '财源广进', cost: 999, icon: <Crown className="w-5 h-5" />, description: "愿正财具足，广利众生" },
  { id: 'nirvana', name: '清净自在', cost: 1000, icon: <Sun className="w-5 h-5" />, description: "愿烦恼尽消，得大自在" },
];

// --- Data: Divination Lots ---
const DIVINATION_LOTS = [
  { type: '上上', title: '万事如意', poem: '大鹏一日同风起，扶摇直上九万里。', explain: '时来运转，百事大吉，前程似锦。' },
  { type: '上吉', title: '枯木逢春', poem: '宝镜尘埋久未磨，一朝擦拭起光华。', explain: '苦尽甘来，渐入佳境，贵人相助。' },
  { type: '中平', title: '守静待时', poem: '行到水穷处，坐看云起时。', explain: '目前宜静不宜动，顺其自然，等待良机。' },
  { type: '中吉', title: '如鱼得水', poem: '春水满池塘，鱼儿戏绿波。', explain: '环境顺遂，心情舒畅，小有收获。' },
  { type: '下下', title: '慎言慎行', poem: '夜半渡长江，江心浪更狂。', explain: '此时风险较大，宜保守行事，切勿冒进。' },
  { type: '下签', title: '韬光养晦', poem: '莫道浮云终蔽日，严冬过尽绽春蕾。', explain: '暂遇挫折，需忍耐修身，静待花开。' },
];

const WoodenFish: React.FC<WoodenFishProps> = ({ count, logs, onIncrement, onSpend }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  // Default to 'incense' to encourage action first
  const [activeTab, setActiveTab] = useState<'store' | 'incense' | 'lantern' | 'release' | 'divination' | 'meditation' | 'history'>('incense');
  const audioContextRef = useRef<AudioContext | null>(null);

  // Filter logs for wooden fish history
  const historyLogs = logs.filter(l => l.category === 'woodenfish').reverse();

  // --- Sound Logic ---
  const playSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t); 
      osc.frequency.exponentialRampToValueAtTime(550, t + 0.1); 

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.8, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); 

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    onIncrement();
    playSound();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Add randomness to position for organic feel
    const randomX = (Math.random() - 0.5) * 40;
    const randomY = (Math.random() - 0.5) * 10;
    const rotation = (Math.random() - 0.5) * 30;
    
    const x = e.clientX - rect.left + randomX;
    const y = e.clientY - rect.top + randomY;
    
    const newRipple = { id: Date.now(), x, y, rotation };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Wooden Fish */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group">
        
        <div className="absolute top-4 right-4 bg-stone-100 px-3 py-1 rounded-full text-xs text-stone-500 font-mono">
          今日功德
        </div>

        {/* Main Counter Display */}
        <div className="mb-10 text-center relative">
           <h2 className="text-6xl font-serif font-bold text-zen-ink mb-2 transition-all group-active:scale-110 duration-100 relative z-10">
              {count}
           </h2>
           {/* Glow effect behind number */}
           <div className="absolute inset-0 bg-zen-gold blur-3xl opacity-20 rounded-full scale-150 z-0"></div>
           <p className="text-stone-400 text-sm tracking-widest font-serif">功德无量</p>
        </div>

        {/* The Wooden Fish Visual */}
        <div 
          className={`cursor-pointer transform transition-transform duration-75 select-none relative ${isAnimating ? 'scale-95' : 'scale-100 hover:scale-105'}`}
          onClick={handleClick}
        >
          {/* Simplified Wooden Fish SVG */}
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
            <g filter="url(#filter0_d)">
              <path d="M30 100C30 55.8172 65.8172 20 110 20C154.183 20 190 55.8172 190 100C190 144.183 154.183 180 110 180C65.8172 180 30 144.183 30 100Z" fill="#8A3324"/>
              <path d="M30 100C30 55.8172 65.8172 20 110 20C154.183 20 190 55.8172 190 100C190 144.183 154.183 180 110 180C65.8172 180 30 144.183 30 100Z" stroke="#5D2016" strokeWidth="4"/>
              <path d="M170 100H190" stroke="#5D2016" strokeWidth="4" strokeLinecap="round"/>
              <path d="M110 50C90 50 70 70 70 100C70 130 90 150 110 150" stroke="#B04030" strokeWidth="8" strokeLinecap="round"/>
              <path d="M120 40C150 40 170 60 175 80" stroke="#A84838" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
            </g>
            <rect x="10" y="80" width="80" height="20" rx="10" fill="#2C2C2C" className={`origin-right transition-transform duration-75 ${isAnimating ? 'rotate-12 translate-x-4' : '-rotate-12'}`}/>
            <defs>
              <filter id="filter0_d" x="20" y="15" width="180" height="180" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
              </filter>
            </defs>
          </svg>

          {/* Floating texts - Enhanced Merit Effect */}
          {ripples.map(ripple => (
             <div 
               key={ripple.id}
               className="absolute pointer-events-none font-serif font-bold text-2xl animate-float-up whitespace-nowrap z-50 flex items-center gap-1"
               style={{ 
                  left: ripple.x, 
                  top: ripple.y,
                  color: '#c5a059', // zen-gold
                  textShadow: '0 0 15px rgba(197, 160, 89, 0.8), 0 2px 4px rgba(0,0,0,0.1)',
                  transform: `rotate(${ripple.rotation}deg)`,
                  animation: 'floatUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
               }}
             >
               <span>功德</span> 
               <span className="text-3xl">+1</span>
             </div>
          ))}
        </div>

        <style>{`
          @keyframes floatUp {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) translateY(20px); }
            20% { opacity: 1; transform: translate(-50%, -80%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -200%) scale(1); filter: blur(2px); }
          }
          @keyframes floatSky {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(-400px) scale(0.5); opacity: 0; }
          }
          @keyframes smokeRise {
            0% { opacity: 0; transform: translateY(0) scale(0.5) rotate(0deg); }
            20% { opacity: 0.6; }
            100% { opacity: 0; transform: translateY(-120px) scale(2) rotate(20deg); }
          }
          @keyframes swimLeft {
            0% { transform: translateX(200px) scaleX(-1); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(-300px) scaleX(-1); opacity: 0; }
          }
          @keyframes shake {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.5); opacity: 0.1; }
          }
        `}</style>
        
        <div className="mt-12 max-w-sm text-center">
           <p className="text-stone-500 text-sm mb-2">
              “静心敲击，一念清净。”
           </p>
        </div>
      </div>

      {/* Right Column: Interaction Hub */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col h-full max-h-[600px] overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-stone-200 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('incense')}
            className={`flex-1 min-w-[60px] py-4 text-xs md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap ${activeTab === 'incense' ? 'text-zen-red border-b-2 border-zen-red bg-stone-50' : 'text-stone-400 hover:text-zen-ink'}`}
          >
            <Cloud className="w-4 h-4" /> <span>敬香</span>
          </button>
          <button 
            onClick={() => setActiveTab('lantern')}
            className={`flex-1 min-w-[60px] py-4 text-xs md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap ${activeTab === 'lantern' ? 'text-zen-red border-b-2 border-zen-red bg-stone-50' : 'text-stone-400 hover:text-zen-ink'}`}
          >
            <Flame className="w-4 h-4" /> <span>供灯</span>
          </button>
          <button 
            onClick={() => setActiveTab('release')}
            className={`flex-1 min-w-[60px] py-4 text-xs md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap ${activeTab === 'release' ? 'text-zen-red border-b-2 border-zen-red bg-stone-50' : 'text-stone-400 hover:text-zen-ink'}`}
          >
            <Waves className="w-4 h-4" /> <span>放生</span>
          </button>
           <button 
            onClick={() => setActiveTab('meditation')}
            className={`flex-1 min-w-[60px] py-4 text-xs md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap ${activeTab === 'meditation' ? 'text-zen-red border-b-2 border-zen-red bg-stone-50' : 'text-stone-400 hover:text-zen-ink'}`}
          >
            <Hourglass className="w-4 h-4" /> <span>冥想</span>
          </button>
          <button 
            onClick={() => setActiveTab('divination')}
            className={`flex-1 min-w-[60px] py-4 text-xs md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap ${activeTab === 'divination' ? 'text-zen-red border-b-2 border-zen-red bg-stone-50' : 'text-stone-400 hover:text-zen-ink'}`}
          >
            <ScrollText className="w-4 h-4" /> <span>占卜</span>
          </button>
           <button 
            onClick={() => setActiveTab('store')}
            className={`flex-1 min-w-[60px] py-4 text-xs md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap ${activeTab === 'store' ? 'text-zen-red border-b-2 border-zen-red bg-stone-50' : 'text-stone-400 hover:text-zen-ink'}`}
          >
            <ShoppingBag className="w-4 h-4" /> <span>商城</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[60px] py-4 text-xs md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'text-zen-red border-b-2 border-zen-red bg-stone-50' : 'text-stone-400 hover:text-zen-ink'}`}
          >
            <History className="w-4 h-4" /> <span>明细</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-stone-50/30 relative">
          
          {/* 1. Incense (Default) */}
          {activeTab === 'incense' && (
            <IncensePanel count={count} onSpend={onSpend} />
          )}

          {/* 2. Sky Lantern */}
          {activeTab === 'lantern' && (
            <SkyLanternPanel count={count} onSpend={onSpend} />
          )}

          {/* 3. Release Life */}
          {activeTab === 'release' && (
             <ReleasePanel count={count} onSpend={onSpend} />
          )}
          
          {/* 4. Meditation */}
          {activeTab === 'meditation' && (
             <MeditationPanel count={count} onSpend={onSpend} />
          )}

          {/* 5. Divination */}
          {activeTab === 'divination' && (
            <DivinationPanel count={count} onSpend={onSpend} />
          )}
          
          {/* 6. Merit Store */}
          {activeTab === 'store' && (
            <div className="p-4 space-y-3 animate-fade-in">
              <div className="text-center mb-4 text-xs text-stone-400">消耗功德，兑换虚拟精神寄托</div>
              {SHOP_ITEMS.map((item) => {
                const canAfford = count >= item.cost;
                return (
                  <div key={item.id} className="bg-white p-3 rounded-lg border border-stone-100 shadow-sm flex items-center justify-between group hover:border-stone-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${canAfford ? 'bg-amber-50 text-zen-gold' : 'bg-stone-100 text-stone-400'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-zen-ink">{item.name}</div>
                        <div className="text-xs text-stone-400">{item.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (canAfford) onSpend(item.cost, `商城：${item.name}`);
                      }}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                        canAfford 
                          ? 'bg-zen-gold text-white hover:bg-amber-600 shadow-sm' 
                          : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                      }`}
                    >
                      {item.cost}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 7. History */}
          {activeTab === 'history' && (
             <div className="p-4 animate-fade-in">
                <div className="text-center mb-4 text-xs text-stone-400">电子木鱼功德消耗明细</div>
                {historyLogs.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-sm">
                        暂无明细记录
                    </div>
                ) : (
                    <div className="space-y-2">
                        {historyLogs.map(log => (
                            <div key={log.id} className="bg-white p-3 rounded-lg border border-stone-100 flex justify-between items-center text-sm">
                                <div className="flex flex-col gap-1">
                                   <span className="font-bold text-zen-ink">{log.description}</span>
                                   <span className="text-xs text-stone-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(log.timestamp).toLocaleString()}
                                   </span>
                                </div>
                                <div className="font-bold text-stone-500">
                                   -{log.points}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Meditation Panel ---
const MeditationPanel: React.FC<{count: number, onSpend: (n:number, r:string)=>void}> = ({count, onSpend}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(5); // Default 5 minutes
  const cost = 20;

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Timer finished logic can go here (e.g., play sound)
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    if (isActive) {
      // Stop logic
      setIsActive(false);
      setTimeLeft(0);
      return;
    }
    
    if (count < cost) return;
    onSpend(cost, `冥想：${duration}分钟`);
    setTimeLeft(duration * 60);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center animate-fade-in relative overflow-hidden bg-emerald-50/30">
       
       {/* Background Breathing Animation */}
       {isActive && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 bg-emerald-200 rounded-full opacity-20 animate-[breathe_4s_ease-in-out_infinite]"></div>
            <div className="absolute w-32 h-32 bg-emerald-300 rounded-full opacity-20 animate-[breathe_4s_ease-in-out_infinite_1s]"></div>
         </div>
       )}

       <div className="z-10 flex flex-col items-center w-full">
         
         <div className="mb-8 relative">
            {/* Timer Display */}
            <div className="w-40 h-40 rounded-full border-4 border-emerald-100 flex items-center justify-center bg-white shadow-sm relative z-10">
               <div className="text-4xl font-serif font-bold text-zen-ink tabular-nums tracking-wider">
                  {isActive ? formatTime(timeLeft) : `${duration}:00`}
               </div>
            </div>
            {/* Progress Ring (Simple visual) */}
            {isActive && (
               <svg className="absolute top-0 left-0 w-40 h-40 -rotate-90 pointer-events-none z-20">
                  <circle
                    cx="80" cy="80" r="78"
                    fill="none" stroke="#10b981" strokeWidth="4"
                    strokeDasharray="490"
                    strokeDashoffset={490 - (490 * timeLeft) / (duration * 60)}
                    className="transition-all duration-1000 ease-linear"
                  />
               </svg>
            )}
         </div>

         {!isActive && (
           <div className="flex gap-2 mb-6">
              {[1, 5, 15, 30].map(min => (
                 <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${
                       duration === min 
                         ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                         : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-200'
                    }`}
                 >
                    {min}分钟
                 </button>
              ))}
           </div>
         )}

         <h3 className="font-serif font-bold text-lg text-zen-ink mb-2">静坐冥想</h3>
         <p className="text-xs text-stone-500 mb-6 text-center max-w-xs">
           {isActive ? "吸气... 呼气... 关注当下..." : (
             <>
               收摄心神，定生智慧。<br/>
               开启冥想倒计时消耗 <span className="text-zen-red font-bold">{cost}</span> 功德。
             </>
           )}
         </p>

         <button 
            onClick={handleStart}
            disabled={!isActive && count < cost}
            className={`w-48 py-2 rounded-full font-bold text-sm shadow-md transition-all ${
               isActive 
                 ? 'bg-stone-500 text-white hover:bg-stone-600'
                 : count >= cost
                   ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                   : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
         >
            {isActive ? '结束冥想' : '开始静修'}
         </button>
       </div>
    </div>
  );
};

// --- Sub-Component: Incense Panel ---
const IncensePanel: React.FC<{count: number, onSpend: (n:number, r:string)=>void}> = ({count, onSpend}) => {
  const [burning, setBurning] = useState(false);
  const cost = 30;

  const handleLight = () => {
    if (count < cost || burning) return;
    onSpend(cost, '敬香');
    setBurning(true);
    setTimeout(() => setBurning(false), 5000); // Burns for 5 seconds
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center animate-fade-in relative overflow-hidden bg-stone-100/50">
      
      {/* Incense Visual */}
      <div className="relative mt-10 mb-10">
         {/* Smoke Animation */}
         {burning && (
           <>
             <div className="absolute -top-10 left-[-10px] w-6 h-6 rounded-full bg-stone-300 blur-md opacity-0" style={{animation: 'smokeRise 3s ease-in-out infinite'}}></div>
             <div className="absolute -top-16 left-[0px] w-8 h-8 rounded-full bg-stone-200 blur-md opacity-0" style={{animation: 'smokeRise 3.5s ease-in-out infinite 0.5s'}}></div>
             <div className="absolute -top-12 left-[10px] w-5 h-5 rounded-full bg-stone-300 blur-md opacity-0" style={{animation: 'smokeRise 2.8s ease-in-out infinite 1s'}}></div>
           </>
         )}

         {/* Incense Sticks */}
         <div className="flex gap-2 justify-center items-end">
            <div className="w-1 h-16 bg-zen-red relative">
               {burning && <div className="absolute top-0 left-0 w-full h-1 bg-orange-400 animate-pulse box-shadow-[0_0_5px_red]"></div>}
            </div>
            <div className="w-1 h-20 bg-zen-red relative">
               {burning && <div className="absolute top-0 left-0 w-full h-1 bg-orange-400 animate-pulse"></div>}
            </div>
            <div className="w-1 h-16 bg-zen-red relative">
               {burning && <div className="absolute top-0 left-0 w-full h-1 bg-orange-400 animate-pulse"></div>}
            </div>
         </div>
         {/* Censer */}
         <div className="w-24 h-12 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-full shadow-lg border-t-4 border-amber-600 relative z-10 flex justify-center items-center">
             <div className="text-amber-500 font-serif text-xs opacity-50">佛</div>
         </div>
         {/* Legs */}
         <div className="absolute -bottom-2 left-2 w-3 h-4 bg-amber-900 rounded-full"></div>
         <div className="absolute -bottom-2 right-2 w-3 h-4 bg-amber-900 rounded-full"></div>
      </div>

      <h3 className="font-serif font-bold text-lg text-zen-ink mb-2">敬香祈福</h3>
      <p className="text-xs text-stone-500 mb-6 text-center">
        一柱清香通信去，万般心愿上天庭。<br/>
        每次敬香消耗 <span className="text-zen-red font-bold">{cost}</span> 功德。
      </p>

      <button 
          onClick={handleLight}
          disabled={count < cost || burning}
          className={`px-8 py-2 rounded-full font-bold text-sm shadow-md transition-all ${
            count >= cost && !burning
              ? 'bg-amber-700 text-white hover:bg-amber-800' 
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
      >
          {burning ? '香云缭绕中...' : '诚心敬香'}
      </button>
    </div>
  );
};

// --- Sub-Component: Release Panel ---
const ReleasePanel: React.FC<{count: number, onSpend: (n:number, r:string)=>void}> = ({count, onSpend}) => {
  const [fishes, setFishes] = useState<{id: number}[]>([]);
  const cost = 50;

  const handleRelease = () => {
    if (count < cost) return;
    onSpend(cost, '放生锦鲤');
    const newFish = { id: Date.now() };
    setFishes(prev => [...prev, newFish]);
    setTimeout(() => {
      setFishes(prev => prev.filter(f => f.id !== newFish.id));
    }, 4000);
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-blue-50/50">
      
      {/* Water Background Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-200 to-transparent opacity-30 pointer-events-none"></div>

      {/* Fish Animation Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         {fishes.map(fish => (
            <div 
              key={fish.id}
              className="absolute right-[-50px] text-orange-500 opacity-0"
              style={{
                 top: `${30 + Math.random() * 40}%`,
                 animation: 'swimLeft 4s linear forwards',
              }}
            >
               <Fish className="w-12 h-12" fill="currentColor" />
               <div className="absolute right-full top-1/2 w-8 h-1 bg-white opacity-30 rounded-full blur-[1px]"></div>
            </div>
         ))}
      </div>

      <div className="z-10 flex flex-col items-center justify-center h-full p-6">
          <div className="bg-blue-100 p-4 rounded-full mb-4 text-blue-500">
             <Waves className="w-8 h-8" />
          </div>
          
          <h3 className="font-serif font-bold text-lg text-zen-ink mb-2">功德放生</h3>
          <p className="text-xs text-stone-500 mb-6 text-center">
            诸功德中，放生第一。<br/>
            每次放生锦鲤消耗 <span className="text-zen-red font-bold">{cost}</span> 功德。
          </p>

          <button 
              onClick={handleRelease}
              disabled={count < cost}
              className={`px-8 py-2 rounded-full font-bold text-sm shadow-md transition-all ${
                count >= cost
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
          >
              放生锦鲤
          </button>
      </div>
    </div>
  );
};

// --- Sub-Component: Sky Lantern Panel ---
const SkyLanternPanel: React.FC<{count: number, onSpend: (n:number, r:string)=>void}> = ({count, onSpend}) => {
  const [wish, setWish] = useState('');
  const [flyingLanterns, setFlyingLanterns] = useState<{id: number, text: string}[]>([]);
  const cost = 10;

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wish.trim() || count < cost) return;

    onSpend(cost, '供灯祈福');
    const newLantern = { id: Date.now(), text: wish };
    setFlyingLanterns(prev => [...prev, newLantern]);
    setWish('');

    // Remove after animation
    setTimeout(() => {
      setFlyingLanterns(prev => prev.filter(l => l.id !== newLantern.id));
    }, 4000);
  };

  return (
    <div className="p-6 h-full flex flex-col items-center animate-fade-in relative overflow-hidden">
       {/* Background Animation Area */}
       <div className="absolute inset-0 pointer-events-none z-0">
          {flyingLanterns.map(l => (
             <div 
                key={l.id}
                className="absolute left-1/2 bottom-0 flex flex-col items-center text-center opacity-0"
                style={{ 
                   animation: 'floatSky 4s ease-out forwards',
                   marginLeft: `${Math.random() * 100 - 50}px` 
                }}
             >
                <div className="text-zen-red mb-2 text-xs font-serif font-bold bg-white/80 px-2 py-1 rounded shadow-sm whitespace-nowrap">
                   {l.text}
                </div>
                <div className="text-orange-500 relative">
                   <div className="w-8 h-10 bg-gradient-to-t from-orange-500 to-yellow-200 rounded-t-full rounded-b-lg opacity-90 shadow-[0_0_15px_rgba(255,165,0,0.6)]"></div>
                   <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-4 h-1 bg-orange-800"></div>
                </div>
             </div>
          ))}
       </div>

       <div className="z-10 w-full flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-orange-50 p-4 rounded-full mb-4">
             <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="font-serif font-bold text-lg text-zen-ink mb-2">供灯祈福</h3>
          <p className="text-xs text-stone-500 mb-6 max-w-xs">
            燃灯祈福，心愿上达天听。<br/>
            每次放飞消耗 <span className="text-zen-red font-bold">{cost}</span> 功德。
          </p>

          <form onSubmit={handleRelease} className="w-full max-w-xs space-y-3">
             <input 
                type="text" 
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="在此写下您的愿望..."
                className="w-full text-center border-b-2 border-stone-200 bg-transparent py-2 focus:border-zen-red focus:outline-none placeholder-stone-300 transition-colors"
                maxLength={12}
             />
             <button 
                type="submit"
                disabled={count < cost || !wish.trim()}
                className={`w-full py-2 rounded-full font-bold text-sm shadow-md transition-all ${
                   count >= cost && wish.trim() 
                     ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg' 
                     : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
             >
                点亮放飞
             </button>
          </form>
       </div>
    </div>
  );
}

// --- Sub-Component: Divination Panel ---
const DivinationPanel: React.FC<{count: number, onSpend: (n:number, r:string)=>void}> = ({count, onSpend}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [result, setResult] = useState<typeof DIVINATION_LOTS[0] | null>(null);
  const cost = 50;

  const handleDraw = () => {
    if (count < cost || isShaking) return;
    
    onSpend(cost, '求签');
    setIsShaking(true);
    setResult(null);

    // Shake animation time
    setTimeout(() => {
       const randomLot = DIVINATION_LOTS[Math.floor(Math.random() * DIVINATION_LOTS.length)];
       setResult(randomLot);
       setIsShaking(false);
    }, 1500);
  };

  return (
    <div className="p-6 h-full flex flex-col items-center animate-fade-in">
       {result ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in relative">
             <button 
               onClick={() => setResult(null)} 
               className="absolute top-0 right-0 p-1 hover:bg-stone-100 rounded-full text-stone-400"
             >
               <X className="w-5 h-5" />
             </button>

             <div className="text-sm font-bold text-stone-400 mb-2">求得灵签</div>
             <div className="text-3xl font-serif font-bold text-zen-red mb-4 border-2 border-zen-red px-4 py-2 rounded">
                {result.type}
             </div>
             <h4 className="text-xl font-bold text-zen-ink mb-2">{result.title}</h4>
             <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 w-full mb-4">
                <p className="font-serif italic text-stone-600 mb-2">“{result.poem}”</p>
                <div className="h-px bg-stone-200 w-full my-2"></div>
                <p className="text-xs text-stone-500 text-left">
                   <span className="font-bold">解曰：</span>{result.explain}
                </p>
             </div>
             <button 
                onClick={() => setResult(null)}
                className="text-xs text-stone-400 underline hover:text-zen-red"
             >
                诚心再求
             </button>
          </div>
       ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <div className={`mb-6 relative ${isShaking ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''}`}>
                 <div className="w-16 h-24 bg-gradient-to-br from-stone-700 to-stone-900 rounded-lg flex items-center justify-center shadow-lg border-b-4 border-stone-950 relative overflow-hidden">
                    <div className="absolute top-2 w-12 h-1 bg-stone-600 rounded-full opacity-30"></div>
                    <span className="writing-vertical text-stone-400 font-serif font-bold opacity-50 select-none">灵签</span>
                 </div>
                 {/* Stick */}
                 <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-2 h-24 bg-amber-200 rounded-full -z-10 border border-amber-300"></div>
              </div>

              <h3 className="font-serif font-bold text-lg text-zen-ink mb-2">摇筒求签</h3>
              <p className="text-xs text-stone-500 mb-6 max-w-xs">
                心诚则灵，问卜前程。<br/>
                每次求签消耗 <span className="text-zen-red font-bold">{cost}</span> 功德。
              </p>

              <button 
                 onClick={handleDraw}
                 disabled={count < cost || isShaking}
                 className={`w-full max-w-xs py-2 rounded-full font-bold text-sm shadow-md transition-all ${
                    count >= cost
                      ? 'bg-zen-ink text-white hover:bg-stone-800' 
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                 }`}
              >
                 {isShaking ? '求签中...' : '诚心摇动'}
              </button>
          </div>
       )}
    </div>
  );
}

export default WoodenFish;
