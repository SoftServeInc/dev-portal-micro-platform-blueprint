import {LoggerService} from '@backstage/backend-plugin-api';
import {Config} from '@backstage/config';
import {EnvClientConfig, KeycloakClientConfig} from "./KeycloakClientConfig.ts";

export interface EnvironmentService {
  listEnvironments(): Promise<string[]>;

  getClientConfig(env: string): Promise<EnvClientConfig>;
}

export class EnvironmentServiceImpl implements EnvironmentService {

  private readonly logger: LoggerService;
  private readonly config: KeycloakClientConfig;

  constructor(options: {
    logger: LoggerService,
    config: Config
  }) {
    this.logger = options.logger;
    this.config = new KeycloakClientConfig(options);
  }

  async listEnvironments(): Promise<string[]> {
    this.logger.info('[EnvironmentService] Getting list of envs');
    return this.config.getEnvironments();
  }

  async getClientConfig(env: string): Promise<EnvClientConfig> {
    this.logger.info(`[EnvironmentService] Getting client config for env=${env}`);
    return this.config.getClientConfig(env);
  }
}
