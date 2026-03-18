import {LoggerService} from '@backstage/backend-plugin-api';
import {generatePKCE} from '../utils/pkce';
// eslint-disable-next-line no-restricted-imports
import crypto from 'crypto';
import {getAuthUrl} from '../utils/authUtils';
import {API_CALLBACK_URI} from '../utils/constants';
import {InputError} from '@backstage/errors';
import {EnvironmentService} from "./EnvironmentService.ts";

export interface AuthenticationService {
  login(env: string): Promise<string>;

  generateToken(code: string, state: string): Promise<Response>;
}

export class AuthenticationServiceImpl implements AuthenticationService {
  private readonly logger: LoggerService;
  private readonly environmentService: EnvironmentService;
  private readonly backendUrl: string;
  private readonly sessionDataStore = new Map<string, {
    verifier: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
  }>();

  constructor(options: { logger: any; config: any; environmentService: EnvironmentService }) {
    this.logger = options.logger;
    this.environmentService = options.environmentService;
    this.backendUrl = options.config.getString('backend.baseUrl');
  }

  async login(env: string): Promise<string> {
    this.logger.info(`[AuthenticationService] Login request received: env=${env}`);
    try {
      const clientConfig = await this.environmentService.getClientConfig(env);
      const authUrl = clientConfig.authUrl;
      const tokenUrl = clientConfig.tokenUrl;
      const clientId = clientConfig.clientId;
      const clientSecret = clientConfig.clientSecret;

      const {verifier, challenge} = await generatePKCE();
      const sessionId = crypto.randomBytes(16).toString('hex');
      this.sessionDataStore.set(sessionId, {verifier, tokenUrl, clientId, clientSecret});
      const redirectUrl = getAuthUrl(authUrl, clientId, this.backendUrl, challenge, sessionId);
      this.logger.info(`[AuthenticationService] Generated PKCE challenge and redirect URL for sessionId=${sessionId}`);
      return redirectUrl;
    } catch (error: any) {
      this.logger.error(`[AuthenticationService] Failed to initiate login: ${error}`);
      throw new InputError('Failed to generate authentication URL');
    }
  }

  async generateToken(code: string, state: string): Promise<Response> {
    this.logger.info(`[AuthenticationService] Token generation started for state=${state}`);
    if (!code || !state) {
      this.logger.warn(`[AuthenticationService] Missing code or state in callback`);
      throw new InputError('Missing code or state');
    }
    const sessionId = state;
    const sessionData = this.sessionDataStore.get(sessionId);
    if (!sessionData) {
      this.logger.warn(`[AuthenticationService] No session found for sessionId=${sessionId}`);
      throw new InputError('Invalid session or expired');
    }
    const {verifier, tokenUrl, clientId, clientSecret} = sessionData;
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${this.backendUrl}${API_CALLBACK_URI}`,
          client_id: clientId,
          code_verifier: verifier,
          client_secret: clientSecret
        })
      });
      if (!response.ok) {
        this.logger.error(`[AuthenticationService] Token request failed. Status: ${response.status}`);
      } else {
        this.logger.info(`[AuthenticationService] Token successfully obtained for sessionId=${sessionId}`);
      }
      return response;
    } catch (error: any) {
      this.logger.error(`[AuthenticationService] Exception during token request for sessionId=${sessionId}, error=${error}`);
      throw new Error('Token exchange failed');
    } finally {
      this.sessionDataStore.delete(sessionId);
      this.logger.debug(`[AuthenticationService] Cleaned up sessionId=${sessionId}`);
    }
  }
}
