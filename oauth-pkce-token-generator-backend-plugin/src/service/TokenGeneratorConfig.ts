import {Config} from '@backstage/config';
import {LoggerService} from "@backstage/backend-plugin-api";
import {PLUGIN_ROOT_CONFIG_PATH} from "../utils/constants.ts";

export interface EnvClientConfig {
  name: string;
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
}

export class TokenGeneratorConfig {
  private readonly logger: LoggerService;
  private readonly config: Config;
  private readonly environments: EnvClientConfig[];

  constructor(options: {
    logger: LoggerService
    config: Config
  }) {
    this.logger = options.logger;
    this.config = options.config;
    this.logger.info("Reading config constructor");
    this.environments = this.readConfig();
  }

  private readConfig(): EnvClientConfig[] {
    try {
      const envs = this.config.getOptionalConfigArray(`${PLUGIN_ROOT_CONFIG_PATH}.environments`) || [];
      this.logger.info(`env size ${envs.length}`);
      return envs.filter(env => env.getOptionalString('name'))
        .map((c, index) => {
        const envConfig: EnvClientConfig = {
          name: c.getString('name'),
          authUrl: c.getString('authUrl'),
          tokenUrl: c.getString('tokenUrl'),
          clientId: c.getString('clientId'),
          clientSecret: c.getString('clientSecret')
        };
        const missing = Object.entries(envConfig)
          .filter(([_, value]) => !value)
          .map(([key]) => key);
        if (missing.length > 0) {
          this.logger.warn(`[TokenGeneratorConfig] Environment at index ${index} is missing fields: ${missing.join(', ')}`);
        }
        return envConfig;
      });
    } catch (_) {
      this.logger.error(`[TokenGeneratorConfig] Failed to load configuration for ${PLUGIN_ROOT_CONFIG_PATH}`);
      return [];
    }
  }

  public getEnvironments(): string[] {
    if (!this.environments.length) {
      this.logger.warn('[TokenGeneratorConfig] No environments configured. Check your app-config.yaml',);
    }
    return this.environments.map(env => env.name);
  }

  public getClientConfig(envName: string): EnvClientConfig {
    const envConfig = this.environments.find(env => env.name === envName);
    if (!envConfig) {
      this.logger.error(`[TokenGeneratorConfig] Environment "${envName}" not found in configuration.`,);
      throw new Error(`Environment "${envName}" not found`);
    }
    return envConfig;
  }
}
