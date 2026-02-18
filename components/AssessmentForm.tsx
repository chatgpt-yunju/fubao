
import React from 'react';
import { BaseScores } from '../types';

interface AssessmentFormProps {
  scores: BaseScores;
  onChange: (newScores: BaseScores) => void;
}

interface ScoringRule {
  low: string;  // 下品/亏欠 (0-30%分值)
  mid: string;  // 中品/常人 (31-70%分值)
  high: string; // 上品/圆满 (71-100%分值)
}

const SliderGroup: React.FC<{
  label: string;
  value: number;
  max: number;
  description: string;
  rules: ScoringRule;
  onChange: (val: number) => void;
}> = ({ label, value, max, description, rules, onChange }) => {
  
  // Helper to determine current range
  const getRange = (val: number, max: number) => {
    const ratio = val / max;
    if (ratio <= 0.3) return 'low';
    if (ratio <= 0.7) return 'mid';
    return 'high';
  };

  const currentRange = getRange(value, max);

  return (
    <div className="mb-8 bg-stone-50 p-4 rounded-lg border border-stone-100">
      <div className="flex justify-between items-end mb-2">
        <div>
          <label className="font-serif font-bold text-lg text-zen-ink">{label}</label>
          <p className="text-xs text-stone-500 mt-1">{description}</p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-serif font-bold ${
            currentRange === 'low' ? 'text-stone-500' : 
            currentRange === 'mid' ? 'text-zen-gold' : 'text-zen-red'
          }`}>
            {value}
          </span>
          <span className="text-xs text-stone-400 font-medium">/{max}</span>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-zen-ink mb-4"
      />

      {/* Detailed Scoring Rules Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div className={`p-2 rounded border transition-colors ${
          currentRange === 'low' 
            ? 'bg-stone-200 border-stone-300 text-stone-800 font-medium shadow-sm' 
            : 'bg-transparent border-transparent text-stone-400 opacity-50'
        }`}>
          <div className="font-bold mb-1">[下品 {0}-{Math.floor(max * 0.3)}分]</div>
          {rules.low}
        </div>
        
        <div className={`p-2 rounded border transition-colors ${
          currentRange === 'mid' 
            ? 'bg-amber-50 border-amber-200 text-amber-900 font-medium shadow-sm' 
            : 'bg-transparent border-transparent text-stone-400 opacity-50'
        }`}>
          <div className="font-bold mb-1">[中品 {Math.floor(max * 0.3) + 1}-{Math.floor(max * 0.7)}分]</div>
          {rules.mid}
        </div>

        <div className={`p-2 rounded border transition-colors ${
          currentRange === 'high' 
            ? 'bg-red-50 border-red-200 text-zen-red font-medium shadow-sm' 
            : 'bg-transparent border-transparent text-stone-400 opacity-50'
        }`}>
          <div className="font-bold mb-1">[上品 {Math.floor(max * 0.7) + 1}-{max}分]</div>
          {rules.high}
        </div>
      </div>
    </div>
  );
};

const AssessmentForm: React.FC<AssessmentFormProps> = ({ scores, onChange }) => {

  const updateBuddhism = (key: keyof BaseScores['buddhism'], val: number) => {
    onChange({ ...scores, buddhism: { ...scores.buddhism, [key]: val } });
  };
  const updateConfucianism = (key: keyof BaseScores['confucianism'], val: number) => {
    onChange({ ...scores, confucianism: { ...scores.confucianism, [key]: val } });
  };
  const updateTaoism = (key: keyof BaseScores['taoism'], val: number) => {
    onChange({ ...scores, taoism: { ...scores.taoism, [key]: val } });
  };

  // --- Scoring Rules Definitions ---

  const buddhismRules = {
    dana: {
      low: "悭吝不舍，见死不救，或因布施而生傲慢悔恼。对财物极度执着，不愿拔一毛利天下。",
      mid: "随缘布施，偶有计较。见人急难能伸援手，但内心仍有亲疏之别，或期待回报。",
      high: "三轮体空，无私奉献。内舍身心，外舍国城妻子，一切皆舍，心无挂碍，不求人知。"
    },
    sila: {
      low: "毁犯戒律，肆无忌惮。言行相诡，突破伦理道德底线，对过错无羞耻心。",
      mid: "小过偶犯，大戒能守。知耻能改，行止基本合规，但独处时偶尔松懈。",
      high: "严持净戒，尘点不染。身口意三业清净，如护眼珠，不仅不作恶，更主动防非止恶。"
    },
    ksanti: {
      low: "嗔心深重，睚眦必报。遇微小逆境即怨天尤人，暴躁易怒，无法控制情绪。",
      mid: "遇事能忍，心中有气。事后能自我化解，不至于当场失态，但内心仍有波澜。",
      high: "难忍能忍，宽容慈悲。视逆境为增上缘，受辱不怨，心如止水，如大地般厚得载物。"
    },
    virya: {
      low: "懈怠懒散，得过且过。沉迷享乐，无进取之心，今日事推明日，明日复明日。",
      mid: "忽勤忽懒，遇顺则进。维持日常工作生活而不堕落，但缺乏突破自我的恒心。",
      high: "勇猛精进，披甲而行。日新又新，即使百折亦不回，为追求真理与大义不惜身命。"
    },
    dhyana: {
      low: "心浮气躁，思虑纷飞。无法专注片刻，情绪极易受环境与他人言语掌控。",
      mid: "稍有定力，遇事能静。能专注处理工作事务，但偶尔仍被环境噪音干扰心神。",
      high: "如如不动，动静皆定。泰山崩于前而色不变，行住坐卧皆在定中，心神合一。"
    },
    prajna: {
      low: "愚痴执着，不明事理。迷信盲从，常做错误决策，认假为真，执非为是。",
      mid: "明理尚可，知黑守白。能辨是非善恶，但在重大利益面前偶尔会迷茫动摇。",
      high: "般若圆融，洞察本质。破除一切执念，决策顺应天理人心，知行合一，圆满无碍。"
    }
  };

  const confucianismRules = {
    cultivateSelf: {
      low: "放纵私欲，言行无状。缺乏教养，常因私利损人，生活无规律，不知反省。",
      mid: "独善其身，克己复礼。注重仪表言谈，不给人添麻烦，能遵守社会公德。",
      high: "内圣外王，慎独慎微。德行深厚感化他人，为众人之表率，行止皆可为法则。"
    },
    regulateFamily: {
      low: "家庭破碎，六亲不和。推卸责任，常与亲近人争吵，家风败坏，互相怨恨。",
      mid: "家庭和睦，各司其职。能尽孝道，对伴侣子女负责，维持家庭基本运转与和谐。",
      high: "孝悌圆满，家风严谨。不仅一家和乐，更助族人共荣，父慈子孝，兄友弟恭。"
    },
    governState: {
      low: "尸位素餐，推诿扯皮。缺乏担当，由于失职造成团队或集体利益损失。",
      mid: "尽职尽责，完成本分。团队协作良好，能达成既定目标，不拖后腿。",
      high: "鞠躬尽瘁，统筹全局。勇于承担重任，在危难时刻挺身而出，带领团队突破困境。"
    },
    peaceWorld: {
      low: "目光短浅，唯利是图。制造矛盾，传播负面情绪，对社会产生负面影响。",
      mid: "遵纪守法，热心公益。关注社会问题，力所能及地传递正能量，维护公序良俗。",
      high: "胸怀天下，立功立言。创造巨大的社会价值，为后世开太平，功在当代，利在千秋。"
    }
  };

  const taoismRules = {
    taoLaw: {
      low: "逆施倒行，强求硬取。不撞南墙不回头，违背客观规律，不仅无功反受其害。",
      mid: "顺势而为，灵活应变。懂得规避风险，办事较为顺遂，能利用环境优势。",
      high: "与道合真，无为而无不为。顺应天时地利，不需刻意用力而事半功倍，合于大道。"
    },
    nature: {
      low: "虚伪造作，矫揉掩饰。违背本心，活在他人的眼光中，充满焦虑与伪装。",
      mid: "实事求是，保持本真。不卑不亢，生活态度自然大方，不刻意讨好也不傲慢。",
      high: "返璞归真，天人合一。去伪存真，生命状态如婴儿般纯粹，内外澄澈，通透自然。"
    },
    quietude: {
      low: "心神不宁，焦躁不安。欲望炽盛，终日忙碌而无所获，精神内耗严重。",
      mid: "忙里偷闲，偶尔静修。懂得调节生活节奏，保持内心平衡，不被物欲完全牵引。",
      high: "致虚守静，厚积薄发。宁静致远，在喧嚣中守住清凉，如深潭之水，波澜不惊。"
    }
  };

  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      
      {/* 释门 */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-zen-red"></div>
        <h3 className="text-2xl font-serif font-bold text-zen-red mb-2 pb-2 border-b border-stone-100">
            释门六度 (总30分)
        </h3>
        <p className="text-sm text-stone-500 mb-8 italic">
            “诸恶莫作，众善奉行，自净其意。” —— 每一度满分5分。
        </p>
        <div className="grid grid-cols-1 gap-y-2">
          <SliderGroup 
            label="布施 (Dana)" value={scores.buddhism.dana} max={5} 
            description="主动利他，资源共享" rules={buddhismRules.dana} 
            onChange={(v) => updateBuddhism('dana', v)} 
          />
          <SliderGroup 
            label="持戒 (Sila)" value={scores.buddhism.sila} max={5} 
            description="严守规则，言行一致" rules={buddhismRules.sila} 
            onChange={(v) => updateBuddhism('sila', v)} 
          />
          <SliderGroup 
            label="忍辱 (Ksanti)" value={scores.buddhism.ksanti} max={5} 
            description="宽以待人，化解冲突" rules={buddhismRules.ksanti} 
            onChange={(v) => updateBuddhism('ksanti', v)} 
          />
          <SliderGroup 
            label="精进 (Virya)" value={scores.buddhism.virya} max={5} 
            description="持续学习，追求卓越" rules={buddhismRules.virya} 
            onChange={(v) => updateBuddhism('virya', v)} 
          />
          <SliderGroup 
            label="禅定 (Dhyana)" value={scores.buddhism.dhyana} max={5} 
            description="专注当下，思虑澄明" rules={buddhismRules.dhyana} 
            onChange={(v) => updateBuddhism('dhyana', v)} 
          />
          <SliderGroup 
            label="智慧 (Prajna)" value={scores.buddhism.prajna} max={5} 
            description="洞察本质，知行合一" rules={buddhismRules.prajna} 
            onChange={(v) => updateBuddhism('prajna', v)} 
          />
        </div>
      </div>

      {/* 儒门 */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-zen-gold"></div>
        <h3 className="text-2xl font-serif font-bold text-zen-gold mb-2 pb-2 border-b border-stone-100">
            儒门修齐 (总40分)
        </h3>
        <p className="text-sm text-stone-500 mb-8 italic">
            “修身齐家治国平天下。” —— 每一目满分10分。
        </p>
        <div className="grid grid-cols-1 gap-y-2">
          <SliderGroup 
            label="修身 (Self)" value={scores.confucianism.cultivateSelf} max={10} 
            description="克己复礼，提升修养" rules={confucianismRules.cultivateSelf} 
            onChange={(v) => updateConfucianism('cultivateSelf', v)} 
          />
          <SliderGroup 
            label="齐家 (Family)" value={scores.confucianism.regulateFamily} max={10} 
            description="家庭和谐，协作互助" rules={confucianismRules.regulateFamily} 
            onChange={(v) => updateConfucianism('regulateFamily', v)} 
          />
          <SliderGroup 
            label="治国 (Career/State)" value={scores.confucianism.governState} max={10} 
            description="担当责任，统筹全局" rules={confucianismRules.governState} 
            onChange={(v) => updateConfucianism('governState', v)} 
          />
          <SliderGroup 
            label="平天下 (World)" value={scores.confucianism.peaceWorld} max={10} 
            description="胸怀格局，价值创造" rules={confucianismRules.peaceWorld} 
            onChange={(v) => updateConfucianism('peaceWorld', v)} 
          />
        </div>
      </div>

      {/* 道门 */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-zen-green"></div>
        <h3 className="text-2xl font-serif font-bold text-zen-green mb-2 pb-2 border-b border-stone-100">
            道门守真 (总30分)
        </h3>
        <p className="text-sm text-stone-500 mb-8 italic">
            “人法地，地法天，天法道，道法自然。” —— 每一目满分10分。
        </p>
        <div className="grid grid-cols-1 gap-y-2">
          <SliderGroup 
            label="道法 (Tao/Law)" value={scores.taoism.taoLaw} max={10} 
            description="顺应规律，灵活应变" rules={taoismRules.taoLaw} 
            onChange={(v) => updateTaoism('taoLaw', v)} 
          />
          <SliderGroup 
            label="自然 (Nature)" value={scores.taoism.nature} max={10} 
            description="实事求是，去伪存真" rules={taoismRules.nature} 
            onChange={(v) => updateTaoism('nature', v)} 
          />
          <SliderGroup 
            label="守静 (Quietude)" value={scores.taoism.quietude} max={10} 
            description="沉淀思考，宁静致远" rules={taoismRules.quietude} 
            onChange={(v) => updateTaoism('quietude', v)} 
          />
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;
