import { Telegraf } from 'telegraf';
import type { TokenLaunch } from '../types/index.js';
import { Logger } from '../utils/logger.js';

export class TelegramBotService {
  private bot: Telegraf;
  private logger: Logger;

  constructor(private token: string, private chatId: string) {
    this.bot = new Telegraf(token);
    this.logger = new Logger();
  }

  async sendTokenLaunchNotification(token: TokenLaunch): Promise<void> {
    const message = this.formatTokenMessage(token);

    try {
      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
      });
      this.logger.info('Telegram notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send Telegram notification', { error });
      throw error;
    }
  }

  private formatTokenMessage(token: TokenLaunch): string {
    const supplyFormatted = this.formatTokenAmount(token.totalSupply);
    
    const twitterInfo = token.twitterUsername && token.twitterFollowers 
      ? `🐦 *Twitter:* @${token.twitterUsername} (${token.twitterFollowers} followers)`
      : '🐦 *Twitter:* Unknown';

    return `🚀 *NEW ZORA TOKEN DETECTED*\n\n` +
      `📛 *Name:* ${token.name || 'Unknown'}\n` +
      `🏷️ *Symbol:* ${token.symbol || '???'}\n` +
      `📍 *Address:* \`${token.address}\`\n` +
      `💰 *Total Supply:* ${supplyFormatted}\n` +
      `👤 *Creator:* \`${token.creator || 'Unknown'}\`\n` +
      `${twitterInfo}\n` +
      `🧱 *Block:* #${token.blockNumber}\n` +
      `🔗 *Transaction:* \`${token.transactionHash}\`\n` +
      `⏰ *Block Time:* ${token.timestamp.toUTCString()}\n\n` +
      `🔍 [View on BaseScan](https://basescan.org/token/${token.address})\n` +
      `📊 [DEXTools Chart](https://www.dextools.io/app/base/pair-explorer/${token.address})\n\n` +
      `⚡ *Ready for analysis!*`;
  }

  private formatTokenAmount(amount: bigint): string {
    const ethAmount = Number(amount) / 1e18;
    
    if (ethAmount >= 1e9) {
      return `${(ethAmount / 1e9).toFixed(2)}B`;
    } else if (ethAmount >= 1e6) {
      return `${(ethAmount / 1e6).toFixed(2)}M`;
    } else if (ethAmount >= 1e3) {
      return `${(ethAmount / 1e3).toFixed(2)}K`;
    } else {
      return ethAmount.toFixed(2);
    }
  }

  async start(): Promise<void> {
    this.bot.start((ctx) => {
      ctx.reply('Zora Monitor is running! 🚀');
    });

    await this.bot.launch();
    this.logger.info('Telegram bot started');
  }

  async stop(): Promise<void> {
    this.bot.stop();
  }
}