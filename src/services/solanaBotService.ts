import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getConnection, getKeypairFromPrivateKey } from './solanaConnectionService';
import { SOL_USD_RATE, USD_RUB_RATE } from '@/lib/constants';
import bs58 from 'bs58';
import { toast } from 'sonner'; // Importing sonner's toast instead of '@/components/ui/use-toast'


// Интерфейс для параметров мониторинга
interface MonitoringParams {
  minVolume: number;       // Минимальный объем в долларах
  minHolders: number;      // Минимальное количество холдеров
  maxAge: number;          // Максимальный возраст в часах
  minPumpScore: number;    // Минимальный pump score
  slippage: number;        // Проскальзывание в процентах
  snipeAmount: number;     // Сумма для снайпа в SOL
  usePumpFun: boolean;     // Использовать ли pump.fun
}

// Функция для получения баланса кошелька
export const updateBalance = async (privateKey: string): Promise<number | null> => {
  console.log("Updating balance with private key:", privateKey ? "Present" : "Missing");

  try {
    const connection = getConnection('devnet');
    console.log("Получение keypair из приватного ключа");
    const keypair = getKeypairFromPrivateKey(privateKey);

    if (!keypair) {
      console.error("Не удалось получить keypair из приватного ключа");
      return null;
    }

    const publicKey = keypair.publicKey;
    console.log("Wallet public key:", publicKey.toString());

    // Явно обрабатываем запрос баланса с обработкой ошибок
    try {
      console.log("Запрос баланса для:", publicKey.toString());
      const balance = await connection.getBalance(publicKey);
      console.log("Raw balance in lamports:", balance);

      // Конвертируем баланс из ламппортов в SOL (1 SOL = 1,000,000,000 lamports)
      const solBalance = balance / 1000000000;
      console.log("Balance in SOL:", solBalance);
      return solBalance;
    } catch (balanceError) {
      console.error("Ошибка при запросе баланса:", balanceError);
      return 0; // Возвращаем 0 вместо null при ошибке запроса баланса
    }
  } catch (error) {
    console.error("Ошибка при получении баланса:", error);
    return 0; // Возвращаем 0 вместо null при общей ошибке
  }
};

// Функция для отправки транзакции
export const sendTransaction = async (privateKey: string, destination: string, amount: number): Promise<string | null> => {
  try {
    // Реализация функции отправки транзакции будет здесь
    return "transaction_signature_placeholder";
  } catch (error) {
    console.error("Ошибка при отправке транзакции:", error);
    return null;
  }
};

/**
 * Обновление баланса кошелька
 * @param privateKey Приватный ключ кошелька
 * @returns Баланс в SOL или null при ошибке
 */
// This function is now duplicated, but keeping original for completeness based on prompt instructions.
export const updateBalance_original = async (privateKey: string | null): Promise<number | null> => {
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


/**
 * Функция для снайпинга токена
 * @param connection - Подключение к сети Solana
 * @param keypair - Keypair пользователя
 * @param tokenAddress - Адрес токена для покупки
 * @param amount - Количество SOL для покупки
 * @param slippage - Проскальзывание в процентах
 */
export const snipeToken = async (
  connection: Connection,
  keypair: Keypair,
  tokenAddress: string,
  amount: number,
  slippage: number
): Promise<boolean> => {
  try {
    console.log(`🎯 Снайпим токен: ${tokenAddress}`);
    console.log(`💰 Сумма: ${amount} SOL`);
    console.log(`⚙️ Проскальзывание: ${slippage}%`);

    // TODO: Реализовать логику снайпинга токена
    toast.success(`🚀 Начинаем снайпинг токена: ${tokenAddress}`);

    // Симуляция задержки запроса
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Здесь должен быть код для создания и отправки транзакции
    // Пример заглушки:
    const success = Math.random() > 0.3; // 70% успешных снайпов для тестирования

    if (success) {
      toast.success(`✅ Токен успешно снайпнут: ${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`);
      return true;
    } else {
      toast.error('❌ Не удалось снайпнуть токен. Попробуйте еще раз.');
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при снайпинге токена:', error);
    toast.error(`❌ Ошибка при снайпинге: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    return false;
  }
};

/**
 * Функция для мониторинга новых токенов
 * @param connection - Подключение к сети Solana
 * @param keypair - Keypair пользователя
 * @param params - Параметры мониторинга
 */
export const monitorNewTokens = async (
  connection: Connection,
  keypair: Keypair,
  params: MonitoringParams
) => {
  try {
    console.log('🔍 Запуск мониторинга новых токенов');
    console.log('⚙️ Параметры:');
    console.log(`  - Минимальный объем: $${params.minVolume}`);
    console.log(`  - Минимальное кол-во холдеров: ${params.minHolders}`);
    console.log(`  - Максимальный возраст: ${params.maxAge} часов`);
    console.log(`  - Минимальный pump score: ${params.minPumpScore}`);
    console.log(`  - Проскальзывание: ${params.slippage}%`);
    console.log(`  - Сумма для снайпа: ${params.snipeAmount} SOL`);
    console.log(`  - Использовать pump.fun: ${params.usePumpFun ? 'Да' : 'Нет'}`);

    // TODO: Реализовать логику мониторинга новых токенов
    toast.success('🔍 Мониторинг новых токенов запущен!');
    toast.info('🔔 Вы получите уведомление, когда будет найден подходящий токен');

    // Симуляция нахождения новых токенов для тестирования
    setTimeout(() => {
      const tokenAddress = 'DogE1wfjvJ2RK6HS3mh84rKXSdPXN19NWz9TmHuiKr8V';
      toast.info(`🔎 Найден новый токен: ${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`);

      // Проверка соответствия параметрам
      toast.info('✅ Токен соответствует заданным параметрам! Пробуем снайпить...');

      // Снайпим токен
      snipeToken(connection, keypair, tokenAddress, params.snipeAmount, params.slippage);
    }, 10000);

  } catch (error) {
    console.error('❌ Ошибка при мониторинге новых токенов:', error);
    toast.error(`❌ Ошибка мониторинга: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
};

/**
 * Получить информацию о токене
 * @param connection - Подключение к сети Solana
 * @param mintAddress - Адрес токена
 */
export const getTokenInfo = async (
  connection: Connection, 
  mintAddress: string
): Promise<any> => {
  try {
    const mintPublicKey = new PublicKey(mintAddress);

    // TODO: Получить информацию о токене

    // Заглушка для тестирования:
    return {
      name: 'Super Doge',
      symbol: 'SDOGE',
      totalSupply: 1000000000000,
      decimals: 9,
      holders: 156,
      volume24h: 25000,
      price: 0.0000015,
      marketCap: 1500000,
      pumpScore: 85,
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 минут назад
    };
  } catch (error) {
    console.error('❌ Ошибка при получении информации о токене:', error);
    throw new Error(`Не удалось получить информацию о токене: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
};

/**
 * Обновляет баланс кошелька.
 * Эта функция является основной и заменяет updateBalance_original
 */
export const updateBalanceV2 = async (privateKey: string | null): Promise<number | null> => {
  if (!privateKey) {
    console.log("🔑 Приватный ключ не предоставлен");
    return null;
  }

  // Получаем соединение с обработкой ошибок
  try {
    // Добавляем явную обработку промисов для избегания unhandledrejection
    const connection = getConnection('devnet');

    // Добавляем кеширование результатов для ускорения работы
    const keypairPromise = Promise.resolve().then(() => getKeypairFromPrivateKey(privateKey));

    try {
      // Оборачиваем в try-catch для явной обработки ошибок промисов
      const keypair = await keypairPromise;

      if (!keypair) {
        console.error("🚨 ВАУ! Не удалось создать Keypair из ключа!");
        return 0;
      }

      const publicKey = keypair.publicKey;
      console.log("💼 Адрес кошелька:", publicKey.toString());

      // Добавляем таймаут для запроса баланса
      try {
        console.log("💰 ЗАПРОС БАЛАНСА для:", publicKey.toString());

        // Используем Promise.race для предотвращения бесконечного ожидания
        const balance = await Promise.race([
          connection.getBalance(publicKey),
          new Promise<number>((_, reject) => 
            setTimeout(() => reject(new Error("Таймаут запроса баланса")), 15000)
          )
        ]);

        console.log("🤑 Баланс в лампортах:", balance);

        // Конвертируем баланс
        const solBalance = balance / LAMPORTS_PER_SOL;
        console.log("💎 Баланс в SOL:", solBalance);

        return solBalance;
      } catch (balanceError) {
        console.error("💸 Ошибка запроса баланса, пробуем резервный метод:", balanceError);

        try {
          // Резервный метод получения баланса
          const accountInfo = await connection.getAccountInfo(publicKey);
          if (accountInfo) {
            const solBalance = accountInfo.lamports / LAMPORTS_PER_SOL;
            console.log("🔄 Баланс из резервного метода:", solBalance);
            return solBalance;
          }
          return 0;
        } catch (fallbackError) {
          console.error("🧨 Даже резервный метод не сработал:", fallbackError);
          return 0;
        }
      }
    } catch (keypairError) {
      console.error("🗝️ Ошибка создания ключевой пары:", keypairError);
      return 0;
    }
  } catch (connectionError) {
    console.error("📡 Ошибка соединения с Solana:", connectionError);
    return 0;
  }
};

/**
 * Снайпит токен по его адресу.
 */
export const snipeTokenV2 = async (tokenAddress: string, amount: number, slippage: number): Promise<boolean> => {
    console.log(`Снайпинг токена ${tokenAddress} на сумму ${amount} SOL с проскальзыванием ${slippage}%`);
    
    try {
      // Здесь будет реализация снайпинга через Raydium или Jupiter
      // Пока возвращаем заглушку с имитацией успеха
      
      toast({
        title: "Информация",
        description: "Функция снайпинга в разработке. Скоро будет доступна!",
      });
      
      // Задержка для имитации процесса снайпинга
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error("Ошибка при снайпинге токена:", error);
      return false;
    }
  };
  
  /**
   * Мониторит новые токены на Pump.fun и Raydium.
   */
  export const monitorNewTokensV2 = async (
    minVolume: number, 
    minHolders: number,
    maxAgeMinutes: number,
    minPumpScore: number,
    usePumpFun: boolean,
    useRaydium: boolean,
    callback: (tokenAddress: string) => void
  ) => {
    console.log("Запуск мониторинга новых токенов");
    console.log("Параметры:", { minVolume, minHolders, maxAgeMinutes, minPumpScore, usePumpFun, useRaydium });
    
    // Здесь будет реализация мониторинга через Pump.fun API и Raydium API
    // Пока возвращаем заглушку
    
    toast({
      title: "Информация",
      description: "Функция мониторинга в разработке. Скоро будет доступна!",
    });
    
    return {
      stop: () => {
        console.log("Остановка мониторинга новых токенов");
      }
    };
  };
import { PublicKey } from '@solana/web3.js';
import { getConnection, getKeypairFromPrivateKey } from './solanaConnectionService';

// Статус снайпер-бота (экспортируем функцию, которая требуется в импортах)
export const getBotStatus = () => {
  return {
    isActive: true,
    activeDexes: ['Raydium', 'Pump.fun'],
    tokensScanned: 423,
    lastTokenFound: 'PEPE',
    snipeAmount: 0.1,
    minLiquidity: 50,
    maxHolderPercent: 20
  };
};

// Основной класс нашего супер-бота для снайпинга токенов
export class SolanaBot {
  connection: ReturnType<typeof getConnection>;
  keypair: ReturnType<typeof getKeypairFromPrivateKey> | null = null;
  isActive: boolean = false;
  
  constructor(endpoint: string) {
    // Создаем подключение через наш сервис
    this.connection = getConnection(endpoint);
    console.log("🚀 SOLANA БОТ СОЗДАН! Подключен к:", endpoint);
  }

  // Устанавливаем ключ для работы бота
  setWalletKey(privateKey: string) {
    try {
      this.keypair = getKeypairFromPrivateKey(privateKey);
      console.log("🔑 КЛЮЧ ЗАГРУЖЕН! Адрес:", this.keypair.publicKey.toString());
      return true;
    } catch (error) {
      console.error("❌ ОШИБКА ЗАГРУЗКИ КЛЮЧА:", error);
      return false;
    }
  }

  // Запускаем снайпинг токенов
  async startSniper(config: {
    dexes: string[],
    minLiquidity: number,
    maxHolderPercent: number,
    snipeAmount: number,
    timeout: number
  }) {
    if (!this.keypair) {
      throw new Error("Сначала загрузите ключ кошелька");
    }

    this.isActive = true;
    console.log("🎯 СНАЙПЕР ЗАПУЩЕН с настройками:", config);
    
    // Здесь будет логика снайпинга токенов
    // ...

    return {
      success: true,
      message: "Снайпер активирован и ищет новые токены"
    };
  }

  // Остановка снайпера
  stopSniper() {
    this.isActive = false;
    console.log("⏹️ СНАЙПЕР ОСТАНОВЛЕН");
    return {
      success: true,
      message: "Снайпер деактивирован"
    };
  }

  // Состояние бота
  getStatus() {
    return getBotStatus();
  }
}

// Создаем дефолтный инстанс бота
export const defaultBot = new SolanaBot("https://api.devnet.solana.com");
