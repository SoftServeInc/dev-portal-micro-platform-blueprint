// @ts-ignore
import express from 'express';
import {Config} from '@backstage/config';
import {InputError} from "@backstage/errors";
import {EnvironmentService} from "./service/EnvironmentService";
import {AuthenticationService} from "./service/AuthenticationService";
import {PLUGIN_ROOT_CONFIG_PATH} from "./utils/constants";

export interface RouterOptions {
  config: Config;
  environmentService: EnvironmentService;
  authenticationService: AuthenticationService;
}

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const {config, environmentService, authenticationService} = options;
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.use(express.json());
  // @ts-ignore
  router.get('/environments', async (_, res) => {
    res.status(200).json(await environmentService.listEnvironments());
  });
  // @ts-ignore
  router.post('/login', async (req, res) => {
      const {environment} = req.body;
      if (!environment) {
        return res.status(400).json({error: 'Missing parameters'});
      }
      try {
        const authUrl = await authenticationService.login(environment as string);
        return res.status(200).json({redirectUrl: authUrl})
      } catch (e: any) {
        return res.status(400).json({error: e.message});
      }
    },
  );
  // @ts-ignore
  router.get('/callback', async (req, res) => {
    const {code, state} = req.query; // state = sessionId
    try {
      const tokenResponse = await authenticationService.generateToken(code as string, state as string);
      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.json();
        return res.status(tokenResponse.status).json(errorBody);
      }
      const tokenData = await tokenResponse.json();
      const frontendUrl = config.getString('app.baseUrl');
      const frontendPluginPath = config.getString(`${PLUGIN_ROOT_CONFIG_PATH}.frontendRoutePath`);
      const tokenRedirectUrl = new URL(`${frontendUrl}/${frontendPluginPath}`);
      tokenRedirectUrl.hash = `accessToken=${tokenData.access_token}`;
      return res.redirect(tokenRedirectUrl.toString());
    } catch (e: any) {
      if (e instanceof InputError) {
        return res.status(400).json({error: e.message});
      }
      return res.status(500).send(`Failed to complete token request: ${e}`);
    }
  });
  return router;
}
