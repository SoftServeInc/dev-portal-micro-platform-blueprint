import {createApiRef, DiscoveryApi, FetchApi, IdentityApi,} from '@backstage/core-plugin-api';

const BACKEND_PLUGIN_ID = "oauth-pkce-token-generator-backend";

export const authenticationApiRef = createApiRef<AuthenticationApi>({
  id: 'plugin.oauth-pkce-token-generator.authentication-api.service'
});
export const environmentConfigApiRef = createApiRef<EnvironmentConfigApi>({
  id: 'plugin.oauth-pkce-token-generator.environment-config-api.service'
});

export interface AuthenticationApi {
  login(env: string): Promise<string>;
}

export interface EnvironmentConfigApi {
  listEnvironments(): Promise<string[]>;
}

export class AuthenticationApiClient implements AuthenticationApi {
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

  async login(env: string): Promise<string> {
    const baseUrl = await this.discoveryApi.getBaseUrl(BACKEND_PLUGIN_ID);
    const {token} = await this.identityApi.getCredentials();
    const res = await this.fetchApi.fetch(`${baseUrl}/login`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environment: env
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json() as { redirectUrl: string };
    return data.redirectUrl;
  }
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
