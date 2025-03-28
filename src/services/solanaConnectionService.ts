
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { Buffer } from 'buffer';

/**
 * Инициализирует подключение к сети Solana.
 * @param network - Сеть для подключения ('mainnet', 'devnet')
 * @returns Объект Connection
 */
export const initializeSolanaConnection = (network: string): Connection => {
  const endpoint = network === 'mainnet' 
    ? clusterApiUrl('mainnet-beta') 
    : clusterApiUrl('devnet');
  
  console.log(`🚀 Подключаемся к сети Solana (${network}): ${endpoint}`);

  try {
    return new Connection(endpoint, 'confirmed');
  } catch (error) {
    console.error('Ошибка при создании подключения к Solana:', error);
    throw new Error(`Не удалось создать подключение к Solana: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
};

/**
 * Создает Keypair из приватного ключа.
 * @param privateKeyStr - Приватный ключ в формате Base58 или массива байтов
 * @returns Keypair или null, если произошла ошибка
 */
export const getKeypairFromPrivateKey = async (privateKeyStr: string): Promise<Keypair | null> => {
  try {
    let privateKeyBytes;

    // Проверяем, не является ли строка уже массивом байтов в виде строки
    if (privateKeyStr.startsWith('[') && privateKeyStr.endsWith(']')) {
      try {
        // Пытаемся распарсить JSON массив
        privateKeyBytes = JSON.parse(privateKeyStr);
        console.log("✅ Успешно распарсили приватный ключ как массив байтов");
      } catch (parseError) {
        console.error("❌ Ошибка при парсинге массива байтов:", parseError);
        return null;
      }
    } else {
      // Иначе, считаем что это base58 строка
      try {
        privateKeyBytes = bs58.decode(privateKeyStr);
        console.log("✅ Успешно декодировали приватный ключ из формата Base58");
      } catch (decodeError) {
        console.error("❌ Ошибка при декодировании Base58:", decodeError);
        return null;
      }
    }

    // Если получили приватный ключ не правильной длины
    if (!Array.isArray(privateKeyBytes) && !(privateKeyBytes instanceof Uint8Array)) {
      console.error("❌ Приватный ключ должен быть массивом байтов или Uint8Array");
      return null;
    }

    // Создаем keypair из байтов
    const keypair = Keypair.fromSecretKey(
      Buffer.from(privateKeyBytes)
    );

    console.log(`✅ Успешно создан Keypair с публичным ключом: ${keypair.publicKey.toString()}`);
    return keypair;
  } catch (error) {
    console.error("❌ Ошибка при создании Keypair:", error);
    return null;
  }
};

/**
 * Получает баланс аккаунта Solana.
 * @param connection - Подключение к сети Solana
 * @param publicKey - Публичный ключ аккаунта
 * @returns Баланс в SOL
 */
export const getSolanaBalance = async (connection: Connection, publicKey: PublicKey): Promise<number> => {
  try {
    console.log(`🔍 Получаем баланс для адреса: ${publicKey.toString()}`);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    console.log(`💰 Баланс: ${solBalance} SOL`);
    return solBalance;
  } catch (error) {
    console.error('❌ Ошибка при получении баланса Solana:', error);
    throw new Error(`Не удалось получить баланс: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
};
