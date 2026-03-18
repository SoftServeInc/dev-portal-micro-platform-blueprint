import {coreServices, createBackendPlugin} from '@backstage/backend-plugin-api';
import {createRouter} from './router';
import {EnvironmentServiceImpl} from "./service/EnvironmentService";
import {KeycloakAdminServiceImpl} from "./service/KeycloakAdminService";

export const keycloakClientBackendPlugin = createBackendPlugin({
  pluginId: 'keycloak-client-backend',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        http: coreServices.httpRouter,
        config: coreServices.rootConfig
      },
      async init({http, logger, config}) {
        const environmentService = new EnvironmentServiceImpl({logger, config});
        const keycloakAdminService = new KeycloakAdminServiceImpl({logger, environmentService});
        http.use(
          await createRouter({
            environmentService: environmentService,
            keycloakAdminService: keycloakAdminService
          }),
        );
      },
    });
  },
});
