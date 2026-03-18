import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import {oauthPkceTokenGeneratorPageRouteRef} from './routes';
import {
  AuthenticationApiClient,
  authenticationApiRef,
  EnvironmentConfigApiClient,
  environmentConfigApiRef
} from "./api";

export const oauthPkceTokenGeneratorPlugin = createPlugin({
  id: 'oauthPkceTokenGenerator',
  routes: {
    root: oauthPkceTokenGeneratorPageRouteRef
  },
  apis: [
    createApiFactory({
      api: authenticationApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        fetchApi: fetchApiRef
      },
      factory: ({discoveryApi, identityApi, fetchApi}) =>
        new AuthenticationApiClient({discoveryApi, identityApi, fetchApi}),
    }),
    createApiFactory({
      api: environmentConfigApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        fetchApi: fetchApiRef
      },
      factory: ({discoveryApi, identityApi, fetchApi}) =>
        new EnvironmentConfigApiClient({discoveryApi, identityApi, fetchApi}),
    }),
  ],
});

export const TokenGeneratorPage = oauthPkceTokenGeneratorPlugin.provide(
  createRoutableExtension({
    name: 'TokenGeneratorPage',
    component: () =>
      import('./components/TokenGeneratorPage').then(m => m.TokenGeneratorPage),
    mountPoint: oauthPkceTokenGeneratorPageRouteRef
  }),
);
