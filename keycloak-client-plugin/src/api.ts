import {createApiRef, DiscoveryApi, FetchApi, IdentityApi,} from '@backstage/core-plugin-api';

const BACKEND_PLUGIN_ID = "keycloak-client-backend";

export const environmentConfigApiRef = createApiRef<EnvironmentConfigApi>({
  id: 'plugin.keycloak-client-backend.environment-config-api.service'
});
export const keycloakApiRef = createApiRef<KeycloakApi>({
  id: 'plugin.keycloak-client-backend.keycloak-api.service'
});

export interface KeycloakApi {
  getClientById(env: string, clientId: string): Promise<ClientResponse | null>;

  createClient(env: string, body: ClientRequest): Promise<ClientResponse>;

  deleteClient(env: string, clientId: string): Promise<number>;

  getClientSecret(env: string, uuid: string): Promise<ClientSecretResponse>;
}

export interface ClientRequest {
  flow: string;
  clientId: string;
  redirectUris: string[];
  webOrigins: string[]
}

export interface ClientResponse {
  id: string;
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

export interface ClientSecretResponse {
  secret: string
}

export interface EnvironmentConfigApi {
  listEnvironments(): Promise<string[]>;
}

export class EnvironmentConfigApiClient implements EnvironmentConfigApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  private readonly fetchApi: FetchApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
    this.fetchApi = options.fetchApi;
  }

  async listEnvironments(): Promise<string[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl(BACKEND_PLUGIN_ID);
    const {token} = await this.identityApi.getCredentials();
    const res = await this.fetchApi.fetch(`${baseUrl}/environments`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    return await res.json() as string[];
  }
}

export class KeycloakApiClient implements KeycloakApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  private readonly fetchApi: FetchApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
    this.fetchApi = options.fetchApi;
  }

  async getClientById(env: string, clientId: string): Promise<ClientResponse | null> {
    const baseUrl = await this.discoveryApi.getBaseUrl(BACKEND_PLUGIN_ID);
    const {token} = await this.identityApi.getCredentials();
    const res = await this.fetchApi.fetch(`${baseUrl}/environments/${env}/clients/${clientId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  }

  async createClient(env: string, body: ClientRequest): Promise<ClientResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl(BACKEND_PLUGIN_ID);
    const {token} = await this.identityApi.getCredentials();
    const res = await this.fetchApi.fetch(`${baseUrl}/environments/${env}/clients`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      },
    );
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    return await res.json() as ClientResponse;
  }

  async deleteClient(env: string, clientId: string): Promise<number> {
    const baseUrl = await this.discoveryApi.getBaseUrl(BACKEND_PLUGIN_ID);
    const {token} = await this.identityApi.getCredentials();
    const res = await this.fetchApi.fetch(`${baseUrl}/environments/${env}/clients/${clientId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to delete client: ${res.statusText}`);
    }
    return res.status;
  }

  async getClientSecret(env: string, uuid: string): Promise<ClientSecretResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl(BACKEND_PLUGIN_ID);
    const {token} = await this.identityApi.getCredentials();
    const res = await this.fetchApi.fetch(`${baseUrl}/environments/${env}/clients/${uuid}/secret`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
    );
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    return await res.json() as ClientSecretResponse;
  }
}
