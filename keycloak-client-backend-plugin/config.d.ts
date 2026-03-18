export interface Config {
    keycloakClient: {
        environments?: {
            [key: string]: {
                url: string;
                realm: string;
                clientId: string;
                username: string;
                password: string;
            };
        };
    };
}
