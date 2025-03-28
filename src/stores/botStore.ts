
import { create } from 'zustand';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface BotState {
  balance: number;
  network: 'devnet' | 'mainnet-beta';
  privateKey: string | null;
  publicKey: string | null;
  isRunning: boolean;
  snipeAmount: number;
  maxGas: number;
  slippage: number; 
  swapTime: number;
  logs: string[];
  
  // Методы мутации состояния
  setPrivateKey: (key: string) => void;
  setSnipeAmount: (amount: number) => void;
  setMaxGas: (gas: number) => void; 
  setSlippage: (slippage: number) => void;
  setSwapTime: (time: number) => void;
  addLog: (log: string) => void;
}

export const useBotStore = create<BotState>((set) => ({
  // Состояние
  balance: 0,
  network: 'devnet',
  privateKey: null,
  publicKey: null,
  isRunning: false,
  snipeAmount: 0.01,
  maxGas: 0.000005 * LAMPORTS_PER_SOL,
  slippage: 2.5, // 2.5%
  swapTime: 5,
  logs: [],
  
  // Методы
  setPrivateKey: (key) => set({ privateKey: key }),
  setSnipeAmount: (amount) => set({ snipeAmount: amount }),
  setMaxGas: (gas) => set({ maxGas: gas }),
  setSlippage: (slippage) => set({ slippage: slippage }),
  setSwapTime: (time) => set({ swapTime: time }),
  addLog: (log) => set((state) => ({ 
    logs: [...state.logs.slice(-99), log]  // Сохраняем только последние 100 записей
  })),
}));
