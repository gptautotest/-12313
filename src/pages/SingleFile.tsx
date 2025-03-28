import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import TokenSniper from '@/components/TokenSniper';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBotStatus } from '@/services/solanaBotService';

// Интерфейс для токена
interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  liquidityUSD: number;
  createdAt: string;
  holders: number;
}

const SingleFile = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Симуляция подключения к WebSocket
    setTimeout(() => {
      setConnectionStatus('connected');
      toast({
        title: "🚀 Снайпер на связи!",
        description: "Бот успешно подключен к Solana. Готов к охоте на токены!",
      });
      setIsLoaded(true);
    }, 2000);

    // Получаем статус бота при загрузке
    const checkStatus = async () => {
      const status = await getBotStatus();
      console.log("Статус бота:", status);
    };

    checkStatus();

    // Здесь бы был код для загрузки токенов с API 
    // но пока используем демо-данные
    const demoTokens: Token[] = [
      {
        id: "1",
        name: "Solana Dog",
        symbol: "SDOG",
        price: 0.00042,
        change24h: 125.5,
        volume24h: 2500000,
        marketCap: 420000,
        liquidityUSD: 150000,
        createdAt: new Date().toISOString(),
        holders: 352
      },
      {
        id: "2",
        name: "Pump Coin",
        symbol: "PUMP",
        price: 0.0000069,
        change24h: 420.69,
        volume24h: 1200000,
        marketCap: 120000,
        liquidityUSD: 50000,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        holders: 124
      },
      {
        id: "3",
        name: "Moon Shot",
        symbol: "MOON",
        price: 0.00032,
        change24h: -15.2,
        volume24h: 850000,
        marketCap: 950000,
        liquidityUSD: 220000,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        holders: 789
      }
    ];
    setTokens(demoTokens);

    return () => {
      // Очистка при размонтировании компонента
      console.log("Компонент размонтирован");
    };
  }, [toast]);

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    toast({
      title: `Токен выбран: ${token.name}`,
      description: `${token.symbol} сейчас стоит $${token.price.toFixed(8)}`,
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-solana border-t-transparent rounded-full mb-4 mx-auto"></div>
          <p className="text-xl font-bold">Загрузка снайпер-бота...</p>
          <p className="text-sm mt-2 text-gray-500">Готовим ракету на луну 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-solana to-solana-secondary text-transparent bg-clip-text">
        🚀 Solana Pump.fun Снайпер 2.0 🚀
      </h1>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              Снайпер новых токенов
            </CardTitle>
            <CardDescription>
              Найди и купи самые свежие токены на Pump.fun и Raydium раньше всех
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenSniper />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ токенов по объему (24ч)</CardTitle>
            <CardDescription>
              Самые популярные токены за последние 24 часа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Название</th>
                    <th className="text-right py-2">Цена</th>
                    <th className="text-right py-2">Изм. 24ч</th>
                    <th className="text-right py-2">Объем 24ч</th>
                    <th className="text-right py-2">Ликвидность</th>
                    <th className="text-right py-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.id} className="border-b hover:bg-muted/50 cursor-pointer">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-solana to-solana-secondary rounded-full mr-3 flex items-center justify-center text-white font-bold">
                            {token.symbol.substring(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold">{token.name}</div>
                            <div className="text-sm text-muted-foreground">{token.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right font-mono">${token.price.toFixed(8)}</td>
                      <td className={`text-right ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </td>
                      <td className="text-right">${(token.volume24h/1000).toFixed(1)}K</td>
                      <td className="text-right">${(token.liquidityUSD/1000).toFixed(1)}K</td>
                      <td className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleTokenSelect(token)}
                        >
                          Выбрать
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Назад</Button>
            <Button variant="outline">Вперед</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SingleFile;