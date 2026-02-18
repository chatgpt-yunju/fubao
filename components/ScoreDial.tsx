import React from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { BaseScores, Ranking } from '../types';
import { MAX_POINTS, RANKING_DESCRIPTIONS } from '../constants';

interface ScoreDialProps {
  baseScores: BaseScores;
  logPoints: number;
}

const ScoreDial: React.FC<ScoreDialProps> = ({ baseScores, logPoints }) => {
  const bScore = (Object.values(baseScores.buddhism) as number[]).reduce((a, b) => a + b, 0);
  const cScore = (Object.values(baseScores.confucianism) as number[]).reduce((a, b) => a + b, 0);
  const tScore = (Object.values(baseScores.taoism) as number[]).reduce((a, b) => a + b, 0);

  const totalBase = bScore + cScore + tScore;
  const finalScore = Math.min(100, Math.max(0, totalBase + logPoints));

  let ranking = Ranking.DEFICIT;
  if (finalScore >= 90) ranking = Ranking.PERFECT;
  else if (finalScore >= 75) ranking = Ranking.ABUNDANT;
  else if (finalScore >= 60) ranking = Ranking.STABLE;
  else if (finalScore >= 30) ranking = Ranking.WEAK;

  const data = [
    { subject: '释', A: (bScore / MAX_POINTS.buddhism) * 100, fullMark: 100 },
    { subject: '儒', A: (cScore / MAX_POINTS.confucianism) * 100, fullMark: 100 },
    { subject: '道', A: (tScore / MAX_POINTS.taoism) * 100, fullMark: 100 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex flex-col items-center">
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-zen-stone opacity-30"></div>
        <div 
            className="absolute inset-0 rounded-full border-4 border-zen-red transition-all duration-1000 ease-out"
            style={{ 
                clipPath: `inset(${100 - finalScore}% 0 0 0)` 
            }}
        ></div>
        <div className="flex flex-col items-center z-10">
          <span className="text-5xl font-serif font-bold text-zen-ink">{finalScore}</span>
          <span className="text-xs text-stone-500 uppercase tracking-widest mt-1">福报总分</span>
        </div>
      </div>

      <h2 className={`text-xl font-serif font-bold mb-2 ${
          ranking === Ranking.PERFECT ? 'text-zen-gold' : 
          ranking === Ranking.ABUNDANT ? 'text-zen-red' : 
          ranking === Ranking.DEFICIT ? 'text-stone-500' : 'text-zen-ink'
      }`}>
        {ranking}
      </h2>
      
      <p className="text-sm text-stone-600 text-center mb-6 max-w-md italic">
        {RANKING_DESCRIPTIONS[ranking as keyof typeof RANKING_DESCRIPTIONS]}
      </p>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#57534e', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="均衡度"
              dataKey="A"
              stroke="#8a3324"
              strokeWidth={2}
              fill="#8a3324"
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center text-sm">
        <div>
            <div className="text-stone-500">释</div>
            <div className="font-bold">{bScore}/{MAX_POINTS.buddhism}</div>
        </div>
        <div>
            <div className="text-stone-500">儒</div>
            <div className="font-bold">{cScore}/{MAX_POINTS.confucianism}</div>
        </div>
        <div>
            <div className="text-stone-500">道</div>
            <div className="font-bold">{tScore}/{MAX_POINTS.taoism}</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDial;