import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { useBotStore } from '../stores/botStore';
import { getConnection, getKeypairFromPrivateKey } from './solanaConnectionService';
import { SOL_USD_RATE, USD_RUB_RATE } from '../lib/constants';

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
  const { privateKey, targetAddress, maxGasPrice, swapAmountSol, swapTimeSec } = useBotStore.getState();

  if (!privateKey) {
    console.error('Невозможно запустить бота: приватный ключ не установлен');
    return false;
  }

  if (!targetAddress) {
    console.error('Невозможно запустить бота: адрес цели не установлен');
    return false;
  }

  try {
    useBotStore.setState({ isRunning: true });

    // Здесь будет логика отслеживания и копирования транзакций
    console.log('Бот запущен с параметрами:', {
      targetAddress,
      maxGasPrice: maxGasPrice / LAMPORTS_PER_SOL,
      swapAmountSol,
      swapTimeSec
    });

    // Добавляем лог
    addLog('Бот запущен успешно. Отслеживаю транзакции...');

    // Здесь можно добавить WebSocket подписки на транзакции
    // ...

    return true;
  } catch (error) {
    console.error('Ошибка при запуске бота:', error);
    useBotStore.setState({ isRunning: false });
    addLog(`Ошибка запуска: ${error.message}`);
    return false;
  }
};

// Остановка бота
export const stopCopyBot = () => {
  try {
    // Здесь можно добавить логику отписки от WebSocket и т.д.

    useBotStore.setState({ isRunning: false });
    addLog('Бот остановлен.');
    return true;
  } catch (error) {
    console.error('Ошибка при остановке бота:', error);
    return false;
  }
};

// Добавление записи в лог
export const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;

  useBotStore.setState(state => ({
    logs: [logEntry, ...state.logs].slice(0, 100) // Ограничиваем 100 записями
  }));
};

// Обновление баланса кошелька
export const updateBalance = async () => {
  const { network, privateKey } = useBotStore.getState();

  console.log("Updating balance with private key:", privateKey ? "Present" : "Not present");

  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    useBotStore.setState({ balance: 0 });
    return 0;
  }

  try {
    const connection = getConnection(network);
    const keypair = getKeypairFromPrivateKey(privateKey);

    if (!keypair) {
      console.error('Ошибка: невозможно создать keypair из приватного ключа');
      useBotStore.setState({ balance: 0 });
      return 0;
    }

    const publicKey = keypair.publicKey;
    console.log("Wallet public key:", publicKey.toString());

    // Получаем баланс
    const lamports = await connection.getBalance(publicKey);
    console.log("Raw balance:", lamports);

    // Обновляем состояние
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
  return `${balance.toFixed(5)} SOL`;
};

// Форматирование суммы в рублях
export const formatRubDisplay = (balance: number): string => {
  const usdValue = balance * SOL_USD_RATE;
  const rubValue = usdValue * USD_RUB_RATE;
  return `≈ ${rubValue.toFixed(0)} ₽`;
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