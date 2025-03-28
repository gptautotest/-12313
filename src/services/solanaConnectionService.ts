
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

// Создание подключения к выбранной сети Solana
export const getConnection = (network: 'devnet' | 'mainnet') => {
  const endpoint = network === 'devnet' 
    ? 'https://api.devnet.solana.com' 
    : 'https://api.mainnet-beta.solana.com';
  
  console.log(`Connecting to Solana ${network} network at ${endpoint}`);
  return new Connection(endpoint, 'confirmed');
};

// Получение keypair из приватного ключа
export const getKeypairFromPrivateKey = (privateKey: string): Keypair | null => {
  try {
    console.log("Получение keypair из приватного ключа");
    
    // Проверяем, является ли приватный ключ массивом чисел
    if (privateKey.startsWith('[') && privateKey.endsWith(']')) {
      try {
        const numbersArray = JSON.parse(privateKey);
        if (Array.isArray(numbersArray) && numbersArray.every(n => typeof n === 'number')) {
          const uint8Array = new Uint8Array(numbersArray);
          return Keypair.fromSecretKey(uint8Array);
        }
      } catch (error) {
        console.error("Ошибка при парсинге массива:", error);
      }
    }
    
    // Если это не массив или парсинг не удался, пробуем как base58
    try {
      const decodedKey = bs58.decode(privateKey);
      return Keypair.fromSecretKey(decodedKey);
    } catch (error) {
      console.error("Ошибка при декодировании base58:", error);
    }
    
    return null;
  } catch (error) {
    console.error("Ошибка при создании Keypair:", error);
    return null;
  }
};

// Получение PublicKey из приватного ключа
export const getPublicKeyFromPrivate = (privateKey: string): PublicKey | null => {
  const keypair = getKeypairFromPrivateKey(privateKey);
  if (!keypair) {
    console.error("Не удалось получить keypair");
    return null;
  }
  return keypair.publicKey;
};
