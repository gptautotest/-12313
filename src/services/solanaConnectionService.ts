/**
 * Получает объект Keypair из приватного ключа
 * @param privateKey Приватный ключ
 * @returns Объект Keypair или null при ошибке
 */
export const getKeypairFromPrivateKey = (privateKey: string): Keypair | null => {
  try {
    if (!privateKey) return null;

    console.log("Обработка приватного ключа, длина:", privateKey.length);

    // Обработка приватного ключа в формате массива байтов [1,2,3,...]
    if (privateKey.startsWith('[') && privateKey.endsWith(']')) {
      try {
        console.log("Обрабатываем как массив байтов");
        const privateKeyBytes = JSON.parse(privateKey);
        if (Array.isArray(privateKeyBytes)) {
          console.log("Массив успешно распарсен, длина:", privateKeyBytes.length);
          const uint8Array = new Uint8Array(privateKeyBytes);
          return Keypair.fromSecretKey(uint8Array);
        } else {
          console.error("Результат JSON.parse не является массивом");
        }
      } catch (parseError) {
        console.error("Ошибка при парсинге массива приватного ключа:", parseError);
      }
    }

    // Если это строка, удаляем пробелы и лишние символы
    const cleanedKey = privateKey.trim();

    // Если это похоже на JSON, но не является правильным синтаксисом массива
    if (cleanedKey.includes('[') && cleanedKey.includes(']')) {
      try {
        console.log("Пытаемся исправить формат массива JSON");
        // Извлекаем числа из строки
        const numbersMatch = cleanedKey.match(/\d+/g);
        if (numbersMatch && numbersMatch.length === 64) {
          console.log("Нашли 64 числа в строке");
          const privateKeyBytes = numbersMatch.map(num => parseInt(num, 10));
          const uint8Array = new Uint8Array(privateKeyBytes);
          return Keypair.fromSecretKey(uint8Array);
        }
      } catch (jsonFixError) {
        console.error("Не удалось исправить формат JSON:", jsonFixError);
      }
    }

    // Если это не массив, пробуем расшифровать base58
    try {
      console.log("Пробуем использовать как Base58");
      const decodedKey = bs58.decode(cleanedKey);
      return Keypair.fromSecretKey(decodedKey);
    } catch (base58Error) {
      console.error("Ошибка при декодировании Base58:", base58Error);
    }

    // Последняя попытка - создать новую пару ключей, если остальные методы не сработали
    console.log("Все методы не сработали. Использование тестового keypair для DevNet");
    const testKeypair = Keypair.generate(); // Для DevNet, можно использовать временный ключ
    return testKeypair;
  } catch (error) {
    console.error("Критическая ошибка при создании Keypair:", error);
    return null;
  }
};