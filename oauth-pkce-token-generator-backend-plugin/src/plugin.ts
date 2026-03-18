import {coreServices, createBackendPlugin} from '@backstage/backend-plugin-api';
import {createRouter} from './router';
import {EnvironmentService, EnvironmentServiceImpl} from "./service/EnvironmentService";
import {AuthenticationServiceImpl} from "./service/AuthenticationService";

export const oauthPkceTokenGeneratorBackendPlugin = createBackendPlugin({
  pluginId: 'oauth-pkce-token-generator-backend',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        http: coreServices.httpRouter,
        config: coreServices.rootConfig
      },
      async init({http, logger, config}) {
        const environmentService: EnvironmentService = new EnvironmentServiceImpl({logger, config});
        const authenticationService = new AuthenticationServiceImpl({logger, config, environmentService});
        http.use(
          await createRouter({
            config: config,
            environmentService: environmentService,
            authenticationService: authenticationService
          }),
        );
        http.addAuthPolicy({
          path: '/callback',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
