import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { create } from 'zustand';
import { DEVNET_RPC, DEFAULT_KEY } from '@/lib/constants';

// Интерфейс для состояния бота
interface BotState {
  balance: number;
  isRunning: boolean;
  network: string;
  privateKey: string;
  publicKey: string;
  snipeAmount: number;
  maxGas: number;
  swapTime: number;
  logs: string[];
  setPrivateKey: (key: string) => void;
  setSnipeAmount: (amount: number) => void;
  setMaxGas: (gas: number) => void;
  setSwapTime: (time: number) => void;
  addLog: (log: string) => void;
}

// Создаем Zustand store для управления состоянием бота
export const useBotStore = create<BotState>((set) => ({
  balance: 0,
  isRunning: false,
  network: 'devnet',
  privateKey: '',
  publicKey: '',
  snipeAmount: 0.1,
  maxGas: 0.005,
  swapTime: 10,
  logs: [],
  setPrivateKey: (key) => set({ privateKey: key }),
  setSnipeAmount: (amount) => set({ snipeAmount: amount }),
  setMaxGas: (gas) => set({ maxGas: gas }),
  setSwapTime: (time) => set({ swapTime: time }),
  addLog: (log) => set((state) => ({
    logs: [log, ...state.logs].slice(0, 50),
    balance: state.balance // Сохраняем текущий баланс при добавлении лога
  }))
}));


//This file needs to be created or adjusted to match your existing structure.
// src/services/solanaConnectionService.ts
// import { Connection, Keypair } from '@solana/web3.js';
// import { DEVNET_RPC } from '@/lib/constants';

// export const getConnection = () => {
//   return new Connection(DEVNET_RPC, 'confirmed');
// };

// export const getKeypairFromPrivateKey = (privateKey: string): Keypair | null => {
//   try {
//     const privateKeyBytes = parsePrivateKey(privateKey);
//     if (!privateKeyBytes) return null;
//     return Keypair.fromSecretKey(Uint8Array.from(privateKeyBytes));
//   } catch (error) {
//     console.error('Error creating Keypair from private key:', error);
//     return null;
//   }
// };


//  This function is likely redundant now.

// Парсинг приватного ключа в различных форматах (This function might need adjustments to be compatible with getKeypairFromPrivateKey)
const parsePrivateKey = (key: string): number[] | null => {
  // Удаляем все пробелы и переносы строк
  const cleanKey = key.replace(/\s+/g, '');

  // Проверяем, если это массив чисел [123,456,...]
  if (cleanKey.startsWith('[') && cleanKey.endsWith(']')) {
    try {
      return JSON.parse(cleanKey);
    } catch {
      // Если не смогли распарсить как JSON
      try {
        // Удаляем скобки и пробуем как простую строку с числами
        return cleanKey.slice(1, -1).split(',').map(num => parseInt(num.trim(), 10));
      } catch {
        return null;
      }
    }
  }

  // Если это просто строка чисел через запятую
  if (cleanKey.includes(',')) {
    try {
      return cleanKey.split(',').map(num => parseInt(num.trim(), 10));
    } catch {
      return null;
    }
  }

  // Если это base58 или другой формат, который можно преобразовать
  try {
    const decoded = Uint8Array.from(Buffer.from(cleanKey, 'base64'));
    return Array.from(decoded);
  } catch {
    return null;
  }
};

// Обновление баланса кошелька
import { getConnection, getKeypairFromPrivateKey } from './solanaConnectionService';
export const updateBalance = async (privateKey?: string): Promise<number> => {
  console.log("Обновление баланса...");

  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    useBotStore.setState({ balance: 0, publicKey: '' });
    return 0;
  }

  console.log("Updating balance with private key:", privateKey ? "Present" : "Not present");

  try {
    const keypair = getKeypairFromPrivateKey(privateKey);
    if (!keypair) {
      console.error('Ошибка: невозможно создать keypair из приватного ключа');
      return 0;
    }

    const connection = getConnection();
    const lamports = await connection.getBalance(keypair.publicKey);
    const publicKey = keypair.publicKey.toString();

    console.log("Wallet public key:", publicKey);
    console.log("Raw balance:", lamports);

    useBotStore.setState({
      balance: lamports / LAMPORTS_PER_SOL,
      publicKey
    });

    console.log("Баланс успешно обновлен:", lamports / LAMPORTS_PER_SOL, "SOL");
    return lamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    useBotStore.setState({ balance: 0 });
    return 0;
  }
};

// Форматирование баланса для отображения
export const formatBalance = (balance: number): string => {
  return balance.toFixed(4);
};


// Форматирование баланса для отображения в рублях
export const formatRubDisplay = (balance: number): string => {
  const rate = 7000; // Примерный курс SOL к рублю
  return (balance * rate).toFixed(0) + ' ₽';
};

// Запуск бота для копирования транзакций
let runningInterval;
export const startCopyBot = async () => {
  if (useBotStore.getState().isRunning) {
    return;
  }

  useBotStore.setState({ isRunning: true });

  const { privateKey } = useBotStore.getState();
  if (!privateKey) {
    useBotStore.setState({ isRunning: false });
    useBotStore.getState().addLog('❌ Ошибка: Не установлен приватный ключ');
    return;
  }

  useBotStore.getState().addLog('🚀 Бот запущен. Начинаем слушать транзакции...');

  // Запускаем автоматический снайпинг
  runningInterval = setInterval(async () => {
    try {
      // Получаем текущие параметры
      const { snipeAmount, maxGas, network } = useBotStore.getState();

      // Генерируем случайный токен для имитации снайпинга
      const randomTokenAddress = Keypair.generate().publicKey.toString();
      const connection = getConnection();

      // Имитация случайной суммы снайпинга в пределах установленного лимита
      const actualAmount = (Math.random() * 0.8 + 0.2) * snipeAmount;
      const gasUsed = (Math.random() * 0.8) * maxGas;

      // Записываем информацию в логи
      useBotStore.getState().addLog(`🔍 Найден новый токен: ${randomTokenAddress.substring(0, 10)}...`);
      useBotStore.getState().addLog(`💰 Снайпинг токена на сумму ${actualAmount.toFixed(4)} SOL`);

      // Имитация транзакции
      const transaction = new Transaction();

      // Создаем транзакцию на отправку средств самому себе (имитация снайпинга)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: getKeypairFromPrivateKey(privateKey)?.publicKey,
          toPubkey: getKeypairFromPrivateKey(privateKey)?.publicKey,
          lamports: 1000 // минимальная сумма, чтобы не тратить реальные средства
        })
      );

      // Отправляем транзакцию
      try {
        const signature = await connection.sendTransaction(transaction, [getKeypairFromPrivateKey(privateKey)!]);
        useBotStore.getState().addLog(`✅ Транзакция выполнена: ${signature.substring(0, 10)}...`);

        // Обновляем баланс после транзакции
        await updateBalance(privateKey);
      } catch (error) {
        console.error("Ошибка при отправке транзакции:", error);
        useBotStore.getState().addLog(`❌ Ошибка транзакции: ${error.message}`);
      }
    } catch (error) {
      console.error("Ошибка в снайпинге:", error);
      useBotStore.getState().addLog(`❌ Ошибка: ${error.message}`);
    }
  }, 10000); // Снайпинг каждые 10 секунд
};

// Остановка бота
export const stopCopyBot = () => {
  clearInterval(runningInterval);
  useBotStore.setState({ isRunning: false });
  useBotStore.getState().addLog('Бот остановлен');
  console.log('WebSocket closed');
};

// Эмуляция нахождения новых токенов
const simulateTokenDiscovery = () => {
  const checkForNewTokens = () => {
    if (!useBotStore.getState().isRunning) return;

    // С вероятностью 30% эмулируем нахождение нового токена
    if (Math.random() < 0.3) {
      const tokenAddress = generateRandomTokenAddress();
      const tokenSymbol = generateRandomTokenSymbol();
      const logMessage = `Найден новый токен: ${tokenSymbol} (${tokenAddress.substring(0, 8)}...)`;
      useBotStore.getState().addLog(logMessage);

      // Эмулируем снайпинг токена
      setTimeout(() => {
        snipeToken(tokenAddress, tokenSymbol);
      }, 500);
    }

    // Продолжаем поиск, если бот активен
    if (useBotStore.getState().isRunning) {
      setTimeout(checkForNewTokens, 3000); // Проверка каждые 3 секунды
    }
  };

  checkForNewTokens();
};

// Генерация случайного адреса токена для эмуляции
const generateRandomTokenAddress = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Генерация случайного символа токена
const generateRandomTokenSymbol = () => {
  const symbols = ['SOL', 'BONK', 'PYTH', 'JUP', 'RAY', 'MANGO', 'SAMO', 'DUST', 'RENDER', 'APT', 'USDC'];
  return symbols[Math.floor(Math.random() * symbols.length)] + Math.floor(Math.random() * 100);
};

// Функция для снайпинга токена
const snipeToken = async (tokenAddress: string, tokenSymbol: string) => {
  if (!useBotStore.getState().isRunning) return;

  const { snipeAmount } = useBotStore.getState();
  const logMessage = `🎯 Снайпинг токена ${tokenSymbol}: ${snipeAmount.toFixed(2)} SOL`;
  useBotStore.getState().addLog(logMessage);

  // Эмуляция процесса покупки
  setTimeout(() => {
    // С вероятностью 80% транзакция успешна
    if (Math.random() < 0.8) {
      const successMessage = `✅ Успешно куплено ${tokenSymbol} за ${snipeAmount.toFixed(2)} SOL`;
      useBotStore.getState().addLog(successMessage);
    } else {
      const errorMessage = `❌ Ошибка при покупке ${tokenSymbol}: нехватка ликвидности`;
      useBotStore.getState().addLog(errorMessage);
    }
  }, 1500);
};