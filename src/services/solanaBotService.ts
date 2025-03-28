
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { getConnection, getKeypairFromPrivateKey, getPublicKeyFromPrivate } from './solanaConnectionService';
import { SOL_USD_RATE, USD_RUB_RATE } from '@/lib/constants';
import bs58 from 'bs58';

/**
 * Обновление баланса кошелька
 * @param privateKey Приватный ключ кошелька
 * @returns Баланс в SOL или null при ошибке
 */
export const updateBalance = async (privateKey: string | null): Promise<number | null> => {
  console.log("Обновление баланса...");
  console.log("Updating balance with private key:", privateKey ? "Present" : "Not provided");
  
  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    return null;
  }

  try {
    const connection = getConnection('devnet');
    const publicKey = getPublicKeyFromPrivate(privateKey);
    
    if (!publicKey) {
      console.error("Не удалось получить публичный ключ");
      return null;
    }

    console.log("Wallet public key:", publicKey.toString());
    
    const balance = await connection.getBalance(publicKey);
    console.log("Raw balance:", balance);
    
    // Конвертируем баланс из ламппортов в SOL (1 SOL = 1,000,000,000 lamports)
    return balance / 1000000000;
  } catch (error) {
    console.error("Ошибка при получении баланса:", error);
    return null;
  }
};

/**
 * Конвертация SOL в USD
 * @param solAmount Количество SOL
 * @returns Стоимость в USD
 */
export const convertSolToUsd = (solAmount: number): number => {
  return solAmount * SOL_USD_RATE;
};

/**
 * Конвертация SOL в RUB
 * @param solAmount Количество SOL
 * @returns Стоимость в RUB
 */
export const convertSolToRub = (solAmount: number): number => {
  return convertSolToUsd(solAmount) * USD_RUB_RATE;
};

/**
 * Форматирование суммы с символом валюты
 * @param amount Сумма
 * @param currency Валюта (SOL, USD, RUB)
 * @returns Отформатированная строка
 */
export const formatCurrency = (amount: number | null, currency: 'SOL' | 'USD' | 'RUB'): string => {
  if (amount === null) return '—';
  
  const formatter = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: currency === 'SOL' ? 5 : 2,
    maximumFractionDigits: currency === 'SOL' ? 9 : 2,
  });
  
  const formatted = formatter.format(amount);
  
  switch (currency) {
    case 'SOL':
      return `${formatted} SOL`;
    case 'USD':
      return `$${formatted}`;
    case 'RUB':
      return `₽${formatted}`;
  }
};

// Вебсокет для мониторинга транзакций в реальном времени
let webSocket: WebSocket | null = null;

/**
 * Запуск бота для копирования транзакций
 */
export const startCopyBot = async () => {
  // Имплементация системы мониторинга и копирования транзакций
  console.log("Бот запущен");
  return true;
};

/**
 * Остановка бота для копирования транзакций
 */
export const stopCopyBot = () => {
  if (webSocket) {
    webSocket.close();
    webSocket = null;
  }
  console.log("Бот остановлен");
  return true;
};

/**
 * Инициализация WebSocket соединения
 */
export const initializeWebSocket = (targetAddress: string, callback: (txSignature: string) => void) => {
  if (webSocket) {
    webSocket.close();
  }
  
  try {
    const connection = getConnection('devnet');
    const subscriptionId = connection.onAccountChange(
      new PublicKey(targetAddress),
      (accountInfo) => {
        console.log("Обнаружено изменение аккаунта:", accountInfo);
        // В реальном приложении здесь был бы код для обработки изменений
      }
    );
    
    console.log("WebSocket connected");
    return subscriptionId;
  } catch (error) {
    console.error("WebSocket connection error:", error);
    return null;
  }
};

/**
 * Отправка SOL
 */
export const sendSol = async (
  privateKey: string,
  toAddress: string,
  amount: number
): Promise<string | null> => {
  try {
    const connection = getConnection('devnet');
    const keypair = getKeypairFromPrivateKey(privateKey);
    
    if (!keypair) {
      console.error("Не удалось создать keypair");
      return null;
    }
    
    const toPublicKey = new PublicKey(toAddress);
    
    // Количество в ламппортах
    const lamports = amount * 1000000000;
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: toPublicKey,
        lamports,
      })
    );
    
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [keypair]
    );
    
    console.log("Транзакция успешно отправлена:", signature);
    return signature;
  } catch (error) {
    console.error("Ошибка при отправке транзакции:", error);
    return null;
  }
};
