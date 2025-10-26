import { decodeEventLog } from 'viem';
import { ERC20_ABI, TRANSFER_EVENT_ABI } from '../blochain/contracts.js';
import { Logger } from '../utils/logger.js';
export class TransactionAnalyzer {
    constructor(httpClient, hookAddress, poolManagerAddress) {
        this.httpClient = httpClient;
        this.hookAddress = hookAddress;
        this.poolManagerAddress = poolManagerAddress;
        this.logger = new Logger();
    }
    isPotentialZoraTransaction(tx) {
        // Check direct interaction with hook contract
        if (tx.to && tx.to.toLowerCase() === this.hookAddress.toLowerCase()) {
            return true;
        }
        // Check if transaction data contains our contract addresses
        if (tx.input && tx.input.length >= 20) {
            const inputBytes = tx.input.toLowerCase();
            const hookBytes = this.hookAddress.toLowerCase().slice(2);
            const poolBytes = this.poolManagerAddress.toLowerCase().slice(2);
            return inputBytes.includes(hookBytes) || inputBytes.includes(poolBytes);
        }
        return false;
    }
    parseTransferLog(log) {
        var _a;
        try {
            if (log.topics.length < 3) {
                return null;
            }
            const expectedSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
            if (log.topics[0].toLowerCase() !== expectedSignature) {
                return null;
            }
            const decoded = decodeEventLog({
                abi: [TRANSFER_EVENT_ABI],
                data: log.data,
                topics: log.topics,
            });
            if (decoded.eventName === 'Transfer') {
                const args = decoded.args;
                return {
                    from: args.from,
                    to: args.to,
                    amount: args.value,
                };
            }
        }
        catch (error) {
            // This is normal - not all logs are Transfer events
            this.logger.debug('Log is not a Transfer event or failed to decode', {
                address: log.address,
                topics: (_a = log.topics) === null || _a === void 0 ? void 0 : _a.length
            });
        }
        return null;
    }
    async getTokenMetadata(tokenAddress) {
        try {
            this.logger.debug(`Getting metadata for token ${tokenAddress}`);
            const [name, symbol] = await Promise.all([
                this.httpClient.readContract({
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: 'name',
                }).catch(() => null),
                this.httpClient.readContract({
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: 'symbol',
                }).catch(() => null),
            ]);
            return {
                name: name || undefined,
                symbol: symbol || undefined
            };
        }
        catch (error) {
            this.logger.debug(`Failed to get metadata for token ${tokenAddress}`, { error });
            return {};
        }
    }
}
//# sourceMappingURL=TransactionAnalyzer.js.map