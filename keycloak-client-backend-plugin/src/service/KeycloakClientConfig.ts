import {Config} from '@backstage/config';
import {LoggerService} from "@backstage/backend-plugin-api";
import {PLUGIN_ROOT_CONFIG_PATH} from "../utils/constants.ts";

export interface EnvClientConfig {
  name: string;
  url: string;
  realm: string;
  clientId: string;
  username: string;
  password: string;
}

export class KeycloakClientConfig {
  private readonly logger: LoggerService;
  private readonly config: Config;
  private readonly environments: EnvClientConfig[];


  constructor(options: {
    logger: LoggerService
    config: Config
  }) {
    this.logger = options.logger;
    this.config = options.config;
    this.environments = this.readConfig();
  }

  private readConfig(): EnvClientConfig[] {
    try {
      const envs = this.config.getOptionalConfigArray(PLUGIN_ROOT_CONFIG_PATH) || [];
      return envs.filter(env => env.getOptionalString('name') && env.getOptionalString('url'))
        .map((c, index) => {
          const envConfig: EnvClientConfig = {
            name: c.getString('name'),
            url: c.getString('url'),
            realm: c.getString('realm'),
            clientId: c.getString('clientId'),
            username: c.getString('username'),
            password: c.getString('password'),
          };
          const missing = Object.entries(envConfig)
            .filter(([_, value]) => !value)
            .map(([key]) => key);
          if (missing.length > 0) {
            this.logger.warn(`[KeycloakClientConfig] Environment at index ${index} is missing fields: ${missing.join(', ')}`);
          }
          return envConfig;
        });
    } catch (_) {
      this.logger.error(`[KeycloakClientConfig] Failed to load configuration for ${PLUGIN_ROOT_CONFIG_PATH}`);
      return [];
    }
  }

  public getEnvironments(): string[] {
    if (!this.environments.length) {
      this.logger.warn('[KeycloakClientConfig] No environments configured. Check your app-config.yaml',);
    }
    return this.environments.map(env => env.name);
  }

  public getClientConfig(envName: string): EnvClientConfig {
    const envConfig = this.environments.find(env => env.name === envName);
    if (!envConfig) {
      this.logger.error(`[KeycloakClientConfigService] Environment "${envName}" not found in configuration.`,);
      throw new Error(`Environment "${envName}" not found`);
    }
    return envConfig;
  }
}
