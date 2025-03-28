
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useBotStore } from '@/stores/botStore';
import { 
  startCopyBot,
  stopCopyBot, 
  updateBalance, 
  formatBalanceDisplay, 
  formatRubDisplay 
} from '@/services/solanaBotService';

const SolanaControls = () => {
  const { 
    balance, 
    isRunning, 
    network, 
    privateKey, 
    publicKey, 
    setPrivateKey, 
    snipeAmount,
    setSnipeAmount,
    maxGas,
    setMaxGas,
    swapTime,
    setSwapTime,
    logs
  } = useBotStore();

  const [activeTab, setActiveTab] = useState("settings");

  // Обновляем баланс при загрузке и периодически
  useEffect(() => {
    const fetchBalance = async () => {
      console.log("Обновление баланса...");
      await updateBalance();
    };

    fetchBalance();
    // Обновляем баланс чаще при работающем боте
    const interval = setInterval(fetchBalance, isRunning ? 3000 : 15000);

    return () => clearInterval(interval);
  }, [privateKey, network, isRunning]);

  const handleKeyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setPrivateKey(value);
    console.log("Приватный ключ обновлен:", value ? "установлен" : "не установлен");
    // Сразу проверим баланс при изменении ключа
    updateBalance();
  };

  const handleStartBot = async () => {
    await startCopyBot();
  };

  const handleStopBot = () => {
    stopCopyBot();
  };

  const handleSnipeAmountChange = (value: number[]) => {
    setSnipeAmount(value[0]);
  };

  const handleMaxGasChange = (value: number[]) => {
    setMaxGas(value[0]);
  };

  const handleSwapTimeChange = (value: number[]) => {
    setSwapTime(value[0]);
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-card shadow-lg p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Solana Бот</h2>
      
      <div className="mb-4 p-3 bg-muted rounded-md">
        <div className="font-medium">Баланс: {formatBalanceDisplay(balance)}</div>
        <div className="text-sm text-muted-foreground">{formatRubDisplay(balance)}</div>
        <div className="text-sm mt-1">Сеть: {network}</div>
        {!privateKey && <div className="text-sm text-red-500 mt-1">Приватный ключ не установлен</div>}
        {isRunning && 
          <div className="text-sm text-green-500 mt-1 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Бот активен
          </div>
        }
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="w-full mb-2">
          <TabsTrigger value="settings" className="flex-1">Настройки</TabsTrigger>
          <TabsTrigger value="logs" className="flex-1">Логи</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Приватный ключ:
            </label>
            <textarea
              rows={3}
              className="w-full p-2 bg-background border rounded-md text-xs"
              placeholder="Вставьте приватный ключ..."
              value={privateKey}
              onChange={handleKeyChange}
            ></textarea>
            <p className="text-xs text-muted-foreground">
              Формат: [1,2,3,...] или через запятую
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Сумма снайпинга: {snipeAmount.toFixed(2)} SOL
              </label>
              <Slider 
                value={[snipeAmount]} 
                max={1} 
                step={0.01} 
                onValueChange={handleSnipeAmountChange} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Макс газ: {maxGas.toFixed(3)} SOL
              </label>
              <Slider 
                value={[maxGas]} 
                max={0.01} 
                step={0.001} 
                onValueChange={handleMaxGasChange} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Время свапа: {swapTime} сек
              </label>
              <Slider 
                value={[swapTime]} 
                max={60} 
                step={1} 
                onValueChange={handleSwapTimeChange} 
              />
            </div>

            {isRunning ? (
              <button
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
                onClick={handleStopBot}
              >
                Остановить бота
              </button>
            ) : (
              <button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md transition-colors"
                onClick={handleStartBot}
                disabled={!privateKey}
              >
                Запустить снайпинг
              </button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="logs" className="h-[calc(100vh-230px)] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Логи появятся здесь после запуска бота
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="text-xs p-2 border-b">
                  {log}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {isRunning && (
        <div className="mt-6 p-3 bg-green-100 dark:bg-green-900/20 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Бот активен, сканирует сеть в поисках токенов...
          </p>
        </div>
      )}
    </div>
  );
};

export default SolanaControls;
