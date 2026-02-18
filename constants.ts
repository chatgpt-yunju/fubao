import { BaseScores } from './types';

export const INITIAL_SCORES: BaseScores = {
  buddhism: {
    dana: 3, sila: 3, ksanti: 3, virya: 3, dhyana: 3, prajna: 3
  },
  confucianism: {
    cultivateSelf: 5, regulateFamily: 5, governState: 5, peaceWorld: 5
  },
  taoism: {
    taoLaw: 5, nature: 5, quietude: 5
  }
};

export const MAX_POINTS = {
  buddhism: 30,
  confucianism: 40,
  taoism: 30
};

export const RANKING_DESCRIPTIONS = {
  '上上品·福报圆满': "德厚智明，三教兼修，行止合道，人生正向循环，感召顺遂。修持要旨：守初心，行利众，持满不溢，慎终如始。",
  '上品·福报丰厚': "福基牢固，德行无亏，培福远多于损福，言出有信，行止有矩，顺境居多，感召稳定。修持要旨：补齐短板，谨护小过，精进不辍。",
  '中品·福报平稳': "福报及格，根基尚在，然修持有短板，培损持平，顺逆参半，感召时灵时不灵。修持要旨：先堵漏洞，固守根本，再求增益。",
  '下品·福报薄弱': "福基不足，漏洞颇多，损福远多于培福，心性不定，逆境居多，感召难应。修持要旨：立停大过，先止亏损，日积小善。",
  '下下品·福报亏空': "福报严重亏空，过恶积深，根基耗损，人生困顿循环，感召失效。修持要旨：诚心补过，革除恶习，重建福基。"
};
