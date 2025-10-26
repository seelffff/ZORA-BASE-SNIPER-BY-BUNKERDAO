import { createPublicClient, createWalletClient, http, webSocket } from 'viem';
import { base } from 'viem/chains';
import { Logger } from '../utils/logger.js';
export class BlockchainProviders {
    constructor(config) {
        this.config = config;
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
    setWalletClient(privateKey) {
        this.walletClient = createWalletClient({
            chain: base,
            transport: http(this.config.network.baseRpcHttp),
        });
    }
}
//# sourceMappingURL=providers.js.map