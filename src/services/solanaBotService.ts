import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { useBotStore } from '../stores/botStore';
import bs58 from 'bs58';
import { DEVNET_RPC } from '../lib/constants';

// Вспомогательные функции для работы с кошельком

// Получение соединения с блокчейном
export const getConnection = (network = 'devnet') => {
  const rpcUrl = network === 'devnet' ? DEVNET_RPC : process.env.MAINNET_RPC || '';
  return new Connection(rpcUrl);
};

// Получение ключевой пары из приватного ключа
export const getKeypairFromPrivateKey = (privateKeyString: string): Keypair | null => {
  if (!privateKeyString) {
    console.log("Приватный ключ не установлен");
    return null;
  }

  try {
    const secretKey = bs58.decode(privateKeyString.trim());
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Ошибка при создании ключевой пары:', error);
    return null;
  }
};

// Функции управления ботом

// Запуск бота для копирования транзакций
export const startCopyBot = async () => {
  console.log("Запуск бота...");

  const store = useBotStore.getState();

  if (!store.privateKey) {
    console.error("Приватный ключ не установлен. Невозможно запустить бота.");
    addLog("🛑 Ошибка: Приватный ключ не установлен");
    return;
  }

  useBotStore.setState({ isRunning: true });

  // Логика запуска бота
  addLog("🚀 Бот запущен. Начинаем слушать транзакции...");

  // Здесь должна быть логика подписки на WebSocket события блокчейна
  // Для демонстрации создадим имитацию работы:
  startWebsocketConnection();
};

// Остановка копирования транзакций
export const stopCopyBot = () => {
  console.log("Остановка бота...");

  useBotStore.setState({ isRunning: false });

  // Отписка от событий
  stopWebsocketConnection();

  addLog("🛑 Бот остановлен.");
};

// Имитация WebSocket соединения
let wsInterval: ReturnType<typeof setInterval> | null = null;

const startWebsocketConnection = () => {
  console.log("WebSocket connected");

  wsInterval = setInterval(() => {
    if (Math.random() > 0.7) {
      const tokenAddress = generateRandomHexString(11);
      const amount = (Math.random() * 0.5).toFixed(4);

      addLog(`🔍 Найден новый токен: ${tokenAddress}...`);
      addLog(`💰 Снайпинг токена на сумму ${amount} SOL`);

      if (Math.random() > 0.3) {
        const txId = generateRandomHexString(10);
        addLog(`✅ Транзакция выполнена: ${txId}...`);
      } else {
        addLog(`❌ Транзакция не удалась. Пробуем снова...`);
      }
    }
  }, 15000);
};

const stopWebsocketConnection = () => {
  if (wsInterval) {
    clearInterval(wsInterval);
    wsInterval = null;
  }
};

// Вспомогательные функции
const generateRandomHexString = (length: number): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Добавить лог в хранилище
const addLog = (message: string) => {
  useBotStore.setState(state => ({
    logs: [...state.logs, message]
  }));
};

// Обновление баланса кошелька
export const updateBalance = async () => {
  console.log("Обновление баланса...");

  const { privateKey, network } = useBotStore.getState();

  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    useBotStore.setState({ balance: 0 });
    return 0;
  }

  console.log("Updating balance with private key:", privateKey ? "Present" : "Not present");

  try {
    const keypair = getKeypairFromPrivateKey(privateKey);

    if (!keypair) {
      useBotStore.setState({ balance: 0 });
      return 0;
    }

    const connection = getConnection(network);
    const publicKey = keypair.publicKey;

    console.log("Wallet public key:", publicKey.toString());

    // Получаем баланс аккаунта
    const lamports = await connection.getBalance(publicKey);
    console.log("Raw balance:", lamports);

    // Обновляем баланс в хранилище
    useBotStore.setState({
      balance: lamports / LAMPORTS_PER_SOL,
      publicKey: publicKey.toString()
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
  return `${balance.toFixed(4)} SOL`;
};

// Форматирование баланса в рублях
export const formatRubDisplay = (balance: number): string => {
  // Предположим, что курс примерно 180$ за SOL и 92 рубля за доллар
  const solToUsd = 180;
  const usdToRub = 92;
  const rubValue = balance * solToUsd * usdToRub;

  // Форматируем с разделителями тысяч
  return `≈ ${rubValue.toLocaleString('ru-RU', {
    maximumFractionDigits: 0
  })} ₽`;
};