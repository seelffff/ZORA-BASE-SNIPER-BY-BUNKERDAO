import type { TokenLaunch } from '../types/index.js';
export declare class TelegramBotService {
    private token;
    private chatId;
    private bot;
    private logger;
    constructor(token: string, chatId: string);
    sendTokenLaunchNotification(token: TokenLaunch): Promise<void>;
    private formatTokenMessage;
    private formatTokenAmount;
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=BotService.d.ts.map