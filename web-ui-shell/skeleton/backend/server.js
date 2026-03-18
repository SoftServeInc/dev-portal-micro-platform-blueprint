const config = require("./config");
const express = require("express");
const path = require("path");
const session = require("express-session");
const authMiddleware = require("./middlewares/authMiddleware");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const { v4: uuidv4 } = require("uuid");
const { createProxyMiddleware } = require("http-proxy-middleware");
const fs = require("fs");

const app = express();

// Load proxy configuration
const proxyConfig = JSON.parse(fs.readFileSync("./proxy-config.json", "utf-8"));

// Session middleware
app.use(
    session({
        secret: "your-session-secret",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport OAuth2 Strategy
passport.use(
    new OAuth2Strategy(
        {
            authorizationURL: config.authorizationURL,
            tokenURL: config.tokenURL,
            clientID: config.clientID,
            clientSecret: config.clientSecret,
            callbackURL: config.callbackURL,
            state: true,
            pkce: "S256",
        },
        (accessToken, refreshToken, profile, done) => {
            const user = { id: uuidv4(), accessToken };
            return done(null, user);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, { id: user.id, accessToken: user.accessToken });
});

passport.deserializeUser((sessionData, done) => {
    const user = { id: sessionData.id, accessToken: sessionData.accessToken };
    done(null, user);
});

// Apply auth middleware globally
app.use(authMiddleware(passport));

const validateAndAddAuthHeader = (proxyConfig) => (req, res, next) => {
  // Get the requested URL
  const requestedUrl = req.originalUrl;

  // Check if the requested URL matches any pattern in the proxy configuration
  const matchedMapping = Object.keys(proxyConfig.mappings).find((pattern) =>
    requestedUrl.startsWith(pattern.split('*')[0])
  );

  if (!matchedMapping) {
    console.warn(`No matching route found for requested URL: ${requestedUrl}`);
    return res.status(404).json({ error: "Not Found: No matching route in configuration" });
  }

  // Extract the access token dynamically (e.g., from session)
  const { accessToken } = req.session?.passport?.user || {};
  if (accessToken) {
    req.headers["Authorization"] = `Bearer ${accessToken}`;
    console.log(`Authorization header added for route: ${matchedMapping}`);
  } else {
    console.warn(`No access token found for route: ${matchedMapping}`);
  }

  next();
};


// Dynamically configure proxy routes
Object.entries(proxyConfig.mappings).forEach(([pattern, endpoints]) => {
  endpoints.forEach((endpoint) => {
    const basePath = pattern.replace(/\*$/, ""); // Remove wildcard

    app.use(basePath, validateAndAddAuthHeader(proxyConfig));

    app.use(
      basePath,
      createProxyMiddleware({
        target: endpoint,
        changeOrigin: true,
        pathRewrite: (path, req) => {
          const finalPath = `${req.originalUrl}`;
          console.log("proxied path:", finalPath);
          return finalPath;
        },
      })
    );
  });
});

// OAuth2 Login Route
app.get("/auth/login", passport.authenticate("oauth2", { scope: ["openid", "profile", "email"] }));

// OAuth2 Callback Route
app.get(
    "/auth/callback",
    passport.authenticate("oauth2", { failureRedirect: "/auth/login" }),
    (req, res) => {
        const redirectTo = req.session.returnTo || "/";
        delete req.session.returnTo;
        res.redirect(redirectTo);
    }
);

// Serve frontend files
app.use("/mfe1", express.static(path.join(__dirname, "../mfe1/dist")));
app.use("/shell", express.static(path.join(__dirname, "../shell/dist")));

// Default route to shell app
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../shell/dist/index.html"));
});

// Fallback for undefined routes
app.get("*", (req, res) => {
    res.status(404).sendFile(path.join(__dirname, "404.html"));
});

// Start server
app.listen(config.serverPort, () => {
    console.log(`Server is running on ${config.serverBaseUrl}`);
});
