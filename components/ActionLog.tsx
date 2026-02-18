import React, { useState } from 'react';
import { LogEntry } from '../types';
import { PlusCircle, MinusCircle, History, RotateCcw } from 'lucide-react';

interface ActionLogProps {
  logs: LogEntry[];
  onAddLog: (log: LogEntry) => void;
  onClearLogs: () => void;
}

const ActionLog: React.FC<ActionLogProps> = ({ logs, onAddLog, onClearLogs }) => {
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<number>(1);
  const [type, setType] = useState<LogEntry['type']>('merit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onAddLog({
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      description,
      points: Math.abs(points), // Ensure positive value stored, logic handles sign
      category: 'general' 
    });
    setDescription('');
    setPoints(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Form */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-fit sticky top-6">
        <h3 className="text-lg font-serif font-bold text-zen-ink mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-zen-red" />
          记录省察
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">行止类型</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('merit')}
                className={`p-2 text-sm rounded-md border ${type === 'merit' ? 'bg-zen-red text-white border-zen-red' : 'bg-white border-stone-200 text-stone-600'}`}
              >
                益福
              </button>
              <button
                type="button"
                onClick={() => setType('demerit')}
                className={`p-2 text-sm rounded-md border ${type === 'demerit' ? 'bg-stone-600 text-white border-stone-600' : 'bg-white border-stone-200 text-stone-600'}`}
              >
                损福
              </button>
              <button
                type="button"
                onClick={() => setType('correction')}
                className={`p-2 text-sm rounded-md border ${type === 'correction' ? 'bg-zen-gold text-white border-zen-gold' : 'bg-white border-stone-200 text-stone-600'}`}
              >
                补过
              </button>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-stone-600 mb-1">事由描述</label>
             <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：帮助同事解决难题..."
                className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-zen-red focus:outline-none"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-stone-600 mb-1">分值 ({type === 'merit' ? '+' : type === 'demerit' ? '-' : '+'}分)</label>
             <input 
                type="number" 
                min="1"
                max="50"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value))}
                className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-zen-red focus:outline-none"
             />
             <p className="text-xs text-stone-400 mt-1">
                {type === 'merit' && '下品(1-2), 中品(3-9), 上品(10-20)'}
                {type === 'demerit' && '下品(1-2), 中品(3-9), 上品(10-30)'}
             </p>
          </div>

          <button type="submit" className="w-full bg-zen-ink text-white py-2 rounded-md hover:bg-black transition-colors">
            确认记录
          </button>
        </form>
      </div>

      {/* List */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-zen-ink flex items-center gap-2">
            <History className="w-5 h-5 text-stone-500" />
            省察历史
            </h3>
            <button onClick={onClearLogs} className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> 清空记录
            </button>
        </div>
        
        {logs.length === 0 ? (
            <div className="text-center py-10 text-stone-400 italic">
                暂无记录。请开始记录您的每日修持。
            </div>
        ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {[...logs].reverse().map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-100 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                                ${log.type === 'merit' ? 'bg-red-100 text-zen-red' : 
                                  log.type === 'demerit' ? 'bg-stone-200 text-stone-600' : 
                                  'bg-yellow-100 text-zen-gold'}
                            `}>
                                {log.type === 'merit' ? '+' : log.type === 'demerit' ? '-' : '补'}
                            </div>
                            <div>
                                <div className="font-medium text-zen-ink">{log.description}</div>
                                <div className="text-xs text-stone-400">{new Date(log.timestamp).toLocaleDateString()} • {log.type === 'correction' ? '补过' : log.type === 'merit' ? '益福' : '损福'}</div>
                            </div>
                        </div>
                        <div className={`font-bold ${log.type === 'demerit' ? 'text-stone-500' : 'text-zen-red'}`}>
                            {log.type === 'demerit' ? '-' : '+'}{log.points}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ActionLog;