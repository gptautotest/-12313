#!/usr/bin/env python3
"""
Solana Transaction Copy Bot - Interactive Terminal GUI
"""

import os
import sys
import time
import asyncio
from termcolor import colored
from solana_copy_bot import CopyBot, DEFAULT_WALLET

# Терминальный GUI для Solana Copy Bot
class SolanaBotTerminalGUI:
    def __init__(self):
        self.bot = None
        self.running = True
        
        # Настройки по умолчанию
        self.settings = {
            "target_wallet": "avAtiJAzAJv8dhMC6GLjW3FpJ1wY7aNegaxE9q4H5h5",
            "network": "devnet",
            "private_key": None,
            "verbose": False,
            
            # Настройки снайпинга (с учетом требований пользователя)
            "snipe_amount": 0.1,
            "slippage": 5.0,
            "min_volume": 5000,         # Минимальный объем $5000 
            "min_holders": 2,           # Минимальное количество холдеров 2
            "max_age": 0.017,          # Максимальный возраст 1 минута (0.017 часа)
            "min_pump_score": 70,
            "use_pumpfun": True,
            
            # Настройки копирования
            "copy_amount": 0.05
        }
        
        # Инициализация бота в режиме снайпинга по умолчанию
        self.initialize_bot("snipe")
    
    def log(self, msg, level="info"):
        """Логирование сообщений"""
        color = None
        if level == "error":
            color = "red"
        elif level == "warning":
            color = "yellow"
        elif level == "success":
            color = "green"
        elif level == "info":
            color = "cyan"
            
        if color:
            print(colored(msg, color))
        else:
            print(msg)
    
    def initialize_bot(self, mode):
        """Инициализация бота с текущими настройками"""
        try:
            from solana_copy_bot import CopyBot
            
            # Сбрасываем предыдущий экземпляр, если есть
            self.bot = None
            
            # Создаем новый экземпляр с текущими настройками
            self.bot = CopyBot(
                target_wallet=self.settings["target_wallet"],
                amount=self.settings["copy_amount"],
                network=self.settings["network"],
                private_key=self.settings["private_key"],
                verbose=self.settings["verbose"],
                mode=mode,
                snipe_amount=self.settings["snipe_amount"],
                slippage=self.settings["slippage"],
                min_volume=self.settings["min_volume"],
                min_holders=self.settings["min_holders"],
                max_age=self.settings["max_age"],
                min_pump_score=self.settings["min_pump_score"],
                use_pumpfun=self.settings["use_pumpfun"]
            )
            
            # Проверяем, что бот успешно создан
            if self.bot:
                print(colored(f"Бот успешно инициализирован в режиме: {mode}", "green"))
            else:
                print(colored(f"Ошибка: не удалось создать экземпляр бота", "red"))
                
        except ImportError as ie:
            print(colored(f"Ошибка импорта: не удалось импортировать модуль solana_copy_bot.py: {str(ie)}", "red"))
            self.bot = None
        except Exception as e:
            print(colored(f"Ошибка при инициализации бота: {str(e)}", "red"))
            self.bot = None
    
    def clear_screen(self):
        """Очистка экрана терминала"""
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def print_header(self):
        """Отображение заголовка"""
        self.clear_screen()
        print(colored("=" * 70, "cyan"))
        print(colored("               SOLANA TRANSACTION COPY BOT - v1.0               ", "cyan", attrs=["bold"]))
        print(colored("=" * 70, "cyan"))
        print()
    
    def print_main_menu(self):
        """Отображение главного меню"""
        self.print_header()
        
        # Обновляем и показываем баланс кошелька
        if self.bot:
            balance = self.bot.update_balance()
            print(colored(f"Баланс кошелька: {balance} SOL", "green"))
            # Адрес кошелька получаем из лога бота
            wallet_address = "2JmAk3TkhxsT3WeAXKpR19v7551CioEXwcyFRb6ty7TE"
            print(colored(f"Адрес кошелька: {wallet_address}", "green"))
            print(colored(f"Сеть: {self.bot.network}", "green"))
        
        print("\n" + colored("ГЛАВНОЕ МЕНЮ:", "yellow", attrs=["bold"]))
        print("1. " + colored("Запустить режим снайпинга токенов", "green"))
        print("2. " + colored("Запустить режим копирования транзакций", "green"))
        print("3. " + colored("Прямой снайпинг токена по адресу", "green"))
        print("4. " + colored("Настройки параметров снайпинга", "yellow"))
        print("5. " + colored("Настройки параметров копирования", "yellow"))
        print("6. " + colored("Просмотр истории снайпов", "blue"))
        print("7. " + colored("Просмотр истории транзакций", "blue"))
        print("8. " + colored("Изменить настройки сети", "magenta"))
        print("0. " + colored("Выход", "red"))
        
        choice = input("\nВыберите опцию (0-8): ")
        return choice
    
    def print_snipe_settings(self):
        """Отображение и изменение настроек снайпинга"""
        while True:
            self.print_header()
            print(colored("НАСТРОЙКИ СНАЙПИНГА:", "yellow", attrs=["bold"]))
            print(f"1. Сумма SOL для снайпа: {colored(self.settings['snipe_amount'], 'green')} SOL")
            print(f"2. Проскальзывание: {colored(self.settings['slippage'], 'green')}%")
            print(f"3. Минимальный объем: ${colored(self.settings['min_volume'], 'green')}")
            print(f"4. Минимальное количество холдеров: {colored(self.settings['min_holders'], 'green')}")
            print(f"5. Максимальный возраст токена: {colored(self.settings['max_age'], 'green')} часов")
            print(f"6. Минимальный pump score: {colored(self.settings['min_pump_score'], 'green')}")
            print(f"7. Использовать pump.fun: {colored('Да' if self.settings['use_pumpfun'] else 'Нет', 'green')}")
            print("0. Вернуться в главное меню")
            
            choice = input("\nВыберите параметр для изменения (0-7): ")
            
            if choice == "0":
                break
            elif choice == "1":
                try:
                    value = float(input("Введите сумму SOL для снайпа: "))
                    if value > 0:
                        self.settings["snipe_amount"] = value
                except ValueError:
                    print(colored("Ошибка! Введите корректное число.", "red"))
                    time.sleep(1)
            elif choice == "2":
                try:
                    value = float(input("Введите проскальзывание в %: "))
                    if value > 0:
                        self.settings["slippage"] = value
                except ValueError:
                    print(colored("Ошибка! Введите корректное число.", "red"))
                    time.sleep(1)
            elif choice == "3":
                try:
                    value = float(input("Введите минимальный объем в USD: "))
                    if value >= 0:
                        self.settings["min_volume"] = value
                except ValueError:
                    print(colored("Ошибка! Введите корректное число.", "red"))
                    time.sleep(1)
            elif choice == "4":
                try:
                    value = int(input("Введите минимальное количество холдеров: "))
                    if value >= 0:
                        self.settings["min_holders"] = value
                except ValueError:
                    print(colored("Ошибка! Введите корректное целое число.", "red"))
                    time.sleep(1)
            elif choice == "5":
                try:
                    value = float(input("Введите максимальный возраст токена в часах: "))
                    if value > 0:
                        self.settings["max_age"] = value
                except ValueError:
                    print(colored("Ошибка! Введите корректное число.", "red"))
                    time.sleep(1)
            elif choice == "6":
                try:
                    value = float(input("Введите минимальный pump score (0-100): "))
                    if 0 <= value <= 100:
                        self.settings["min_pump_score"] = value
                    else:
                        print(colored("Значение должно быть от 0 до 100.", "red"))
                except ValueError:
                    print(colored("Ошибка! Введите корректное число.", "red"))
                    time.sleep(1)
            elif choice == "7":
                use_pumpfun = input("Использовать pump.fun? (да/нет): ").lower()
                self.settings["use_pumpfun"] = use_pumpfun.startswith("д") or use_pumpfun.startswith("y")
        
        # Переинициализируем бота с новыми настройками
        self.initialize_bot("snipe")
    
    def print_copy_settings(self):
        """Отображение и изменение настроек копирования"""
        while True:
            self.print_header()
            print(colored("НАСТРОЙКИ КОПИРОВАНИЯ:", "yellow", attrs=["bold"]))
            print(f"1. Целевой кошелек для мониторинга: {colored(self.settings['target_wallet'], 'green')}")
            print(f"2. Сумма SOL для копирования: {colored(self.settings['copy_amount'], 'green')} SOL")
            print("0. Вернуться в главное меню")
            
            choice = input("\nВыберите параметр для изменения (0-2): ")
            
            if choice == "0":
                break
            elif choice == "1":
                value = input("Введите адрес кошелька для мониторинга: ")
                if value and len(value) >= 32:
                    self.settings["target_wallet"] = value
                else:
                    print(colored("Ошибка! Введите корректный адрес кошелька.", "red"))
                    time.sleep(1)
            elif choice == "2":
                try:
                    value = float(input("Введите сумму SOL для копирования: "))
                    if value > 0:
                        self.settings["copy_amount"] = value
                except ValueError:
                    print(colored("Ошибка! Введите корректное число.", "red"))
                    time.sleep(1)
        
        # Переинициализируем бота с новыми настройками
        self.initialize_bot("copy")
    
    def print_network_settings(self):
        """Отображение и изменение настроек сети"""
        while True:
            self.print_header()
            print(colored("НАСТРОЙКИ СЕТИ:", "magenta", attrs=["bold"]))
            print(f"1. Сеть: {colored(self.settings['network'], 'green')}")
            print(f"2. Приватный ключ: {colored('Настроен' if self.settings['private_key'] else 'Не настроен', 'green')}")
            print(f"3. Подробное логирование: {colored('Включено' if self.settings['verbose'] else 'Выключено', 'green')}")
            print("0. Вернуться в главное меню")
            
            choice = input("\nВыберите параметр для изменения (0-3): ")
            
            if choice == "0":
                break
            elif choice == "1":
                network = input("Выберите сеть (mainnet/devnet): ").lower()
                if network in ["mainnet", "devnet"]:
                    self.settings["network"] = network
                else:
                    print(colored("Ошибка! Выберите mainnet или devnet.", "red"))
                    time.sleep(1)
            elif choice == "2":
                key = input("Введите приватный ключ (оставьте пустым для ключа по умолчанию): ")
                self.settings["private_key"] = key if key else None
            elif choice == "3":
                verbose = input("Включить подробное логирование? (да/нет): ").lower()
                self.settings["verbose"] = verbose.startswith("д") or verbose.startswith("y")
        
        # Переинициализируем бота с новыми настройками
        mode = "snipe"  # Устанавливаем режим по умолчанию
        if self.bot and hasattr(self.bot, 'mode'):
            mode = self.bot.mode
        self.initialize_bot(mode)

    def direct_snipe_token(self):
        """Прямой снайпинг токена по адресу или URL"""
        self.print_header()
        print(colored("ПРЯМОЙ СНАЙПИНГ ТОКЕНА:", "green", attrs=["bold"]))
        
        token_url = input("Введите адрес токена или URL с pump.fun: ")
        if not token_url:
            print(colored("Операция отменена.", "yellow"))
            time.sleep(1)
            return
        
        # Обновляем баланс перед снайпингом
        balance = 0
        if self.bot and hasattr(self.bot, 'update_balance'):
            balance = self.bot.update_balance()
        else:
            print(colored("Ошибка: бот не инициализирован", "red"))
            input("Нажмите Enter для продолжения...")
            return
            
        if balance < self.settings["snipe_amount"]:
            print(colored(f"Недостаточно SOL! У вас {balance} SOL, нужно {self.settings['snipe_amount']} SOL", "red"))
            input("Нажмите Enter для продолжения...")
            return
        
        token_address = None
        if hasattr(self.bot, 'parse_token_from_url'):
            token_address = self.bot.parse_token_from_url(token_url)
        else:
            print(colored("Ошибка: функция разбора адреса токена недоступна", "red"))
            input("Нажмите Enter для продолжения...")
            return
        if token_address:
            print(colored(f"Подготовка к снайпу токена: {token_address}", "green"))
            print(colored(f"Сумма: {self.settings['snipe_amount']} SOL, Проскальзывание: {self.settings['slippage']}%", "cyan"))
            
            confirm = input("Подтвердите операцию (да/нет): ").lower()
            if confirm.startswith("д") or confirm.startswith("y"):
                print(colored("Выполнение снайпа...", "yellow"))
                
                # Выполняем снайп в асинхронном режиме
                success = False
                try:
                    if hasattr(self.bot, 'snipe_token'):
                        success = asyncio.run(self.bot.snipe_token(token_address, self.settings["snipe_amount"], self.settings["slippage"]))
                    else:
                        print(colored("Ошибка: функция снайпинга токена недоступна", "red"))
                except Exception as e:
                    print(colored(f"Ошибка при снайпинге: {str(e)}", "red"))
                
                if success:
                    print(colored(f"Успешно снайпнут токен: {token_address}", "green"))
                    if hasattr(self.bot, 'update_balance'):
                        self.bot.update_balance()
                else:
                    print(colored(f"Не удалось снайпнуть токен: {token_address}", "red"))
            else:
                print(colored("Операция отменена.", "yellow"))
        else:
            print(colored(f"Не удалось распознать адрес токена из: {token_url}", "red"))
        
        input("\nНажмите Enter для продолжения...")
    
    def show_snipe_history(self):
        """Отображение истории снайпов"""
        self.print_header()
        print(colored("ИСТОРИЯ СНАЙПОВ:", "blue", attrs=["bold"]))
        
        if hasattr(self.bot, 'snipe_history'):
            self.bot.snipe_history.print_history(limit=30)
        else:
            print(colored("История снайпов недоступна.", "yellow"))
        
        input("\nНажмите Enter для продолжения...")
    
    def show_transaction_history(self):
        """Отображение истории транзакций"""
        self.print_header()
        print(colored("ИСТОРИЯ ТРАНЗАКЦИЙ:", "blue", attrs=["bold"]))
        
        if hasattr(self.bot, 'history'):
            self.bot.history.print_history(limit=30)
        else:
            print(colored("История транзакций недоступна.", "yellow"))
        
        input("\nНажмите Enter для продолжения...")
    
    async def run_snipe_mode(self):
        """Запуск режима снайпинга токенов"""
        self.print_header()
        print(colored("РЕЖИМ СНАЙПИНГА ТОКЕНОВ", "green", attrs=["bold"]))
        
        # Информация о текущих настройках
        print("\nТекущие настройки:")
        print(colored(f"  Сумма для снайпа: {self.settings['snipe_amount']} SOL", "cyan"))
        print(colored(f"  Проскальзывание: {self.settings['slippage']}%", "cyan"))
        print(colored(f"  Фильтры pump.fun:", "cyan"))
        print(colored(f"    - Минимальный объем: ${self.settings['min_volume']}", "cyan"))
        print(colored(f"    - Минимальное кол-во холдеров: {self.settings['min_holders']}", "cyan"))
        print(colored(f"    - Максимальный возраст: {self.settings['max_age']} часов", "cyan"))
        print(colored(f"    - Минимальный pump score: {self.settings['min_pump_score']}", "cyan"))
        
        # Переинициализируем бота в режиме снайпинга
        self.initialize_bot("snipe")
        
        # Обновляем баланс перед запуском
        balance = 0
        if hasattr(self.bot, 'update_balance'):
            balance = self.bot.update_balance()
            print(colored(f"\nТекущий баланс: {balance} SOL", "green"))
            
            if balance < self.settings["snipe_amount"]:
                print(colored(f"Внимание! Недостаточно SOL для снайпа. У вас {balance} SOL, нужно {self.settings['snipe_amount']} SOL", "yellow"))
        else:
            print(colored("\nНе удалось получить баланс кошелька.", "yellow"))
        
        confirm = input("\nНачать мониторинг токенов? (да/нет): ").lower()
        if not (confirm.startswith("д") or confirm.startswith("y")):
            print(colored("Операция отменена.", "yellow"))
            return
        
        print(colored("\nЗапуск мониторинга новых токенов...", "green"))
        print(colored("Для остановки нажмите Ctrl+C", "yellow"))
        
        try:
            # Запускаем мониторинг токенов
            if hasattr(self.bot, 'run'):
                await self.bot.run()
            else:
                print(colored("\nОшибка: функция мониторинга недоступна", "red"))
        except KeyboardInterrupt:
            print(colored("\nМониторинг остановлен пользователем", "yellow"))
        except Exception as e:
            print(colored(f"\nОшибка при запуске мониторинга: {str(e)}", "red"))
        
        input("\nНажмите Enter для возврата в главное меню...")
    
    async def run_copy_mode(self):
        """Запуск режима копирования транзакций"""
        self.print_header()
        print(colored("РЕЖИМ КОПИРОВАНИЯ ТРАНЗАКЦИЙ", "green", attrs=["bold"]))
        
        # Информация о текущих настройках
        print("\nТекущие настройки:")
        print(colored(f"  Целевой кошелек: {self.settings['target_wallet']}", "cyan"))
        print(colored(f"  Сумма для копирования: {self.settings['copy_amount']} SOL", "cyan"))
        
        # Переинициализируем бота в режиме копирования
        self.initialize_bot("copy")
        
        # Обновляем баланс перед запуском
        balance = 0
        if hasattr(self.bot, 'update_balance'):
            balance = self.bot.update_balance()
            print(colored(f"\nТекущий баланс: {balance} SOL", "green"))
            
            if balance < self.settings["copy_amount"]:
                print(colored(f"Внимание! Недостаточно SOL для копирования. У вас {balance} SOL, нужно {self.settings['copy_amount']} SOL", "yellow"))
        else:
            print(colored("\nНе удалось получить баланс кошелька.", "yellow"))
        
        confirm = input("\nНачать мониторинг транзакций? (да/нет): ").lower()
        if not (confirm.startswith("д") or confirm.startswith("y")):
            print(colored("Операция отменена.", "yellow"))
            return
        
        print(colored("\nЗапуск мониторинга транзакций...", "green"))
        print(colored("Для остановки нажмите Ctrl+C", "yellow"))
        
        try:
            # Запускаем мониторинг транзакций
            if hasattr(self.bot, 'run'):
                await self.bot.run()
            else:
                print(colored("\nОшибка: функция мониторинга недоступна", "red"))
        except KeyboardInterrupt:
            print(colored("\nМониторинг остановлен пользователем", "yellow"))
        except Exception as e:
            print(colored(f"\nОшибка при запуске мониторинга: {str(e)}", "red"))
        
        input("\nНажмите Enter для возврата в главное меню...")
    
    def run(self):
        """Запуск основного цикла GUI"""
        while self.running:
            choice = self.print_main_menu()
            
            if choice == "0":
                self.running = False
                print(colored("\nЗавершение работы бота...", "yellow"))
                time.sleep(1)
            elif choice == "1":
                asyncio.run(self.run_snipe_mode())
            elif choice == "2":
                asyncio.run(self.run_copy_mode())
            elif choice == "3":
                self.direct_snipe_token()
            elif choice == "4":
                self.print_snipe_settings()
            elif choice == "5":
                self.print_copy_settings()
            elif choice == "6":
                self.show_snipe_history()
            elif choice == "7":
                self.show_transaction_history()
            elif choice == "8":
                self.print_network_settings()
            else:
                print(colored("\nНеверный выбор! Пожалуйста, выберите опцию от 0 до 8.", "red"))
                time.sleep(1)

def main():
    """Основная функция приложения"""
    try:
        gui = SolanaBotTerminalGUI()
        gui.run()
    except KeyboardInterrupt:
        print(colored("\nПрограмма завершена пользователем", "yellow"))
    except Exception as e:
        print(colored(f"\nПроизошла ошибка: {str(e)}", "red"))
        sys.exit(1)

if __name__ == "__main__":
    main()
