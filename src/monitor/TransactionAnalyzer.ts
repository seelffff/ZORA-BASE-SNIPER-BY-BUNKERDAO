import { decodeEventLog } from 'viem';
import { ERC20_ABI, TRANSFER_EVENT_ABI } from '../blochain/contracts.js';
import type { TransferEvent } from '../types/index.js';
import { Logger } from '../utils/logger.js';

export class TransactionAnalyzer {
  private logger: Logger;

  constructor(private httpClient: any, private hookAddress: string, private poolManagerAddress: string) {
    this.logger = new Logger();
  }

  isPotentialZoraTransaction(tx: any): boolean {
    if (tx.to && tx.to.toLowerCase() === this.hookAddress.toLowerCase()) {
      return true;
    }
    if (tx.input && tx.input.length >= 20) {
      const inputBytes = tx.input.toLowerCase();
      const hookBytes = this.hookAddress.toLowerCase().slice(2);
      const poolBytes = this.poolManagerAddress.toLowerCase().slice(2);

      return inputBytes.includes(hookBytes) || inputBytes.includes(poolBytes);
    }

    return false;
  }

  parseTransferLog(log: any): TransferEvent | null {
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
        const args = decoded.args as any;
        return {
          from: args.from,
          to: args.to,
          amount: args.value,
        };
      }
    } catch (error) {
      this.logger.debug('Log is not a Transfer event or failed to decode', { 
        address: log.address,
        topics: log.topics?.length 
      });
    }
    return null;
  }

  async getTokenMetadata(tokenAddress: string): Promise<{ name?: string; symbol?: string }> {
    try {
      this.logger.debug(`Getting metadata for token ${tokenAddress}`);

      const [name, symbol] = await Promise.all([
        this.httpClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'name',
        }).catch(() => null),
        this.httpClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }).catch(() => null),
      ]);

      return { 
        name: name || undefined, 
        symbol: symbol || undefined 
      };
    } catch (error) {
      this.logger.debug(`Failed to get metadata for token ${tokenAddress}`, { error });
      return {};
    }
  }
}