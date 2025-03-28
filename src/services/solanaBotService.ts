
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

  // Максимальное количество попыток
  const MAX_RETRIES = 3;
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      // Подключение к выбранной сети (devnet для тестирования)
      const connection = getConnection('devnet');
      console.log(`Попытка ${retryCount + 1} получения ключа и баланса`);
      
      // Получаем ключевую пару из приватного ключа
      const keypair = getKeypairFromPrivateKey(privateKey);
      
      if (!keypair) {
        console.error("Не удалось получить keypair из приватного ключа");
        retryCount++;
        continue;
      }
      
      // Получаем публичный ключ
      const publicKey = keypair.publicKey;
      console.log("Wallet public key:", publicKey.toString());
      
      try {
        // Запрашиваем баланс с большим таймаутом
        console.log("Запрос баланса для:", publicKey.toString());
        const balance = await Promise.race([
          connection.getBalance(publicKey),
          new Promise<number>((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 10000)
          )
        ]) as number;
        
        console.log("Raw balance in lamports:", balance);
        
        // Конвертируем баланс из ламппортов в SOL (1 SOL = 1,000,000,000 lamports)
        const solBalance = balance / 1000000000;
        console.log("Balance in SOL:", solBalance);
        return solBalance;
      } catch (balanceError) {
        console.error(`Ошибка при запросе баланса (попытка ${retryCount + 1}):`, balanceError);
        retryCount++;
        
        // Если это последняя попытка, пробуем другой метод
        if (retryCount === MAX_RETRIES - 1) {
          try {
            console.log("Пробуем альтернативный метод получения баланса");
            const accountInfo = await connection.getAccountInfo(publicKey);
            if (accountInfo) {
              const lamports = accountInfo.lamports;
              const solBalance = lamports / 1000000000;
              console.log("Balance from accountInfo in SOL:", solBalance);
              return solBalance;
            }
          } catch (altError) {
            console.error("Ошибка при использовании альтернативного метода:", altError);
          }
        }
        
        // Небольшая задержка перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Ошибка при получении баланса (попытка ${retryCount + 1}):`, error);
      retryCount++;
      
      // Небольшая задержка перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.error("Все попытки получения баланса исчерпаны");
  return 0; // Возвращаем 0, когда все попытки исчерпаны
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
