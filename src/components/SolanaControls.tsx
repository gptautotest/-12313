
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { initializeSolanaConnection, getKeypairFromPrivateKey, getSolanaBalance } from '@/services/solanaConnectionService';
import { snipeToken, monitorNewTokens } from '@/services/solanaBotService';

interface SolanaControlsProps {
  // Добавляем пропсы, если они нужны
}

const SolanaControls: React.FC<SolanaControlsProps> = () => {
  // Состояние для приватного ключа и сети
  const [privateKey, setPrivateKey] = useState<string>("");
  const [network, setNetwork] = useState<string>("devnet");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Функция для подключения к сети Solana
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      if (!privateKey.trim()) {
        toast.error("🔑 Введите приватный ключ!");
        return;
      }

      const trimmedKey = privateKey.trim();
      
      // Инициализируем соединение
      const connection = initializeSolanaConnection(network);
      
      // Получаем keypair из приватного ключа
      const keypair = await getKeypairFromPrivateKey(trimmedKey);
      if (!keypair) {
        toast.error("🔑 Не удалось создать keypair из приватного ключа!");
        return;
      }
      
      // Получаем адрес кошелька
      const walletAddr = keypair.publicKey.toString();
      setWalletAddress(walletAddr);
      
      // Получаем баланс
      try {
        const userBalance = await getSolanaBalance(connection, keypair.publicKey);
        setBalance(userBalance);
      } catch (err) {
        console.error("Ошибка при получении баланса:", err);
        setBalance(0);
      }
      
      // Устанавливаем флаг подключения
      setIsConnected(true);
      
      toast.success(`🚀 Подключено к ${network}!`);
      
      // Сохраняем ключ и сеть в local storage
      localStorage.setItem('privateKey', trimmedKey);
      localStorage.setItem('network', network);
    } catch (error) {
      console.error("Ошибка подключения:", error);
      toast.error(`❌ Ошибка подключения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для отключения
  const handleDisconnect = () => {
    setIsConnected(false);
    setBalance(null);
    setWalletAddress(null);
    if (isMonitoring) {
      handleStopMonitoring();
    }
    toast.info("🔌 Отключено от сети Solana");
  };

  // Функция для обновления баланса
  const handleRefreshBalance = async () => {
    if (!isConnected || !walletAddress) return;
    
    try {
      setIsLoading(true);
      const connection = initializeSolanaConnection(network);
      const keypair = await getKeypairFromPrivateKey(privateKey);
      if (!keypair) {
        toast.error("🔑 Не удалось создать keypair из приватного ключа!");
        return;
      }
      
      const userBalance = await getSolanaBalance(connection, keypair.publicKey);
      setBalance(userBalance);
      
      toast.success("💰 Баланс обновлен!");
    } catch (error) {
      console.error("Ошибка обновления баланса:", error);
      toast.error(`❌ Ошибка обновления баланса: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для запуска мониторинга новых токенов
  const handleStartMonitoring = async () => {
    if (!isConnected) {
      toast.error("🔌 Сначала подключитесь к сети Solana!");
      return;
    }
    
    try {
      setIsMonitoring(true);
      const connection = initializeSolanaConnection(network);
      const keypair = await getKeypairFromPrivateKey(privateKey);
      
      if (!keypair) {
        toast.error("🔑 Не удалось создать keypair из приватного ключа!");
        return;
      }
      
      toast.success("🔍 Мониторинг новых токенов запущен!");
      
      // Здесь логика мониторинга токенов
      monitorNewTokens(connection, keypair, {
        minVolume: 5000,
        minHolders: 2,
        maxAge: 0.017, // 1 минута в часах
        minPumpScore: 70,
        slippage: 5.0,
        snipeAmount: 0.1,
        usePumpFun: true
      });
    } catch (error) {
      console.error("Ошибка запуска мониторинга:", error);
      toast.error(`❌ Ошибка запуска мониторинга: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      setIsMonitoring(false);
    }
  };

  // Функция для остановки мониторинга
  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    // Здесь логика остановки мониторинга
    
    toast.info("🛑 Мониторинг новых токенов остановлен");
  };

  // Функция для загрузки сохраненных данных при монтировании компонента
  useEffect(() => {
    const savedPrivateKey = localStorage.getItem('privateKey');
    const savedNetwork = localStorage.getItem('network');
    
    if (savedPrivateKey) {
      setPrivateKey(savedPrivateKey);
    }
    
    if (savedNetwork) {
      setNetwork(savedNetwork);
    }
    
    // Если есть сохраненные данные, пытаемся подключиться автоматически
    if (savedPrivateKey && savedNetwork) {
      // Для автоматического подключения раскомментируйте строку ниже
      // handleConnect();
    }
  }, []);

  return (
    <div className="w-full md:w-64 md:fixed md:h-full p-4 bg-gray-100 dark:bg-gray-900 border-r">
      <div className="space-y-4">
        <div className="text-xl font-bold">🚀 Solana Sniper Bot</div>
        
        <Card>
          <CardHeader>
            <CardTitle>🔌 Подключение</CardTitle>
            <CardDescription>Подключение к сети Solana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="private-key">Приватный ключ</Label>
              <Input 
                id="private-key"
                type="password" 
                placeholder="Введите приватный ключ" 
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                disabled={isConnected || isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="network">Сеть</Label>
              <Select 
                value={network} 
                onValueChange={setNetwork}
                disabled={isConnected || isLoading}
              >
                <SelectTrigger id="network">
                  <SelectValue placeholder="Выберите сеть" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                  <SelectItem value="devnet">Devnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {!isConnected ? (
              <Button 
                onClick={handleConnect} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Подключение...' : 'Подключиться'}
              </Button>
            ) : (
              <Button 
                onClick={handleDisconnect} 
                variant="outline"
                className="w-full"
              >
                Отключиться
              </Button>
            )}
          </CardContent>
        </Card>
        
        {isConnected && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>💰 Баланс</CardTitle>
                <CardDescription>Информация о вашем кошельке</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Адрес: </span>
                  <span className="text-gray-500 break-all">
                    {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Не подключено'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Баланс: </span>
                    <span className="text-green-500 font-bold">
                      {balance !== null ? `${balance.toFixed(6)} SOL` : 'Загрузка...'}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRefreshBalance}
                    disabled={isLoading}
                  >
                    🔄
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>🔍 Мониторинг</CardTitle>
                <CardDescription>Поиск новых токенов</CardDescription>
              </CardHeader>
              <CardContent>
                {!isMonitoring ? (
                  <Button 
                    onClick={handleStartMonitoring} 
                    className="w-full"
                    disabled={!isConnected || isLoading}
                  >
                    Запустить мониторинг
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopMonitoring} 
                    variant="destructive"
                    className="w-full"
                  >
                    Остановить мониторинг
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SolanaControls;
