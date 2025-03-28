import { Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { useBotStore } from '../stores/botStore';
import { getConnection, getKeypairFromPrivateKey } from './solanaConnectionService';
import { SOL_USD_RATE, USD_RUB_RATE } from '../lib/constants';
import bs58 from 'bs58';

// Запуск бота для копирования транзакций
export const startCopyBot = async () => {
  const { privateKey, targetAddress, maxGasPrice, swapAmountSol, swapTimeSec } = useBotStore.getState();

  if (!privateKey) {
    console.error('Приватный ключ не установлен');
    return;
  }

  try {
    // Получаем ключевую пару и соединение
    const keypair = getKeypairFromPrivateKey(privateKey);
    if (!keypair) {
      throw new Error('Не удалось создать ключевую пару');
    }

    // Обновляем состояние бота
    useBotStore.setState({ 
      isRunning: true, 
      logs: [...useBotStore.getState().logs, `Бот запущен - ${new Date().toLocaleTimeString()}`] 
    });

    // Здесь будет логика отслеживания и копирования транзакций
    console.log('Бот запущен с параметрами:', {
      targetAddress,
      maxGasPrice: maxGasPrice / LAMPORTS_PER_SOL,
      swapAmountSol,
      swapTimeSec
    });

    // Проверяем соединение
    await updateBalance();

  } catch (error) {
    console.error('Ошибка при запуске бота:', error);
    stopCopyBot();
    useBotStore.setState({ 
      logs: [...useBotStore.getState().logs, `Ошибка запуска: ${error.message}`] 
    });
  }
};

// Остановка бота
export const stopCopyBot = () => {
  useBotStore.setState({ 
    isRunning: false,
    logs: [...useBotStore.getState().logs, `Бот остановлен - ${new Date().toLocaleTimeString()}`]
  });
};

// Обновление баланса кошелька
export const updateBalance = async () => {
  const { privateKey, network } = useBotStore.getState();
  console.log("Обновление баланса...");

  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    useBotStore.setState({ balance: 0 });
    return 0;
  }

  try {
    // Получаем ключевую пару
    const keypair = getKeypairFromPrivateKey(privateKey);
    if (!keypair) {
      throw new Error('Не удалось создать ключевую пару');
    }

    console.log("Wallet public key:", keypair.publicKey.toString());

    // Получаем соединение и баланс
    const connection = getConnection(network);
    const lamports = await connection.getBalance(keypair.publicKey);

    console.log("Raw balance:", lamports);

    // Обновляем состояние
    useBotStore.setState({
      balance: lamports / LAMPORTS_PER_SOL,
      publicKey: keypair.publicKey.toString()
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

// Форматирование баланса в рублях
export const formatRubDisplay = (balance: number): string => {
  const usdValue = balance * SOL_USD_RATE;
  const rubValue = usdValue * USD_RUB_RATE;
  return `≈ ${rubValue.toFixed(0)} ₽`;
};

// Добавление записи в лог
export const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;

  useBotStore.setState(state => ({
    logs: [logEntry, ...state.logs].slice(0, 100) // Ограничиваем 100 записями
  }));
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