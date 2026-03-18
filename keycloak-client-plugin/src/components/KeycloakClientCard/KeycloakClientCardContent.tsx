import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {alertApiRef, errorApiRef, useApi} from '@backstage/core-plugin-api';
import {useEntity} from '@backstage/plugin-catalog-react';
import {ClientRequest, environmentConfigApiRef, keycloakApiRef} from '../../api';

type AuthFlowType = 'client_credentials' | 'authorization_code' | 'auth_code_client';

const DEFAULT_AUTH_FLOW_OPTIONS: { value: AuthFlowType; label: string }[] = [
  {value: 'client_credentials', label: 'Client Credentials'},
  {value: 'authorization_code', label: 'Authorization Code'},
  {value: 'auth_code_client', label: 'Authorization Code with Client Credentials'}
];

export const KeycloakClientCardContent = () => {
  const environmentConfigApi = useApi(environmentConfigApiRef);
  const keycloakApi = useApi(keycloakApiRef);
  const alertApi = useApi(alertApiRef);
  const errorApi = useApi(errorApiRef);

  const {entity} = useEntity();
  const clientId = entity.metadata.name;

  const getEnvCache = () => sessionStorage.getItem(`${clientId}_env`);
  const setEnvCache = (value: string) => sessionStorage.setItem(`${clientId}_env`, value);
  const getCacheItem = (key: string) => sessionStorage.getItem(`${clientId}_${env}_${key}`);
  const setCacheItem = (key: string, value: string) => sessionStorage.setItem(`${clientId}_${env}_${key}`, value);
  const removeCacheItem = (key: string) => sessionStorage.removeItem(`${clientId}_${env}_${key}`);

  const [environments, setEnvironments] = useState<string[]>([]);
  const [env, setEnv] = useState<string>(getEnvCache() || '');
  const [flow, setFlow] = useState(getCacheItem('flow') || '');
  const [clientData, setClientData] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [redirectUris, setRedirectUris] = useState<string>(getCacheItem('redirectUris') || '');
  const [webOrigins, setWebOrigins] = useState<string>(getCacheItem('webOrigins') || '');

  const [redirectUrisError, setRedirectUrisError] = useState('');

  const fetchEnvironments = async () => {
    try {
      setEnvironments(await environmentConfigApi.listEnvironments());
    } catch (error: any) {
      console.error('Failed to fetch environments:', error);
      errorApi.post(error);
    }
  };

  const fetchClient = async () => {
    try {
      const clientResponse = await keycloakApi.getClientById(env, clientId);
      if (clientResponse) {
        const clientData = {};
        Object.assign(clientData, {env: env, flow: getAuthFlowValue(clientResponse)}, clientResponse);
        setClientData(clientData);
        setCacheItem('clientData', JSON.stringify(clientData));
      } else {
        setClientData(null);
      }
    } catch (e: any) {
      console.error('Failed to fetch client:', clientId);
      errorApi.post(e);
    }
  };

  // Fetch environment list on first render
  useEffect(() => {
    fetchEnvironments();
  }, []);

  useEffect(() => {
    if (env) {
      const cachedClient = getCacheItem('clientData');
      if (cachedClient) {
        setClientData(JSON.parse(cachedClient));
      } else {
        fetchClient();
      }
    }
  }, [env]);

  const handleCreate = async () => {
    if (validationHasAnyErrors()) {
      return;
    }
    try {
      const clientRequest: ClientRequest = {
        flow,
        clientId,
        redirectUris: redirectUris ? redirectUris.split(',').map(s => s.trim()) : [],
        webOrigins: webOrigins ? webOrigins.split(',').map(s => s.trim()) : []
      }
      const clientResponse = await keycloakApi.createClient(env, clientRequest);
      alertApi.post({message: 'Client successfully created', severity: 'success'});

      const clientData = {};
      Object.assign(clientData, {env: env, flow: flow}, clientResponse);
      setClientData(clientData);
      setCacheItem('clientData', JSON.stringify(clientData));
    } catch (e) {
      errorApi.post(e as Error);
    }
  };

  const handleShowSecret = async () => {
    if (!clientData?.id) return;
    if (showSecret && clientSecret) {
      setShowSecret(false);
    } else {
      console.log(`handleShowSecret: ${showSecret}`);
      try {
        const secretResponse = await keycloakApi.getClientSecret(
          clientData.env,
          clientData.id
        );
        setClientSecret(secretResponse.secret);
        setShowSecret(true);
      } catch (e) {
        errorApi.post(e as Error);
      }
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this client?");
    if (!confirmed) return;
    if (!clientData?.id) return;
    try {
      const status = await keycloakApi.deleteClient(env, clientData.id);
      if (status === 204) {
        alertApi.post({message: 'Client successfully deleted', severity: 'success'});
        setClientData(null);
        removeCacheItem('clientData');
      } else {
        alertApi.post({message: 'Unexpected error', severity: 'error'});
      }
    } catch (e: any) {
      console.error('Failed to delete client:', clientId);
      errorApi.post(e);
    }
  };

  const handleEnvChange = (value: string) => {
    setEnv(value);
    setEnvCache(value);

    setFlow('');
    removeCacheItem('flow');
    clearAuthFlowData();
  };

  const handleFlowChange = (value: string) => {
    setFlow(value);
    setCacheItem('flow', value);
    if (value === 'client_credentials') {
      clearAuthFlowData();
    }
  }

  const clearAuthFlowData = () => {
    setRedirectUris('');
    removeCacheItem('redirectUris');
    setWebOrigins('');
    removeCacheItem('webOrigins');
  }

  const handleRedirectUriChange = (value: string) => {
    setRedirectUris(value);
    setCacheItem('redirectUris', value);
    validateField(value, setRedirectUrisError, 'Redirect URIs');
  }

  const handleWebOriginChange = (value: string) => {
    setWebOrigins(value);
    setCacheItem('webOrigins', value);
  }

  const getAuthFlowValue = (client: any): string => {
    const codeEnabled = client.standardFlowEnabled;
    const clientEnabled = client.serviceAccountsEnabled;

    if (codeEnabled && clientEnabled) return 'auth_code_with_client_credentials';
    if (codeEnabled) return 'authorization_code';
    if (clientEnabled) return 'client_credentials';
    return 'unknown';
  };

  const getAuthFlowLabel = (value: AuthFlowType | 'unknown'): string => {
    if (value === 'unknown') return 'Unknown';
    return (DEFAULT_AUTH_FLOW_OPTIONS.find(option => option.value === value)?.label ?? 'Unknown');
  };

  const validationHasAnyErrors = () => {
    if (flow === 'authorization_code' || flow === 'auth_code_client') {
      validateField(redirectUris, setRedirectUrisError, 'Redirect URIs');
    }
    return Boolean(redirectUrisError);
  }

  const validateField = (value: string, setter: (msg: string) => void, name: string): boolean => {
    if (!value.trim()) {
      setter(`${name} is required`);
      return false;
    }
    setter('');
    return true;
  };

  return clientData ? (
    <>
      <Box sx={{
        p: 0,
        maxWidth: 500,
        mt: 1,
        ml: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Stack direction="column" spacing={2}>
          <TextField
            label="Client ID"
            value={clientData.clientId}
            fullWidth
            margin="normal"
            disabled
          />
          <FormControl variant="outlined" sx={{minWidth: 200, mb: 2}}>
            <InputLabel>Environment</InputLabel>
            <Select
              value={env}
              label="Environment"
              onChange={(e) => handleEnvChange(e.target.value as string)}
              MenuProps={{
                PaperProps: {sx: {'& .MuiMenuItem-root': {display: 'block',},},},
                MenuListProps: {sx: {flexDirection: 'column', gap: 1, py: 1},},
              }}>
              {environments.map((env) => (
                <MenuItem key={env} value={env} sx={{'&.MuiMenuItem-root': {py: 1, px: 2}}}>{env}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="h6" gutterBottom>
            Client Details
          </Typography>
          <TextField
            label="OAuth2 Flow"
            value={getAuthFlowLabel(clientData.flow)}
            fullWidth
            margin="normal"
            disabled
          />
          {(clientData.flow === 'authorization_code' || clientData.flow === 'auth_code_client') &&
            clientData.redirectUris?.length > 0 && (
              <TextField
                label="Redirect URIs"
                value={clientData.redirectUris.join(', ')}
                fullWidth
                margin="normal"
                disabled
              />
            )}
          {(clientData.flow === 'authorization_code' || clientData.flow === 'auth_code_client') && (
            <TextField
              label="Web Origins"
              value={clientData.webOrigins.join(', ')}
              fullWidth
              margin="normal"
              disabled
            />
          )}
          <TextField
            label="Client Secret"
            value={showSecret ? clientSecret : '••••••••••'}
            fullWidth
            margin="normal"
            disabled
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleShowSecret} edge="end" size="small">
                  <VisibilityIcon/>
                </IconButton>
              ),
            }}
          />
          <Button
            onClick={handleDelete}
            variant="outlined"
            style={{color: 'red'}}
            sx={{mt: 1, width: '100%'}}>
            Delete Client
          </Button>
        </Stack>
      </Box>
    </>
  ) : (
    <>
      <Box sx={{
        p: 0,
        maxWidth: 500,
        mt: 1,
        ml: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Stack direction="column" spacing={2}>
          <FormControl variant="outlined" sx={{minWidth: 200, mb: 0}}>
            <TextField
              label="Client ID"
              value={clientId}
              disabled
              fullWidth
              style={{marginTop: 16}}
            />
          </FormControl>
          <FormControl variant="outlined" sx={{minWidth: 200, mb: 2}}>
            <InputLabel>Environment</InputLabel>
            <Select
              value={env}
              label="Environment"
              onChange={(e) => handleEnvChange(e.target.value as string)}
              MenuProps={{
                PaperProps: {sx: {'& .MuiMenuItem-root': {display: 'block',},},},
                MenuListProps: {sx: {flexDirection: 'column', gap: 1, py: 1},},
              }}>
              {environments.map((env) => (
                <MenuItem key={env} value={env} sx={{'&.MuiMenuItem-root': {py: 1, px: 2}}}>{env}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {env && (
            <>
              <Typography variant="h6" gutterBottom>
                New Client
              </Typography>
              <Typography variant="body1" gutterBottom>
                Specify values below to create your client
              </Typography>
              <FormControl variant="outlined" sx={{minWidth: 200, mb: 2}}>
                <InputLabel>OAuth2 Flow</InputLabel>
                <Select
                  value={flow}
                  label="OAuth2 Flow"
                  onChange={(e) => handleFlowChange(e.target.value)}
                  MenuProps={{
                    PaperProps: {sx: {'& .MuiMenuItem-root': {display: 'block',},},},
                    MenuListProps: {sx: {flexDirection: 'column', gap: 1, py: 1},},
                  }}>
                  {DEFAULT_AUTH_FLOW_OPTIONS.map(({value, label}) => (
                    <MenuItem key={value} value={value} sx={{'&.MuiMenuItem-root': {py: 1, px: 2}}}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          {(flow === 'authorization_code' || flow === 'auth_code_client') && (
            <>
              <FormControl variant="outlined" sx={{minWidth: 200, mb: 0}}>
                <TextField
                  label="Redirect URIs (comma-separated)"
                  value={redirectUris}
                  onChange={(e) => handleRedirectUriChange(e.target.value)}
                  fullWidth
                  error={Boolean(redirectUrisError)}
                  helperText={redirectUrisError}
                />
              </FormControl>
              <FormControl variant="outlined" sx={{minWidth: 200, mb: 0}}>
                <TextField
                  label="Web Origins (comma-separated)"
                  value={webOrigins}
                  onChange={(e) => handleWebOriginChange(e.target.value)}
                  fullWidth
                />
              </FormControl>
            </>
          )}
          {flow && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              sx={{mt: 1, width: '100%'}}
              disabled={(flow === 'authorization_code' || flow === 'auth_code_client') && (Boolean(redirectUrisError))}>
              Create Client
            </Button>
          )}
        </Stack>
      </Box>
    </>
  );
};
