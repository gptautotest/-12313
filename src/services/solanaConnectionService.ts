import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { DEVNET_RPC, MAINNET_RPC } from '../lib/constants';
import { useBotStore } from '../stores/botStore';
import bs58 from 'bs58';

// Получение соединения с нужной сетью Solana
export const getConnection = (network: 'devnet' | 'mainnet' = 'devnet'): Connection => {
  const endpoint = network === 'devnet' ? DEVNET_RPC : MAINNET_RPC;
  console.log(`Connecting to ${network} at ${endpoint}`);
  return new Connection(endpoint);
};

// Получение Keypair из приватного ключа
export const getKeypairFromPrivateKey = (privateKeyString: string | null): Keypair | null => {
  if (!privateKeyString) {
    console.log("Приватный ключ не установлен");
    return null;
  }

  try {
    // Если ключ в формате base58
    if (privateKeyString.match(/^[1-9A-HJ-NP-Za-km-z]{88,98}$/)) {
      const decoded = bs58.decode(privateKeyString);
      return Keypair.fromSecretKey(decoded);
    }

    // Если ключ в формате массива чисел через запятую
    const privateKeyArray = privateKeyString
      .split(',')
      .map(num => parseInt(num.trim(), 10));

    const secretKey = new Uint8Array(privateKeyArray);
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Ошибка при создании Keypair:', error);
    return null;
  }
};