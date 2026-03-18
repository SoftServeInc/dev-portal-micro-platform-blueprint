module.exports = (passport) => {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        if (req.originalUrl.startsWith('/auth/login') || req.originalUrl.startsWith('/auth/callback')) {
            return next();
        }
        // Save requested URL to redirect after authentication
        req.session.returnTo = req.originalUrl;
        return passport.authenticate('oauth2')(req, res, next);
    };
};
