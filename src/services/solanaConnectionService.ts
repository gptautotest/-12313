import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import { DEVNET_RPC, MAINNET_RPC } from '../lib/constants';

// Получение соединения с блокчейном Solana
export const getConnection = (network = 'devnet') => {
  const rpcUrl = network === 'devnet' ? DEVNET_RPC : MAINNET_RPC;
  return new Connection(rpcUrl);
};

// Преобразование приватного ключа в объект Keypair
export const getKeypairFromPrivateKey = (privateKeyString: string): Keypair | null => {
  if (!privateKeyString) {
    console.log("Приватный ключ не установлен");
    return null;
  }

  try {
    const secretKey = bs58.decode(privateKeyString.trim());
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Ошибка при создании ключевой пары:', error);
    return null;
  }
};