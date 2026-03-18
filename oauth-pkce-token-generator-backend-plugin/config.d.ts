export interface Config {
  oauthPkceTokenGenerator: {
    /** @visibility backend  */
    frontendRoutePath: string;
    environments?: {
      [key: string]: {
        providers?: {
          [key: string]: {
            authUrl: string;
            tokenUrl: string;
            clients?: Array<{
              id: string;
              /** @visibility secret */
              secret: string;
            }>;
          };
        };
      };
    };
  };
}
