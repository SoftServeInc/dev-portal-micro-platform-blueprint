import React, {useEffect, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {
  Box,
  Button,
  Stack,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import {errorApiRef, useApi} from '@backstage/core-plugin-api';
import {decodeJWT} from '../../utils/decodeJWT';
import {DecodedTokenViewer} from '../DecodedTokenViewer';
import {
  authenticationApiRef,
  environmentConfigApiRef,
} from '../../api';

export const TokenGeneratorPageContent = () => {
  const errorApi = useApi(errorApiRef);

  const environmentConfigApi = useApi(environmentConfigApiRef);
  const authenticationApi = useApi(authenticationApiRef);

  const cacheKeyPrefix = 'oauth-pkce-token-generator-page';
  const getCacheItem = (key: string) => sessionStorage.getItem(`${cacheKeyPrefix}_${key}`);
  const setCacheItem = (key: string, value: string) => sessionStorage.setItem(`${cacheKeyPrefix}_${key}`, value);

  const [environments, setEnvironments] = useState<string[]>([]);
  const [env, setEnv] = useState<string>(getCacheItem('env') || '');

  const [token, setToken] = useState<string | null>(null);
  const [decodedHeader, setDecodedHeader] = useState<Record<string, any> | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<Record<string, any> | null>(null);
  const [decodedSignature, setDecodedSignature] = useState<string | null>(null);

  // Fetch all environments
  const fetchEnvironments = async () => {
    try {
      setEnvironments(await environmentConfigApi.listEnvironments());
    } catch (e) {
      errorApi.post(e as Error);
    }
  };

  const handleGenerateToken = async () => {
    try {
      window.location.href = await authenticationApi.login(env);
    } catch (e) {
      errorApi.post(e as Error);
    }
  };

  // Fetch environment list on first render
  useEffect(() => {
    fetchEnvironments();
  }, []);

  // Check if there's a token in URL on mount
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken = hashParams.get('accessToken');
    if (accessToken) {
      setToken(accessToken);
      const decoded = decodeJWT(accessToken);
      setDecodedHeader(decoded.header);
      setDecodedPayload(decoded.payload);
      setDecodedSignature(decoded.signature);
    }
  }, []);

  const clearTokenInfo = () => {
    setToken('');
    setDecodedHeader(null);
    setDecodedPayload(null);
    setDecodedSignature('');
  }

  // Handlers for selection changes
  const handleEnvChange = (value: string) => {
    setEnv(value);
    setCacheItem('env', value);
    clearTokenInfo();
  };

  return (
    <Box sx={{p: 1, maxWidth: 500, mx: 'auto', mt: 1, display: 'flex', flexDirection: 'column'}}>
      <Typography variant="body1" gutterBottom>
        Select environment below to begin generating your token
      </Typography>
      <Stack direction="column" spacing={2}>
        <FormControl variant="outlined" sx={{minWidth: 200, mb: 2}}>
          <InputLabel>Environment</InputLabel>
          <Select
            value={env}
            label="Environment"
            onChange={e => handleEnvChange(e.target.value as string)}
            MenuProps={{
              PaperProps: {sx: {'& .MuiMenuItem-root': {display: 'block',},},},
              MenuListProps: {sx: {flexDirection: 'column', gap: 1, py: 1},},
            }}>
            {environments.map(e => (
              <MenuItem key={e} value={e} sx={{'&.MuiMenuItem-root': {py: 1, px: 2}}}>{e}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {env && (
          <Button variant="contained" color="primary" onClick={handleGenerateToken} sx={{mt: 1, width: '100%'}}>
            Generate Token
          </Button>
        )}

        {token && (
          <>
            <TextField label="JWT" fullWidth margin="normal" value={token}
                       InputProps={{
                         readOnly: true,
                         endAdornment: (
                           <InputAdornment position="end">
                             <IconButton onClick={() => navigator.clipboard.writeText(token)}>
                               <ContentCopyIcon/>
                             </IconButton>
                           </InputAdornment>
                         ),
                       }}
                       sx={{mt: 2, whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'ellipsis'}}
            />
            <DecodedTokenViewer header={decodedHeader} payload={decodedPayload} signature={decodedSignature}/>
          </>
        )}
      </Stack>
    </Box>
  );
};
