# 🚀 ZORA Token Sniper

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)
![Base](https://img.shields.io/badge/Base-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)

**Мониторинг новых токенов на Zora в реальном времени с автоматической проверкой создателей**

[Установка](#установка) • [Конфигурация](#конфигурация) • [Как работает](#как-работает) • [Поддержка](#поддержка)

</div>

## ✨ Особенности

- 🔥 **Мониторинг в реальном времени** - отслеживание новых блоков в сети Base
- 🎯 **Обнаружение токенов** - автоматическое обнаружение новых токенов через Zora V4 Coin Hook
- 👤 **Проверка создателей** - получение информации о создателе через Zora API + Twitter
- 🤖 **Telegram уведомления** - мгновенные оповещения о новых токенах
- 🔧 **Гибкая настройка** - фильтрация по supply, pool %, Twitter подписчикам

## 🚀 Быстрый старт

### 📋 Предварительные требования

- Node.js 18+ 
- npm или yarn
- Telegram бот (получите у [@BotFather](https://t.me/BotFather))
- RPC провайдер для Base (Infura, Alchemy и т.д.)

### ⚡ Установка

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/zora-token-monitor.git
cd zora-token-monitor

# Установите зависимости
npm install

# Настройте конфигурацию
cp config/default.example.json config/default.json