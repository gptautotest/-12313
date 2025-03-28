import { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useBotStore } from '../stores/botStore';
import bs58 from 'bs58';

// Константы RPC для разных сетей
const DEVNET_RPC = clusterApiUrl('devnet');
const MAINNET_RPC = clusterApiUrl('mainnet-beta');

/**
 * Получение соединения с сетью Solana
 * @param network - сеть для подключения ('devnet' или 'mainnet')
 * @returns Connection - объект соединения
 */
export const getConnection = (): Connection => {
  const network = useBotStore.getState().network;
  const endpoint = network === 'mainnet' ? MAINNET_RPC : DEVNET_RPC;
  return new Connection(endpoint, 'confirmed');
};

/**
 * Получение пары ключей из приватного ключа
 * @param privateKey - приватный ключ в виде строки (различные форматы)
 * @returns Keypair | null - объект пары ключей или null в случае ошибки
 */
export const getKeypairFromPrivateKey = (privateKey: string | null): Keypair | null => {
  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    return null;
  }

  try {
    // Проверяем, является ли privateKey строкой чисел через запятую
    if (privateKey.includes(',')) {
      // Преобразование строки с числами через запятую в массив чисел
      const privateKeyArray = privateKey
        .split(',')
        .map(num => parseInt(num.trim(), 10));

      // Создание массива байтов из чисел
      const privateKeyUint8Array = new Uint8Array(privateKeyArray);

      // Создание пары ключей из массива байтов
      return Keypair.fromSecretKey(privateKeyUint8Array);
    } else {
      // Если ключ в формате base58
      const decodedKey = bs58.decode(privateKey);
      return Keypair.fromSecretKey(decodedKey);
    }
  } catch (error) {
    console.error('Ошибка при создании пары ключей:', error);
    return null;
  }
};