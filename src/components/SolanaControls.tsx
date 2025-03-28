import { useState, useEffect } from 'react';
import { updateBalance } from '../services/solanaBotService';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from './ui/use-toast';

const SolanaControls: React.FC = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [network, setNetwork] = useState<'devnet' | 'mainnet'>('devnet');

  useEffect(() => {
    console.log("Обновление баланса...");
    if (privateKey) {
      refreshBalance();
    }
  }, [privateKey, network]);

  // Обновление баланса
  const refreshBalance = async () => {
    if (privateKey) {
      console.log("Запрос обновления баланса с приватным ключом...");
      try {
        const newBalance = await updateBalance(privateKey);
        console.log("Полученный баланс:", newBalance);
        // Даже если баланс 0, устанавливаем его (может быть пустой кошелек)
        setBalance(newBalance !== null ? newBalance : 0);
        setConnectionStatus('connected');
      } catch (error) {
        console.error("Ошибка при обновлении баланса:", error);
        setConnectionStatus('disconnected');
        toast({
          title: "Ошибка",
          description: "Не удалось обновить баланс",
          variant: "destructive"
        });
      }
    } else {
      console.log("Не могу обновить баланс: приватный ключ не установлен");
    }
  };

  // Обработчик изменения приватного ключа
  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrivateKey(value);
    setConnectionStatus('connecting');
  };

  // Обработчик изменения сети
  const handleNetworkChange = (value: string) => {
    setNetwork(value as 'devnet' | 'mainnet');
    if (privateKey) {
      setConnectionStatus('connecting');
      setTimeout(() => refreshBalance(), 1000);
    }
  };

  return (
    <div className="w-64 h-screen fixed top-0 left-0 bg-card border-r p-4 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-solana to-solana-secondary w-8 h-8 rounded-full mr-2"></div>
          <h2 className="text-lg font-bold text-primary">Solana Bot</h2>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="network">Сеть Solana</Label>
            <Select value={network} onValueChange={handleNetworkChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите сеть" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="devnet">Devnet</SelectItem>
                <SelectItem value="mainnet">Mainnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="privateKey">Приватный ключ</Label>
            <Input
              id="privateKey"
              type="password"
              placeholder="Введите приватный ключ"
              value={privateKey}
              onChange={handlePrivateKeyChange}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Введите ваш приватный ключ в формате base58 или массива байтов
            </p>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Статус:</span>
              <span className="flex items-center text-sm">
                <span 
                  className={`w-2 h-2 rounded-full mr-2 ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                ></span>
                {connectionStatus === 'connected' ? 'Подключено' : 
                 connectionStatus === 'connecting' ? 'Подключение...' : 'Отключено'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Баланс:</span>
              <span className="text-sm font-medium">
                {balance !== null ? `${balance.toFixed(4)} SOL` : '-'}
              </span>
            </div>

            <Button 
              className="w-full mt-2" 
              size="sm"
              variant="outline"
              onClick={refreshBalance}
              disabled={!privateKey || connectionStatus === 'connecting'}
            >
              Обновить баланс
            </Button>
          </div>
        </div>

        <div className="pt-4 mt-auto">
          <p className="text-xs text-center text-muted-foreground">
            Solana Bot v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default SolanaControls;