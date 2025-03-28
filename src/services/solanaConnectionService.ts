import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { DEVNET_RPC, MAINNET_RPC } from '@/lib/constants';

/**
 * Получение активного соединения с блокчейном Solana
 * @param network Сеть Solana (devnet или mainnet)
 * @returns Объект соединения
 */
export const getConnection = (network: 'devnet' | 'mainnet' = 'devnet'): Connection => {
  const endpoint = network === 'devnet' ? DEVNET_RPC : MAINNET_RPC;
  console.log(`Connecting to Solana ${network} network at ${endpoint}`);
  return new Connection(endpoint, 'confirmed');
};

/**
 * Преобразование приватного ключа в объект Keypair
 * @param privateKey Приватный ключ в base58 формате или массив байтов
 * @returns Объект Keypair или null при ошибке
 */
export const getKeypairFromPrivateKey = (privateKey: string | null): Keypair | null => {
  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    return null;
  }

  try {
    if (privateKey.startsWith('[') && privateKey.endsWith(']')) {
      const bytesArray = JSON.parse(privateKey);
      if (!Array.isArray(bytesArray) || bytesArray.length !== 64) {
        throw new Error("Неверный формат массива байтов приватного ключа");
      }
      return Keypair.fromSecretKey(new Uint8Array(bytesArray));
    } else {
      const decodedKey = bs58.decode(privateKey);
      return Keypair.fromSecretKey(decodedKey);
    }
  } catch (error) {
    console.error("Ошибка при создании Keypair:", error);
    return null;
  }
};

/**
 * Получение PublicKey из строкового представления адреса
 * @param address Адрес кошелька в виде строки
 * @returns Объект PublicKey или null при ошибке
 */
export const getPublicKeyFromAddress = (address: string | null): PublicKey | null => {
  if (!address) return null;

  try {
    return new PublicKey(address);
  } catch (error) {
    console.error("Ошибка при создании PublicKey:", error);
    return null;
  }
};

/**
 * Получение публичного ключа из приватного
 */
export const getPublicKeyFromPrivate = (privateKey: string | null): PublicKey | null => {
  const keypair = getKeypairFromPrivateKey(privateKey);
  return keypair ? keypair.publicKey : null;
};

/**
 * Форматирование публичного ключа для отображения
 */
export const formatPublicKey = (publicKey: PublicKey | null | string): string => {
  if (!publicKey) return 'Не установлен';

  const pkString = typeof publicKey === 'string' ? publicKey : publicKey.toString();

  // Сокращаем ключ для отображения (первые 4 и последние 4 символа)
  if (pkString.length > 10) {
    return `${pkString.substring(0, 4)}...${pkString.substring(pkString.length - 4)}`;
  }

  return pkString;
};

/**
 * Проверка валидности приватного ключа
 * @param key Приватный ключ
 * @returns true если ключ валидный
 */
export const isValidPrivateKey = (key: string): boolean => {
  // Проверка на формат массива байтов
  if (key.startsWith('[') && key.endsWith(']')) {
    try {
      const bytesArray = JSON.parse(key);
      return Array.isArray(bytesArray) && bytesArray.length === 64;
    } catch (error) {
      console.error("Ошибка при парсинге массива байтов:", error);
      return false;
    }
  } 

  // Проверка на формат Base58
  try {
    // Проверяем, можно ли декодировать ключ из base58
    const decoded = bs58.decode(key);
    // Валидный ключ должен быть длиной 64 байта (512 бит)
    return decoded.length === 64;
  } catch (error) {
    return false;
  }
};