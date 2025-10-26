import type { TransferEvent } from '../types/index.js';
export declare class TransactionAnalyzer {
    private httpClient;
    private hookAddress;
    private poolManagerAddress;
    private logger;
    constructor(httpClient: any, hookAddress: string, poolManagerAddress: string);
    isPotentialZoraTransaction(tx: any): boolean;
    parseTransferLog(log: any): TransferEvent | null;
    getTokenMetadata(tokenAddress: string): Promise<{
        name?: string;
        symbol?: string;
    }>;
}
//# sourceMappingURL=TransactionAnalyzer.d.ts.map