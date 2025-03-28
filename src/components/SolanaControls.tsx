
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Clipboard, Wallet, ArrowUpDown, Activity, Copy, RefreshCw } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import { useBotStore } from '@/stores/botStore';
import { formatPublicKey, isValidPrivateKey, getPublicKeyFromPrivate } from '@/services/solanaConnectionService';
import { updateBalance, formatCurrency, convertSolToUsd, convertSolToRub, initializeWebSocket } from '@/services/solanaBotService';

const SolanaControls: React.FC = () => {
  const { 
    privateKey, setPrivateKey, 
    isRunning, setIsRunning,
    balance, setBalance,
    network, setNetwork
  } = useBotStore();
  
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [targetAddress, setTargetAddress] = useState<string>('');
  const [privateKeyInput, setPrivateKeyInput] = useState<string>(privateKey || '');
  const [publicKey, setPublicKey] = useState<string>('');
  const [isValidPrivKey, setIsValidPrivKey] = useState<boolean>(false);
  
  // Инициализация при загрузке
  useEffect(() => {
    if (privateKey) {
      const pubKey = getPublicKeyFromPrivate(privateKey);
      setPublicKey(pubKey ? pubKey.toString() : '');
      setIsValidPrivKey(true);
      refreshBalance();
      setConnectionStatus('connected');
    }
    
    // Запускаем интервал обновления баланса
    const interval = setInterval(() => {
      if (privateKey) {
        refreshBalance();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [privateKey]);

  // Обновление баланса
  const refreshBalance = async () => {
    try {
      const newBalance = await updateBalance(privateKey);
      if (newBalance !== null) {
        setBalance(newBalance);
        if (connectionStatus !== 'connected') {
          setConnectionStatus('connected');
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении баланса:", error);
      setConnectionStatus('disconnected');
    }
  };

  // Обновление приватного ключа
  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrivateKeyInput(value);
    setIsValidPrivKey(isValidPrivateKey(value));
    
    if (isValidPrivateKey(value)) {
      const pubKey = getPublicKeyFromPrivate(value);
      setPublicKey(pubKey ? pubKey.toString() : '');
    } else {
      setPublicKey('');
    }
  };

  // Сохранение приватного ключа
  const handleSavePrivateKey = () => {
    if (isValidPrivKey) {
      setPrivateKey(privateKeyInput);
      setConnectionStatus('connecting');
      setTimeout(() => refreshBalance(), 1000);
    }
  };

  // Включение/выключение бота
  const toggleBot = () => {
    if (privateKey) {
      if (!isRunning) {
        // Инициализация WebSocket
        if (targetAddress) {
          initializeWebSocket(targetAddress, (txSignature) => {
            console.log("Новая транзакция:", txSignature);
          });
        }
      }
      setIsRunning(!isRunning);
    }
  };

  // Смена сети
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
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold">Solana Bot</h1>
          <ConnectionStatus status={connectionStatus} />
        </div>
        
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="wallet"><Wallet className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="bot"><Activity className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="settings"><RefreshCw className="h-4 w-4" /></TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallet" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Кошелёк</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="privateKey">Приватный ключ</Label>
                    <div className="relative">
                      <Input 
                        id="privateKey" 
                        type="password" 
                        value={privateKeyInput} 
                        onChange={handlePrivateKeyChange}
                        className={isValidPrivKey ? "pr-8 border-green-500/50" : "pr-8"}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full" 
                        onClick={handleSavePrivateKey}
                        disabled={!isValidPrivKey}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Публичный ключ</Label>
                    <div className="text-xs bg-background p-2 rounded border overflow-hidden text-ellipsis">
                      {publicKey ? formatPublicKey(publicKey) : 'Не установлен'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Баланс</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SOL:</span>
                    <span className="font-medium">{formatCurrency(balance, 'SOL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">USD:</span>
                    <span className="font-medium">{formatCurrency(balance ? convertSolToUsd(balance) : null, 'USD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RUB:</span>
                    <span className="font-medium">{formatCurrency(balance ? convertSolToRub(balance) : null, 'RUB')}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={refreshBalance}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Обновить
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="bot" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Настройки бота</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="targetAddress">Целевой адрес</Label>
                    <Input 
                      id="targetAddress" 
                      placeholder="Публичный ключ..." 
                      value={targetAddress} 
                      onChange={(e) => setTargetAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="botSwitch">Запустить бота</Label>
                    <Switch 
                      id="botSwitch" 
                      checked={isRunning} 
                      onCheckedChange={toggleBot}
                      disabled={!privateKey}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Статус</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Состояние:</span>
                    <span className={`font-medium ${isRunning ? 'text-green-500' : 'text-red-500'}`}>
                      {isRunning ? 'Работает' : 'Остановлен'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сеть:</span>
                    <span className="font-medium">
                      {network === 'devnet' ? 'Devnet' : 'Mainnet'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Настройки сети</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={network === 'devnet' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleNetworkChange('devnet')}
                    >
                      Devnet
                    </Button>
                    <Button
                      variant={network === 'mainnet' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleNetworkChange('mainnet')}
                    >
                      Mainnet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="mt-auto text-center text-xs text-muted-foreground">
          <p>Solana Bot v1.0.0</p>
          <p>© 2023 All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default SolanaControls;
