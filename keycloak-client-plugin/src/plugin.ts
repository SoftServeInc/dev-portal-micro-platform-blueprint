import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import {keycloakClientPageRouteRef} from './routes';
import {
  EnvironmentConfigApiClient,
  environmentConfigApiRef, KeycloakApiClient,
  keycloakApiRef
} from "./api";

export const keycloakClientPlugin = createPlugin({
  id: 'keycloakClientPlugin',
  routes: {
    root: keycloakClientPageRouteRef
  },
  apis: [
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
    createApiFactory({
      api: keycloakApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        fetchApi: fetchApiRef
      },
      factory: ({discoveryApi, identityApi, fetchApi}) =>
        new KeycloakApiClient({discoveryApi, identityApi, fetchApi}),
    })
  ],
});

export const KeycloakClientCard = keycloakClientPlugin.provide(
  createRoutableExtension({
    name: 'KeycloakClientCard',
    component: () =>
      import('./components/KeycloakClientCard').then(m => m.KeycloakClientCard),
    mountPoint: keycloakClientPageRouteRef
  }),
);
