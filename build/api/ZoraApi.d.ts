export declare class ZoraAPI {
    private client;
    private logger;
    constructor();
    getCreatorInfo(tokenName?: string, tokenSymbol?: string): Promise<{
        username: string;
        followers: number;
    } | null>;
    private getCreatorProfile;
}
//# sourceMappingURL=ZoraApi.d.ts.map