
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import { useBotStore } from '../stores/botStore';
import { DEVNET_RPC, MAINNET_RPC } from '@/lib/constants';

// Получение соединения с сетью Solana
export const getConnection = (): Connection => {
  const network = useBotStore.getState().network;
  const endpoint = network === 'devnet' ? DEVNET_RPC : MAINNET_RPC;
  return new Connection(endpoint);
};

// Создание keypair из приватного ключа
export const getKeypairFromPrivateKey = (privateKey: string | null): Keypair | null => {
  if (!privateKey) return null;
  
  try {
    // Декодирование приватного ключа из base58
    const decodedKey = bs58.decode(privateKey);
    return Keypair.fromSecretKey(decodedKey);
  } catch (error) {
    console.error('Ошибка при создании keypair:', error);
    return null;
  }
};

// Получение публичного ключа из приватного
export const getPublicKeyFromPrivate = (privateKey: string | null): PublicKey | null => {
  const keypair = getKeypairFromPrivateKey(privateKey);
  return keypair ? keypair.publicKey : null;
};

// Форматирование публичного ключа для отображения
export const formatPublicKey = (publicKey: PublicKey | null | string): string => {
  if (!publicKey) return 'Не установлен';
  
  const pkString = typeof publicKey === 'string' ? publicKey : publicKey.toString();
  
  // Сокращаем ключ для отображения (первые 4 и последние 4 символа)
  if (pkString.length > 10) {
    return `${pkString.substring(0, 4)}...${pkString.substring(pkString.length - 4)}`;
  }
  
  return pkString;
};

// Проверка валидности приватного ключа
export const isValidPrivateKey = (key: string): boolean => {
  try {
    const decodedKey = bs58.decode(key);
    return decodedKey.length === 64; // Приватный ключ Solana должен быть 64 байта
  } catch (error) {
    return false;
  }
};
