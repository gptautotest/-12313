
import { PublicKey, clusterApiUrl } from '@solana/web3.js';

// Системный ID для транзакций SOL
export const SYSTEM_ID = new PublicKey("11111111111111111111111111111111");

// RPC эндпоинты
export const DEVNET_RPC = clusterApiUrl('devnet');
export const MAINNET_RPC = clusterApiUrl('mainnet-beta');

// Курсы конвертации
export const SOL_USD_RATE = 180; // Примерный курс SOL к USD
export const USD_RUB_RATE = 92; // Примерный курс USD к RUB
