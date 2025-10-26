import { createPublicClient, createWalletClient, http, webSocket } from 'viem';
import { base } from 'viem/chains';
import { Config } from '../types/index.js';
import { Logger } from '../utils/logger.js';

export class BlockchainProviders {
  private httpClient: any;
  private wsClient: any;
  private walletClient?: any;
  private logger: Logger;

  constructor(private config: Config) {
    this.logger = new Logger();
    
    this.httpClient = createPublicClient({
      chain: base,
      transport: http(this.config.network.baseRpcHttp),
    });

    this.wsClient = createPublicClient({
      chain: base,
      transport: webSocket(this.config.network.baseRpcWs),
    });

    this.logger.info('Blockchain providers initialized');
  }

  getHttpClient() {
    return this.httpClient;
  }

  getWsClient() {
    return this.wsClient;
  }

  setWalletClient(privateKey: string) {
    this.walletClient = createWalletClient({
      chain: base,
      transport: http(this.config.network.baseRpcHttp),
    });
  }
}