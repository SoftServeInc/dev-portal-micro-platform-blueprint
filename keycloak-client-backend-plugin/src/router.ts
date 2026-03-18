import express from 'express';
import {EnvironmentService} from "./service/EnvironmentService";
import {ClientRequest, KeycloakAdminService} from "./service/KeycloakAdminService.ts";

export interface RouterOptions {
  environmentService: EnvironmentService;
  keycloakAdminService: KeycloakAdminService;
}

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const {environmentService, keycloakAdminService} = options;

  const router = express.Router();
  router.use(express.json());
  router.get('/environments', async (_, res) => {
    res.status(200).json(await environmentService.listEnvironments());
  });
  router.get('/environments/:env/clients/:clientId', async (req, res) => {
    try {
      const result = await keycloakAdminService.getClient(req.params.env, req.params.clientId);
      if (result === null) {
        res.status(404).json({error: `Client with id: ${req.params.clientId} not found`});
      } else {
        res.status(200).json(result);
      }
    } catch (e: any) {
      res.status(500).json({error: e.message});
    }
  });
  router.post('/environments/:env/clients', async (req, res) => {
    try {
      const result = await keycloakAdminService.createClient(req.params.env, req.body as ClientRequest);
      res.status(201).json(result);
    } catch (e: any) {
      res.status(500).json({error: e.message});
    }
  });
  router.delete('/environments/:env/clients/:clientUuid', async (req, res) => {
    try {
      const result = await keycloakAdminService.deleteClient(req.params.env, req.params.clientUuid);
      if (result === null) {
        res.status(404).json({error: `Client with id: ${req.params.clientUuid} not found`});
      } else {
        res.status(204).json(result);
      }
    } catch (e: any) {
      res.status(500).json({error: e.message});
    }
  });
  router.get('/environments/:env/clients/:clientUuid/secret', async (req, res) => {
    try {
      const result = await keycloakAdminService.getClientSecret(req.params.env, req.params.clientUuid);
      if (result === null) {
        res.status(404).json({error: `Client with id: ${req.params.clientUuid} not found`});
      } else {
        res.status(200).json(result);
      }
    } catch (e: any) {
      res.status(500).json({error: e.message});
    }
  });
  return router;
}
