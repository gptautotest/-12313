import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { useBotStore } from '../stores/botStore';
import { getConnection, getKeypairFromPrivateKey, getPublicKeyFromPrivate } from './solanaConnectionService';
import { DEVNET_RPC, SOL_USD_RATE, USD_RUB_RATE } from '@/lib/constants';
import bs58 from 'bs58';
import {  } from '@solana/web3.js';

// Сервис для работы с ботом Solana

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
export const updateBalance = async (privateKey: string | null): Promise<number> => {
  console.log("Updating balance with private key:", privateKey ? "Present" : "Missing");

  if (!privateKey) {
    console.log("Приватный ключ не установлен");
    const { setBalance } = useBotStore.getState();
    setBalance(0);
    return 0;
  }

  try {
    // Получаем keypair из приватного ключа
    const keypair = getKeypairFromPrivateKey(privateKey);
    if (!keypair) {
      console.error("Не удалось создать keypair из приватного ключа");
      return 0;
    }

    // Получаем соединение с Solana
    const network = useBotStore.getState().network;
    const connection = getConnection(network);

    // Логируем публичный ключ для отладки
    console.log("Wallet public key:", keypair.publicKey.toString());

    // Получаем баланс с повторными попытками при ошибке
    let balance = 0;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        balance = await connection.getBalance(keypair.publicKey);
        console.log("Raw balance:", balance);
        break;
      } catch (err) {
        console.warn(`Попытка ${attempts+1}/${maxAttempts} получения баланса не удалась:`, err);
        attempts++;
        if (attempts >= maxAttempts) throw err;
        // Небольшая задержка перед следующей попыткой
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Обновляем состояние в хранилище
    const { setBalance } = useBotStore.getState();
    const solBalance = balance / LAMPORTS_PER_SOL;
    setBalance(solBalance);

    return solBalance;
  } catch (error) {
    console.error("Ошибка обновления баланса:", error);
    const { setBalance } = useBotStore.getState();
    setBalance(0);
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