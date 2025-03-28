
import { create } from 'zustand';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface BotState {
  balance: number;
  network: 'devnet' | 'mainnet';
  privateKey: string | null;
  isRunning: boolean;
  targetAddress: string | null;
  maxGasPrice: number;
  swapAmountSol: number;
  swapTimeSec: number;
}

export const useBotStore = create<BotState>((set) => ({
  balance: 0,
  network: 'devnet',
  privateKey: null,
  isRunning: false,
  targetAddress: null,
  maxGasPrice: 0.000005 * LAMPORTS_PER_SOL,
  swapAmountSol: 0.01,
  swapTimeSec: 5
}));
