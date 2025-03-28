import { create } from 'zustand';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface BotState {
  balance: number;
  network: 'devnet' | 'mainnet';
  privateKey: string | null;
  publicKey: string | null;
  isRunning: boolean;
  targetAddress: string | null;
  maxGasPrice: number;
  snipeAmount: number;
  swapTime: number;
  logs: string[];
  setPrivateKey: (key: string) => void;
  setMaxGas: (amount: number) => void;
  setSnipeAmount: (amount: number) => void;
  setSwapTime: (time: number) => void;
}

// Дефолтный ключ для разработки (только для devnet!)
const DEFAULT_DEV_KEY = "4NMwxzmYbBq8e11Vx6M1Dq14RN1JnhSQb9nDnKwwy1Gy2F8oLmrJzYAjNcKzfnmier9gMrFNVAiCXNRQvzNZtSFY";

export const useBotStore = create<BotState>((set) => ({
  balance: 0,
  network: 'devnet',
  privateKey: DEFAULT_DEV_KEY, // Используем дефолтный ключ для быстрого старта
  publicKey: null,
  isRunning: false,
  targetAddress: null,
  maxGasPrice: 0.000005 * LAMPORTS_PER_SOL,
  snipeAmount: 0.01,
  swapTime: 5,
  logs: [],
  setPrivateKey: (key) => set({ privateKey: key }),
  setMaxGas: (amount) => set({ maxGasPrice: amount }),
  setSnipeAmount: (amount) => set({ snipeAmount: amount }),
  setSwapTime: (time) => set({ swapTime: time })
}));