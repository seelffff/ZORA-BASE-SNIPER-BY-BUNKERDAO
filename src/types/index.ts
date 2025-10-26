export interface Config {
  network: NetworkConfig;
  zora: ZoraConfig;
  telegram: TelegramConfig;
  monitoring: MonitoringConfig;
}

export interface NetworkConfig {
  baseRpcWs: string;
  baseRpcHttp: string;
}

export interface ZoraConfig {
  hookContract: string;
  uniswapV4PoolManager: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface MonitoringConfig {
  blockConfirmationCount: number;
  maxRetryAttempts: number;
  retryDelaySeconds: number;
  // 🔧 НАСТРАИВАЕМЫЕ ПАРАМЕТРЫ ДЕТЕКТА
  minSupply: number;           // Минимальный total supply (в миллионах)
  minPoolAmount: number;       // Минимальная сумма в pool (в миллионах)  
  maxPoolPercentage: number;   // Максимальный % для pool
  minTwitterFollowers: number; // Минимальные подписчики Twitter
}

export interface TokenLaunch {
  address: string;
  name?: string | undefined;
  symbol?: string | undefined;
  totalSupply: bigint;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
  creator?: string | undefined;
  twitterUsername?: string | undefined;
  twitterFollowers?: number | undefined;
}

export interface TransferEvent {
  from: string;
  to: string;
  amount: bigint;
}

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode: string;
}

export interface ZoraSearchResponse {
  data: {
    globalSearch: {
      edges: Array<{
        node: {
          fullProfile?: {
            profileId: string;
          };
        };
      }>;
    };
  };
}

export interface ZoraProfileResponse {
  data: {
    profile?: {
      socialAccounts?: {
        twitter?: {
          username: string;
          followerCount: number;
        };
      };
    };
  };
}