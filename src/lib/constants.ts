
// Константы для сети Solana
export const DEVNET_RPC = 'https://api.devnet.solana.com';
export const MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

// Константы для конвертации валют
export const SOL_USD_RATE = 138.5; // Текущий курс SOL/USD
export const USD_RUB_RATE = 93.5;  // Текущий курс USD/RUB

// Константы для временных интервалов (в миллисекундах)
export const UPDATE_INTERVAL = 5000; // Интервал обновления данных (5 сек)
export const PING_INTERVAL = 30000;  // Интервал проверки соединения (30 сек)

// Константы для копированиятранзакций
export const MAX_TX_HISTORY = 50;    // Максимальное количество хранимых транзакций
export const MIN_SOL_BALANCE = 0.01; // Минимальный баланс для выполнения операций

// Конфигурация веб-сокетов
export const WS_RECONNECT_INTERVAL = 3000; // Интервал переподключения (3 сек)
export const WS_MAX_RECONNECT_ATTEMPTS = 5; // Максимальное число попыток переподключения
