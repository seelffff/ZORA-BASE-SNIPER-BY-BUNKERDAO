import { Config } from '../types/index.js';
export declare class ZoraMonitor {
    private config;
    private providers;
    private telegramBot;
    private zoraAPI;
    private transactionAnalyzer;
    private logger;
    private isMonitoring;
    constructor(config: Config);
    startMonitoring(): Promise<void>;
    private processBlock;
    private analyzeTransaction;
    private detectTokenCreation;
    private formatAmount;
    stopMonitoring(): Promise<void>;
}
//# sourceMappingURL=ZoraMonitor.d.ts.map