import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { create } from 'zustand';
import { DEVNET_RPC, DEFAULT_KEY } from '@/lib/constants';
import { getConnection, getKeypairFromPrivateKey } from './solanaConnectionService';

// Интерфейс для состояния бота
interface BotState {
  balance: number;
  isRunning: boolean;
  network: string;
  privateKey: string;
  publicKey: string;
  snipeAmount: number;
  maxGas: number;
  slippage: number; // Added slippage
  swapTime: number;
  logs: string[];
  setPrivateKey: (key: string) => void;
  setSnipeAmount: (amount: number) => void;
  setMaxGas: (gas: number) => void;
  setSlippage: (slippage: number) => void; // Added setSlippage
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
  slippage: 0.01, // Added slippage
  swapTime: 10,
  logs: [],
  setPrivateKey: (key) => set({ privateKey: key }),
  setSnipeAmount: (amount) => set({ snipeAmount: amount }),
  setMaxGas: (gas) => set({ maxGas: gas }),
  setSlippage: (slippage) => set({ slippage }), // Added setSlippage
  setSwapTime: (time) => set({ swapTime: time }),
  addLog: (log) => set((state) => ({
    logs: [log, ...state.logs].slice(0, 50)
  }))
}));

// Парсинг приватного ключа в различных форматах
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
export const updateBalance = async (privateKey: string | null): Promise<number> => {
  console.log("Обновление баланса...");

  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    useBotStore.setState({ balance: 0 });
    return 0;
  }

  try {
    console.log("Updating balance with private key:", privateKey ? "Present" : "Missing");

    const keypair = getKeypairFromPrivateKey(privateKey);
    if (!keypair) {
      console.error('Ошибка: Невозможно создать keypair из приватного ключа');
      useBotStore.setState({ balance: 0 });
      return 0;
    }

    console.log("Wallet public key:", keypair.publicKey.toString());

    const connection = getConnection();
    const lamports = await connection.getBalance(keypair.publicKey);
    const publicKey = keypair.publicKey.toString();

    console.log("Raw balance:", lamports);

    useBotStore.setState({ 
      balance: lamports / LAMPORTS_PER_SOL,
      publicKey 
    });

    return lamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    useBotStore.setState({ balance: 0 });
    return 0;
  }
};

// Форматирование баланса для отображения
export const formatBalanceDisplay = (balance: number): string => {
  return `${balance.toFixed(6)} SOL`;
};

// Форматирование баланса в рублях (примерный курс)
export const formatRubDisplay = (balance: number): string => {
  const solToRub = 8500; // Примерный курс 1 SOL = 8500 RUB
  return `≈ ${(balance * solToRub).toFixed(2)} ₽`;
};

// Запуск бота для копирования транзакций
export const startCopyBot = async (): Promise<void> => {
  try {
    // Получаем необходимые параметры из хранилища
    const { privateKey, network, snipeAmount, slippage, maxGas, swapTime } = useBotStore.getState();

    // Проверяем, есть ли приватный ключ
    if (!privateKey) {
      useBotStore.getState().addLog('❌ Ошибка: Приватный ключ не установлен');
      return;
    }

    // Обновляем статус бота
    useBotStore.setState({ isRunning: true });

    // Обновляем баланс кошелька
    await updateBalance(privateKey);

    // Добавляем лог
    useBotStore.getState().addLog("🚀 Бот запущен. Начинаем слушать транзакции...");

    // Имитация работы бота (для примера)
    startMockBotActivity();

  } catch (error) {
    console.error("Ошибка при запуске бота:", error);
    useBotStore.getState().addLog(`❌ Ошибка при запуске бота: ${error}`);
    useBotStore.setState({ isRunning: false });
  }
};

// Остановка бота
export const stopCopyBot = (): void => {
  useBotStore.setState({ isRunning: false });
  useBotStore.getState().addLog("🛑 Бот остановлен");

  // Остановка имитации работы бота
  stopMockBotActivity();
};

// Пременные для имитации работы бота
let mockInterval: number | null = null;
let mockTransactionInterval: number | null = null;

// Имитация активности бота для демонстрации
const startMockBotActivity = () => {
  if (mockInterval) clearInterval(mockInterval);
  if (mockTransactionInterval) clearInterval(mockTransactionInterval);

  // Генерация случайных токенов
  mockInterval = window.setInterval(() => {
    const { isRunning, snipeAmount } = useBotStore.getState();

    if (!isRunning) return;

    // Случайная сумма SOL в пределах заданного значения
    const amount = (Math.random() * snipeAmount).toFixed(4);

    // Генерация случайного адреса токена
    const randomTokenAddress = Array.from({ length: 10 }, () => 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
        Math.floor(Math.random() * 62)
      ]
    ).join('');

    useBotStore.getState().addLog(`💰 Снайпинг токена на сумму ${amount} SOL`);
    useBotStore.getState().addLog(`🔍 Найден новый токен: ${randomTokenAddress}...`);

    // Случайный успех или неудача
    if (Math.random() > 0.3) {
      const txHash = Array.from({ length: 10 }, () => 
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
          Math.floor(Math.random() * 62)
        ]
      ).join('');

      useBotStore.getState().addLog(`✅ Транзакция выполнена: ${txHash}...`);

      // Имитируем обновление баланса
      const currentBalance = useBotStore.getState().balance;
      const newBalance = Math.max(0, currentBalance - 0.000005);
      useBotStore.setState({ balance: newBalance });
    } else {
      useBotStore.getState().addLog(`❌ Ошибка: ${getRandomError()}`);
    }
  }, 5000); // Каждые 5 секунд
};

// Остановка имитации работы бота
const stopMockBotActivity = () => {
  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
  }
  if (mockTransactionInterval) {
    clearInterval(mockTransactionInterval);
    mockTransactionInterval = null;
  }
};

// Генерация случайной ошибки
const getRandomError = (): string => {
  const errors = [
    "Недостаточный баланс для транзакции",
    "Ошибка проскальзывания, слишком высокая волатильность",
    "Токен не найден в пуле ликвидности",
    "Лимит газа превышен",
    "Транзакция отклонена: высокая нагрузка на сеть",
    "Ошибка подписи транзакции",
    "Timeout при ожидании подтверждения"
  ];
  return errors[Math.floor(Math.random() * errors.length)];
};