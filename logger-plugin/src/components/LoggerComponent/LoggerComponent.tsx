import React, {useState} from 'react';
import {Button, Grid, TextField} from '@material-ui/core';
import {Content, Header, InfoCard, Page,} from '@backstage/core-components';
import {LoggersFetchComponent} from '../LoggersFetchComponent';

const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};

const isJwt = (token: string): boolean => {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
};

export const LoggerComponent = () => {
    const [url, setUrl] = useState(sessionStorage.getItem('logger_url') || '');
    const [authToken, setAuthToken] = useState(sessionStorage.getItem('logger_token') || '');

    const [urlError, setUrlError] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [showLogs, setShowLogs] = useState(false);

    const validateUrl = (value: string) => {
        if (!value) return 'Server URL is required';
        if (!isValidUrl(value)) return 'Enter a valid URL';
        return null;
    };

    const validateToken = (value: string) => {
        if (!value) return 'Auth Token is required';
        if (!isJwt(value)) return 'Enter a valid JWT';
        return null;
    };

    const handleUrlChange = (value: string) => {
        setUrl(value);
        sessionStorage.setItem('logger_url', value);
        setUrlError(validateUrl(value));
    };

    const handleTokenChange = (value: string) => {
        setAuthToken(value);
        sessionStorage.setItem('logger_token', value);
        setTokenError(validateToken(value));
    };

    const handleGetLogs = () => {
        setUrlError(validateUrl(url));
        setTokenError(validateToken(authToken));
        if (!urlError && !tokenError) {
            setShowLogs(true);
        }
    };

    const isFormValid = !validateUrl(url) && !validateToken(authToken);

    return (
        <Page themeId="tool">
            <Header title="Loggers Configuration">
            </Header>
            <Content>
                <Grid container spacing={3} direction="column" alignItems="center">
                    <Grid item style={{width: '100%', maxWidth: '600px'}}>
                        <InfoCard title="Provide Server Data">
                            <TextField
                                label="Server URL"
                                variant="outlined"
                                fullWidth
                                value={url}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                error={!!urlError}
                                helperText={urlError}
                                style={{marginBottom: '16px'}}
                            />
                            <TextField
                                label="Auth Token"
                                variant="outlined"
                                fullWidth
                                type="password"
                                value={authToken}
                                onChange={(e) => handleTokenChange(e.target.value)}
                                error={!!tokenError}
                                helperText={tokenError}
                                style={{marginBottom: '16px'}}
                            />
                            <Button
                                onClick={handleGetLogs}
                                variant="contained"
                                color="primary"
                                disabled={!isFormValid}
                                fullWidth
                            >
                                Get Loggers
                            </Button>
                        </InfoCard>
                    </Grid>

                    <Grid item style={{width: '100%'}}>
                        {showLogs && (
                            <LoggersFetchComponent url={url} authToken={authToken}/>
                        )}
                    </Grid>
                </Grid>
            </Content>
        </Page>
    );
};
