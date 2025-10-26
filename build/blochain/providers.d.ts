import { Config } from '../types/index.js';
export declare class BlockchainProviders {
    private config;
    private httpClient;
    private wsClient;
    private walletClient?;
    private logger;
    constructor(config: Config);
    getHttpClient(): any;
    getWsClient(): any;
    setWalletClient(privateKey: string): void;
}
//# sourceMappingURL=providers.d.ts.map