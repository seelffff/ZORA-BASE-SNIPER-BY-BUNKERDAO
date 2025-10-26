import { Config } from '../types/index.js';
import Joi from 'joi';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ConfigService {
  private readonly config: Config;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    
    const possiblePaths = [
      path.join(process.cwd(), 'config', 'default.json'),
      path.join(__dirname, '..', '..', 'config', 'default.json'),
      path.join(__dirname, 'default.json')
    ];
    
    let configPath: string | null = null;
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        configPath = possiblePath;
        break;
      }
    }
    
    if (!configPath) {
      throw new Error(`Config file not found. Tried: ${possiblePaths.join(', ')}`);
    }
    
    this.logger.info(`Loading config from: ${configPath}`);
    
    try {
      const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      this.config = this.validate(configFile);
      this.logger.info('Configuration loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load configuration', { error });
      throw error;
    }
  }

  private validate(config: any): Config {
    const schema = Joi.object({
      network: Joi.object({
        baseRpcWs: Joi.string().uri().required(),
        baseRpcHttp: Joi.string().uri().required(),
      }).required(),
      zora: Joi.object({
        hookContract: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
        uniswapV4PoolManager: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      }).required(),
      telegram: Joi.object({
        botToken: Joi.string().required(),
        chatId: Joi.string().required(),
      }).required(),
      monitoring: Joi.object({
        blockConfirmationCount: Joi.number().min(1).max(20).default(5),
        maxRetryAttempts: Joi.number().min(1).max(10).default(3),
        retryDelaySeconds: Joi.number().min(1).max(60).default(10),
        // 🔧 ВАЛИДАЦИЯ НОВЫХ ПАРАМЕТРОВ
        minSupply: Joi.number().min(1).max(10000).default(999),
        minPoolAmount: Joi.number().min(1).max(5000).default(400),
        maxPoolPercentage: Joi.number().min(1).max(100).default(60),
        minTwitterFollowers: Joi.number().min(0).max(1000000).default(0),
      }).required(),
    });

    const { error, value } = schema.validate(config);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return value;
  }

  get(): Config {
    return this.config;
  }
}