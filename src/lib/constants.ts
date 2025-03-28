
import { PublicKey } from '@solana/web3.js';

// Эндпоинты Solana
export const DEVNET_RPC = "https://api.devnet.solana.com";
export const MAINNET_RPC = "https://api.mainnet-beta.solana.com";
export const MAINNET_WS = "wss://api.mainnet-beta.solana.com";
export const HELIUS_DEVNET_RPC = "https://devnet.helius-rpc.com/?api-key=a1489d2c-f42d-4f12-96d7-ccfd3e13802a";

// Примеры дефолтных значений
export const DEFAULT_WALLET = "8S6P5yVd5gNBu635XT67PKLxU75NJuG69fsJC3Jj36LN";
export const DEFAULT_KEY = "139,219,161,216,20,10,91,48,109,78,176,175,7,168,232,117,179,42,162,237,97,32,98,56,151,128,94,133,165,66,121,200,19,104,128,102,70,201,86,127,234,157,13,72,129,76,115,124,133,81,221,174,183,155,51,41,238,120,106,193,116,101,254,89";

// Системный ID для транзакций SOL
export const SYSTEM_ID = new PublicKey("11111111111111111111111111111111");
