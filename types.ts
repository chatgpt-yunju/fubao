
export interface BuddhismScore {
  dana: number; // 布施 (0-5)
  sila: number; // 持戒 (0-5)
  ksanti: number; // 忍辱 (0-5)
  virya: number; // 精进 (0-5)
  dhyana: number; // 禅定 (0-5)
  prajna: number; // 智慧 (0-5)
}

export interface ConfucianismScore {
  cultivateSelf: number; // 修身 (0-10)
  regulateFamily: number; // 齐家 (0-10)
  governState: number; // 治国 (0-10)
  peaceWorld: number; // 平天下 (0-10)
}

export interface TaoismScore {
  taoLaw: number; // 道法 (0-10)
  nature: number; // 自然 (0-10)
  quietude: number; // 守静 (0-10)
}

export interface BaseScores {
  buddhism: BuddhismScore;
  confucianism: ConfucianismScore;
  taoism: TaoismScore;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'merit' | 'demerit' | 'correction'; // 益福 | 损福 | 补过
  description: string;
  points: number;
  category: 'buddhism' | 'confucianism' | 'taoism' | 'general' | 'woodenfish';
}

export interface AppState {
  baseScores: BaseScores;
  logs: LogEntry[];
  woodenFishCount?: number;
}

export enum Ranking {
  PERFECT = '上上品·福报圆满', // 90-100
  ABUNDANT = '上品·福报丰厚',  // 75-89
  STABLE = '中品·福报平稳',    // 60-74
  WEAK = '下品·福报薄弱',      // 30-59
  DEFICIT = '下下品·福报亏空'   // 0-29
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  sources?: {
    title: string;
    uri: string;
  }[];
}
