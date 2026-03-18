const dotenv = require("dotenv");

dotenv.config();

const serverPort = process.env.SERVER_PORT || 3000;
const serverHost = process.env.SERVER_HOST || "localhost";
const serverBaseUrl = process.env.SERVER_URL || `http://${serverHost}:${serverPort}`;

const config = {
  authorizationURL: "http://localhost:8080/realms/backstage-dev/protocol/openid-connect/auth",
  tokenURL: "http://localhost:8080/realms/backstage-dev/protocol/openid-connect/token",
  clientID: "my-token-client",
  clientSecret: process.env.CLIENT_SECRET,
  serverPort,
  serverBaseUrl,
  callbackURL: `${serverBaseUrl}/auth/callback`,
};

module.exports = config;
