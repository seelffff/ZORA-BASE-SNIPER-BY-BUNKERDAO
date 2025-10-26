import { ConfigService } from './config/index.js';
import { ZoraMonitor } from './monitor/ZoraMonitor.js';
import { Logger } from './utils/logger.js';

const logger = new Logger();

async function main() {
  try {
    logger.info('🔍 Starting Zora Token Monitor v1.0.0');
    logger.info(`📂 Current working directory: ${process.cwd()}`);
    logger.info('📋 Loading configuration...');

    const configService = new ConfigService();
    const config = configService.get();

    logger.info('✅ Configuration loaded successfully');
    logger.info(`🔗 RPC HTTP: ${config.network.baseRpcHttp}`);
    logger.info(`🔗 RPC WebSocket: ${config.network.baseRpcWs}`);
    logger.info(`🎯 Hook Contract: ${config.zora.hookContract}`);
    logger.info(`🏊 Pool Manager: ${config.zora.uniswapV4PoolManager}`);

    const monitor = new ZoraMonitor(config);
    
    process.on('SIGINT', async () => {
      logger.info('Shutting down...');
      await monitor.stopMonitoring();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down...');
      await monitor.stopMonitoring();
      process.exit(0);
    });

    await monitor.startMonitoring();

  } catch (error: any) {
    logger.error('Failed to start application', { 
      error: error.message,
      stack: error.stack,
      code: error.code 
    });
    
    process.exit(1);
  }
}

main();