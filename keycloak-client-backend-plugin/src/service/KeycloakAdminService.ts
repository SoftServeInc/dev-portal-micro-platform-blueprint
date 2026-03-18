import {LoggerService} from "@backstage/backend-plugin-api";
import {EnvironmentService} from "./EnvironmentService.ts";
import {EnvClientConfig} from "./KeycloakClientConfig.ts";

export type OAuthFlow = "client_credentials" | "authorization_code" | "auth_code_client";

export interface ClientRequest {
  flow: OAuthFlow;
  clientId: string;
  redirectUris?: string[];
  webOrigins?: string[];
}

export interface KeycloakClientSecretResponse {
  secret: string
}

export interface KeycloakClientRequestBody {
  clientId: string;
  protocol: string;
  publicClient: boolean;
  enabled: boolean;
  standardFlowEnabled: boolean;
  implicitFlowEnabled: boolean;
  directAccessGrantsEnabled: boolean;
  serviceAccountsEnabled: boolean;
  redirectUris?: string[];
  webOrigins?: string[];
  attributes?: {
    'pkce.code.challenge.method'?: string;
  }
}

export interface KeycloakClientResponseBody extends KeycloakClientRequestBody {
  id: string;
}

export interface KeycloakAdminService {
  getClient(env: string, clientId: string): Promise<KeycloakClientResponseBody | null>;

  createClient(env: string, clientRequest: ClientRequest): Promise<KeycloakClientResponseBody>;

  deleteClient(env: string, clientUuid: string): Promise<void>;

  getClientSecret(env: string, clientUuid: string): Promise<KeycloakClientSecretResponse | null>;
}

export class KeycloakAdminServiceImpl implements KeycloakAdminService {

  private readonly logger: LoggerService;
  private readonly environmentService: EnvironmentService;

  constructor(options: {
    logger: LoggerService
    environmentService: EnvironmentService
  }) {
    this.logger = options.logger;
    this.environmentService = options.environmentService;
  }

  async getClient(env: string, clientId: string): Promise<KeycloakClientResponseBody | null> {
    this.logger.info(`[KeycloakAdminService] Fetching client by clientId=${clientId} for env=${env}`);
    const config = await this.environmentService.getClientConfig(env);
    const token = await this.getAdminToken(config);
    const baseUrl = getAdminBaseUrl(config);
    const url = `${baseUrl}/clients?clientId=${clientId}`;
    this.logger.info(`[KeycloakAdminService] Sending GET request to: ${url}`);
    const clientsResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    this.logger.info(`[KeycloakAdminService] Response status: ${clientsResponse.status}`);
    const clientList: KeycloakClientResponseBody[] = await clientsResponse.json();
    if (clientList.length === 0) {
      this.logger.info(`[KeycloakAdminService] No client found for clientId=${clientId}`);
      return null;
    }
    const client = sanitizeClientResponse(clientList.at(0));
    this.logger.info(`[KeycloakAdminService] Found client with id="${client.id}"`);
    return client;
  }

  async createClient(env: string, clientRequest: ClientRequest): Promise<KeycloakClientResponseBody> {
    this.logger.info(`[KeycloakAdminService] Creating client: ${clientRequest.clientId} for env=${env}`);
    const config = await this.environmentService.getClientConfig(env);
    const token = await this.getAdminToken(config);
    const baseUrl = getAdminBaseUrl(config);
    const url = `${baseUrl}/clients`;
    const request = JSON.stringify(buildClientRequest(clientRequest));
    this.logger.info(`[KeycloakAdminService] Sending POST request: ${request} to: ${url}`);
    const createdClientResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: request
    });
    if (!createdClientResponse.ok) {
      this.logger.error(`[KeycloakAdminService] Failed to create client. Status: ${createdClientResponse.status}`);
      let errorMsg = 'Failed to create client';
      try {
        const errorBody = await createdClientResponse.json();
        errorMsg = JSON.stringify(errorBody) || errorMsg;
      } catch (_) {
        errorMsg = await createdClientResponse.text();
      }
      throw new Error(`Keycloak client create request failed: ${errorMsg}`);
    }
    const clientLocation = createdClientResponse.headers.get('Location') as string;
    const id = clientLocation.substring(clientLocation.lastIndexOf('/') + 1);
    this.logger.info(`[KeycloakAdminService] Client created successfully with ID: ${id}`);
    const clientResponse = await fetch(`${baseUrl}/clients/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    this.logger.info(`[KeycloakAdminService] Fetched newly created client: ${id}`);
    return sanitizeClientResponse(await clientResponse.json());
  }

  async deleteClient(env: string, clientUuid: string): Promise<void> {
    this.logger.info(`[KeycloakAdminService] Deleting client with ID=${clientUuid} for env=${env}`);
    const config = await this.environmentService.getClientConfig(env);
    const token = await this.getAdminToken(config);
    const baseUrl = getAdminBaseUrl(config);
    const url = `${baseUrl}/clients/${clientUuid}`;
    this.logger.info(`[KeycloakAdminService] Sending DELETE request to: ${url}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.status !== 204) {
      this.logger.error(`[KeycloakAdminService] Failed to delete client. Status: ${response.status}`);
      throw new Error(`Keycloak client deletion failed: ${response.status}`);
    }
    this.logger.info(`[KeycloakAdminService] Client ${clientUuid} deleted successfully`);
  }

  async getClientSecret(env: string, clientUuid: string): Promise<KeycloakClientSecretResponse | null> {
    this.logger.info(`[KeycloakAdminService] Getting secret for client ID=${clientUuid} for env=${env}`);
    const config = await this.environmentService.getClientConfig(env);
    const token = await this.getAdminToken(config);
    const baseUrl = getAdminBaseUrl(config);
    const url = `${baseUrl}/clients/${clientUuid}/client-secret`;
    this.logger.info(`[KeycloakAdminService] Sending GET request to: ${url}`);
    const clientSecretResponse = await fetch(url, {
      method: 'GET',
      headers: {Authorization: `Bearer ${token}`}
    });
    if (!clientSecretResponse.ok) {
      this.logger.error(`[KeycloakAdminService] Failed to fetch client secret. Status: ${clientSecretResponse.status}`);
      return null;
    }
    this.logger.debug(`[KeycloakAdminService] Secret fetched successfully for client ID=${clientUuid}`);
    const secretResponse = await clientSecretResponse.json();
    return {
      secret: secretResponse.value
    }
  }

  async getAdminToken(config: EnvClientConfig): Promise<string> {
    const url = `${config.url}/realms/${config.realm}/protocol/openid-connect/token`;
    this.logger.info(`[KeycloakAdminService] Fetching admin token from: ${url}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        client_id: config.clientId,
        grant_type: 'password',
        username: config.username,
        password: config.password,
      }),
    });
    const tokenResponse = await res.json();
    if (!res.ok) {
      this.logger.error(`[KeycloakAdminService] Failed to get admin token. Status: ${tokenResponse.status}`);
      let errorMsg = 'Failed to get admin token';
      try {
        const errorBody = await res.json();
        errorMsg = JSON.stringify(errorBody) || errorMsg;
      } catch (_) {
        errorMsg = await res.text();
      }
      throw new Error(`Keycloak token request failed: ${errorMsg}`);
    }
    this.logger.info(`[KeycloakAdminService] Admin token retrieved successfully`);
    return tokenResponse.access_token;
  }
}

function getAdminBaseUrl(config: EnvClientConfig): string {
  return `${config.url}/admin/realms/${config.realm}`;
}

const clientBuilder: Record<OAuthFlow, (req: ClientRequest) => KeycloakClientRequestBody> = {
  client_credentials: (req) => ({
    clientId: req.clientId,
    protocol: 'openid-connect',
    publicClient: false,
    enabled: true,
    standardFlowEnabled: false,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: false,
    serviceAccountsEnabled: true
  }),
  authorization_code: (req) => ({
    clientId: req.clientId,
    protocol: 'openid-connect',
    publicClient: false,
    enabled: true,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: false,
    serviceAccountsEnabled: false,
    redirectUris: req.redirectUris || [],
    webOrigins: req.webOrigins || [],
    attributes: {
      'pkce.code.challenge.method': 'S256'
    }
  }),
  auth_code_client: (req) => ({
    clientId: req.clientId,
    protocol: 'openid-connect',
    publicClient: false,
    enabled: true,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: false,
    serviceAccountsEnabled: true,
    redirectUris: req.redirectUris || [],
    webOrigins: req.webOrigins || [],
    attributes: {
      'pkce.code.challenge.method': 'S256'
    }
  }),
};

function buildClientRequest(req: ClientRequest): KeycloakClientRequestBody {
  const builder = clientBuilder[req.flow];
  if (!builder) {
    throw new Error(`Unsupported OAuth flow: ${req.flow}`);
  }
  return builder(req);
}

function sanitizeClientResponse(client: any): KeycloakClientResponseBody {
  return {
    id: client.id,
    clientId: client.clientId,
    protocol: client.protocol,
    publicClient: client.publicClient,
    enabled: client.enabled,
    standardFlowEnabled: client.standardFlowEnabled,
    implicitFlowEnabled: client.implicitFlowEnabled,
    directAccessGrantsEnabled: client.directAccessGrantsEnabled,
    serviceAccountsEnabled: client.serviceAccountsEnabled,
    redirectUris: client.redirectUris,
    webOrigins: client.webOrigins,
    attributes: {
      'pkce.code.challenge.method': client.attributes?.['pkce.code.challenge.method']
    }
  };
}
