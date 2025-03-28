
import { Connection, Keypair } from '@solana/web3.js';
import { DEVNET_RPC, MAINNET_RPC } from '@/lib/constants';

/**
 * Получение соединения с блокчейном Solana
 * @param network - сеть для подключения ('devnet' или 'mainnet')
 * @returns Connection - объект соединения
 */
export const getConnection = (network: string = 'devnet'): Connection => {
  const endpoint = network === 'mainnet' ? MAINNET_RPC : DEVNET_RPC;
  return new Connection(endpoint, 'confirmed');
};

/**
 * Получение пары ключей из приватного ключа
 * @param privateKeyString - приватный ключ в виде строки (массив чисел через запятую)
 * @returns Keypair | null - объект пары ключей или null в случае ошибки
 */
export const getKeypairFromPrivateKey = (privateKeyString?: string): Keypair | null => {
  if (!privateKeyString) return null;
  
  try {
    // Преобразование строки с числами через запятую в массив чисел
    const privateKeyArray = privateKeyString
      .split(',')
      .map(num => parseInt(num.trim(), 10));
    
    // Создание массива байтов из чисел
    const privateKeyUint8Array = new Uint8Array(privateKeyArray);
    
    // Создание пары ключей из массива байтов
    return Keypair.fromSecretKey(privateKeyUint8Array);
  } catch (error) {
    console.error('Ошибка при создании пары ключей:', error);
    return null;
  }
};
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { useBotStore } from '../stores/botStore';
import bs58 from 'bs58';

// Получение соединения Solana в зависимости от выбранной сети
export const getConnection = (): Connection => {
  const network = useBotStore.getState().network;
  const endpoint = network === 'devnet' ? clusterApiUrl('devnet') : clusterApiUrl('mainnet-beta');
  return new Connection(endpoint, 'confirmed');
};

// Получение объекта Keypair из приватного ключа
export const getKeypairFromPrivateKey = (privateKey: string | null): Keypair | null => {
  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    return null;
  }
  
  try {
    const decodedKey = bs58.decode(privateKey);
    return Keypair.fromSecretKey(decodedKey);
  } catch (error) {
    console.error("Ошибка при создании Keypair:", error);
    return null;
  }
};
