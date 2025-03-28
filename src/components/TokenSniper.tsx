
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from './ui/use-toast';
import { formatSol } from '@/lib/utils';
import { snipeToken } from '@/services/solanaBotService';

export function TokenSniper() {
  // Параметры снайпинга
  const [snipeAmount, setSnipeAmount] = useState<number>(0.1);
  const [slippage, setSlippage] = useState<number>(5.0);
  const [minVolume, setMinVolume] = useState<number>(5000);
  const [minHolders, setMinHolders] = useState<number>(2);
  const [maxAge, setMaxAge] = useState<number>(1); // в минутах
  const [minPumpScore, setMinPumpScore] = useState<number>(70);
  const [usePumpFun, setUsePumpFun] = useState<boolean>(true);
  const [useRaydium, setUseRaydium] = useState<boolean>(true);
  const [botActive, setBotActive] = useState<boolean>(false);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [isSniping, setIsSniping] = useState<boolean>(false);
  
  // Эффект для мониторинга активности бота
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (botActive) {
      toast({
        title: "Бот активирован",
        description: "Мониторинг новых токенов запущен",
      });
      
      // Здесь будет логика подключения к WebSocket для мониторинга токенов
      // ...
    } else if (interval) {
      clearInterval(interval);
      toast({
        title: "Бот остановлен",
        description: "Мониторинг новых токенов остановлен",
      });
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [botActive]);
  
  // Функция ручного снайпинга токена
  const handleManualSnipe = async () => {
    if (!tokenAddress) {
      toast({
        title: "Ошибка",
        description: "Введите адрес токена",
        variant: "destructive"
      });
      return;
    }
    
    setIsSniping(true);
    try {
      const success = await snipeToken(tokenAddress, snipeAmount, slippage);
      if (success) {
        toast({
          title: "Успешно",
          description: `Токен ${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)} снайпнут на ${snipeAmount} SOL`,
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось снайпнуть токен",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Ошибка при снайпинге:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось снайпнуть токен",
        variant: "destructive"
      });
    } finally {
      setIsSniping(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Снайпер токенов Solana</CardTitle>
        <CardDescription>Настройте параметры и запустите автоматический снайпинг новых токенов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="snipe-amount">Сумма для снайпинга</Label>
              <span className="text-sm text-muted-foreground">{formatSol(snipeAmount)}</span>
            </div>
            <Slider 
              id="snipe-amount"
              min={0.01} 
              max={1} 
              step={0.01} 
              value={[snipeAmount]} 
              onValueChange={(value) => setSnipeAmount(value[0])} 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="slippage">Проскальзывание (%)</Label>
              <span className="text-sm text-muted-foreground">{slippage}%</span>
            </div>
            <Slider 
              id="slippage"
              min={1} 
              max={50} 
              step={1} 
              value={[slippage]} 
              onValueChange={(value) => setSlippage(value[0])} 
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="min-volume">Минимальный объём ($)</Label>
              <span className="text-sm text-muted-foreground">${minVolume}</span>
            </div>
            <Slider 
              id="min-volume"
              min={1000} 
              max={50000} 
              step={1000} 
              value={[minVolume]} 
              onValueChange={(value) => setMinVolume(value[0])} 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="min-holders">Минимальное кол-во холдеров</Label>
              <span className="text-sm text-muted-foreground">{minHolders}</span>
            </div>
            <Slider 
              id="min-holders"
              min={1} 
              max={50} 
              step={1} 
              value={[minHolders]} 
              onValueChange={(value) => setMinHolders(value[0])} 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-age">Макс. возраст токена (мин)</Label>
              <span className="text-sm text-muted-foreground">{maxAge} мин</span>
            </div>
            <Slider 
              id="max-age"
              min={0.5} 
              max={60} 
              step={0.5} 
              value={[maxAge]} 
              onValueChange={(value) => setMaxAge(value[0])} 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="min-pump-score">Мин. Pump Score</Label>
              <span className="text-sm text-muted-foreground">{minPumpScore}</span>
            </div>
            <Slider 
              id="min-pump-score"
              min={10} 
              max={100} 
              step={5} 
              value={[minPumpScore]} 
              onValueChange={(value) => setMinPumpScore(value[0])} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pump-fun">Использовать Pump.fun</Label>
              <p className="text-sm text-muted-foreground">Мониторинг токенов через Pump.fun</p>
            </div>
            <Switch 
              id="pump-fun"
              checked={usePumpFun} 
              onCheckedChange={setUsePumpFun} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="raydium">Использовать Raydium</Label>
              <p className="text-sm text-muted-foreground">Мониторинг токенов через Raydium</p>
            </div>
            <Switch 
              id="raydium"
              checked={useRaydium} 
              onCheckedChange={setUseRaydium} 
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="token-address">Адрес токена (для ручного снайпинга)</Label>
            <div className="flex space-x-2">
              <Input 
                id="token-address"
                placeholder="Введите адрес токена Solana" 
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
              />
              <Button 
                onClick={handleManualSnipe} 
                disabled={isSniping || !tokenAddress}
                className="whitespace-nowrap"
              >
                {isSniping ? "Снайпинг..." : "Снайпнуть"}
              </Button>
            </div>
          </div>
          
          <Button 
            variant={botActive ? "destructive" : "default"}
            className="w-full mt-4"
            onClick={() => setBotActive(!botActive)}
          >
            {botActive ? "Остановить бота" : "Запустить бота"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export default function TokenSniper() {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-solana-secondary/10 to-solana/5 border-solana/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">🎯 Sniper Bot 3000</CardTitle>
            <CardDescription>Отлавливай новые токены быстрее всех</CardDescription>
          </div>
          <Badge variant="success" className="bg-green-500">АКТИВЕН</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Минимальная ликвидность</label>
            <div className="flex items-center gap-2">
              <Slider defaultValue={[50]} max={100} step={1} className="flex-1" />
              <span className="text-xs opacity-70">50 SOL</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Макс. % топ-холдеров</label>
            <div className="flex items-center gap-2">
              <Slider defaultValue={[20]} max={100} step={1} className="flex-1" />
              <span className="text-xs opacity-70">20%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Бюджет на снайп (SOL)</label>
            <Input type="number" placeholder="0.1" defaultValue="0.1" />
          </div>
          <div>
            <label className="text-sm font-medium">Таймаут (сек)</label>
            <Input type="number" placeholder="60" defaultValue="60" />
          </div>
        </div>

        <div className="p-3 bg-black/20 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">DEX Мониторинг</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-solana bg-black/20">Raydium ✓</Badge>
            <Badge variant="outline" className="border-solana bg-black/20">Pump.fun ✓</Badge>
            <Badge variant="outline" className="border-solana/50 bg-black/10 opacity-50">Orca</Badge>
            <Badge variant="outline" className="border-solana/50 bg-black/10 opacity-50">Jupiter</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
        <Button className="w-full sm:w-auto bg-solana hover:bg-solana-secondary">🚀 ЗАПУСТИТЬ СНАЙПЕР</Button>
        <Button variant="outline" className="w-full sm:w-auto border-solana/30 text-solana hover:bg-solana/10">⚙️ РАСШИРЕННЫЕ НАСТРОЙКИ</Button>
      </CardFooter>
    </Card>
  );
}
