import { Config, TokenLaunch } from '../types/index.js';
import { BlockchainProviders } from '../blochain/providers.js';
import { TelegramBotService } from '../telegram/BotService.js';
import { ZoraAPI } from '../api/ZoraApi.js';
import { TransactionAnalyzer } from './TransactionAnalyzer.js';
import { Logger } from '../utils/logger.js';

export class ZoraMonitor {
  private providers: BlockchainProviders;
  private telegramBot: TelegramBotService;
  private zoraAPI: ZoraAPI;
  private transactionAnalyzer: TransactionAnalyzer;
  private logger: Logger;
  private isMonitoring: boolean = false;

  constructor(private config: Config) {
    this.providers = new BlockchainProviders(config);
    this.telegramBot = new TelegramBotService(config.telegram.botToken, config.telegram.chatId);
    this.zoraAPI = new ZoraAPI();
    this.transactionAnalyzer = new TransactionAnalyzer(
      this.providers.getHttpClient(),
      config.zora.hookContract,
      config.zora.uniswapV4PoolManager
    );
    this.logger = new Logger();
  }

  async startMonitoring(): Promise<void> {
    this.logger.info('🚀 Starting Zora token monitoring...');
    this.logger.info(`⚙️  Detection settings: MinSupply=${this.config.monitoring.minSupply}M, MinPool=${this.config.monitoring.minPoolAmount}M, MaxPool=${this.config.monitoring.maxPoolPercentage}%, MinFollowers=${this.config.monitoring.minTwitterFollowers}`);
    
    this.isMonitoring = true;
    const wsClient = this.providers.getWsClient();
    
    const unsubscribe = wsClient.watchBlocks({
      onBlock: async (block:any) => {
        if (!this.isMonitoring) return;
        await this.processBlock(block);
      },
      onError: (error:any) => {
        this.logger.error('Error in block subscription', { error });
      },
    });
    
    await this.telegramBot.start();
    this.logger.info('✅ Monitoring started successfully');
  }

  private async processBlock(block: any): Promise<void> {
    const blockNumber = Number(block.number);
    
    this.logger.info(`🆕 BLOCK #${blockNumber} received at ${new Date().toLocaleTimeString()}`);

    const fullBlock = await this.providers.getHttpClient().getBlock({
      blockNumber: block.number,
      includeTransactions: true,
    });

    if (fullBlock && fullBlock.transactions) {
      this.logger.info(`📊 BLOCK #${blockNumber}: ${fullBlock.transactions.length} transactions to analyze`);
      
      let zoraCount = 0;
      for (const tx of fullBlock.transactions) {
        if (!this.isMonitoring) break;
        
        if (this.transactionAnalyzer.isPotentialZoraTransaction(tx)) {
          zoraCount++;
        }
        
        await this.analyzeTransaction(tx, fullBlock);
      }
      
      if (zoraCount > 0) {
        this.logger.info(`🎯 BLOCK #${blockNumber}: ${zoraCount} potential Zora transactions`);
      }
    }
  }

  private async analyzeTransaction(tx: any, block: any): Promise<void> {
    if (!this.transactionAnalyzer.isPotentialZoraTransaction(tx)) {
      return;
    }

    this.logger.debug(`🔍 Analyzing potential Zora transaction: ${tx.hash}`);

    try {
      const receipt = await this.providers.getHttpClient().getTransactionReceipt({
        hash: tx.hash,
      });

      if (receipt.status === 'success') {
        const tokenLaunch = await this.detectTokenCreation(receipt, block);
        if (tokenLaunch) {
          this.logger.info(`🎯 NEW TOKEN DETECTED: ${tokenLaunch.symbol || '???'} (${tokenLaunch.address})`);

          // TODO: Вызов скрипта покупки токена
          // await this.buyToken(tokenLaunch.address);

          await this.telegramBot.sendTokenLaunchNotification(tokenLaunch);
        }
      }
    } catch (error) {
      this.logger.warn(`Error analyzing transaction ${tx.hash}`, { error });
    }
  }

  private async detectTokenCreation(receipt: any, block: any): Promise<TokenLaunch | null> {
    const detectedTokens = new Map<string, { totalSupply: bigint; creator: string }>();
    const poolTransfers = new Map<string, bigint>();

    const minSupply = BigInt(this.config.monitoring.minSupply) * BigInt(10) ** BigInt(18) * BigInt(1000000);
    const minPoolAmount = BigInt(this.config.monitoring.minPoolAmount) * BigInt(10) ** BigInt(18) * BigInt(1000000);
    const maxPoolPercentage = BigInt(this.config.monitoring.maxPoolPercentage);
    const minTwitterFollowers = this.config.monitoring.minTwitterFollowers;

    for (const log of receipt.logs) {
      const transfer = this.transactionAnalyzer.parseTransferLog(log);
      if (!transfer) continue;

      this.logger.debug(`💸 Transfer: ${transfer.from} -> ${transfer.to} (${this.formatAmount(transfer.amount)}) at ${log.address}`);

      // Паттерн 1: Mint от zero address = новый токен
      if (transfer.from === '0x0000000000000000000000000000000000000000') {
        if (transfer.amount >= minSupply) {
          detectedTokens.set(log.address, { totalSupply: transfer.amount, creator: transfer.to });
          this.logger.debug(`🪙 Found large mint: ${this.formatAmount(transfer.amount)} tokens for ${log.address}`);
        }
      }

      // Паттерн 2: Transfer от Hook в Pool Manager
      if (transfer.from.toLowerCase() === this.config.zora.hookContract.toLowerCase() &&
          transfer.to.toLowerCase() === this.config.zora.uniswapV4PoolManager.toLowerCase()) {
        if (transfer.amount >= minPoolAmount) {
          poolTransfers.set(log.address, transfer.amount);
          this.logger.debug(`🏊 Found pool transfer: ${this.formatAmount(transfer.amount)} tokens of ${log.address}`);
        }
      }
    }

    // Проверяем токены с полным паттерном
    for (const [tokenAddress, { totalSupply, creator }] of detectedTokens) {
      const poolAmount = poolTransfers.get(tokenAddress);
      if (poolAmount) {
        const poolPercentage = (poolAmount * BigInt(100)) / totalSupply;

        if (poolPercentage <= maxPoolPercentage) {
          const creatorPercentage = BigInt(100) - poolPercentage;
          this.logger.info(`🔍 Checking token ${tokenAddress} (Creator: ${creatorPercentage}%, Pool: ${poolPercentage}%)`);
          
          const { name, symbol } = await this.transactionAnalyzer.getTokenMetadata(tokenAddress);
          const creatorInfo = await this.zoraAPI.getCreatorInfo(name, symbol);
          
          if (creatorInfo && creatorInfo.followers >= minTwitterFollowers) {
            this.logger.info(`✅ QUALIFIED: ${symbol || '???'} - @${creatorInfo.username} (${creatorInfo.followers} followers)`);
            
            return {
              address: tokenAddress,
              name,
              symbol,
              totalSupply,
              blockNumber: Number(block.number),
              transactionHash: receipt.transactionHash,
              timestamp: new Date(),
              creator,
              twitterUsername: creatorInfo.username,
              twitterFollowers: creatorInfo.followers,
            };
          } else {
            const reason = creatorInfo 
              ? `insufficient followers (${creatorInfo.followers} < ${minTwitterFollowers})`
              : 'no Twitter info';
            this.logger.info(`🚫 REJECTED: ${reason}`);
          }
        } else {
          this.logger.debug(`🚫 REJECTED: Pool too large (${poolPercentage}% > ${maxPoolPercentage}%)`);
        }
      } else {
        this.logger.debug(`🚫 REJECTED: No pool transfer found`);
      }
    }

    return null;
  }

  private formatAmount(amount: bigint): string {
    const millions = Number(amount) / 1e18 / 1e6;
    return `${millions.toFixed(1)}M`;
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    await this.telegramBot.stop();
    this.logger.info('Monitoring stopped');
  }
}